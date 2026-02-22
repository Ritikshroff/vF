'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserCircle, Hash, Check, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { completeInfluencerOnboarding } from '@/lib/auth'
import { fadeInUp } from '@/lib/animations'
import { INFLUENCER_CATEGORIES } from '@/lib/constants'

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TWITTER', label: 'Twitter / X' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
]

export default function InfluencerOnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    categories: [] as string[],
    platform: '',
    handle: '',
    followers: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }))
  }

  const canSubmit =
    formData.username.trim().length >= 3 &&
    formData.categories.length >= 1 &&
    formData.platform &&
    formData.handle.trim().length >= 1

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      await completeInfluencerOnboarding({
        username: formData.username.trim(),
        fullName: user?.name || formData.username,
        bio: formData.bio || undefined,
        categories: formData.categories,
        platforms: [{
          platform: formData.platform,
          handle: formData.handle.trim(),
          followers: parseInt(formData.followers.replace(/,/g, '')) || 0,
          verified: false,
        }],
        contentTypes: [],
      } as any)
      toast.success('Influencer profile created!')
      refreshUser()
      router.push('/influencer/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-10 lg:py-12 px-4 sm:px-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-lg"
      >
        <Card>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                <UserCircle className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Set up your profile</h2>
              <p className="text-sm text-[rgb(var(--muted))]">
                Let brands discover you
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Username *</label>
                <Input
                  placeholder="yourname"
                  icon={Hash}
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ''),
                  }))}
                  disabled={loading}
                />
                <p className="text-xs text-[rgb(var(--muted))]">
                  3-30 characters, letters, numbers &amp; underscores only
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Bio <span className="text-[rgb(var(--muted))] font-normal">(optional)</span>
                  </label>
                  <span className="text-xs text-[rgb(var(--muted))]">
                    {formData.bio.length}/500
                  </span>
                </div>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]"
                  placeholder="Tell brands about yourself and what you create..."
                  maxLength={500}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={loading}
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categories * <span className="text-[rgb(var(--muted))] font-normal">(pick at least 1)</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {INFLUENCER_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium text-left ${
                        formData.categories.includes(category)
                          ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5 text-[rgb(var(--brand-primary))]'
                          : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{category}</span>
                        {formData.categories.includes(category) && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.categories.map(cat => (
                      <Badge key={cat} variant="primary" size="sm">{cat}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Platform */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Primary Platform *</label>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]"
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                    disabled={loading}
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="@handle"
                      value={formData.handle}
                      onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                      disabled={loading}
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Followers"
                      value={formData.followers}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        followers: e.target.value.replace(/[^0-9,]/g, ''),
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Info note */}
              <p className="text-xs text-[rgb(var(--muted))] text-center">
                Connect more platforms and set content types from your Settings later
              </p>

              {/* Submit Button */}
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
