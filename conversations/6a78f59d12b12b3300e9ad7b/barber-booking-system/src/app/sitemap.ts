import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://barber-rho-blond.vercel.app'
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
