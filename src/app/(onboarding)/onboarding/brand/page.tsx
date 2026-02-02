'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Target, Users, DollarSign, Globe, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { completeBrandOnboarding } from '@/lib/auth'
import { fadeInUp, slideInRight } from '@/lib/animations'

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

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501+ employees',
]

const GOALS = [
  'Increase brand awareness',
  'Drive website traffic',
  'Generate leads',
  'Boost sales',
  'Grow social media following',
  'Launch new product',
  'Build brand credibility',
  'Reach new audiences',
]

const BUDGETS = [
  'Less than $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000+',
]

export default function BrandOnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    goals: [] as string[],
    budget: '',
  })

  const totalSteps = 4

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await completeBrandOnboarding(formData)
      refreshUser()
      router.push('/brand/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.companyName && formData.industry
      case 2:
        return formData.companySize
      case 3:
        return formData.goals.length > 0
      case 4:
        return formData.budget
      default:
        return false
    }
  }

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-[rgb(var(--muted))]">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideInRight}
          >
            <Card>
              <CardContent className="p-8">
                {/* Step 1: Company Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Tell us about your company</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Help us understand your business better
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name *</label>
                        <Input
                          placeholder="Acme Inc."
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Industry *</label>
                        <select
                          className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]"
                          value={formData.industry}
                          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        >
                          <option value="">Select an industry</option>
                          {INDUSTRIES.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Website (Optional)</label>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          icon={Globe}
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Company Size */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Company size</h2>
                      <p className="text-[rgb(var(--muted))]">
                        How many people work at your company?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {COMPANY_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => setFormData(prev => ({ ...prev, companySize: size }))}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.companySize === size
                              ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{size}</span>
                            {formData.companySize === size && (
                              <Check className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Goals */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">What are your goals?</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Select all that apply (at least one)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {GOALS.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => handleGoalToggle(goal)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.goals.includes(goal)
                              ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium">{goal}</span>
                            {formData.goals.includes(goal) && (
                              <Check className="h-4 w-4 text-[rgb(var(--brand-primary))] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {formData.goals.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.goals.map(goal => (
                          <Badge key={goal} variant="primary">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Budget */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Campaign budget</h2>
                      <p className="text-[rgb(var(--muted))]">
                        What's your typical campaign budget?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {BUDGETS.map((budget) => (
                        <button
                          key={budget}
                          onClick={() => setFormData(prev => ({ ...prev, budget }))}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.budget === budget
                              ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{budget}</span>
                            {formData.budget === budget && (
                              <Check className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgb(var(--border))]">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1 || loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {step < totalSteps ? (
                    <Button
                      variant="gradient"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="gradient"
                      onClick={handleSubmit}
                      disabled={!canProceed() || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
