import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import {
  AIMatchRequest,
  AIMatchResult,
  ContentSuggestionRequest,
  ContentSuggestionResult,
  PricingRecommendation,
  FraudDetectionResult,
} from '@/types/ai'

const AI_MODEL_VERSION = 'v1.0.0'

// ==================== AI Matching Engine ====================

/**
 * Find best matching influencers for a brand/campaign
 * Uses a scoring algorithm that weighs multiple factors
 */
export async function findInfluencerMatches(input: AIMatchRequest): Promise<AIMatchResult[]> {
  const { brandId, campaignId, filters = {}, limit = 20 } = input

  // Get brand preferences
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { preferences: true },
  })

  if (!brand) throw new Error('Brand not found')

  const campaign = campaignId
    ? await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { requirements: true, targetAudience: true },
      })
    : null

  // Build influencer query based on filters
  const influencerWhere: Prisma.InfluencerWhereInput = {
    verified: true,
    availability: 'AVAILABLE',
    ...(filters.categories && filters.categories.length > 0 && {
      categories: { hasSome: filters.categories },
    }),
    ...(filters.locations && filters.locations.length > 0 && {
      location: { in: filters.locations },
    }),
    ...(filters.minFollowers || filters.maxFollowers
      ? {
          platforms: {
            some: {
              ...(filters.minFollowers && { followers: { gte: filters.minFollowers } }),
              ...(filters.maxFollowers && { followers: { lte: filters.maxFollowers } }),
              ...(filters.platforms && filters.platforms.length > 0 && {
                platform: { in: filters.platforms as any },
              }),
            },
          },
        }
      : undefined),
  }

  const influencers = await prisma.influencer.findMany({
    where: influencerWhere,
    include: {
      platforms: true,
      metrics: true,
      audience: true,
      reviewsReceived: { select: { rating: true } },
      pricing: true,
    },
    take: limit * 3, // Get more for scoring
  })

  // Score each influencer
  const matches: AIMatchResult[] = influencers.map((influencer) => {
    const totalFollowers = influencer.platforms.reduce((sum, p) => sum + p.followers, 0)
    const avgEngagementRate = influencer.platforms.length > 0
      ? influencer.platforms.reduce((sum, p) => sum + p.engagementRate.toNumber(), 0) / influencer.platforms.length
      : 0

    // Audience score (0-100)
    let audienceScore = 50
    if (campaign?.targetAudience && influencer.audience) {
      // Higher score if audience demographics align
      const hasMatchingLocations = campaign.targetAudience.locations.some(
        (loc) => JSON.stringify(influencer.audience?.topCountries).includes(loc)
      )
      if (hasMatchingLocations) audienceScore += 20
      audienceScore = Math.min(audienceScore + totalFollowers / 10000, 100)
    }

    // Content score (0-100)
    let contentScore = 40
    if (influencer.categories.some((c) => brand.industry.toLowerCase().includes(c.toLowerCase()))) {
      contentScore += 30
    }
    const avgRating = influencer.reviewsReceived.length > 0
      ? influencer.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / influencer.reviewsReceived.length
      : 3
    contentScore += avgRating * 6

    // Engagement score (0-100)
    const engagementScore = Math.min(avgEngagementRate * 20, 100)

    // Budget fit (0-100)
    let budgetFitScore = 50
    if (campaign && influencer.pricing) {
      const avgPrice = influencer.pricing.instagramPost?.toNumber() || 0
      const campaignBudget = campaign.budgetMax.toNumber()
      if (avgPrice > 0 && avgPrice <= campaignBudget) {
        budgetFitScore = 80 + (1 - avgPrice / campaignBudget) * 20
      } else if (avgPrice > campaignBudget) {
        budgetFitScore = Math.max(20, 60 - ((avgPrice - campaignBudget) / campaignBudget) * 40)
      }
    }

    // Brand safety (0-100)
    const brandSafetyScore = influencer.metrics?.brandSafetyScore
      ? Math.min(influencer.metrics.brandSafetyScore, 100)
      : 70

    // Overall score (weighted average)
    const overallScore =
      audienceScore * 0.25 +
      contentScore * 0.25 +
      engagementScore * 0.2 +
      budgetFitScore * 0.15 +
      brandSafetyScore * 0.15

    // Generate match reasons
    const matchReasons: string[] = []
    const warnings: string[] = []

    if (audienceScore >= 70) matchReasons.push('Strong audience alignment')
    if (contentScore >= 70) matchReasons.push('Relevant content expertise')
    if (engagementScore >= 60) matchReasons.push('High engagement rate')
    if (budgetFitScore >= 70) matchReasons.push('Within budget range')
    if (brandSafetyScore >= 80) matchReasons.push('Excellent brand safety')

    if (audienceScore < 40) warnings.push('Low audience alignment')
    if (engagementScore < 30) warnings.push('Below average engagement')
    if (budgetFitScore < 40) warnings.push('May exceed budget')
    if (brandSafetyScore < 50) warnings.push('Brand safety concerns')

    let recommendation: string | null = null
    if (overallScore >= 80) recommendation = 'Highly recommended - strong match across all dimensions'
    else if (overallScore >= 60) recommendation = 'Good fit - consider for campaign'
    else if (overallScore >= 40) recommendation = 'Moderate fit - review specific metrics'

    return {
      influencerId: influencer.id,
      overallScore: Math.round(overallScore * 100) / 100,
      audienceScore: Math.round(audienceScore * 100) / 100,
      contentScore: Math.round(contentScore * 100) / 100,
      engagementScore: Math.round(engagementScore * 100) / 100,
      budgetFitScore: Math.round(budgetFitScore * 100) / 100,
      brandSafetyScore: Math.round(brandSafetyScore * 100) / 100,
      matchReasons,
      warnings,
      recommendation,
    }
  })

  // Sort by overall score and take top results
  matches.sort((a, b) => b.overallScore - a.overallScore)
  const topMatches = matches.slice(0, limit)

  // Store match scores in DB
  for (const match of topMatches) {
    await prisma.aIMatchScore.upsert({
      where: {
        brandId_influencerId_campaignId: {
          brandId,
          influencerId: match.influencerId,
          campaignId: campaignId || '',
        },
      },
      update: {
        overallScore: match.overallScore,
        audienceScore: match.audienceScore,
        contentScore: match.contentScore,
        engagementScore: match.engagementScore,
        budgetFitScore: match.budgetFitScore,
        brandSafetyScore: match.brandSafetyScore,
        matchReasons: match.matchReasons,
        warnings: match.warnings,
        recommendation: match.recommendation,
        modelVersion: AI_MODEL_VERSION,
        computedAt: new Date(),
      },
      create: {
        brandId,
        influencerId: match.influencerId,
        campaignId: campaignId || null,
        overallScore: match.overallScore,
        audienceScore: match.audienceScore,
        contentScore: match.contentScore,
        engagementScore: match.engagementScore,
        budgetFitScore: match.budgetFitScore,
        brandSafetyScore: match.brandSafetyScore,
        matchReasons: match.matchReasons,
        warnings: match.warnings,
        recommendation: match.recommendation,
        modelVersion: AI_MODEL_VERSION,
      },
    })
  }

  return topMatches
}

