'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { type Session } from 'next-auth'

interface SessionProviderProps {
  children: React.ReactNode
  session?: Session | null
}

/**
 * Session Provider Component
 * Wraps the application with NextAuth SessionProvider
 * Must be a client component to use next-auth/react
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}

