'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, UserCircle, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { fadeInUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

export default function SelectRolePage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [selectedRole, setSelectedRole] = useState<'BRAND' | 'INFLUENCER'>('BRAND')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/select-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to set role')
      }

      await refreshUser()
      toast.success('Welcome to Viralfluencer!')
      router.push(`/onboarding/${selectedRole.toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
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
            How will you use Viralfluencer?
          </h1>
          <p className="text-sm sm:text-base text-[rgb(var(--muted))]">
            Select your role to get a personalized experience
          </p>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Role Selection Cards */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedRole('BRAND')}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-start gap-4',
                  selectedRole === 'BRAND'
                    ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                    : 'border-[rgb(var(--border))] hover:border-[rgb(var(--muted))]'
                )}
              >
                <div className={cn(
                  'p-3 rounded-lg shrink-0',
                  selectedRole === 'BRAND'
                    ? 'bg-[rgb(var(--brand-primary))]/10 text-[rgb(var(--brand-primary))]'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))]'
                )}>
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">I&apos;m a Brand</h3>
                  <p className="text-sm text-[rgb(var(--muted))]">
                    Find influencers, launch campaigns, and grow your brand
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('INFLUENCER')}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-start gap-4',
                  selectedRole === 'INFLUENCER'
                    ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                    : 'border-[rgb(var(--border))] hover:border-[rgb(var(--muted))]'
                )}
              >
                <div className={cn(
                  'p-3 rounded-lg shrink-0',
                  selectedRole === 'INFLUENCER'
                    ? 'bg-[rgb(var(--brand-primary))]/10 text-[rgb(var(--brand-primary))]'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))]'
                )}>
                  <UserCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">I&apos;m an Influencer</h3>
                  <p className="text-sm text-[rgb(var(--muted))]">
                    Connect with brands, monetize your content, and grow your audience
                  </p>
                </div>
              </button>
            </div>

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue as {selectedRole === 'BRAND' ? 'a Brand' : 'an Influencer'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
