import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { PasswordSecurity, SecurityUtils } from './security'
import { SecurityLogger } from './logger'
import { userLoginSchema } from './validations'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
    async jwt({ token, user, account }) {
      // Add user role to token
      if (user) {
        token.role = user.role
        token.lastLogin = Date.now()
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
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Additional security checks can be added here
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
      // Log successful sign in
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
