import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDemoSessionFromRequest } from '@/lib/demo-auth'

// ============================================================================
// Middleware
// 1. Security headers on ALL responses
// 2. Auth gate ONLY for /dashboard and /api/dashboard routes
//    Demo mode: checks demo-session cookie instead of NextAuth JWT
// ============================================================================

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
}

function addSecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if this is a protected route
  const isDashboard = pathname.startsWith('/dashboard')
  const isDashboardApi = pathname.startsWith('/api/dashboard')

  if (isDashboard || isDashboardApi) {
    // Demo mode: check demo-session cookie
    const session = await getDemoSessionFromRequest(req)

    if (!session) {
      if (isDashboardApi) {
        const response = NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
        addSecurityHeaders(response)
        return response
      }

      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      const response = NextResponse.redirect(loginUrl)
      addSecurityHeaders(response)
      return response
    }
  }

  // All other routes: just add security headers
  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|api/auth).*)',
  ],
}
