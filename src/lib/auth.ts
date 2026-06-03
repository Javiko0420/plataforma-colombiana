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
      authorization: {
        params: {
          scope: 'name email',
          response_mode: 'form_post',
          response_type: 'code',
        },
      },
      idToken: true,
      checks: ['pkce'],
      client: {
        token_endpoint_auth_method: 'client_secret_post',
      },
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
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
      },
    },
    nonce: {
      name: 'next-auth.nonce',
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
      },
    },
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/',
        secure: true,
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
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
        console.log('[JWT USER]', JSON.stringify({
          userId: user?.id,
          provider: account?.provider,
          trigger,
          hasCompletedProfile: token.hasCompletedProfile,
        }))
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
      try {
        console.log('[SIGNIN START]', JSON.stringify({
          provider: account?.provider,
          userId: user?.id,
          userEmail: user?.email,
        }))

        if (account?.provider === 'google') {
          const googleProfile = profile as { email_verified?: boolean }
          if (!googleProfile?.email_verified) {
            return false
          }
        }

        return true
      } catch (error) {
        console.error('[SIGNIN ERROR]', error)
        return false
      }
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
    error: '/auth/signin',
  },
  events: {
    async signIn(message) {
      console.log('[EVENT signIn]', JSON.stringify({
        user: message.user?.email,
        account: message.account?.provider,
        isNewUser: message.isNewUser,
      }))
      SecurityLogger.logAuthEvent({
        type: 'login',
        userId: message.user.id,
        email: message.user.email!,
        success: true
      })
    },
    async createUser(message) {
      console.log('[EVENT createUser]', JSON.stringify({
        user: message.user?.email,
        id: message.user?.id,
      }))
    },
    async linkAccount(message) {
      console.log('[EVENT linkAccount]', JSON.stringify({
        provider: message.account?.provider,
      }))
    },
    async signOut({ session, token }) {
      if (token?.sub) {
        SecurityLogger.logAuthEvent({
          type: 'logout',
          userId: token.sub,
          success: true
        })
      }
    }
  },
  debug: true,
}
