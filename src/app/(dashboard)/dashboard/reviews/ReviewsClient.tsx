'use client'

import { useState } from 'react'
import { Star, Trash2, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  authorName: string
  rating: number
  comment: string | null
  isFeatured: boolean
  createdAt: string
}

export function ReviewsClient({
  initialReviews,
  avgRating,
  total,
}: {
  initialReviews: Review[]
  avgRating: string
  total: number
}) {
  const [reviews, setReviews] = useState(initialReviews)

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const res = await fetch('/api/dashboard/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFeatured: !featured }),
      })
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isFeatured: !featured } : r))
      }
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    try {
      await fetch(`/api/dashboard/reviews?id=${id}`, { method: 'DELETE' })
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-serif">Reviews</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage customer reviews and testimonials</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <div>
            <p className="text-2xl font-bold text-zinc-100 leading-none">{avgRating}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{total} reviews</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <Quote className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No reviews yet. Customers can leave reviews on your public review page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div
              key={r.id}
              className={cn(
                'bg-zinc-900/50 border rounded-xl p-5',
                r.isFeatured ? 'border-amber-500/30' : 'border-zinc-800'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-semibold shrink-0">
                    {r.authorName[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">{r.authorName}</span>
                      {r.isFeatured && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={cn(
                            'w-3.5 h-3.5',
                            s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                          )}
                        />
                      ))}
                      <span className="text-xs text-zinc-500 ml-2">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-zinc-400 mt-2 italic">"{r.comment}"</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleFeatured(r.id, r.isFeatured)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                      r.isFeatured
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                    )}
                  >
                    {r.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
