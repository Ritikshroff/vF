import Link from 'next/link'
import { Home } from 'lucide-react'
import { BackButton } from '@/components/shared/back-button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        {/* Large 404 Display */}
        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tighter mb-2">
          <span className="gradient-text-gold">404</span>
        </h1>

        {/* Decorative gold divider */}
        <div className="divider-gold w-24 mx-auto mb-6" />

        {/* Title */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgb(var(--foreground))] mb-3">
          Page not found
        </h2>

        {/* Description */}
        <p className="text-[rgb(var(--muted))] text-sm sm:text-base mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Let us help you find your way back.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <BackButton />
        </div>
      </div>
    </div>
  )
}
