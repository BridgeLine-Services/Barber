import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Book Appointment',
    short_name: (process.env.NEXT_PUBLIC_APP_NAME || 'Book Appointment').split(' ')[0],
    description: 'Book your next appointment online. Quick, easy, no app download required.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#f59e0b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
