import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' })

export const metadata: Metadata = {
  title: {
    default: 'Barber Shop | Book Your Appointment',
    template: '%s | Barber Shop',
  },
  description: 'Book your next haircut or beard trim. Pay in person — no app download required.',
  keywords: ['barber shop', 'haircut', 'beard trim', 'fades', 'barber near me', 'book appointment'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Barber Shop | Book Your Appointment',
    description: 'Book your next haircut or beard trim. Pay in person — no app download required.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