/**
 * Get cached match scores for a brand
 */
export async function getCachedMatches(brandId: string, campaignId?: string) {
  return prisma.aIMatchScore.findMany({
    where: {
      brandId,
      ...(campaignId && { campaignId }),
    },
    include: {
      influencer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          categories: true,
          rating: true,
          platforms: { select: { platform: true, followers: true, engagementRate: true } },
        },
      },
    },
    orderBy: { overallScore: 'desc' },
    take: 50,
  })
}

// ==================== Content Suggestions ====================

/**
 * Generate content suggestions for a campaign
 * Uses heuristic-based suggestions (can be extended with LLM integration)
 */
export async function generateContentSuggestions(input: ContentSuggestionRequest): Promise<ContentSuggestionResult[]> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: input.campaignId },
    include: {
      brand: { select: { companyName: true, industry: true } },
      goals: true,
      targetAudience: true,
      hashtags: true,
    },
  })

  if (!campaign) throw new Error('Campaign not found')

  const suggestions: ContentSuggestionResult[] = []
  const goalNames = campaign.goals.map((g) => g.goal)
  const hashtags = campaign.hashtags.map((h) => h.hashtag)

  // Generate suggestions based on campaign type and goals
  const contentTypes = ['INSTAGRAM_POST', 'INSTAGRAM_REEL', 'STORY', 'TIKTOK', 'YOUTUBE_SHORT']

  for (const type of contentTypes.slice(0, 3)) {
    const suggestion: ContentSuggestionResult = {
      type,
      title: `${campaign.brand.companyName} - ${type.replace('_', ' ').toLowerCase()} concept`,
      description: `Create engaging ${type.replace('_', ' ').toLowerCase()} content highlighting ${campaign.title}. Focus on authentic storytelling that resonates with the target audience.`,
      suggestedHooks: [
        `"Did you know ${campaign.brand.companyName} just launched..."`,
        `"My honest experience with ${campaign.brand.companyName}..."`,
        `"Why I switched to ${campaign.brand.companyName}..."`,
      ],
      suggestedHashtags: [
        ...hashtags.slice(0, 5),
        `#${campaign.brand.companyName.replace(/\s/g, '')}`,
        `#ad`,
        `#sponsored`,
      ],
      toneGuidance: goalNames.includes('BRAND_AWARENESS')
        ? 'Keep it authentic and conversational. Focus on personal experience.'
        : goalNames.includes('CONVERSIONS')
          ? 'Include a clear call-to-action. Highlight key benefits and value proposition.'
          : 'Balance entertainment with information. Make it shareable.',
      formatTips: type.includes('REEL') || type.includes('TIKTOK')
        ? 'Hook in first 3 seconds. Use trending audio. Keep under 30 seconds for max engagement.'
        : type.includes('STORY')
          ? 'Use polls/questions for engagement. Keep each slide focused. Add swipe-up CTA.'
          : 'Use high-quality visuals. Write a compelling caption with line breaks.',
      predictedEngagementRate: Math.round((Math.random() * 3 + 2) * 100) / 100,
      predictedReach: Math.round(Math.random() * 50000 + 10000),
      confidenceScore: Math.round((Math.random() * 0.3 + 0.6) * 100) / 100,
    }

    suggestions.push(suggestion)

    // Store in DB
    await prisma.aIContentSuggestion.create({
      data: {
        campaignId: input.campaignId,
        influencerId: input.influencerId,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        suggestedHooks: suggestion.suggestedHooks,
        suggestedHashtags: suggestion.suggestedHashtags,
        toneGuidance: suggestion.toneGuidance,
        formatTips: suggestion.formatTips,
        predictedEngagementRate: suggestion.predictedEngagementRate,
        predictedReach: suggestion.predictedReach,
        confidenceScore: suggestion.confidenceScore,
        modelVersion: AI_MODEL_VERSION,
      },
    })
  }

  return suggestions
}

