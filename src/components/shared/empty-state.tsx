'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeInUp } from '@/lib/animations'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  linkHref?: string
  linkLabel?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, linkHref, linkLabel, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center ${className}`}
    >
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgb(var(--surface))]">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-[rgb(var(--muted))]" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[rgb(var(--muted))] max-w-sm mb-6">{description}</p>
      )}
      {linkHref && linkLabel && (
        <Link href={linkHref}>
          <Button variant="gradient">{linkLabel}</Button>
        </Link>
      )}
      {action && (
        <Button variant="gradient" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
