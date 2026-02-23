'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { sendPasswordResetEmail } from '@/lib/auth'
import { fadeInUp } from '@/lib/animations'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      const msg = 'Please enter your email address'
      setError(msg)
      toast.error(msg)
      return
    }

    setLoading(true)

    try {
      await sendPasswordResetEmail(email)
      setSuccess(true)
      toast.success('Password reset email sent!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email'
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
            Forgot password?
          </h1>
          <p className="text-sm sm:text-base text-[rgb(var(--muted))]">
            No worries, we'll send you reset instructions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-600">
                    Password reset email sent! Check your inbox.
                  </p>
                </div>

                <div className="text-sm text-[rgb(var(--muted))] space-y-2">
                  <p>We've sent a password reset link to <strong>{email}</strong></p>
                  <p>
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => {
                        setSuccess(false)
                        setEmail('')
                      }}
                      className="text-[rgb(var(--brand-primary))] hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>

                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to log in
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    icon={Mail}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to log in
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
