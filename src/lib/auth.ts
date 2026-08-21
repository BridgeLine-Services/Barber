import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// No more fallback secret. next.config.mjs enforces that NEXTAUTH_SECRET
// is set in production. If we reach this point in production without it,
// the app should fail, not silently use a fake secret.
const authSecret = process.env.NEXTAUTH_SECRET
if (!authSecret && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET is not set. Configure it in your Vercel environment variables.')
}

export const authOptions: NextAuthOptions = {
  secret: authSecret || 'dev-only-secret-do-not-use-in-production',
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
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
            include: { business: true },
          })

          if (!user) return null

          const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!passwordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            businessId: user.businessId,
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
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: populate token from user record
      if (user) {
        token.role = (user as any).role
        token.businessId = (user as any).businessId
        token.businessName = (user as any).businessName
        token.barberId = (user as any).barberId
      }

      // Session update (triggered by client calling update()):
      // Used after shop creation to refresh businessId/businessName in the JWT
      if (trigger === 'update' && session) {
        if (session.businessId) token.businessId = session.businessId
        if (session.businessName) token.businessName = session.businessName
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
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
