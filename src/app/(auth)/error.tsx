'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, LogIn } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AuthError]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center px-4 py-16 sm:py-24">
      <motion.div
        className="text-center max-w-sm mx-auto"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--error)/0.1)] border border-[rgb(var(--error)/0.2)] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[rgb(var(--error))]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))] mb-2">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-[rgb(var(--muted))] text-sm mb-6 leading-relaxed">
          We could not complete your request. Please try again.
        </p>

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
            href="/login"
            className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center"
          >
            <LogIn className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
