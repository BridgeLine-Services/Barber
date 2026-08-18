import Link from 'next/link'
import { Scissors, MapPin, Phone, Mail, Clock, Instagram, Facebook, Video, Lock } from 'lucide-react'

interface FooterProps {
  business?: {
    name?: string
    phone?: string | null
    email?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
    hours?: any
  } | null
}

export function Footer({ business }: FooterProps) {
  const shopName = business?.name || 'Barber Shop'
  const fullAddress = [business?.address, business?.city, business?.state, business?.zipCode]
    .filter(Boolean)
    .join(', ')

  // Fallback contact info when business data is not available
  const phone = business?.phone || '(555) 555-0199'
  const email = business?.email || 'hello@thebarberco.com'
  const address = fullAddress || '456 Style Avenue, Your City'

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white font-poppins">{shopName}</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Premium haircuts, precision fades, and classic beard care. Book your appointment online and pay in person.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {business?.instagram && (
                <a
                  href={business.instagram.startsWith('http') ? business.instagram : `https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {business?.facebook && (
                <a
                  href={business.facebook.startsWith('http') ? business.facebook : `https://facebook.com/${business.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {business?.tiktok && (
                <a
                  href={business.tiktok.startsWith('http') ? business.tiktok : `https://tiktok.com/@${business.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
                  aria-label="TikTok"
                >
                  <Video className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-zinc-100 font-semibold text-base font-poppins">Contact & Location</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-amber-400 transition">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-amber-400 transition">
                  {email}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-zinc-100 font-semibold text-base font-poppins">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">Home</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-amber-400 transition">Services & Pricing</Link>
              </li>
              <li>
                <Link href="/barbers" className="hover:text-amber-400 transition">Meet Our Barbers</Link>
              </li>
              <li>
                <Link href="/book" className="text-amber-400 hover:underline font-medium">Book Appointment</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition">About Us</Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-amber-400 transition">Client Reviews</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Policy & Hours */}
          <div className="space-y-3">
            <h3 className="text-zinc-100 font-semibold text-base font-poppins">Shop Policies & Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/booking-policy" className="hover:text-amber-400 transition">Booking & Cancellation Policy</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition">Terms of Service</Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-amber-400 transition">Accessibility</Link>
              </li>
            </ul>
            <div className="pt-2">
              <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Pay in Person — No upfront online payment required
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} {shopName?.replace(/\.$/, '')}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-zinc-500">
              Powered by Barber Booking System
            </p>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-zinc-600 hover:text-amber-400 transition"
              aria-label="Staff Login"
            >
              <Lock className="h-3 w-3" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
