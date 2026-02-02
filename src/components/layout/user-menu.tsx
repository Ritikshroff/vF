'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const dashboardLink = user.role ? `/${user.role}/dashboard` : '/role-selector'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[rgb(var(--surface-hover))] transition-colors"
      >
        <Avatar
          src={user.avatar}
          alt={user.name}
          fallback={getInitials(user.name)}
          size="sm"
        />
        <span className="text-sm font-medium hidden md:inline">{user.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 z-50 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] shadow-lg overflow-hidden"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[rgb(var(--muted))]">{user.email}</p>
                {user.role && (
                  <p className="text-xs text-[rgb(var(--brand-primary))] mt-1 capitalize">
                    {user.role} Account
                  </p>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href={dashboardLink}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[rgb(var(--surface-hover))] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {user.role && (
                  <Link
                    href={`/${user.role}/profile`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[rgb(var(--surface-hover))] transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                )}

                {user.role && (
                  <Link
                    href={`/${user.role}/settings`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[rgb(var(--surface-hover))] transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                )}
              </div>

              {/* Logout */}
              <div className="border-t border-[rgb(var(--border))] py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-[rgb(var(--surface-hover))] transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
