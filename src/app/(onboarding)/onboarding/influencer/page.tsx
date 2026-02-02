'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle, Hash, Sparkles, Share2, ArrowRight, ArrowLeft, Check, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { completeInfluencerOnboarding } from '@/lib/auth'
import { slideInRight } from '@/lib/animations'
import { SOCIAL_PLATFORMS, INFLUENCER_CATEGORIES } from '@/lib/constants'

const CONTENT_TYPES = [
  'Photos',
  'Videos',
  'Stories',
  'Reels/Shorts',
  'Live Streams',
  'Blog Posts',
  'Podcasts',
  'Reviews',
]

interface PlatformInput {
  platform: string
  handle: string
  followers: string
}

export default function InfluencerOnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    categories: [] as string[],
    platforms: [] as PlatformInput[],
    contentTypes: [] as string[],
    location: '',
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

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleContentTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type],
    }))
  }

  const addPlatform = () => {
    setFormData(prev => ({
      ...prev,
      platforms: [...prev.platforms, { platform: '', handle: '', followers: '' }],
    }))
  }

  const removePlatform = (index: number) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index),
    }))
  }

  const updatePlatform = (index: number, field: keyof PlatformInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const dataToSubmit = {
        ...formData,
        platforms: formData.platforms.map(p => ({
          platform: p.platform,
          handle: p.handle,
          followers: parseInt(p.followers.replace(/,/g, '')) || 0,
        })),
      }
      await completeInfluencerOnboarding(dataToSubmit)
      refreshUser()
      router.push('/influencer/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.username && formData.bio
      case 2:
        return formData.categories.length > 0
      case 3:
        return formData.platforms.length > 0 &&
               formData.platforms.every(p => p.platform && p.handle && p.followers)
      case 4:
        return formData.contentTypes.length > 0
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
                {/* Step 1: Profile */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <UserCircle className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Create your profile</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Tell brands about yourself
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username *</label>
                        <Input
                          placeholder="@yourhandle"
                          icon={Hash}
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bio *</label>
                        <textarea
                          className="w-full min-h-[120px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]"
                          placeholder="Tell brands what makes you unique..."
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          maxLength={300}
                        />
                        <p className="text-xs text-[rgb(var(--muted))] text-right">
                          {formData.bio.length}/300
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location (Optional)</label>
                        <Input
                          placeholder="New York, USA"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Categories */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Your niche</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Select categories that match your content (at least one)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {INFLUENCER_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.categories.includes(category)
                              ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium">{category}</span>
                            {formData.categories.includes(category) && (
                              <Check className="h-4 w-4 text-[rgb(var(--brand-primary))] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map(category => (
                          <Badge key={category} variant="primary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Social Platforms */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Share2 className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Your social platforms</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Add your social media accounts
                      </p>
                    </div>

                    <div className="space-y-4">
                      {formData.platforms.map((platform, index) => (
                        <div key={index} className="p-4 border border-[rgb(var(--border))] rounded-lg space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Platform {index + 1}</span>
                            <button
                              onClick={() => removePlatform(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <select
                            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-2 text-sm"
                            value={platform.platform}
                            onChange={(e) => updatePlatform(index, 'platform', e.target.value)}
                          >
                            <option value="">Select platform</option>
                            {SOCIAL_PLATFORMS.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>

                          <Input
                            placeholder="@handle"
                            value={platform.handle}
                            onChange={(e) => updatePlatform(index, 'handle', e.target.value)}
                          />

                          <Input
                            placeholder="Followers (e.g., 50000)"
                            type="number"
                            value={platform.followers}
                            onChange={(e) => updatePlatform(index, 'followers', e.target.value)}
                          />
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addPlatform}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Platform
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Content Types */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Content you create</h2>
                      <p className="text-[rgb(var(--muted))]">
                        What types of content do you produce? (Select at least one)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {CONTENT_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleContentTypeToggle(type)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.contentTypes.includes(type)
                              ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium">{type}</span>
                            {formData.contentTypes.includes(type) && (
                              <Check className="h-4 w-4 text-[rgb(var(--brand-primary))] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {formData.contentTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.contentTypes.map(type => (
                          <Badge key={type} variant="primary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
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
