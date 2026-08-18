import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add security headers to all responses
    const response = NextResponse.next()

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
    // Content-Security-Policy — restrictive but allows inline styles for Next.js
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    )

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect /dashboard routes — require authentication
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        // Protect /api/dashboard routes
        if (req.nextUrl.pathname.startsWith('/api/dashboard')) {
          return !!token
        }
        // All other routes are public — security headers still apply
        return true
      },
    },
  }
)

export const config = {
  // Match all routes except static assets, Next.js internals, and auth callbacks
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|api/auth).*)',
  ],
}
