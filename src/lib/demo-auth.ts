// ============================================================================
// DEMO AUTH — Simple cookie-based authentication for template/demo mode.
// No NextAuth, no database, no NEXTAUTH_SECRET needed.
// Credentials are defined in src/lib/demo-data.ts
// ============================================================================

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { DEMO_USERS, findDemoUser, findDemoUserById, DEMO_BUSINESS } from './demo-data'
import { isDemoMode } from './app-config'

const SESSION_COOKIE = 'demo-session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
// Demo mode is intentionally self-contained so a template deployment can run
// without production auth configuration. This fallback is never used by the
// production auth path; deployments should still provide NEXTAUTH_SECRET there.
const DEMO_FALLBACK_SECRET = 'barber-template-demo-session-v1'

function getSessionSecret(): string {
  if (!isDemoMode()) throw new Error('Demo session helper used outside demo mode')
  return process.env.NEXTAUTH_SECRET || DEMO_FALLBACK_SECRET
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url')
}

function fromBase64Url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'))
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))))
}

async function encodeSession(userId: string): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ userId, exp: Date.now() + SESSION_TTL_MS })))
  return `${payload}.${await sign(payload)}`
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left)
  const rightBytes = new TextEncoder().encode(right)
  let difference = leftBytes.length ^ rightBytes.length
  const length = Math.max(leftBytes.length, rightBytes.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  }
  return difference === 0
}

async function decodeSession(token: string): Promise<{ userId: string; exp: number } | null> {
  try {
    const [payload, signature] = token.split('.')
    const expectedSignature = payload ? await sign(payload) : ''
    if (!payload || !signature || !constantTimeEqual(signature, expectedSignature)) return null
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)))
    if (!decoded.userId || typeof decoded.exp !== 'number' || decoded.exp <= Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

// ─── Server-side: get demo session from cookies ──────────────────────────

export interface DemoSession {
  user: {
    id: string
    email: string
    name: string
    role: 'OWNER' | 'BARBER'
    businessId: string
    barberId?: string | null
    businessName: string
  }
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return null

  const decoded = await decodeSession(token)
  if (!decoded) return null

  const user = findDemoUserById(decoded.userId)
  if (!user) return null

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
      barberId: user.barberId || null,
      businessName: DEMO_BUSINESS.name,
    },
  }
}

// ─── Server-side: demo login (for API route) ──────────────────────────────

export async function demoLogin(email: string, password: string): Promise<{ success: boolean; error?: string; session?: DemoSession }> {
  const user = findDemoUser(email, password)
  if (!user) {
    return { success: false, error: 'Invalid email or password.' }
  }

  const session: DemoSession = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
      barberId: user.barberId || null,
      businessName: DEMO_BUSINESS.name,
    },
  }

  return { success: true, session }
}

// ─── Create login response with cookie ────────────────────────────────────

export async function createDemoLoginResponse(session: DemoSession): Promise<NextResponse> {
  const token = await encodeSession(session.user.id)
  const response = NextResponse.json({ success: true, user: session.user })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return response
}

// ─── Create logout response ────────────────────────────────────────────────

export function createDemoLogoutResponse(): NextResponse {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}

// ─── Client-side: login via fetch ──────────────────────────────────────────

export async function clientDemoLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!data.success) return { success: false, error: data.error }
  return { success: true }
}

// ─── Client-side: logout via fetch ──────────────────────────────────────────

export async function clientDemoLogout(): Promise<void> {
  await fetch('/api/auth/demo-logout', { method: 'POST' })
}

// ─── Client-side: get current user via fetch ───────────────────────────────

export async function clientGetDemoUser(): Promise<DemoSession['user'] | null> {
  try {
    const res = await fetch('/api/auth/demo-session')
    const data = await res.json()
    if (!data.user) return null
    return data.user
  } catch {
    return null
  }
}

// ─── Middleware: check demo session token ──────────────────────────────────

export async function getDemoSessionFromRequest(req: NextRequest): Promise<DemoSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null

  const decoded = await decodeSession(token)
  if (!decoded) return null

  const user = findDemoUserById(decoded.userId)
  if (!user) return null

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
      barberId: user.barberId || null,
      businessName: DEMO_BUSINESS.name,
    },
  }
}
