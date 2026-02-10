'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Target,
  CheckCircle2,
  Clock,
  Instagram,
  Youtube,
  Facebook,
  AlertCircle,
  Send,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { fetchCampaignById, applyToCampaign } from '@/services/campaigns'
import { getInfluencerByUserId, getAllInfluencers } from '@/mock-data/influencers'
import type { Campaign } from '@/mock-data/campaigns'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function CampaignDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [influencer, setInfluencer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    loadCampaign()
  }, [params.id, user])

  const loadCampaign = async () => {
    try {
      const campaignId = params.id as string
      const data = await fetchCampaignById(campaignId)
      setCampaign(data)

      if (user) {
        const inf = getInfluencerByUserId(user.id)
        setInfluencer(inf)
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!campaign || !influencer) return

    setApplying(true)
    try {
      await applyToCampaign(campaign.id, influencer.id)
      alert('Application submitted successfully!')
      loadCampaign()
    } catch (error: any) {
      alert(error.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return Instagram
      case 'youtube':
        return Youtube
      case 'facebook':
        return Facebook
      default:
        return Users
    }
  }

  const getApplicationStatus = () => {
    if (!campaign || !influencer) return null

    if (campaign.accepted_influencers.includes(influencer.id)) {
      return { status: 'accepted', label: 'Accepted', variant: 'success' as const }
    }
    if (campaign.applied_influencers.includes(influencer.id)) {
      return { status: 'applied', label: 'Application Pending', variant: 'warning' as const }
    }
    if (campaign.invited_influencers.includes(influencer.id)) {
      return { status: 'invited', label: 'Invited', variant: 'primary' as const }
    }
    return { status: 'available', label: 'Available', variant: 'default' as const }
  }

  if (loading) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="h-64 bg-[rgb(var(--surface))] rounded" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <Card className="text-center py-8 sm:py-12 lg:py-16">
          <CardContent>
            <AlertCircle className="h-16 w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Campaign not found</h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              The campaign you're looking for doesn't exist.
            </p>
            <Link href="/influencer/campaigns">
              <Button>Back to Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const appStatus = getApplicationStatus()
  const canApply =
    appStatus?.status === 'available' || appStatus?.status === 'invited'
  const deadline = new Date(campaign.application_deadline)
  const isDeadlinePassed = deadline < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Back Button */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <Link href="/influencer/campaigns">
              <Button variant="ghost" size="sm" className="gap-2 min-h-[44px]">
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
          </motion.div>

          {/* Header Section - Mobile Optimized */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <Card className="border-2">
              <CardContent className="p-3 sm:p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  {/* Brand Logo */}
                  <div className="shrink-0">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                      <img src={campaign.brandLogo} alt={campaign.brandName} />
                    </Avatar>
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold flex-1 min-w-0">
                        {campaign.title}
                      </h1>
                      {appStatus && (
                        <Badge variant={appStatus.variant} className="shrink-0">
                          {appStatus.label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-[rgb(var(--muted))] mb-3 sm:mb-4">
                      <span className="font-medium text-[rgb(var(--foreground))]">
                        {campaign.brandName}
                      </span>
                      <Badge variant="outline">{campaign.category}</Badge>
                    </div>

                    <p className="text-sm sm:text-base text-[rgb(var(--muted))] mb-4 sm:mb-6">
                      {campaign.description}
                    </p>

                    {/* Quick Stats - Mobile 2 cols */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))]">Budget</div>
                          <div className="font-bold text-sm sm:text-base">
                            {formatCurrency(campaign.budget.min)}-{formatCurrency(campaign.budget.max)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))]">Spots</div>
                          <div className="font-bold text-sm sm:text-base">
                            {campaign.accepted_influencers.length}/{campaign.max_influencers}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))]">Deadline</div>
                          <div className="font-bold text-sm sm:text-base">
                            {deadline.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))]">Duration</div>
                          <div className="font-bold text-sm sm:text-base">
                            {Math.ceil(
                              (new Date(campaign.campaign_end_date).getTime() -
                                new Date(campaign.campaign_start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Section - Mobile Full Width */}
                {canApply && !isDeadlinePassed && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[rgb(var(--border))]">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        variant="gradient"
                        size="lg"
                        className="flex-1 min-h-[44px]"
                        onClick={handleApply}
                        disabled={applying}
                      >
                        <Send className="h-5 w-5 mr-2" />
                        {appStatus?.status === 'invited' ? 'Accept Invitation' : 'Apply Now'}
                      </Button>
                      <Button variant="outline" size="lg" className="flex-1 sm:flex-none min-h-[44px]">
                        Save for Later
                      </Button>
                    </div>
                  </div>
                )}

                {isDeadlinePassed && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[rgb(var(--border))]">
                    <div className="flex items-center gap-2 text-[rgb(var(--muted))]">
                      <AlertCircle className="h-5 w-5" />
                      <span>Application deadline has passed</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Campaign Goals */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Campaign Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {campaign.goals.map((goal) => (
                        <Badge key={goal} variant="outline" className="text-sm">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Deliverables */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {campaign.requirements.deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))]"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white font-bold text-sm">
                            {deliverable.quantity}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{deliverable.type}</h4>
                            <p className="text-sm text-[rgb(var(--muted))]">
                              {deliverable.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Target Audience */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Age Range</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.target_audience.age_range.map((age) => (
                          <Badge key={age} variant="outline">
                            {age}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Gender</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.target_audience.gender.map((gender) => (
                          <Badge key={gender} variant="outline">
                            {gender}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Locations</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.target_audience.locations.map((location) => (
                          <Badge key={location} variant="outline" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Platforms */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {campaign.platforms.map((platform) => {
                        const Icon = getPlatformIcon(platform)
                        return (
                          <div
                            key={platform}
                            className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--surface))]"
                          >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{platform}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Requirements */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-[rgb(var(--muted))] mb-1">Followers</div>
                      <div className="font-semibold">
                        {formatCompactNumber(campaign.requirements.min_followers)}+
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[rgb(var(--muted))] mb-1">
                        Engagement Rate
                      </div>
                      <div className="font-semibold">
                        {campaign.requirements.min_engagement_rate}%+
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[rgb(var(--muted))] mb-2">Content Types</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.requirements.content_types.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Timeline */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-[rgb(var(--muted))] mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-[rgb(var(--muted))]">Apply By</div>
                        <div className="font-semibold">
                          {new Date(campaign.application_deadline).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-[rgb(var(--muted))] mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-[rgb(var(--muted))]">Campaign Period</div>
                        <div className="font-semibold">
                          {new Date(campaign.campaign_start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(campaign.campaign_end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[rgb(var(--muted))] mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-[rgb(var(--muted))]">Content Due</div>
                        <div className="font-semibold">
                          {new Date(campaign.content_due_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Compensation */}
              <motion.div variants={staggerItem}>
                <Card className="border-2 border-green-500/20 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Compensation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {formatCurrency(campaign.budget.min)} -{' '}
                      {formatCurrency(campaign.budget.max)}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))] mb-3">
                      {campaign.compensation_type === 'fixed' && 'Fixed Payment'}
                      {campaign.compensation_type === 'performance' && 'Performance-Based'}
                      {campaign.compensation_type === 'product' && 'Product Only'}
                      {campaign.compensation_type === 'hybrid' && 'Cash + Product'}
                    </div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      Final compensation negotiated based on reach and engagement
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
