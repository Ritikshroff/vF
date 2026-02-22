'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
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
import { Button } from '@/components/ui/button'
import { MARKETING_NAV_LINKS, PLATFORM_NAV_LINKS, APP_NAME } from '@/lib/constants'
import { useAuth } from '@/contexts/auth-context'
import { backdropVariants, mobileMenuVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, User, Megaphone, MessageSquare, DollarSign,
  Search, BarChart3, Store, Rss, Users, Sparkles, Award, Crown, Wallet,
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
  variant?: 'marketing' | 'platform'
}

export function MobileNav({ open, onClose, variant = 'marketing' }: MobileNavProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const role = user?.role?.toLowerCase() as 'brand' | 'influencer' | null
  const platformLinks = role ? PLATFORM_NAV_LINKS[role] ?? [] : []

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Mobile Menu */}
          <motion.div
            variants={mobileMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-[rgb(var(--surface-elevated))] shadow-2xl z-50 overflow-y-auto lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))]">
                <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]" />
                  <span className="text-xl font-bold gradient-text">{APP_NAME}</span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[rgb(var(--surface-hover))] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6 space-y-1">
                {variant === 'marketing' &&
                  MARKETING_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="block px-4 py-3 text-base font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-hover))] rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                {variant === 'platform' && platformLinks.map((link) => {
                  const Icon = ICON_MAP[link.icon] || LayoutDashboard
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive
                          ? 'bg-[rgb(var(--brand-primary))]/10 text-[rgb(var(--brand-primary))]'
                          : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-hover))]'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer Actions */}
              {variant === 'marketing' && (
                <div className="p-6 space-y-3 border-t border-[rgb(var(--border))]">
                  <Link href="/login" onClick={onClose} className="block">
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={onClose} className="block">
                    <Button variant="gradient" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