// ==================== Pricing Recommendations ====================

/**
 * Get pricing recommendation for an influencer
 */
export async function getPricingRecommendation(influencerId: string): Promise<PricingRecommendation[]> {
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    include: {
      platforms: true,
      metrics: true,
      reviewsReceived: { select: { rating: true } },
    },
  })

  if (!influencer) throw new Error('Influencer not found')

  const recommendations: PricingRecommendation[] = []

  for (const platform of influencer.platforms) {
    const followers = platform.followers
    const engRate = platform.engagementRate.toNumber()

    // Base price calculation using industry benchmarks
    const basePricePerK = engRate >= 5 ? 15 : engRate >= 3 ? 10 : engRate >= 1 ? 7 : 5
    const basePrice = (followers / 1000) * basePricePerK

    // Adjustments
    const ratingMultiplier = influencer.rating.toNumber() >= 4.5 ? 1.2 : influencer.rating.toNumber() >= 4 ? 1.1 : 1.0
    const recommendedPrice = Math.round(basePrice * ratingMultiplier)

    const contentTypes = ['POST', 'STORY', 'REEL', 'VIDEO']

    for (const contentType of contentTypes) {
      const typeMultiplier = contentType === 'VIDEO' ? 2.5 : contentType === 'REEL' ? 1.8 : contentType === 'STORY' ? 0.5 : 1.0
      const price = Math.round(recommendedPrice * typeMultiplier)

      const rec: PricingRecommendation = {
        platform: platform.platform,
        contentType,
        recommendedPrice: price,
        priceRangeMin: Math.round(price * 0.7),
        priceRangeMax: Math.round(price * 1.4),
        factors: {
          followers,
          engagementRate: engRate,
          averageRating: influencer.rating.toNumber(),
          basePricePerK,
          typeMultiplier,
          ratingMultiplier,
        },
      }

      recommendations.push(rec)

      await prisma.aIPricingRecommendation.create({
        data: {
          influencerId,
          platform: platform.platform,
          contentType,
          recommendedPrice: price,
          priceRangeMin: Math.round(price * 0.7),
          priceRangeMax: Math.round(price * 1.4),
          factors: rec.factors as Prisma.InputJsonValue,
          modelVersion: AI_MODEL_VERSION,
        },
      })
    }
  }

  return recommendations
}

