import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
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
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*'],
}
