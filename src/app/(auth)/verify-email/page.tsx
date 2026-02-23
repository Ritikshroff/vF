'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { sendVerificationEmail, verifyEmail } from '@/lib/auth'
import { fadeInUp } from '@/lib/animations'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Auto-verify for demo purposes after 3 seconds
  useEffect(() => {
    if (!user) {
      router.push('/sign-up')
      return
    }

    if (user.emailVerified) {
      router.push('/role-selector')
      return
    }

    // Check if there's a verification token in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      handleVerify(token)
    }
  }, [user, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerify = async (token?: string) => {
    if (!user || !token) return

    setLoading(true)
    try {
      await verifyEmail(token)
      refreshUser()
      setVerified(true)

      // Redirect to role selector after verification
      setTimeout(() => {
        router.push('/role-selector')
      }, 2000)
    } catch (err) {
      console.error('Verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!user) return

    setResendLoading(true)
    setResendSuccess(false)

    try {
      await sendVerificationEmail(user.email)
      setResendSuccess(true)
    } catch (err) {
      console.error('Resend error:', err)
    } finally {
      setResendLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start md:items-center justify-center py-4 md:py-10 px-4 sm:px-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center">
              {verified ? (
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              ) : (
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              )}
            </div>
            <CardTitle>
              {verified ? "Email verified!" : "Verify your email"}
            </CardTitle>
            <CardDescription>
              {verified
                ? "Your email has been successfully verified"
                : "We've sent a verification email to"}
            </CardDescription>
            {!verified && (
              <p className="text-sm font-medium mt-2">{user.email}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {verified ? (
              <>
                <div className="text-center text-[rgb(var(--muted))] text-sm">
                  Redirecting you to complete your profile...
                </div>
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--brand-primary))]" />
                </div>
              </>
            ) : (
              <>
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))] mx-auto mb-4" />
                    <p className="text-sm text-[rgb(var(--muted))]">Verifying your email...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-[rgb(var(--muted))] text-center space-y-2">
                      <p>
                        Click the verification link in the email to activate your account.
                      </p>
                      <p className="text-xs">
                        The verification link will expire in 24 hours.
                      </p>
                    </div>

                    {resendSuccess && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                        <p className="text-sm text-green-600">
                          Verification email resent!
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 sm:space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleResend}
                        disabled={resendLoading}
                      >
                        {resendLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resend verification email
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => router.push('/role-selector')}
                      >
                        Skip for now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-center text-[rgb(var(--muted))]">
                      Didn't receive the email? Check your spam folder or contact support.
                    </p>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
