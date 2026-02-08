import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { AnalyticsTimeRange, CampaignPerformanceMetrics, InfluencerPerformanceMetrics, PlatformOverviewMetrics } from '@/types/analytics'

// ==================== Campaign Analytics ====================

/**
 * Get or create campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string): Promise<CampaignPerformanceMetrics> {
  let analytics = await prisma.campaignAnalytics.findUnique({
    where: { campaignId },
  })

  if (!analytics) {
    analytics = await prisma.campaignAnalytics.create({
      data: { campaignId },
    })
  }

  return {
    totalReach: analytics.totalReach,
    totalImpressions: analytics.totalImpressions,
    totalEngagement: analytics.totalEngagement,
    totalClicks: analytics.totalClicks,
    totalConversions: analytics.totalConversions,
    totalSpend: analytics.totalSpend.toNumber(),
    costPerClick: analytics.costPerClick?.toNumber() ?? null,
    costPerEngagement: analytics.costPerEngagement?.toNumber() ?? null,
    costPerConversion: analytics.costPerConversion?.toNumber() ?? null,
    roi: analytics.roi?.toNumber() ?? null,
    totalPosts: analytics.totalPosts,
    avgEngagementRate: analytics.avgEngagementRate?.toNumber() ?? null,
  }
}

/**
 * Update campaign analytics with new metrics
 */
export async function updateCampaignAnalytics(
  campaignId: string,
  metrics: Partial<{
    reach: number
    impressions: number
    engagement: number
    clicks: number
    conversions: number
    spend: number
    posts: number
  }>
) {
  const current = await prisma.campaignAnalytics.findUnique({
    where: { campaignId },
  })

  if (!current) {
    return prisma.campaignAnalytics.create({
      data: {
        campaignId,
        totalReach: metrics.reach || 0,
        totalImpressions: metrics.impressions || 0,
        totalEngagement: metrics.engagement || 0,
        totalClicks: metrics.clicks || 0,
        totalConversions: metrics.conversions || 0,
        totalSpend: metrics.spend || 0,
        totalPosts: metrics.posts || 0,
      },
    })
  }

  const totalReach = current.totalReach + (metrics.reach || 0)
  const totalClicks = current.totalClicks + (metrics.clicks || 0)
  const totalEngagement = current.totalEngagement + (metrics.engagement || 0)
  const totalConversions = current.totalConversions + (metrics.conversions || 0)
  const totalSpend = current.totalSpend.toNumber() + (metrics.spend || 0)

  return prisma.campaignAnalytics.update({
    where: { campaignId },
    data: {
      totalReach,
      totalImpressions: current.totalImpressions + (metrics.impressions || 0),
      totalEngagement,
      totalClicks,
      totalConversions,
      totalSpend,
      totalPosts: current.totalPosts + (metrics.posts || 0),
      costPerClick: totalClicks > 0 ? totalSpend / totalClicks : null,
      costPerEngagement: totalEngagement > 0 ? totalSpend / totalEngagement : null,
      costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : null,
      roi: totalSpend > 0 ? ((totalReach * 0.01 - totalSpend) / totalSpend) * 100 : null,
      lastUpdatedAt: new Date(),
    },
  })
}

// ==================== Influencer Analytics ====================

/**
 * Get or create influencer analytics
 */
export async function getInfluencerAnalytics(influencerId: string): Promise<InfluencerPerformanceMetrics> {
  let analytics = await prisma.influencerAnalytics.findUnique({
    where: { influencerId },
  })

  if (!analytics) {
    analytics = await prisma.influencerAnalytics.create({
      data: { influencerId },
    })
  }

  return {
    totalFollowers: analytics.totalFollowers,
    totalEngagement: analytics.totalEngagement,
    avgEngagementRate: analytics.avgEngagementRate?.toNumber() ?? null,
    completedCampaigns: analytics.completedCampaigns,
    averageRating: analytics.averageRating?.toNumber() ?? null,
    onTimeDeliveryRate: analytics.onTimeDeliveryRate?.toNumber() ?? null,
    totalPostsCreated: analytics.totalPostsCreated,
    followerGrowthRate: analytics.followerGrowthRate?.toNumber() ?? null,
  }
}

/**
 * Recalculate influencer analytics from source data
 */
