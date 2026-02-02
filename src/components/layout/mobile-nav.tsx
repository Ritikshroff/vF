'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MARKETING_NAV_LINKS, APP_NAME } from '@/lib/constants'
import { backdropVariants, mobileMenuVariants } from '@/lib/animations'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  variant?: 'marketing' | 'platform'
}

export function MobileNav({ open, onClose, variant = 'marketing' }: MobileNavProps) {
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
              </nav>

              {/* Footer Actions */}
              {variant === 'marketing' && (
                <div className="p-6 space-y-3 border-t border-[rgb(var(--border))]">
                  <Link href="/role-selector" onClick={onClose} className="block">
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/role-selector" onClick={onClose} className="block">
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
