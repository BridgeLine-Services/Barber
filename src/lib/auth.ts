// ============================================================================
// AUTH — Demo mode authentication.
// This file now exports the same interface that the rest of the app expects
// from next-auth, but uses the demo cookie-based system instead.
// When you switch to production, restore the original NextAuth implementation
// and set NEXTAUTH_SECRET + DATABASE_URL.
// ============================================================================

import { getDemoSession, type DemoSession } from './demo-auth'

// Re-export for compatibility with code that imports from auth.ts
export { getDemoSession as getServerSession }

// authOptions is referenced by various files — provide a no-op placeholder
export const authOptions = {}

// NextAuth handlers — stubbed out for demo mode
export const handlers = {
  GET: () => new Response('Demo mode — auth handled by /api/auth/demo-login', { status: 200 }),
  POST: () => new Response('Demo mode — auth handled by /api/auth/demo-login', { status: 200 }),
}

export const auth = async () => {
  return await getDemoSession()
}

export const signIn = async () => {
  throw new Error('Demo mode — use /api/auth/demo-login instead')
}

export const signOut = async () => {
  throw new Error('Demo mode — use /api/auth/demo-logout instead')
}
