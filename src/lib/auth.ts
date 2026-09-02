// ============================================================================
// AUTH — NextAuth v4 with Credentials provider (production).
// Uses Prisma to validate email/password against the User table.
// Requires NEXTAUTH_SECRET + NEXTAUTH_URL + DATABASE_URL env vars.
// ============================================================================

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { business: { select: { name: true } } },
          })

          if (!user) return null

          const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!passwordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            // businessId may be null for owners who haven't completed onboarding yet
            businessId: user.businessId || '',
            businessName: user.business?.name || 'Barber Shop',
            barberId: user.barberId,
          }
        } catch (error) {
          console.error('Auth error - database may not be configured:', error)
          throw new Error('Database connection failed. The database may not be configured.')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.businessId = (user as any).businessId
        token.businessName = (user as any).businessName
        token.barberId = (user as any).barberId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).businessId = token.businessId
        ;(session.user as any).businessName = token.businessName
        ;(session.user as any).barberId = token.barberId
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-only-fallback-secret-do-not-use-in-production',
}

// Re-export getServerSession for convenience
export { getServerSession } from 'next-auth'
