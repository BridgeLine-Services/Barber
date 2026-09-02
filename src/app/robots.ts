import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const baseUrl = configuredUrl && (configuredUrl.startsWith('http://') || configuredUrl.startsWith('https://'))
    ? configuredUrl
    : configuredUrl ? `https://${configuredUrl}` : undefined

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/*', '/login', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
