import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReviewsClient } from './ReviewsClient'

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  let reviews: any[] = []
  let avgRating = '0.0'
  let total = 0

  try {
    const rawReviews = await prisma.review.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: 'desc' },
    })

    reviews = rawReviews.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
    total = reviews.length
  } catch (error) {
    console.error('Failed to load reviews:', error)
  }

  return <ReviewsClient initialReviews={reviews} avgRating={avgRating} total={total} />
}
