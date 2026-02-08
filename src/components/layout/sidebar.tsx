'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  User,
  Megaphone,
  MessageSquare,
  DollarSign,
  Search,
  BarChart3,
  Store,
  Rss,
  Users,
  Sparkles,
  Award,
  Crown,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { PLATFORM_NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  User,
  Megaphone,
  MessageSquare,
  DollarSign,
  Search,
  BarChart3,
  Store,
  Rss,
  Users,
  Sparkles,
  Award,
  Crown,
  Wallet,
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user?.role) return null

  const role = user.role as 'brand' | 'influencer'
  const links = PLATFORM_NAV_LINKS[role] || []

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--background))] h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = ICON_MAP[link.icon] || LayoutDashboard
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))]/15 to-[rgb(var(--brand-secondary))]/10 text-[rgb(var(--brand-primary))] border border-[rgb(var(--brand-primary))]/20'
                  : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-hover))]'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && 'text-[rgb(var(--brand-primary))]')} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[rgb(var(--border))]">
        <div className="px-3 py-2">
          <p className="text-[10px] text-[rgb(var(--muted))] uppercase tracking-wider">{role} account</p>
          <p className="text-sm font-medium truncate">{user.name}</p>
        </div>
      </div>
    </aside>
  )
}
