'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useAuth } from '@/contexts/auth-context'
import { fadeInUp } from '@/lib/animations'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithOAuth } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle OAuth error redirects
  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError) {
      const messages: Record<string, string> = {
        oauth_denied: 'Google sign-in was cancelled',
        oauth_failed: 'Google sign-in failed. Please try again.',
        invalid_state: 'Session expired. Please try again.',
        unknown_provider: 'Unknown sign-in provider',
      }
      const msg = messages[oauthError] || 'Sign-in failed. Please try again.'
      setError(msg)
      toast.error(msg)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      const msg = 'Please fill in all fields'
      setError(msg)
      toast.error(msg)
      return
    }

    setLoading(true)

    try {
      const user = await login(formData)
      toast.success('Logged in successfully!')

      // Redirect based on user state
      const rolePath = user.role?.toLowerCase()
      if (!user.onboardingCompleted && user.role) {
        router.push(`/onboarding/${rolePath}`)
      } else if (user.onboardingCompleted && user.role) {
        router.push(`/${rolePath}/dashboard`)
      } else {
        router.push('/sign-up')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to log in'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start md:items-center justify-center py-4 md:py-10 px-4 sm:px-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-[rgb(var(--muted))]">
            Log in to your ViralFluencer account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[rgb(var(--brand-primary))] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
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
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--brand-primary))] focus:ring-2 focus:ring-[rgb(var(--brand-primary))]"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm">
                  Remember me for 30 days
                </label>
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
                    Logging in...
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* OAuth Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[rgb(var(--border))]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[rgb(var(--surface-elevated))] px-2 text-[rgb(var(--muted))]">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => loginWithOAuth('google')}
                disabled={loading}
              >
                <GoogleIcon className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-[rgb(var(--muted))]">Don't have an account? </span>
                <Link
                  href="/sign-up"
                  className="text-[rgb(var(--brand-primary))] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
