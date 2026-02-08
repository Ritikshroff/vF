import { prisma } from '@/lib/db/prisma'
import { Prisma, VerificationBadge, UserRole } from '@prisma/client'
import {
  ReputationBreakdown,
  CreateVerificationInput,
  ReviewVerificationInput,
  CreateDisputeInput,
  ResolveDisputeInput,
  DisputeFilters,
  CreateInfluencerReviewInput,
  CreateBrandReviewInput,
} from '@/types/reputation'

// ==================== Reputation Score Operations ====================

/**
 * Get or create a reputation score for a user
 */
export async function getOrCreateReputationScore(userId: string, userType: UserRole) {
  let score = await prisma.reputationScore.findUnique({
    where: { userId },
  })

  if (!score) {
    score = await prisma.reputationScore.create({
      data: {
        userId,
        userType,
        overallScore: 0,
        totalReviews: 0,
        badges: [],
      },
    })
  }

  return score
}

/**
 * Get reputation breakdown for a user
 */
export async function getReputationBreakdown(userId: string): Promise<ReputationBreakdown> {
  const score = await prisma.reputationScore.findUnique({
    where: { userId },
  })

  if (!score) {
    return {
      overallScore: 0,
      totalReviews: 0,
      componentScores: {},
      badges: [],
      trend: 'STABLE',
      lastCalculatedAt: new Date(),
    }
  }

  // Determine trend from history
  const history = score.scoreHistory as { date: string; score: number }[] | null
  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE'
  if (history && history.length >= 2) {
    const latest = history[history.length - 1].score
    const previous = history[history.length - 2].score
    if (latest > previous) trend = 'UP'
    else if (latest < previous) trend = 'DOWN'
  }

  return {
    overallScore: score.overallScore.toNumber(),
    totalReviews: score.totalReviews,
    componentScores: {
      onTimeDelivery: score.onTimeDeliveryScore?.toNumber(),
      contentQuality: score.contentQualityScore?.toNumber(),
      communication: score.communicationScore?.toNumber(),
      professionalism: score.professionalismScore?.toNumber(),
      paymentReliability: score.paymentReliabilityScore?.toNumber(),
      briefClarity: score.briefClarityScore?.toNumber(),
    },
    badges: score.badges,
    trend,
    lastCalculatedAt: score.lastCalculatedAt,
  }
}

/**
 * Recalculate reputation score for an influencer based on reviews
 */
export async function recalculateInfluencerReputation(influencerId: string) {
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    select: { userId: true },
  })

  if (!influencer) throw new Error('Influencer not found')

  const reviews = await prisma.influencerReview.findMany({
    where: { influencerId, isPublic: true },
  })

  if (reviews.length === 0) return

  const totalReviews = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

  // Component averages
  const withComm = reviews.filter((r) => r.communicationRating !== null)
  const avgComm = withComm.length > 0 ? withComm.reduce((sum, r) => sum + r.communicationRating!, 0) / withComm.length : null

  const withQuality = reviews.filter((r) => r.contentQualityRating !== null)
  const avgQuality = withQuality.length > 0 ? withQuality.reduce((sum, r) => sum + r.contentQualityRating!, 0) / withQuality.length : null

  const withProf = reviews.filter((r) => r.professionalismRating !== null)
  const avgProf = withProf.length > 0 ? withProf.reduce((sum, r) => sum + r.professionalismRating!, 0) / withProf.length : null

  // On-time delivery rate
  const withDelivery = reviews.filter((r) => r.wasOnTime !== null)
  const onTimeRate = withDelivery.length > 0 ? (withDelivery.filter((r) => r.wasOnTime).length / withDelivery.length) * 100 : null

  // Get existing score to preserve history
  const existing = await getOrCreateReputationScore(influencer.userId, 'INFLUENCER')
  const history = (existing.scoreHistory as { date: string; score: number }[] | null) || []
  history.push({ date: new Date().toISOString(), score: avgRating })
  // Keep last 12 data points
  const trimmedHistory = history.slice(-12)

  // Determine badges
  const badges: VerificationBadge[] = [...existing.badges]

  if (totalReviews >= 20 && avgRating >= 4.5 && !badges.includes('TOP_CREATOR')) {
    badges.push('TOP_CREATOR')
  }
  if (totalReviews >= 1 && totalReviews <= 5 && avgRating >= 4.8 && !badges.includes('RISING_STAR')) {
    badges.push('RISING_STAR')
  }
  if (avgQuality !== null && avgQuality >= 4.5 && !badges.includes('QUALITY_CONTENT')) {
    badges.push('QUALITY_CONTENT')
  }

  await prisma.reputationScore.upsert({
    where: { userId: influencer.userId },
    update: {
      overallScore: avgRating,
      totalReviews,
      onTimeDeliveryScore: onTimeRate,
      contentQualityScore: avgQuality,
      communicationScore: avgComm,
      professionalismScore: avgProf,
      badges,
      scoreHistory: trimmedHistory as unknown as Prisma.InputJsonValue,
      lastCalculatedAt: new Date(),
    },
    create: {
      userId: influencer.userId,
      userType: 'INFLUENCER',
      overallScore: avgRating,
      totalReviews,
      onTimeDeliveryScore: onTimeRate,
      contentQualityScore: avgQuality,
      communicationScore: avgComm,
      professionalismScore: avgProf,
      badges,
      scoreHistory: trimmedHistory as unknown as Prisma.InputJsonValue,
      lastCalculatedAt: new Date(),
    },
  })
}

