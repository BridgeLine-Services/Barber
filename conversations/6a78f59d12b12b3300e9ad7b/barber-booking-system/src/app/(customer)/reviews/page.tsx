export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatFullDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Client Reviews',
  description: 'Read authentic client reviews and testimonials about our barbering services.',
}

export const revalidate = 60

export default async function ReviewsPage() {
  let reviews: any[] = []

  try {
    const business = await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
    if (business) {
      reviews = await prisma.review.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: 'desc' },
      })
    }
  } catch (error) {
    console.error('Failed to load reviews:', error)
  }

  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-3 py-1">
          Client Feedback
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-poppins">
          Real Reviews from Real Clients
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          We take pride in our precision cuts and unmatched customer satisfaction.
        </p>
      </div>

      {/* Rating Summary Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 min-w-[120px]">
            <span className="text-4xl font-black text-amber-400 font-poppins">{avgRating}</span>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
              Average Rating
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-poppins">
              Based on {totalReviews} {totalReviews === 1 ? 'Review' : 'Verified Reviews'}
            </h3>
            <p className="text-xs text-zinc-400">
              100% genuine client testimonials from booked appointments.
            </p>
          </div>
        </div>

        <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shrink-0">
          <Link href="/book">
            <Calendar className="mr-2 h-4 w-4" />
            Book Your Cut
          </Link>
        </Button>
      </div>

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-zinc-900/90 border-zinc-800 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  {review.isFeatured && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                      Featured
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold text-zinc-200">{review.authorName}</span>
                <span>{review.createdAt ? formatFullDate(new Date(review.createdAt)) : 'Recent'}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800 p-12 text-center space-y-4">
          <MessageSquare className="h-10 w-10 text-amber-400 mx-auto opacity-80" />
          <h3 className="text-xl font-bold text-white">No Reviews Yet</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Be the first to experience our top-rated barbering services and leave a review!
          </p>
          <div>
            <Button asChild className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold">
              <Link href="/book">Book an Appointment</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
