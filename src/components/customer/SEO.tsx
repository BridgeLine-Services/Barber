import React from 'react'

interface SEOProps {
  business?: {
    name?: string
    phone?: string | null
    email?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    latitude?: number | null
    longitude?: number | null
    hours?: any
    logo?: string | null
  } | null
}

const DAY_MAP: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export function SEO({ business }: SEOProps) {
  if (!business) return null

  const name = business.name || 'Barber Shop'
  const telephone = business.phone || undefined
  const email = business.email || undefined

  const openingHoursSpec: any[] = []

  if (business.hours && typeof business.hours === 'object') {
    Object.entries(business.hours).forEach(([day, val]: [string, any]) => {
      const fullDay = DAY_MAP[day.toLowerCase()]
      if (fullDay && val && !val.isOff && val.open && val.close) {
        openingHoursSpec.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${fullDay}`,
          opens: val.open,
          closes: val.close,
        })
      }
    })
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'BarberShop'],
    name,
    image: business.logo || undefined,
    telephone,
    email,
    priceRange: '$$',
    ...(business.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: business.address,
            addressLocality: business.city || undefined,
            addressRegion: business.state || undefined,
            postalCode: business.zipCode || undefined,
            addressCountry: 'US',
          },
        }
      : {}),
    ...(business.latitude && business.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }
      : {}),
    ...(openingHoursSpec.length > 0
      ? { openingHoursSpecification: openingHoursSpec }
      : { openingHours: 'Mo-Sa 09:00-19:00' }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
