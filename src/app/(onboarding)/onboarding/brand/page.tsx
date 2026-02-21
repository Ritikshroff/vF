'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { completeBrandOnboarding } from '@/lib/auth'
import { fadeInUp } from '@/lib/animations'

const INDUSTRIES = [
  'Fashion & Beauty',
  'Technology',
  'Food & Beverage',
  'Fitness & Wellness',
  'Travel & Lifestyle',
  'Gaming & Entertainment',
  'Finance & Business',
  'Education',
  'Health & Medical',
  'Other',
]

const COMPANY_SIZE_OPTIONS = [
  { label: '1-10 employees', value: 'STARTUP_1_10' },
  { label: '11-50 employees', value: 'SMALL_11_50' },
  { label: '51-200 employees', value: 'MEDIUM_51_200' },
  { label: '201-500 employees', value: 'LARGE_201_500' },
  { label: '501-1000 employees', value: 'ENTERPRISE_501_1000' },
  { label: '1000+ employees', value: 'ENTERPRISE_1000_PLUS' },
]

export default function BrandOnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const canSubmit = formData.companyName.trim().length >= 2 && formData.industry

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      await completeBrandOnboarding({
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        ...(formData.companySize && { companySize: formData.companySize }),
      })
      refreshUser()
      router.push('/brand/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
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
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Set up your brand</h2>
              <p className="text-sm text-[rgb(var(--muted))]">
                Tell us about your company to get started
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  placeholder="Acme Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  disabled={loading}
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry *</label>
                <select
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  disabled={loading}
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              {/* Company Size (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Company Size <span className="text-[rgb(var(--muted))] font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPANY_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        companySize: prev.companySize === size.value ? '' : size.value,
                      }))}
                      disabled={loading}
                      className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                        formData.companySize === size.value
                          ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                          : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{size.label}</span>
                        {formData.companySize === size.value && (
                          <Check className="h-4 w-4 text-[rgb(var(--brand-primary))] shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <p className="text-xs text-[rgb(var(--muted))] text-center pt-2">
                You can add goals, budget, and website from your Settings later
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
