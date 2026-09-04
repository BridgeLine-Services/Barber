import { MetadataRoute } from 'next'
import { getAppUrlString } from '@/lib/app-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrlString()
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
