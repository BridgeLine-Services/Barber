'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  Clock,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  User,
  Settings,
  ScrollText,
  CalendarOff,
  UsersRound,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  userName: string
  userRole: string
  businessName: string
}

export function Sidebar({ userName, userRole, businessName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isOwner = userRole === 'OWNER'

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
    { name: 'Waitlist', href: '/dashboard/waitlist', icon: Users },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Services', href: '/dashboard/services', icon: Scissors },
    { name: 'Schedule', href: '/dashboard/schedule', icon: Clock },
    { name: 'Closures', href: '/dashboard/closures', icon: CalendarOff },
    ...(isOwner
      ? [
          { name: 'Barbers', href: '/dashboard/barbers', icon: UserCircle },
          { name: 'Settings', href: '/dashboard/settings', icon: Settings },
          { name: 'Audit Log', href: '/dashboard/audit-log', icon: ScrollText },
        ]
      : []),
  ]

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 leading-tight">{businessName}</h2>
            <p className="text-[10px] text-zinc-400 capitalize">{userRole.toLowerCase()} portal</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-zinc-100 truncate font-serif">{businessName}</h1>
              <p className="text-xs text-amber-500/90 font-medium">Barber Dashboard</p>
            </div>
          </div>
          <button
            onClick={closeMobile}
            className="lg:hidden text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 text-sm font-semibold">
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-zinc-200 truncate">{userName}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                    <Shield className="w-3 h-3" /> Owner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <User className="w-3 h-3" /> Barber
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full bg-zinc-900 hover:bg-red-950/30 text-zinc-300 hover:text-red-400 border-zinc-800 hover:border-red-900/50 justify-start gap-2 h-9 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-500 hover:text-red-400" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