export async function recalculateInfluencerAnalytics(influencerId: string) {
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    include: {
      platforms: true,
      reviewsReceived: { where: { isPublic: true } },
      collaborations: { where: { status: 'COMPLETED' } },
    },
  })

  if (!influencer) throw new Error('Influencer not found')

  const totalFollowers = influencer.platforms.reduce((sum, p) => sum + p.followers, 0)
  const avgEngRate = influencer.platforms.length > 0
    ? influencer.platforms.reduce((sum, p) => sum + p.engagementRate.toNumber(), 0) / influencer.platforms.length
    : 0

  const completedCampaigns = influencer.collaborations.length
  const avgRating = influencer.reviewsReceived.length > 0
    ? influencer.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / influencer.reviewsReceived.length
    : null

  const onTimeReviews = influencer.reviewsReceived.filter((r) => r.wasOnTime !== null)
  const onTimeRate = onTimeReviews.length > 0
    ? (onTimeReviews.filter((r) => r.wasOnTime).length / onTimeReviews.length) * 100
    : null

  return prisma.influencerAnalytics.upsert({
    where: { influencerId },
    update: {
      totalFollowers,
      avgEngagementRate: avgEngRate,
      completedCampaigns,
      averageRating: avgRating,
      onTimeDeliveryRate: onTimeRate,
      lastUpdatedAt: new Date(),
    },
    create: {
      influencerId,
      totalFollowers,
      avgEngagementRate: avgEngRate,
      completedCampaigns,
      averageRating: avgRating,
      onTimeDeliveryRate: onTimeRate,
    },
  })
}

// ==================== Platform Analytics ====================

/**
 * Get platform overview metrics for admin dashboard
 */
export async function getPlatformOverview(): Promise<PlatformOverviewMetrics> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    newUsersToday,
    totalBrands,
    totalInfluencers,
    activeCampaigns,
    revenueData,
    totalCollaborations,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.brand.count(),
    prisma.influencer.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.platformCommission.aggregate({
      _sum: { percentage: true },
    }),
    prisma.collaboration.count(),
  ])

  // Get total wallet transactions as proxy for revenue
  const walletRevenue = await prisma.walletTransaction.aggregate({
    where: { type: 'PLATFORM_FEE' },
    _sum: { amount: true },
  })

  return {
    totalUsers,
    newUsers: newUsersToday,
    activeUsers: 0, // Would need session tracking
    totalBrands,
    totalInfluencers,
    activeCampaigns,
    totalRevenue: 0,
    platformFeeRevenue: walletRevenue._sum.amount?.toNumber() ?? 0,
    totalCollaborations,
  }
}

/**
 * Record a daily analytics snapshot
 */
export async function recordDailySnapshot() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overview = await getPlatformOverview()

  return prisma.platformAnalytics.upsert({
    where: { date: today },
    update: {
      totalUsers: overview.totalUsers,
      newUsers: overview.newUsers,
      activeUsers: overview.activeUsers,
      totalBrands: overview.totalBrands,
      totalInfluencers: overview.totalInfluencers,
      activeCampaigns: overview.activeCampaigns,
      totalRevenue: overview.totalRevenue,
      platformFeeRevenue: overview.platformFeeRevenue,
      totalCollaborations: overview.totalCollaborations,
    },
    create: {
      date: today,
      period: 'DAILY',
      totalUsers: overview.totalUsers,
      newUsers: overview.newUsers,
      activeUsers: overview.activeUsers,
      totalBrands: overview.totalBrands,
      totalInfluencers: overview.totalInfluencers,
      activeCampaigns: overview.activeCampaigns,
      totalRevenue: overview.totalRevenue,
      platformFeeRevenue: overview.platformFeeRevenue,
      totalCollaborations: overview.totalCollaborations,
    },
  })
}

/**
 * Get analytics history for a given time range
 */
export async function getAnalyticsHistory(timeRange: AnalyticsTimeRange) {
  const { startDate, endDate, period = 'DAILY' } = timeRange

  return prisma.platformAnalytics.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      period,
    },
    orderBy: { date: 'asc' },
  })
}

// ==================== Analytics Snapshots ====================

/**
 * Record an analytics snapshot for any entity
 */
export async function recordSnapshot(
  entityId: string,
  entityType: string,
  period: string,
  metrics: Record<string, unknown>
) {
  const periodDate = new Date()
  periodDate.setHours(0, 0, 0, 0)

  return prisma.analyticsSnapshot.upsert({
    where: {
      entityId_entityType_period_periodDate: {
        entityId,
        entityType,
        period,
        periodDate,
      },
    },
    update: {
      metrics: metrics as Prisma.InputJsonValue,
    },
    create: {
      entityId,
      entityType,
      period,
      periodDate,
      metrics: metrics as Prisma.InputJsonValue,
    },
  })
}

/**
 * Get snapshots for an entity
 */
export async function getEntitySnapshots(
  entityId: string,
  entityType: string,
  options: { period?: string; startDate?: string; endDate?: string } = {}
) {
  const where: Prisma.AnalyticsSnapshotWhereInput = {
    entityId,
    entityType,
    ...(options.period && { period: options.period }),
    ...(options.startDate && options.endDate && {
      periodDate: {
        gte: new Date(options.startDate),
        lte: new Date(options.endDate),
      },
    }),
  }

  return prisma.analyticsSnapshot.findMany({
    where,
    orderBy: { periodDate: 'asc' },
  })
}
