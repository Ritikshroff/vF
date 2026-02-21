'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Building2, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { fadeInUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [selectedRole, setSelectedRole] = useState<'BRAND' | 'INFLUENCER'>('BRAND')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      await signUp({ ...formData, role: selectedRole })
      router.push(`/onboarding/${selectedRole.toLowerCase()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-10 lg:py-12 px-4 sm:px-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Create your account
          </h1>
          <p className="text-sm sm:text-base text-[rgb(var(--muted))]">
            Join thousands of brands and influencers
          </p>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Role Selector Tabs */}
            <div className="bg-[rgb(var(--surface))] p-1.5 rounded-xl flex space-x-1 mb-6">
              <button
                type="button"
                onClick={() => { setSelectedRole('BRAND'); setError('') }}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
                  selectedRole === 'BRAND'
                    ? 'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--brand-primary))] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]'
                    : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                )}
              >
                <Building2 className="h-4 w-4" />
                I&apos;m a Brand
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('INFLUENCER'); setError('') }}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
                  selectedRole === 'INFLUENCER'
                    ? 'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--brand-primary))] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]'
                    : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                )}
              >
                <UserCircle className="h-4 w-4" />
                I&apos;m an Influencer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  icon={User}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-[rgb(var(--muted))]">
                  Min 8 chars with uppercase, lowercase, number &amp; special character
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Get started as {selectedRole === 'BRAND' ? 'a Brand' : 'an Influencer'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-[rgb(var(--muted))]">Already have an account? </span>
                <Link
                  href="/login"
                  className="text-[rgb(var(--brand-primary))] hover:underline font-medium"
                >
                  Log in
                </Link>
              </div>

              <div className="text-xs text-center text-[rgb(var(--muted))]">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[rgb(var(--foreground))]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-[rgb(var(--foreground))]">
                  Privacy Policy
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
