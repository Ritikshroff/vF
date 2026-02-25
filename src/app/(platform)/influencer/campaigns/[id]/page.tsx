'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  Clock,
  Instagram,
  Youtube,
  Facebook,
  AlertCircle,
  Send,
  Sparkles,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { useListingDetail } from '@/hooks/queries/use-marketplace'
import { useApplyToListing } from '@/hooks/mutations/use-marketplace-mutations'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function CampaignDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const { data: listing, isLoading } = useListingDetail(id)
  const applyMutation = useApplyToListing()

  const handleApply = async () => {
    if (!listing) return
    applyMutation.mutate({ listingId: listing.id, data: {} })
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

  if (isLoading) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <Card className="text-center py-8 sm:py-12 lg:py-16">
          <CardContent>
            <AlertCircle className="h-16 w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Campaign not found</h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              The campaign you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deadline = listing.applicationDeadline ? new Date(listing.applicationDeadline) : null
  const isDeadlinePassed = deadline ? deadline < new Date() : false
  const startDate = listing.campaignStartDate ? new Date(listing.campaignStartDate) : null
  const endDate = listing.campaignEndDate ? new Date(listing.campaignEndDate) : null
  const durationDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const budgetMin = Number(listing.budgetMin || 0)
  const budgetMax = Number(listing.budgetMax || 0)
  const platforms = listing.targetPlatforms || []
  const niches = listing.targetNiches || []
  const totalSlots = listing.totalSlots || 1
  const applicationCount = listing._count?.applications ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Back Button */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="gap-2 min-h-[44px]">
                <ArrowLeft className="h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
          </motion.div>

          {/* Header Section */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <Card className="border border-[rgb(var(--border))]">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  {/* Brand Logo */}
                  <div className="shrink-0">
                    <Avatar
                      className="h-16 w-16 sm:h-20 sm:w-20"
                      src={listing.brand?.logo}
                      alt={listing.brand?.companyName || 'Brand'}
                      fallback={listing.brand?.companyName || 'B'}
                    />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex-1 min-w-0">
                        {listing.title}
                      </h1>
                      <Badge variant={listing.status === 'ACTIVE' ? 'success' : 'default'}>
                        {listing.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-[rgb(var(--muted))] mb-3 sm:mb-4">
                      <span className="font-medium text-[rgb(var(--foreground))]">
                        {listing.brand?.companyName || 'Brand'}
                      </span>
                      {listing.compensationType && (
                        <Badge variant="outline">{listing.compensationType}</Badge>
                      )}
                      {listing.brand?.verified && (
                        <Badge variant="success" className="text-xs">Verified</Badge>
                      )}
                    </div>

                    <p className="text-sm sm:text-base text-[rgb(var(--muted))] mb-4 sm:mb-6">
                      {listing.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))]">Budget</div>
                          <div className="font-bold text-sm sm:text-base">
                            {formatCurrency(budgetMin)}-{formatCurrency(budgetMax)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))]">Slots</div>
                          <div className="font-bold text-sm sm:text-base">
                            {applicationCount} applied / {totalSlots} slots
                          </div>
                        </div>
                      </div>

                      {deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
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
                      )}

                      {durationDays && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
                          <div>
                            <div className="text-xs text-[rgb(var(--muted))]">Duration</div>
                            <div className="font-bold text-sm sm:text-base">
                              {durationDays} days
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                {listing.status === 'ACTIVE' && !isDeadlinePassed && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[rgb(var(--border))]">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        variant="gradient"
                        size="lg"
                        className="flex-1 min-h-[44px]"
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                      >
                        {applyMutation.isPending ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5 mr-2" />
                        )}
                        Apply Now
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
              {/* Campaign Details */}
              {listing.campaign && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                        Campaign Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-[rgb(var(--muted))]">Campaign: </span>
                          <span className="font-semibold">{listing.campaign.title}</span>
                        </div>
                        {listing.campaign.description && (
                          <p className="text-sm text-[rgb(var(--muted))]">{listing.campaign.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Niches / Categories */}
              {niches.length > 0 && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                        Target Niches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {niches.map((niche: string) => (
                          <Badge key={niche} variant="outline" className="text-sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {niche}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Requirements */}
              {listing.requirements && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <p className="text-sm sm:text-base text-[rgb(var(--muted))] whitespace-pre-wrap">
                        {listing.requirements}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Platforms */}
              {platforms.length > 0 && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Platforms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {platforms.map((platform: string) => {
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
              )}

              {/* Follower Requirements */}
              {(listing.minFollowers || listing.maxFollowers) && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {listing.minFollowers && (
                        <div>
                          <div className="text-sm text-[rgb(var(--muted))] mb-1">Min Followers</div>
                          <div className="font-semibold">
                            {formatCompactNumber(listing.minFollowers)}+
                          </div>
                        </div>
                      )}
                      {listing.maxFollowers && (
                        <div>
                          <div className="text-sm text-[rgb(var(--muted))] mb-1">Max Followers</div>
                          <div className="font-semibold">
                            {formatCompactNumber(listing.maxFollowers)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Timeline */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deadline && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-[rgb(var(--muted))] mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-[rgb(var(--muted))]">Apply By</div>
                          <div className="font-semibold">
                            {deadline.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {startDate && endDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-[rgb(var(--muted))] mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-[rgb(var(--muted))]">Campaign Period</div>
                          <div className="font-semibold">
                            {startDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            -{' '}
                            {endDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Compensation */}
              <motion.div variants={staggerItem}>
                <Card className="border border-[rgb(var(--brand-primary))]/20 bg-[rgb(var(--brand-primary))]/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Compensation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                      {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))] mb-3">
                      {listing.compensationType === 'FIXED' && 'Fixed Payment'}
                      {listing.compensationType === 'PERFORMANCE' && 'Performance-Based'}
                      {listing.compensationType === 'PRODUCT_ONLY' && 'Product Only'}
                      {listing.compensationType === 'HYBRID' && 'Cash + Product'}
                      {listing.compensationType === 'REVENUE_SHARE' && 'Revenue Share'}
                      {!listing.compensationType && 'Negotiable'}
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
