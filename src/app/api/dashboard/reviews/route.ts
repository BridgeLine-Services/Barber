import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/public/reviews — customer submits a review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessId, authorName, rating, comment } = body

    if (!businessId || !authorName?.trim() || !rating) {
      return NextResponse.json({ error: 'Business ID, name, and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        businessId,
        authorName: authorName.trim(),
        rating: parseInt(rating),
        comment: comment?.trim() || null,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Review submit error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/dashboard/reviews — owner lists reviews (authenticated)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: 'desc' },
    })

    const serialized = reviews.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'

    return NextResponse.json({ reviews: serialized, avgRating, total: reviews.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// PATCH /api/dashboard/reviews — owner toggles featured
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, isFeatured } = body

    const review = await prisma.review.findFirst({
      where: { id, businessId: user.businessId },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isFeatured: !!isFeatured },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/dashboard/reviews — owner deletes review
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const review = await prisma.review.findFirst({
      where: { id, businessId: user.businessId },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
