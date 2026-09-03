'use client'

// Searchable timezone selector.
// Options are generated at runtime from the runtime's IANA database
// (see lib/onboarding-constants.ts) — no hardcoded timezone list.

import { useMemo, useRef, useState, useEffect } from 'react'
import { getTimezoneOptions, type TimezoneOption } from '@/lib/onboarding-constants'
import { ChevronDown, Search, Check, Globe } from 'lucide-react'

interface TimezoneSelectProps {
  value: string | null
  onChange: (tz: string) => void
  error?: string | null
}

export function TimezoneSelect({ value, onChange, error }: TimezoneSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const options = useMemo(() => getTimezoneOptions(), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options.slice(0, 60) // show the first chunk until they search
    return options
      .filter((o: TimezoneOption) => o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q))
      .slice(0, 60)
  }, [options, query])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <div className="text-sm font-medium text-zinc-200 mb-1.5">
        Timezone <span className="text-red-400">*</span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 rounded-md border bg-zinc-950 px-3 py-2.5 text-left text-sm transition-colors
          ${error ? 'border-red-500/70' : 'border-zinc-700 hover:border-zinc-600'} ${open ? 'border-amber-500/70' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          <Globe className="h-4 w-4 shrink-0 text-zinc-500" />
          {value ? (
            <span className="text-zinc-100 truncate">{value}</span>
          ) : (
            <span className="text-zinc-500">Select your shop&apos;s timezone…</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timezones…"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-sm text-zinc-500">No timezones match &quot;{query}&quot;</p>
            )}
            {filtered.map((tz) => (
              <button
                key={tz.value}
                type="button"
                onClick={() => {
                  onChange(tz.value)
                  setOpen(false)
                  setQuery('')
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
              >
                <span className="truncate">{tz.value}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-500">{tz.label.replace(tz.value, '').trim()}</span>
                  {value === tz.value && <Check className="h-4 w-4 text-amber-400" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
