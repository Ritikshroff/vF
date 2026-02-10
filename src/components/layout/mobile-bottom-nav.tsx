'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  BarChart3,
  Megaphone,
  User,
  DollarSign,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const BRAND_BOTTOM_NAV: NavItem[] = [
  { href: '/brand/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/brand/discover', icon: Search, label: 'Discover' },
  { href: '/brand/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/brand/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/brand/analytics', icon: BarChart3, label: 'Analytics' },
]

const INFLUENCER_BOTTOM_NAV: NavItem[] = [
  { href: '/influencer/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/marketplace', icon: Store, label: 'Market' },
  { href: '/influencer/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/influencer/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/influencer/payments', icon: DollarSign, label: 'Payments' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user?.role) return null

  const items = user.role === 'brand' ? BRAND_BOTTOM_NAV : INFLUENCER_BOTTOM_NAV

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[rgb(var(--background))] border-t border-[rgb(var(--border))] safe-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-[rgb(var(--brand-primary))]'
                  : 'text-[rgb(var(--muted))]'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-[rgb(var(--brand-primary))]')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
