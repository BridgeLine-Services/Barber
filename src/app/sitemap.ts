import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const baseUrl = configuredUrl && (configuredUrl.startsWith('http://') || configuredUrl.startsWith('https://'))
    ? configuredUrl
    : configuredUrl ? `https://${configuredUrl}` : undefined
  if (!baseUrl) return []
  const lastModified = new Date()

  const staticPages = [
    '',
    '/services',
    '/barbers',
    '/about',
    '/contact',
    '/book',
    '/reviews',
    '/faq',
    '/booking-policy',
    '/privacy',
    '/terms',
  ]

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: path === '' ? 'daily' : 'weekly' as const,
    priority: path === '' ? 1.0 : path === '/book' ? 0.9 : path === '/services' ? 0.8 : 0.6,
  }))
}