// ==================== Fraud Detection ====================

/**
 * Run fraud detection analysis on an influencer
 */
export async function detectFraud(influencerId: string): Promise<FraudDetectionResult> {
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    include: {
      platforms: true,
      metrics: true,
      growthTrend: { orderBy: { month: 'desc' }, take: 6 },
    },
  })

  if (!influencer) throw new Error('Influencer not found')

  const flags: FraudDetectionResult['flags'] = []

  for (const platform of influencer.platforms) {
    const followers = platform.followers
    const engRate = platform.engagementRate.toNumber()
    const avgLikes = platform.avgLikes
    const avgComments = platform.avgComments

    // Check for suspiciously low engagement with high followers
    if (followers > 100000 && engRate < 0.5) {
      flags.push({
        type: 'LOW_ENGAGEMENT',
        severity: 'HIGH',
        description: `${platform.platform}: Very low engagement rate (${engRate}%) for ${followers.toLocaleString()} followers`,
        evidence: { followers, engagementRate: engRate, expectedMinRate: 1.0 },
      })
    }

    // Check for suspicious like-to-comment ratio
    if (avgLikes > 0 && avgComments > 0) {
      const ratio = avgLikes / avgComments
      if (ratio > 100) {
        flags.push({
          type: 'SUSPICIOUS_RATIO',
          severity: 'MEDIUM',
          description: `${platform.platform}: Unusual like-to-comment ratio (${Math.round(ratio)}:1)`,
          evidence: { avgLikes, avgComments, ratio },
        })
      }
    }
  }

  // Check for sudden follower spikes in growth trend
  if (influencer.growthTrend.length >= 2) {
    for (let i = 0; i < influencer.growthTrend.length - 1; i++) {
      const current = influencer.growthTrend[i]
      const previous = influencer.growthTrend[i + 1]
      const growthRate = (current.followers - previous.followers) / previous.followers

      if (growthRate > 0.5) {
        flags.push({
          type: 'SUDDEN_GROWTH',
          severity: 'MEDIUM',
          description: `${Math.round(growthRate * 100)}% follower growth in a single month`,
          evidence: {
            from: previous.followers,
            to: current.followers,
            growthRate,
            month: current.month,
          },
        })
      }
    }
  }

  // Check authenticity score
  if (influencer.metrics?.authenticityScore && influencer.metrics.authenticityScore < 40) {
    flags.push({
      type: 'LOW_AUTHENTICITY',
      severity: 'HIGH',
      description: `Low authenticity score: ${influencer.metrics.authenticityScore}/100`,
      evidence: { authenticityScore: influencer.metrics.authenticityScore },
    })
  }

  // Calculate overall risk score
  const severityWeights = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 5 }
  const totalWeight = flags.reduce((sum, f) => sum + severityWeights[f.severity], 0)
  const riskScore = Math.min(totalWeight * 10, 100)

  // Store flags in DB
  for (const flag of flags) {
    await prisma.aIFraudFlag.create({
      data: {
        influencerId,
        type: flag.type,
        severity: flag.severity,
        description: flag.description,
        evidence: flag.evidence as Prisma.InputJsonValue,
        modelVersion: AI_MODEL_VERSION,
      },
    })
  }

  return { influencerId, flags, riskScore }
}
