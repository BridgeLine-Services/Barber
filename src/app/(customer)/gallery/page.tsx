import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/generate-page-metadata'
import Link from 'next/link'
import { Calendar, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { resolveBusiness } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    titleSuffix: "Gallery",
    description: "Browse the latest work and atmosphere from our shop.",
    path: "/gallery",
  })
}

export default async function GalleryPage() {
  const business = await resolveBusiness()

  if (!business) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Gallery unavailable</h1>
        <p className="mt-3 text-muted-foreground">This business has not been configured yet.</p>
      </div>
    )
  }

  const images = await prisma.mediaAsset.findMany({
    where: { businessId: business.id, type: 'GALLERY', isPublished: true, barberId: null },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Images aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Gallery</h1>
        <p className="mt-4 text-pretty leading-6 text-muted-foreground">
          A look at the work, space, and details that make {business.name} unique.
        </p>
      </header>

      {images.length === 0 ? (
        <Card className="mx-auto mt-12 max-w-xl">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Images className="size-10 text-muted-foreground" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Gallery coming soon</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon for new shop photos.</p>
            </div>
            <Button asChild>
              <Link href="/book"><Calendar data-icon="inline-start" />Book an appointment</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <figure key={image.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="aspect-[4/3] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.altText || `${business.name} gallery photo`} className="size-full object-cover" />
              </div>
              {image.caption && <figcaption className="px-4 py-3 text-sm leading-6 text-muted-foreground">{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Button asChild><Link href="/book"><Calendar data-icon="inline-start" />Book an appointment</Link></Button>
        </div>
      )}
    </div>
  )
}
