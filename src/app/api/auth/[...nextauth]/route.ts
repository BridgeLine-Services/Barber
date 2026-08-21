// NextAuth route handler — stubbed for demo mode.
// Demo auth is handled by /api/auth/demo-login, /api/auth/demo-logout, /api/auth/demo-session
export async function GET() {
  return new Response('Demo mode — use /api/auth/demo-login', { status: 200 })
}
export async function POST() {
  return new Response('Demo mode — use /api/auth/demo-login', { status: 200 })
}
