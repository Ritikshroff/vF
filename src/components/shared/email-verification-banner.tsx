'use client'

import { useState } from 'react'
import { Mail, X, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { sendVerificationEmail } from '@/lib/auth'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!user || user.emailVerified || dismissed) return null

  const handleResend = async () => {
    setSending(true)
    try {
      await sendVerificationEmail(user.email)
      setSent(true)
    } catch {
      // Silently fail
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-[rgb(var(--brand-primary))]/10 border border-[rgb(var(--brand-primary))]/20 rounded-lg p-3 sm:p-4 flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {sent ? (
          <CheckCircle className="h-5 w-5 text-[rgb(var(--success))] shrink-0" />
        ) : (
          <Mail className="h-5 w-5 text-[rgb(var(--brand-primary))] shrink-0" />
        )}
        <p className="text-sm truncate">
          {sent
            ? 'Verification email sent! Check your inbox.'
            : 'Verify your email to unlock all features.'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!sent && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Resend'}
          </Button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
