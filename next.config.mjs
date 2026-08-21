// ============================================================================
// next.config.mjs — Production-hardened configuration for the barber template.
//
// KEY CHANGES FROM PREVIOUS VERSION:
// 1. NEXTAUTH_URL: still normalized (Vercel sets empty strings that crash
//    next-auth's URL parser). We fall back to VERCEL_URL / localhost so the
//    build doesn't crash — but the real value SHOULD be set in Vercel.
// 2. NEXTAUTH_SECRET: NO MORE FALLBACK. A missing secret now throws a hard
//    error at build/runtime. A production authentication secret should never
//    silently become a generated string — that means sessions won't persist
//    and the deployment looks "fine" while being insecure.
// ============================================================================

function firstNonEmpty(...values) {
  for (const v of values) {
    if (v && v.trim() !== '') return v
  }
  return undefined
}

// --- NEXTAUTH_URL normalization (build-safe) ---
// Vercel can set NEXTAUTH_URL to an empty string, which crashes next-auth's
// parseUrl(). We normalize to VERCEL_URL or localhost so the build survives,
// but the operator should still set the real value in Vercel env vars.
if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === '') {
  const vercelUrl = process.env.VERCEL_URL // e.g. "my-app.vercel.app"
  process.env.NEXTAUTH_URL = firstNonEmpty(
    vercelUrl ? `https://${vercelUrl}` : undefined,
    'http://localhost:3000'
  )
}

// --- NEXTAUTH_SECRET hard check (no fallback) ---
// A production auth secret must be explicitly configured. If it's missing,
// the build/deployment should fail loudly, not silently use a fake secret.
if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.trim() === '') {
  if (process.env.NODE_ENV === 'production') {
    // In production: hard fail. The deployment should not succeed without a real secret.
    throw new Error(
      '\n❌ NEXTAUTH_SECRET is not set!\n\n' +
      'Generate one with: openssl rand -base64 32\n' +
      'Then add it to your Vercel project → Settings → Environment Variables.\n' +
      'Do NOT deploy without a real NEXTAUTH_SECRET.\n'
    )
  }
  // In development only: warn but allow (so local dev still works)
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn(
      '\n⚠️  NEXTAUTH_SECRET is not set. Using a dev-only secret.\n' +
      'Set NEXTAUTH_SECRET in your .env file for local development.\n'
    )
    process.env.NEXTAUTH_SECRET = 'dev-only-secret-do-not-use-in-production-' + Math.random().toString(36).slice(2)
  }
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
