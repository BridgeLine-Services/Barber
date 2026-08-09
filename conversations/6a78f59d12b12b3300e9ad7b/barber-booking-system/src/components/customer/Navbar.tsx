'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Menu, X, Calendar, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  businessName?: string
  logo?: string | null
  phone?: string | null
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/barbers', label: 'Barbers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar({ businessName = 'Barber Shop', logo, phone }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md text-zinc-100">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Shop Name */}
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          {logo ? (
            <img src={logo} alt={businessName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Scissors className="h-5 w-5 text-amber-400" />
            </div>
          )}
          <span className="text-lg font-bold tracking-tight text-white font-poppins">
            {businessName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-amber-400 ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-zinc-300'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA & Phone */}
        <div className="hidden md:flex items-center gap-4">
          {phone && (
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition"
            >
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>{phone}</span>
            </a>
          )}
          <Button
            asChild
            className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold px-5 shadow-sm shadow-amber-500/20"
          >
            <Link href="/book">
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold px-3 py-1 text-xs"
          >
            <Link href="/book">Book</Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          {phone && (
            <div className="pt-2 border-t border-zinc-800/60 px-3">
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 py-1"
              >
                <Phone className="h-4 w-4 text-amber-400" />
                <span>Call Us: {phone}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
