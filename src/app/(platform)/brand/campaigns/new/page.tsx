'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateCampaign } from '@/hooks/mutations/use-campaign-mutations'
import { INFLUENCER_CATEGORIES, SOCIAL_PLATFORMS } from '@/lib/constants'
import { slideInRight } from '@/lib/animations'

const CAMPAIGN_GOALS = [
  'Brand Awareness',
  'Product Launch',
  'Sales Conversion',
  'Website Traffic',
  'Social Media Growth',
  'Community Engagement',
  'Content Creation',
  'App Downloads',
]

const CONTENT_TYPES = [
  'Instagram Post',
  'Instagram Story',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'YouTube Short',
  'Blog Post',
  'Podcast',
]

interface Deliverable {
  type: string
  quantity: number
  description: string
}

export default function CampaignBuilderPage() {
  const router = useRouter()
  const createCampaignMutation = useCreateCampaign()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goals: [] as string[],
    platforms: [] as string[],
    minFollowers: '',
    maxFollowers: '',
    minEngagement: '',
    contentTypes: [] as string[],
    deliverables: [] as Deliverable[],
    minBudget: '',
    maxBudget: '',
    applicationDeadline: '',
    startDate: '',
    endDate: '',
    contentDueDate: '',
    targetAgeRanges: [] as string[],
    targetGenders: [] as string[],
    targetLocations: [] as string[],
  })

  const totalSteps = 5

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

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item]
  }

  const addDeliverable = () => {
    setFormData((prev) => ({
      ...prev,
      deliverables: [
        ...prev.deliverables,
        { type: '', quantity: 1, description: '' },
      ],
    }))
  }

  const removeDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }))
  }

  const updateDeliverable = (index: number, field: keyof Deliverable, value: any) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) =>
        i === index ? { ...d, [field]: value } : d
      ),
    }))
  }

  const loading = createCampaignMutation.isPending

  const handleSubmit = async () => {
    // Build requirements string from deliverables and content types
    const requirementsParts: string[] = []
    if (formData.contentTypes.length > 0) {
      requirementsParts.push(`Content types: ${formData.contentTypes.join(', ')}`)
    }
    if (formData.deliverables.length > 0) {
      requirementsParts.push(
        `Deliverables: ${formData.deliverables.map((d) => `${d.quantity}x ${d.type} - ${d.description}`).join('; ')}`
      )
    }
    if (formData.minEngagement) {
      requirementsParts.push(`Min engagement rate: ${formData.minEngagement}%`)
    }

    const listingData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      requirements: requirementsParts.join('\n') || undefined,
      budgetMin: parseInt(formData.minBudget) || 0,
      budgetMax: parseInt(formData.maxBudget) || 0,
      compensationType: 'FIXED' as const,
      targetNiches: formData.goals.length > 0 ? formData.goals : [formData.category].filter(Boolean),
      targetPlatforms: formData.platforms,
      minFollowers: parseInt(formData.minFollowers) || undefined,
      maxFollowers: formData.maxFollowers ? parseInt(formData.maxFollowers) : undefined,
      targetLocations: formData.targetLocations.length > 0 ? formData.targetLocations : undefined,
      targetAgeRange: formData.targetAgeRanges.length > 0 ? formData.targetAgeRanges.join(', ') : undefined,
      targetGender: formData.targetGenders.length > 0 ? formData.targetGenders.join(', ') : undefined,
      totalSlots: 10,
      applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
      campaignStartDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      campaignEndDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    }

    createCampaignMutation.mutate(listingData, {
      onSuccess: () => {
        router.push('/brand/campaigns')
      },
    })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category
      case 2:
        return (
          formData.goals.length > 0 &&
          formData.platforms.length > 0 &&
          formData.minFollowers
        )
      case 3:
        return formData.contentTypes.length > 0 && formData.deliverables.length > 0
      case 4:
        return formData.minBudget && formData.maxBudget
      case 5:
        return (
          formData.applicationDeadline &&
          formData.startDate &&
          formData.endDate &&
          formData.contentDueDate
        )
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))] py-4 sm:py-6 lg:py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline">Draft</Badge>
        </div>

        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 gradient-text">
            Create New Campaign
          </h1>
          <p className="text-base sm:text-lg text-[rgb(var(--muted))]">
            Launch your influencer marketing campaign in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-[rgb(var(--muted))]">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4 overflow-x-auto pb-2 gap-2">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Requirements' },
              { num: 3, label: 'Deliverables' },
              { num: 4, label: 'Budget' },
              { num: 5, label: 'Timeline' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 flex-shrink-0 ${
                  step >= s.num ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))]'
                  }`}
                >
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className="text-xs hidden lg:inline whitespace-nowrap">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideInRight}
          >
            <Card className="border-2">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-3 sm:mb-4">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">Campaign Details</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Tell us about your campaign
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Campaign Title *
                        </label>
                        <Input
                          placeholder="e.g., Summer Product Launch 2026"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description *
                        </label>
                        <textarea
                          className="w-full min-h-[120px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]"
                          placeholder="Describe your campaign, goals, and what you're looking for..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          maxLength={500}
                        />
                        <p className="text-xs text-[rgb(var(--muted))] text-right">
                          {formData.description.length}/500
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category *</label>
                        <select
                          className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-base"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select a category</option>
                          {INFLUENCER_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Requirements */}
                {step === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-3 sm:mb-4">
                        <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">
                        Campaign Requirements
                      </h2>
                      <p className="text-[rgb(var(--muted))]">
                        Define your target influencers
                      </p>
                    </div>

                    {/* Goals */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Campaign Goals * (Select at least one)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CAMPAIGN_GOALS.map((goal) => (
                          <button
                            key={goal}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                goals: toggleArrayItem(prev.goals, goal),
                              }))
                            }
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              formData.goals.includes(goal)
                                ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                                : 'border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium">{goal}</span>
                              {formData.goals.includes(goal) && (
                                <Check className="h-4 w-4 text-[rgb(var(--brand-primary))] flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Platforms * (Select at least one)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                platforms: toggleArrayItem(
                                  prev.platforms,
                                  platform.name
                                ),
                              }))
                            }
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              formData.platforms.includes(platform.name)
                                ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                                : 'border-[rgb(var(--border))]'
                            }`}
                          >
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Follower Range */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Min Followers *
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 10000"
                          value={formData.minFollowers}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              minFollowers: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Max Followers (Optional)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 500000"
                          value={formData.maxFollowers}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxFollowers: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Min Engagement */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Minimum Engagement Rate (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.5"
                        value={formData.minEngagement}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            minEngagement: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Deliverables */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Content Deliverables</h2>
                      <p className="text-[rgb(var(--muted))]">
                        What content do you need?
                      </p>
                    </div>

                    {/* Content Types */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Content Types * (Select at least one)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CONTENT_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                contentTypes: toggleArrayItem(prev.contentTypes, type),
                              }))
                            }
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              formData.contentTypes.includes(type)
                                ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/5'
                                : 'border-[rgb(var(--border))]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium">{type}</span>
                              {formData.contentTypes.includes(type) && (
                                <Check className="h-4 w-4 text-[rgb(var(--brand-primary))] flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Specific Deliverables *
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addDeliverable}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Deliverable
                        </Button>
                      </div>

                      {formData.deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="p-4 border border-[rgb(var(--border))] rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Deliverable {index + 1}
                            </span>
                            <button
                              onClick={() => removeDeliverable(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <select
                            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-2 text-sm"
                            value={deliverable.type}
                            onChange={(e) =>
                              updateDeliverable(index, 'type', e.target.value)
                            }
                          >
                            <option value="">Select type</option>
                            {CONTENT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>

                          <Input
                            type="number"
                            placeholder="Quantity (e.g., 2)"
                            value={deliverable.quantity}
                            onChange={(e) =>
                              updateDeliverable(
                                index,
                                'quantity',
                                parseInt(e.target.value) || 1
                              )
                            }
                          />

                          <textarea
                            className="w-full min-h-[60px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-2 text-sm"
                            placeholder="Description (e.g., 60-second Reels showcasing our product)"
                            value={deliverable.description}
                            onChange={(e) =>
                              updateDeliverable(index, 'description', e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Budget */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Campaign Budget</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Set your budget range
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Minimum Budget (USD) *
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 3000"
                          value={formData.minBudget}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              minBudget: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Maximum Budget (USD) *
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 6000"
                          value={formData.maxBudget}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxBudget: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {formData.minBudget && formData.maxBudget && (
                      <div className="p-6 rounded-lg bg-[rgb(var(--surface))] border-2 border-[rgb(var(--brand-primary))]/20">
                        <div className="text-center">
                          <div className="text-sm text-[rgb(var(--muted))] mb-2">
                            Total Budget Range
                          </div>
                          <div className="text-4xl font-bold gradient-text">
                            ${parseInt(formData.minBudget).toLocaleString()} - $
                            {parseInt(formData.maxBudget).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Timeline */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] mb-4">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Campaign Timeline</h2>
                      <p className="text-[rgb(var(--muted))]">
                        Set important dates
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Application Deadline *
                        </label>
                        <Input
                          type="date"
                          value={formData.applicationDeadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              applicationDeadline: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Campaign Start Date *
                          </label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Campaign End Date *
                          </label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Content Due Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.contentDueDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contentDueDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Campaign
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
