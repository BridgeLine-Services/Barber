'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scissors, Calendar, Phone } from 'lucide-react'

export function MobileBottomNav() {
  const pathname = usePathname()

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Scissors },
    { href: '/book', label: 'Book', icon: Calendar, highlight: true },
    { href: '/contact', label: 'Contact', icon: Phone },
  ]

  return (
    <nav className="sticky-bottom-nav border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-2 py-2 text-zinc-400">
      <div className="flex w-full items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-500 px-4 py-1.5 text-zinc-950 font-semibold shadow-md shadow-amber-500/20 active:scale-95 transition"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
                isActive ? 'text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
