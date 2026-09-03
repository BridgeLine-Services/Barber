// ============================================================================
// next.config.mjs — Production configuration.
// Env vars (NEXTAUTH_URL, DATABASE_URL) are normalized to handle empty strings
// gracefully during build so prerendering doesn't crash.
// ============================================================================

// Normalize env vars — Vercel may pass empty strings for unset vars.
// This prevents "Invalid URL" crashes during prerendering.
function normalizeUrl(val, fallback) {
  if (!val || val.trim() === '') return fallback
  return val
}

const nextAuthUrl = normalizeUrl(process.env.NEXTAUTH_URL, 'http://localhost:3000')
const databaseUrl = normalizeUrl(process.env.DATABASE_URL, 'postgresql://localhost:5432/barber')

process.env.NEXTAUTH_URL = nextAuthUrl
process.env.DATABASE_URL = databaseUrl

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
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
              "connect-src 'self' https:",
              "frame-src 'self' https://www.google.com",
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
