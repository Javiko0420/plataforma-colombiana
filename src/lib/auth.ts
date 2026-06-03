import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { PasswordSecurity } from './password-security'
import { SecurityUtils } from './security'
import { SecurityLogger } from './logger'
import { userLoginSchema } from './validations'

function buildAppleClientSecret(): string {
  const privateKey = (process.env.APPLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
  return jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    audience: 'https://appleid.apple.com',
    issuer: process.env.APPLE_TEAM_ID ?? '',
    subject: process.env.APPLE_SERVICE_ID ?? '',
    keyid: process.env.APPLE_KEY_ID ?? '',
  })
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_SERVICE_ID ?? '',
      clientSecret: buildAppleClientSecret(),
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          // Validate input data
          const validatedData = userLoginSchema.parse(credentials)
          
          // Get client IP for logging
          const ip = req?.headers?.['x-forwarded-for'] as string || 
                    req?.headers?.['x-real-ip'] as string || 
                    'unknown'
          
          const userAgent = req?.headers?.['user-agent'] || 'unknown'

          // Find user by email
          const user = await prisma.user.findUnique({
            where: {
              email: validatedData.email
            }
          })

          if (!user) {
            // Log failed login attempt
            SecurityLogger.logAuthEvent({
              type: 'failed_login',
              email: validatedData.email,
              ip,
              userAgent,
              success: false,
              reason: 'User not found'
            })
            return null
          }

          // Verify password (for MVP, we'll use a simple check, but in production use hashed passwords)
          let isPasswordValid = false
          
          // Check if user has a hashed password (for existing users)
          if (user.password) {
            isPasswordValid = await PasswordSecurity.verifyPassword(
              validatedData.password, 
              user.password
            )
          } else {
            // Temporary for MVP - allow 'password' as default
            isPasswordValid = validatedData.password === 'password'
          }

          if (!isPasswordValid) {
            // Log failed login attempt
            SecurityLogger.logAuthEvent({
              type: 'failed_login',
              userId: user.id,
              email: user.email,
              ip,
              userAgent,
              success: false,
              reason: 'Invalid password'
            })
            return null
          }

          // Log successful login
          SecurityLogger.logAuthEvent({
            type: 'login',
            userId: user.id,
            email: user.email,
            ip,
            userAgent,
            success: true
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          
          // Log authentication error
          SecurityLogger.logAuthEvent({
            type: 'failed_login',
            email: credentials?.email,
            ip: req?.headers?.['x-forwarded-for'] as string || 'unknown',
            userAgent: req?.headers?.['user-agent'] || 'unknown',
            success: false,
            reason: 'Authentication error'
          })
          
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign-in: populate token with user data
      if (user) {
        token.role = user.role
        token.lastLogin = Date.now()
        if (account?.provider) {
          token.provider = account.provider
        }
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { dateOfBirth: true, contractAcceptedAt: true }
        })
        token.hasCompletedProfile = !!(dbUser?.dateOfBirth && dbUser?.contractAcceptedAt)
      }

      // Token refresh: triggered by `await update()` from useSession()
      // after the user completes their profile on /perfil/completar.
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { dateOfBirth: true, contractAcceptedAt: true, role: true }
        })
        if (dbUser) {
          token.hasCompletedProfile = !!(dbUser.dateOfBirth && dbUser.contractAcceptedAt)
          token.role = dbUser.role
        }
      }
      
      // Rotate token periodically for security
      const now = Date.now()
      const tokenAge = now - (token.lastLogin as number || now)
      const maxAge = 60 * 60 * 1000 // 1 hour
      
      if (tokenAge > maxAge) {
        token.lastLogin = now
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.hasCompletedProfile = token.hasCompletedProfile
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For Google: only allow if email is verified by Google
      if (account?.provider === 'google') {
        const googleProfile = profile as { email_verified?: boolean }
        if (!googleProfile?.email_verified) {
          return false
        }
      }
      // Apple verifies emails by default. For new users (no DOB or legal acceptance),
      // redirect immediately to profile completion while the JWT cookie is already set.
      if (account?.provider === 'apple') {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { dateOfBirth: true, contractAcceptedAt: true },
        })
        const hasCompleted = !!(dbUser?.dateOfBirth && dbUser?.contractAcceptedAt)
        if (!hasCompleted) {
          return '/perfil/completar?callbackUrl=/'
        }
        return true
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects are safe
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log successful sign in (both credentials and Google)
      SecurityLogger.logAuthEvent({
        type: 'login',
        userId: user.id,
        email: user.email!,
        success: true
      })
    },
    async signOut({ session, token }) {
      // Log sign out
      if (token?.sub) {
        SecurityLogger.logAuthEvent({
          type: 'logout',
          userId: token.sub,
          success: true
        })
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}
