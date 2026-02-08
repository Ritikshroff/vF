import { SubscriptionTier, SubscriptionStatus, BillingInterval } from '@prisma/client'

export interface CreateSubscriptionInput {
  planId: string
  billingInterval: BillingInterval
  paymentMethodId?: string
}

export interface SubscriptionDetails {
  id: string
  plan: {
    id: string
    name: string
    tier: SubscriptionTier
    monthlyPrice: number
    yearlyPrice: number
    features: string[]
  }
  status: SubscriptionStatus
  billingInterval: BillingInterval
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt: Date | null
}

export interface UsageSummary {
  campaigns: { used: number; limit: number | null }
  influencers: { used: number; limit: number | null }
  aiQueries: { used: number; limit: number | null }
  listings: { used: number; limit: number | null }
  storage: { used: number; limit: number | null }
}

export interface PlanComparison {
  tier: SubscriptionTier
  name: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  limits: {
    campaigns: number | null
    influencers: number | null
    teamMembers: number | null
    listings: number | null
    aiQueries: number | null
  }
  isCurrentPlan: boolean
}
