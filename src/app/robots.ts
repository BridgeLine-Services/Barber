import { MetadataRoute } from 'next'
import { getAppUrlString } from '@/lib/app-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrlString()

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
