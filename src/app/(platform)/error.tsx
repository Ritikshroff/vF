'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PlatformError]', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16 lg:py-24">
      <motion.div
        className="text-center max-w-lg mx-auto"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error)/0.2)] flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-[rgb(var(--error))]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))] mb-3">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-[rgb(var(--muted))] text-sm sm:text-base mb-2 leading-relaxed max-w-sm mx-auto">
          We encountered an error while loading this page. Please try again or navigate to the dashboard.
        </p>

        {/* Error digest */}
        {error.digest && (
          <p className="text-[rgb(var(--subtle))] text-xs mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-6" />}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/brand/dashboard"
            className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
