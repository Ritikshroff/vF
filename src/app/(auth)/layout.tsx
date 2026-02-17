import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Simple header */}
      <header className="border-b border-[rgb(var(--border))]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            <span className="gradient-text">ViralFluencer</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main id="main-content">{children}</main>
    </div>
  )
}
