import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ============================================================================
// Middleware
// 1. Security headers on ALL responses (CSP, HSTS, X-Frame-Options, etc.)
// 2. Auth gate ONLY for /dashboard and /api/dashboard routes
//
// We use getToken() directly instead of withAuth() to avoid redirect-loop
// issues that can occur when withAuth's matcher covers public routes.
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
    // Verify authentication for protected routes
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      // API routes get 401 JSON, page routes redirect to /login
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
  // Match all routes except static assets, Next.js internals, and auth callbacks
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|api/auth).*)',
  ],
}