/**
 * Recalculate reputation score for a brand based on reviews
 */
export async function recalculateBrandReputation(brandId: string) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { userId: true },
  })

  if (!brand) throw new Error('Brand not found')

  const reviews = await prisma.brandReview.findMany({
    where: { brandId, isPublic: true },
  })

  if (reviews.length === 0) return

  const totalReviews = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

  // Component averages
  const withPayment = reviews.filter((r) => r.paymentSpeedRating !== null)
  const avgPayment = withPayment.length > 0 ? withPayment.reduce((sum, r) => sum + r.paymentSpeedRating!, 0) / withPayment.length : null

  const withBrief = reviews.filter((r) => r.briefClarityRating !== null)
  const avgBrief = withBrief.length > 0 ? withBrief.reduce((sum, r) => sum + r.briefClarityRating!, 0) / withBrief.length : null

  const existing = await getOrCreateReputationScore(brand.userId, 'BRAND')
  const history = (existing.scoreHistory as { date: string; score: number }[] | null) || []
  history.push({ date: new Date().toISOString(), score: avgRating })
  const trimmedHistory = history.slice(-12)

  const badges: VerificationBadge[] = [...existing.badges]
  if (avgPayment !== null && avgPayment >= 4.5 && totalReviews >= 10 && !badges.includes('RELIABLE_PAYER')) {
    badges.push('RELIABLE_PAYER')
  }

  await prisma.reputationScore.upsert({
    where: { userId: brand.userId },
    update: {
      overallScore: avgRating,
      totalReviews,
      paymentReliabilityScore: avgPayment,
      briefClarityScore: avgBrief,
      badges,
      scoreHistory: trimmedHistory as unknown as Prisma.InputJsonValue,
      lastCalculatedAt: new Date(),
    },
    create: {
      userId: brand.userId,
      userType: 'BRAND',
      overallScore: avgRating,
      totalReviews,
      paymentReliabilityScore: avgPayment,
      briefClarityScore: avgBrief,
      badges,
      scoreHistory: trimmedHistory as unknown as Prisma.InputJsonValue,
      lastCalculatedAt: new Date(),
    },
  })
}

// ==================== Review Operations ====================

/**
 * Create an influencer review (Brand reviews an influencer)
 */
export async function createInfluencerReview(brandId: string, input: CreateInfluencerReviewInput) {
  const review = await prisma.influencerReview.create({
    data: {
      influencerId: input.influencerId,
      brandId,
      campaignId: input.campaignId,
      rating: input.rating,
      comment: input.comment,
      communicationRating: input.communicationRating,
      contentQualityRating: input.contentQualityRating,
      professionalismRating: input.professionalismRating,
      valueForMoneyRating: input.valueForMoneyRating,
      wasOnTime: input.wasOnTime,
      deliveryDaysLate: input.deliveryDaysLate,
    },
  })

  // Trigger reputation recalculation
  await recalculateInfluencerReputation(input.influencerId)

  return review
}

/**
 * Create a brand review (Influencer reviews a brand)
 */
export async function createBrandReview(influencerId: string, input: CreateBrandReviewInput) {
  const review = await prisma.brandReview.create({
    data: {
      brandId: input.brandId,
      influencerId,
      campaignId: input.campaignId,
      rating: input.rating,
      comment: input.comment,
      communicationRating: input.communicationRating,
      paymentSpeedRating: input.paymentSpeedRating,
      professionalismRating: input.professionalismRating,
      briefClarityRating: input.briefClarityRating,
    },
  })

  // Trigger reputation recalculation
  await recalculateBrandReputation(input.brandId)

  return review
}

/**
 * Respond to a review
 */
export async function respondToInfluencerReview(reviewId: string, influencerId: string, response: string) {
  return prisma.influencerReview.update({
    where: { id: reviewId, influencerId },
    data: {
      influencerResponse: response,
      influencerRespondedAt: new Date(),
    },
  })
}

export async function respondToBrandReview(reviewId: string, brandId: string, response: string) {
  return prisma.brandReview.update({
    where: { id: reviewId, brandId },
    data: {
      brandResponse: response,
      brandRespondedAt: new Date(),
    },
  })
}

/**
 * Get reviews for an influencer
 */
