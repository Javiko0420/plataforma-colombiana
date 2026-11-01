import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { authenticateCredentials } from './credential-auth'
import { accountAuthSelect, getAccountDenial, getCurrentAccount, hasCompletedProfile } from './account-policy'
import { SecurityLogger } from './logger'
import { userLoginSchema } from './validations'
import { checkRateLimit } from './rate-limit'

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

          // Rate limit por email+IP: frena el credential stuffing en el login
          // web. Devolver null se traduce en credenciales inválidas para el
          // cliente — no revelamos si el freno fue por límite o por password.
          const limit = await checkRateLimit('login', `${validatedData.email}:${ip}`)
          if (!limit.success) {
            SecurityLogger.logSecurityViolation({
              type: 'rate_limit',
              ip,
              userAgent: String(userAgent),
              details: 'web login',
              severity: 'medium',
            })
            return null
          }

          const result = await authenticateCredentials(validatedData.email, validatedData.password)
          if (!result.success) {
            SecurityLogger.logAuthEvent({
              type: 'failed_login',
              ip,
              userAgent,
              success: false,
              reason: 'Invalid credentials or unavailable account',
            })
            return null
          }
          const user = result.user

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
        } catch {
          console.error('Authentication failed')
          
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
    async jwt({ token, user, account }) {
      // Revalidate every session resolution, including tokens issued before a ban
      // or role change. Never trust session-update data supplied by the client.
      const userId = user?.id ?? token.sub
      const current = userId ? await getCurrentAccount(userId) : null
      if (!current) throw new Error('Account unavailable')
      token.sub = current.id
      token.email = current.email
      token.name = current.name
      token.picture = current.image
      token.role = current.role
      token.hasCompletedProfile = hasCompletedProfile(current)
      if (user) token.lastLogin = Date.now()
      if (account?.provider) token.provider = account.provider

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.email = token.email!
        session.user.name = token.name
        session.user.image = token.picture
        session.user.role = token.role
        session.user.hasCompletedProfile = token.hasCompletedProfile
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          const googleProfile = profile as { email_verified?: boolean }
          if (googleProfile?.email_verified !== true) {
            return false
          }
        }

        // Existing OAuth identities are resolved by provider subject, not a
        // caller-provided user ID. Leave new-account/linking decisions to NextAuth.
        if (account?.provider === 'google' || account?.provider === 'apple') {
          const linked = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            select: { user: { select: accountAuthSelect } },
          })
          const existing = linked?.user ?? (user.email
            ? await prisma.user.findUnique({ where: { email: user.email }, select: accountAuthSelect })
            : null)
          if (existing && getAccountDenial(existing)) return false
        } else if (account?.provider === 'credentials') {
          if (!(await getCurrentAccount(user.id))) return false
        }

        return true
      } catch {
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
    async signOut({ token }) {
      if (token?.sub) {
        SecurityLogger.logAuthEvent({
          type: 'logout',
          userId: token.sub,
          success: true
        })
      }
    }
  },
}
