import { prisma } from '@/lib/db/prisma'
import { SubscriptionTier, BillingInterval, SubscriptionStatus } from '@prisma/client'
import { CreateSubscriptionInput, SubscriptionDetails, UsageSummary, PlanComparison } from '@/types/subscription'

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
}

// ==================== Plan Operations ====================

/**
 * Get all available subscription plans
 */
export async function getPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: 'asc' },
  })
}

/**
 * Get plan comparison for a user
 */
export async function getPlanComparison(userId: string): Promise<PlanComparison[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: 'asc' },
  })

  const currentSub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
    include: { plan: true },
  })

  return plans.map((plan) => ({
    tier: plan.tier,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice.toNumber(),
    yearlyPrice: plan.yearlyPrice.toNumber(),
    features: plan.features,
    limits: {
      campaigns: plan.maxCampaigns,
      influencers: plan.maxInfluencers,
      teamMembers: plan.maxTeamMembers,
      listings: plan.maxListings,
      aiQueries: plan.maxAIQueries,
    },
    isCurrentPlan: currentSub?.planId === plan.id,
  }))
}

// ==================== Subscription Operations ====================

/**
 * Create a new subscription
 */
export async function createSubscription(userId: string, input: CreateSubscriptionInput) {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: input.planId },
  })

  if (!plan) throw new Error('Plan not found')

  // Check if user already has an active subscription
  const existing = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
  })

  if (existing) {
    throw new Error('User already has an active subscription. Please upgrade or cancel first.')
  }

  const now = new Date()
  const periodEnd = new Date(now)
  if (input.billingInterval === 'MONTHLY') {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  // Free tier doesn't need payment
  const status: SubscriptionStatus = plan.tier === 'FREE' ? 'ACTIVE' : 'ACTIVE'

  return prisma.subscription.create({
    data: {
      userId,
      planId: input.planId,
      status,
      billingInterval: input.billingInterval,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    include: { plan: true },
  })
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionDetails | null> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!sub) return null

  return {
    id: sub.id,
    plan: {
      id: sub.plan.id,
      name: sub.plan.name,
      tier: sub.plan.tier,
      monthlyPrice: sub.plan.monthlyPrice.toNumber(),
      yearlyPrice: sub.plan.yearlyPrice.toNumber(),
      features: sub.plan.features,
    },
    status: sub.status,
    billingInterval: sub.billingInterval,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAt: sub.cancelAt,
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, userId: string, immediate = false) {
  const sub = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
  })

  if (!sub) throw new Error('Subscription not found')

  if (immediate) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })
  }

  // Cancel at end of billing period
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelAt: sub.currentPeriodEnd,
      cancelledAt: new Date(),
    },
  })
}

/**
 * Upgrade or downgrade subscription
 */
export async function changeSubscription(userId: string, newPlanId: string) {
  const currentSub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
    include: { plan: true },
  })

  if (!currentSub) throw new Error('No active subscription found')

  const newPlan = await prisma.subscriptionPlan.findUnique({
    where: { id: newPlanId },
  })

  if (!newPlan) throw new Error('Plan not found')

  const isUpgrade = TIER_HIERARCHY[newPlan.tier] > TIER_HIERARCHY[currentSub.plan.tier]

  if (isUpgrade) {
    // Immediate upgrade with prorated billing
    return prisma.subscription.update({
      where: { id: currentSub.id },
      data: { planId: newPlanId },
      include: { plan: true },
    })
  } else {
    // Downgrade at end of billing period
    return prisma.subscription.update({
      where: { id: currentSub.id },
      data: {
        planId: newPlanId,
        // Plan changes at next billing cycle
      },
      include: { plan: true },
    })
  }
}

// ==================== Usage Tracking ====================

/**
 * Track usage of a feature
 */
export async function trackUsage(userId: string, featureType: string, count = 1) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.usageRecord.upsert({
    where: {
      userId_type_period: {
        userId,
        type: featureType,
        period: today,
      },
    },
    update: {
      count: { increment: count },
    },
    create: {
      userId,
      type: featureType,
      count,
      period: today,
    },
  })
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
    include: { plan: true },
  })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const usageRecords = await prisma.usageRecord.groupBy({
    by: ['type'],
    where: {
      userId,
      period: { gte: startOfMonth },
    },
    _sum: { count: true },
  })

  const usageMap = new Map(usageRecords.map((r) => [r.type, r._sum.count || 0]))

  return {
    campaigns: {
      used: usageMap.get('CAMPAIGN_CREATED') || 0,
      limit: sub?.plan.maxCampaigns ?? null,
    },
    influencers: {
      used: usageMap.get('INFLUENCER_CONTACTED') || 0,
      limit: sub?.plan.maxInfluencers ?? null,
    },
    aiQueries: {
      used: usageMap.get('AI_QUERY') || 0,
      limit: sub?.plan.maxAIQueries ?? null,
    },
    listings: {
      used: usageMap.get('LISTING_CREATED') || 0,
      limit: sub?.plan.maxListings ?? null,
    },
    storage: {
      used: usageMap.get('STORAGE_MB') || 0,
      limit: sub?.plan.storageLimit ?? null,
    },
  }
}

// ==================== Feature Gates ====================

/**
 * Check if a user has access to a feature
 */
export async function checkFeatureAccess(userId: string, featureName: string): Promise<boolean> {
  const [sub, gate] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: true },
    }),
    prisma.featureGate.findUnique({
      where: { feature: featureName },
    }),
  ])

  if (!gate || !gate.isActive) return true // Feature not gated
  if (!sub) return gate.minTier === 'FREE' // No subscription, only allow free features

  return TIER_HIERARCHY[sub.plan.tier] >= TIER_HIERARCHY[gate.minTier]
}

/**
 * Get all feature gates with access status for a user
 */
export async function getFeatureGates(userId: string) {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
    include: { plan: true },
  })

  const gates = await prisma.featureGate.findMany({
    where: { isActive: true },
  })

  const currentTier = sub?.plan.tier || 'FREE'

  return gates.map((gate) => ({
    feature: gate.feature,
    description: gate.description,
    minTier: gate.minTier,
    hasAccess: TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[gate.minTier],
    isAddon: gate.isAddon,
    addonPrice: gate.addonPrice?.toNumber() ?? null,
  }))
}
