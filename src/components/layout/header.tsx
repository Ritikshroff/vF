'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { NotificationsDropdown } from '@/components/notifications/notifications-dropdown'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'
import { MARKETING_NAV_LINKS, APP_NAME } from '@/lib/constants'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

interface HeaderProps {
  variant?: 'marketing' | 'platform'
  className?: string
}

export function Header({ variant = 'marketing', className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-[rgb(var(--border))] bg-[rgb(var(--background)_/_0.95)] backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--background)_/_0.8)]',
          className
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]" />
            <span className="text-xl font-bold gradient-text">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          {mounted && variant === 'marketing' && (
            <nav aria-label="Main navigation" className="hidden lg:flex items-center space-x-1">
              {MARKETING_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgb(var(--surface-hover))] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {mounted && !isLoading && (
              <>
                {user ? (
                  <>
                    {variant === 'platform' && <NotificationsDropdown />}
                    <UserMenu />
                  </>
                ) : (
                  variant === 'marketing' && (
                    <>
                      <Link href="/login" className="hidden lg:inline-flex">
                        <Button variant="ghost">Log In</Button>
                      </Link>
                      <Link href="/sign-up" className="hidden lg:inline-flex">
                        <Button variant="gradient">Get Started</Button>
                      </Link>
                    </>
                  )
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        variant={variant}
      />
    </>
  )
}
