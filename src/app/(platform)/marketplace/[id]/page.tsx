'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Share2,
  Bookmark,
  Send,
  Shield,
  Zap,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Instagram,
  Youtube,
  Facebook,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useListingDetail } from '@/hooks/queries/use-marketplace'
import { useApplyToListing } from '@/hooks/mutations/use-marketplace-mutations'

export default function MarketplaceListingPage() {
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const { data: listing, isLoading } = useListingDetail(id)
  const applyMutation = useApplyToListing()

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [applicationNote, setApplicationNote] = useState('')
  const [proposedRate, setProposedRate] = useState('')

  const isInfluencer = user?.role === 'INFLUENCER'

  const handleApply = () => {
    if (!listing) return
    applyMutation.mutate(
      {
        listingId: listing.id,
        data: {
          coverLetter: applicationNote || undefined,
          proposedRate: proposedRate ? parseFloat(proposedRate) : undefined,
        },
      },
      {
        onSuccess: () => {
          setShowApplication(false)
          setApplicationNote('')
          setProposedRate('')
        },
      }
    )
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram
      case 'youtube': return Youtube
      case 'facebook': return Facebook
      default: return Users
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container py-4 sm:py-8">
        <Card className="text-center py-8 sm:py-16">
          <CardContent>
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Listing not found</h3>
            <p className="text-sm text-[rgb(var(--muted))] mb-6">
              This campaign listing doesn&apos;t exist or has been removed.
            </p>
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const budgetMin = Number(listing.budgetMin || 0)
  const budgetMax = Number(listing.budgetMax || 0)
  const platforms: string[] = listing.targetPlatforms || []
  const niches: string[] = listing.targetNiches || []
  const totalSlots = listing.totalSlots || 1
  const filledSlots = listing.filledSlots || 0
  const applicationCount = listing._count?.applications ?? 0
  const deadline = listing.applicationDeadline ? new Date(listing.applicationDeadline) : null
  const isDeadlinePassed = deadline ? deadline < new Date() : false
  const startDate = listing.campaignStartDate || listing.campaign?.startDate
    ? new Date(listing.campaignStartDate || listing.campaign?.startDate)
    : null
  const endDate = listing.campaignEndDate || listing.campaign?.endDate
    ? new Date(listing.campaignEndDate || listing.campaign?.endDate)
    : null
  const durationDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null
  const requirements = listing.requirements
    ? listing.requirements.split('\n').filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container max-w-5xl py-3 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Back Navigation */}
          <motion.div variants={staggerItem} className="mb-3 sm:mb-6">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors min-h-[44px]">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Header Card */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {listing.isFeatured && (
                          <Badge variant="warning" className="mb-2 text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2">
                          {listing.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              src={listing.brand?.logo}
                              fallback={listing.brand?.companyName?.[0] || 'B'}
                            />
                            <span className="text-sm sm:text-base font-medium">
                              {listing.brand?.companyName || 'Brand'}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {listing.campaign?.category || listing.compensationType || 'Campaign'}
                          </Badge>
                          <Badge variant={listing.status === 'OPEN' ? 'success' : 'default'} className="text-xs">
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                            isBookmarked
                              ? 'text-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/10'
                              : 'text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface))]'
                          }`}
                        >
                          <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface))] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-[rgb(var(--surface))]">
                      <div className="text-center">
                        <DollarSign className="h-4 w-4 mx-auto mb-1 text-[rgb(var(--success))]" />
                        <div className="text-sm sm:text-base font-bold">
                          {formatCurrency(budgetMin)}-{formatCurrency(budgetMax)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Budget</div>
                      </div>
                      <div className="text-center">
                        <Users className="h-4 w-4 mx-auto mb-1 text-[rgb(var(--info))]" />
                        <div className="text-sm sm:text-base font-bold">
                          {applicationCount}/{totalSlots}
                        </div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Applied/Slots</div>
                      </div>
                      {daysLeft !== null && (
                        <div className="text-center">
                          <Clock className="h-4 w-4 mx-auto mb-1 text-[rgb(var(--warning))]" />
                          <div className="text-sm sm:text-base font-bold">{daysLeft}d</div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Days Left</div>
                        </div>
                      )}
                      {listing.minFollowers && (
                        <div className="text-center">
                          <Target className="h-4 w-4 mx-auto mb-1 text-[rgb(var(--brand-primary))]" />
                          <div className="text-sm sm:text-base font-bold">
                            {formatCompactNumber(listing.minFollowers)}+
                          </div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Min Followers</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Description */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                    <p className="text-xs sm:text-sm text-[rgb(var(--muted))] whitespace-pre-wrap leading-relaxed">
                      {listing.description}
                    </p>
                    {listing.campaign?.description && listing.campaign.description !== listing.description && (
                      <div className="mt-3 pt-3 border-t border-[rgb(var(--border))]">
                        <p className="text-xs sm:text-sm text-[rgb(var(--muted))] whitespace-pre-wrap">
                          {listing.campaign.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Requirements */}
              {requirements.length > 0 && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                      <div className="space-y-2">
                        {requirements.map((req: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--success))] mt-0.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-[rgb(var(--muted))]">{req}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Niches */}
              {niches.length > 0 && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--brand-primary))]" />
                        Target Niches
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {niches.map((niche: string) => (
                          <Badge key={niche} variant="outline" className="text-xs">
                            {niche}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Apply Card */}
              {isInfluencer && (
                <motion.div variants={staggerItem}>
                  <Card className="border-[rgb(var(--brand-primary))]/30">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      {!showApplication ? (
                        <>
                          <Button
                            variant="gradient"
                            className="w-full min-h-[44px] mb-3"
                            onClick={() => setShowApplication(true)}
                            disabled={isDeadlinePassed || listing.status !== 'OPEN'}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Apply to Campaign
                          </Button>
                          <p className="text-[10px] sm:text-xs text-center text-[rgb(var(--muted))]">
                            {isDeadlinePassed
                              ? 'Application deadline has passed'
                              : totalSlots - filledSlots > 0
                                ? `${totalSlots - filledSlots} spots remaining`
                                : 'All spots filled'}
                          </p>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="text-sm sm:text-base font-semibold">Your Application</h3>
                          <textarea
                            value={applicationNote}
                            onChange={(e) => setApplicationNote(e.target.value)}
                            placeholder="Tell the brand why you're a great fit..."
                            className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] outline-none resize-none min-h-[100px]"
                            rows={4}
                          />
                          <div>
                            <label className="text-xs text-[rgb(var(--muted))] mb-1 block">
                              Proposed Rate (optional)
                            </label>
                            <input
                              type="number"
                              value={proposedRate}
                              onChange={(e) => setProposedRate(e.target.value)}
                              placeholder="e.g. 500"
                              className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] outline-none"
                            />
                          </div>
                          <Button
                            variant="gradient"
                            className="w-full min-h-[44px]"
                            onClick={handleApply}
                            disabled={applyMutation.isPending}
                          >
                            {applyMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Submit Application
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full min-h-[44px]"
                            onClick={() => setShowApplication(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Platforms */}
              {platforms.length > 0 && (
                <motion.div variants={staggerItem}>
                  <Card>
                    <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                      <CardTitle className="text-sm sm:text-base">Platforms</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                      <div className="space-y-2">
                        {platforms.map((platform: string) => {
                          const Icon = getPlatformIcon(platform)
                          return (
                            <div
                              key={platform}
                              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg bg-[rgb(var(--surface))]"
                            >
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span className="text-sm font-medium">
                                {platform.charAt(0) + platform.slice(1).toLowerCase()}
                              </span>
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
                    <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                      <CardTitle className="text-sm sm:text-base">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-3">
                      {listing.minFollowers && (
                        <div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-1">Min Followers</div>
                          <div className="text-sm sm:text-base font-semibold">
                            {formatCompactNumber(listing.minFollowers)}+
                          </div>
                        </div>
                      )}
                      {listing.maxFollowers && (
                        <div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-1">Max Followers</div>
                          <div className="text-sm sm:text-base font-semibold">
                            {formatCompactNumber(listing.maxFollowers)}
                          </div>
                        </div>
                      )}
                      {listing.targetLocations?.length > 0 && (
                        <div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-1">Locations</div>
                          <div className="flex flex-wrap gap-1">
                            {listing.targetLocations.map((loc: string) => (
                              <Badge key={loc} variant="outline" className="text-[10px]">{loc}</Badge>
                            ))}
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
                  <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                    <CardTitle className="text-sm sm:text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-3">
                    {deadline && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-[rgb(var(--muted))] mt-0.5" />
                        <div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Apply By</div>
                          <div className="text-sm font-semibold">
                            {deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    )}
                    {startDate && endDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-[rgb(var(--muted))] mt-0.5" />
                        <div>
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Campaign Period</div>
                          <div className="text-sm font-semibold">
                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {durationDays && ` (${durationDays} days)`}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Compensation */}
              <motion.div variants={staggerItem}>
                <Card className="border-2 border-green-500/20 bg-green-500/5">
                  <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      Compensation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-1.5">
                      {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
                    </div>
                    <div className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-2">
                      {listing.compensationType === 'FIXED' && 'Fixed Payment'}
                      {listing.compensationType === 'PERFORMANCE' && 'Performance-Based'}
                      {listing.compensationType === 'PRODUCT_ONLY' && 'Product Only'}
                      {listing.compensationType === 'HYBRID' && 'Cash + Product'}
                      {listing.compensationType === 'REVENUE_SHARE' && 'Revenue Share'}
                      {!listing.compensationType && 'Negotiable'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                      Final compensation negotiated based on reach and engagement
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--success))]" />
                      <div>
                        <div className="text-xs sm:text-sm font-medium">Secure Payment</div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                          Funds held in escrow until delivery
                        </div>
                      </div>
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
