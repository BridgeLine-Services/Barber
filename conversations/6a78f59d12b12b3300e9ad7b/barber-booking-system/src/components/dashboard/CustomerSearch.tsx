'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface CustomerSearchProps {
  onSearch: (query: string) => void
  initialValue?: string
}

export function CustomerSearch({ onSearch, initialValue = '' }: CustomerSearchProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value)
    }, 250)

    return () => clearTimeout(handler)
  }, [value, onSearch])

  return (
    <div className="relative w-full max-w-md">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <Input
        placeholder="Search customers by name, phone, email..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-8 bg-zinc-950 border-zinc-800 text-xs text-zinc-100 h-10 focus:border-amber-500"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
