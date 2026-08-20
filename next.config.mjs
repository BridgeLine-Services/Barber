// ============================================================================
// Env normalization — runs before Next.js boots (build AND runtime).
//
// Root cause of a real production incident: Vercel env vars that exist but
// are set to an EMPTY STRING (not unset) crash next-auth/react's internal
// `parseUrl()`, which calls `new URL(process.env.NEXTAUTH_URL)` directly.
// Since `??` only substitutes for null/undefined (not ''), an empty string
// slips through and throws `TypeError: Invalid URL`. Because <SessionProvider>
// renders in the root layout, this crashed prerendering for EVERY page in
// the app, taking down the entire build.
//
// Fix: normalize known env vars here — treat empty string same as unset,
// and derive a sane fallback from Vercel's auto-injected VERCEL_URL so the
// build is resilient even if the dashboard env var is misconfigured.
// This does not replace setting real values in Vercel — it just stops a
// single blank field from taking the whole site down.
// ============================================================================

function firstNonEmpty(...values) {
  for (const v of values) {
    if (v && v.trim() !== '') return v
  }
  return undefined
}

if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === '') {
  const vercelUrl = process.env.VERCEL_URL // e.g. "my-app.vercel.app" — no protocol
  process.env.NEXTAUTH_URL = firstNonEmpty(
    vercelUrl ? `https://${vercelUrl}` : undefined,
    'http://localhost:3000'
  )
}

if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.trim() === '') {
  // Not persisted across deployments, but prevents a hard crash. Sessions
  // will invalidate on redeploy until a real NEXTAUTH_SECRET is set in Vercel.
  process.env.NEXTAUTH_SECRET =
    'build-time-fallback-secret-set-NEXTAUTH_SECRET-in-vercel-' + (process.env.VERCEL_URL || 'local')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Vercel hobby: don't fail builds on ESLint warnings
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