export async function getInfluencerReviews(
  influencerId: string,
  options: { page?: number; pageSize?: number; publicOnly?: boolean } = {}
) {
  const { page = 1, pageSize = 20, publicOnly = true } = options
  const skip = (page - 1) * pageSize

  const where: Prisma.InfluencerReviewWhereInput = {
    influencerId,
    ...(publicOnly && { isPublic: true }),
  }

  const [data, total] = await Promise.all([
    prisma.influencerReview.findMany({
      where,
      include: {
        brand: {
          select: { id: true, companyName: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.influencerReview.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Get reviews for a brand
 */
export async function getBrandReviews(
  brandId: string,
  options: { page?: number; pageSize?: number; publicOnly?: boolean } = {}
) {
  const { page = 1, pageSize = 20, publicOnly = true } = options
  const skip = (page - 1) * pageSize

  const where: Prisma.BrandReviewWhereInput = {
    brandId,
    ...(publicOnly && { isPublic: true }),
  }

  const [data, total] = await Promise.all([
    prisma.brandReview.findMany({
      where,
      include: {
        influencer: {
          select: { id: true, fullName: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.brandReview.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

// ==================== Verification Operations ====================

/**
 * Submit a verification request
 */
export async function submitVerificationRequest(userId: string, input: CreateVerificationInput) {
  return prisma.verificationRequest.create({
    data: {
      userId,
      verificationType: input.verificationType,
      documents: input.documents,
    },
  })
}

/**
 * Get verification requests for a user
 */
export async function getUserVerificationRequests(userId: string) {
  return prisma.verificationRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Review a verification request (Admin only)
 */
export async function reviewVerificationRequest(
  requestId: string,
  adminId: string,
  input: ReviewVerificationInput
) {
  const request = await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status: input.status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: input.rejectionReason,
    },
  })

  // If approved, award the appropriate badge
  if (input.status === 'APPROVED') {
    const badgeMap: Record<string, VerificationBadge> = {
      IDENTITY: 'IDENTITY_VERIFIED',
      BUSINESS: 'BUSINESS_VERIFIED',
    }

    const badge = badgeMap[request.verificationType]
    if (badge) {
      const reputation = await getOrCreateReputationScore(
        request.userId,
        'INFLUENCER' // will be overridden if user is brand
      )

      if (!reputation.badges.includes(badge)) {
        await prisma.reputationScore.update({
          where: { userId: request.userId },
          data: {
            badges: { push: badge },
          },
        })
      }
    }
  }

  return request
}

/**
 * List all pending verification requests (Admin only)
 */
export async function listPendingVerifications(options: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 20 } = options
  const skip = (page - 1) * pageSize

  const where = { status: 'PENDING' }

  const [data, total] = await Promise.all([
    prisma.verificationRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.verificationRequest.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

// ==================== Dispute Operations ====================

/**
 * Create a dispute
 */
export async function createDispute(raisedBy: string, input: CreateDisputeInput) {
  return prisma.dispute.create({
    data: {
      collaborationId: input.collaborationId,
      raisedBy,
      againstUserId: input.againstUserId,
      type: input.type,
      description: input.description,
      evidence: input.evidence,
    },
    include: {
      collaboration: {
        select: { id: true, status: true },
      },
    },
  })
}

/**
 * Get dispute by ID
 */
export async function getDisputeById(disputeId: string) {
  return prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      collaboration: {
        select: {
          id: true,
          status: true,
          campaign: { select: { id: true, title: true } },
        },
      },
      raiser: {
        select: { id: true, name: true, role: true },
      },
      against: {
        select: { id: true, name: true, role: true },
      },
    },
  })
}

/**
 * List disputes with filters
 */
export async function listDisputes(filters: DisputeFilters) {
  const { status, type, userId, collaborationId, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where: Prisma.DisputeWhereInput = {
    ...(status && { status }),
    ...(type && { type }),
    ...(collaborationId && { collaborationId }),
    ...(userId && {
      OR: [{ raisedBy: userId }, { againstUserId: userId }],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: {
        collaboration: {
          select: { id: true, status: true },
        },
        raiser: {
          select: { id: true, name: true, role: true },
        },
        against: {
          select: { id: true, name: true, role: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dispute.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(disputeId: string, status: string) {
  return prisma.dispute.update({
    where: { id: disputeId },
    data: { status },
  })
}

/**
 * Resolve a dispute (Admin only)
 */
export async function resolveDispute(disputeId: string, adminId: string, input: ResolveDisputeInput) {
  const dispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      resolution: input.resolution,
      resolvedAt: new Date(),
      resolvedBy: adminId,
      impactsReputation: input.impactsReputation,
      reputationAction: input.reputationAction,
    },
  })

  // If it impacts reputation, recalculate the affected user's score
  if (input.impactsReputation) {
    const affectedUser = await prisma.user.findUnique({
      where: { id: dispute.againstUserId },
      include: { influencer: true, brand: true },
    })

    if (affectedUser?.influencer) {
      await recalculateInfluencerReputation(affectedUser.influencer.id)
    } else if (affectedUser?.brand) {
      await recalculateBrandReputation(affectedUser.brand.id)
    }
  }

  return dispute
}
