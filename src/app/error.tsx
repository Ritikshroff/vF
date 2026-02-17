'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console (in production, send to error reporting service like Sentry)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error)/0.2)] flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-[rgb(var(--error))]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgb(var(--foreground))] mb-3">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-[rgb(var(--muted))] text-sm sm:text-base mb-2 leading-relaxed">
          An unexpected error occurred. We apologize for the inconvenience.
        </p>

        {/* Error digest for debugging */}
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
            href="/"
            className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
