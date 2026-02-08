import { VerificationBadge, UserRole } from '@prisma/client'

// ==================== Reputation Score Types ====================

export interface ReputationBreakdown {
  overallScore: number
  totalReviews: number
  componentScores: {
    onTimeDelivery?: number
    contentQuality?: number
    communication?: number
    professionalism?: number
    paymentReliability?: number
    briefClarity?: number
  }
  badges: VerificationBadge[]
  trend: 'UP' | 'DOWN' | 'STABLE'
  lastCalculatedAt: Date
}

export interface ReputationUpdateEvent {
  userId: string
  eventType: 'REVIEW' | 'DELIVERY' | 'DISPUTE_RESOLVED' | 'VERIFICATION' | 'MILESTONE_COMPLETED'
  data: Record<string, unknown>
}

// ==================== Verification Types ====================

export interface CreateVerificationInput {
  verificationType: 'IDENTITY' | 'BUSINESS' | 'PORTFOLIO' | 'SOCIAL_ACCOUNT'
  documents: string[]
}

export interface ReviewVerificationInput {
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

// ==================== Dispute Types ====================

export type DisputeType = 'NON_DELIVERY' | 'QUALITY' | 'PAYMENT' | 'COMMUNICATION' | 'CONTRACT_BREACH' | 'OTHER'
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_REQUESTED' | 'RESOLVED' | 'ESCALATED' | 'CLOSED'

export interface CreateDisputeInput {
  collaborationId: string
  againstUserId: string
  type: DisputeType
  description: string
  evidence: string[]
}

export interface ResolveDisputeInput {
  resolution: string
  impactsReputation: boolean
  reputationAction?: string
}

export interface DisputeFilters {
  status?: DisputeStatus
  type?: DisputeType
  userId?: string
  collaborationId?: string
  page?: number
  pageSize?: number
}

// ==================== Review Types ====================

export interface CreateInfluencerReviewInput {
  influencerId: string
  campaignId?: string
  rating: number
  comment?: string
  communicationRating?: number
  contentQualityRating?: number
  professionalismRating?: number
  valueForMoneyRating?: number
  wasOnTime?: boolean
  deliveryDaysLate?: number
}

export interface CreateBrandReviewInput {
  brandId: string
  campaignId?: string
  rating: number
  comment?: string
  communicationRating?: number
  paymentSpeedRating?: number
  professionalismRating?: number
  briefClarityRating?: number
}

export interface ReviewResponse {
  response: string
}

// ==================== Badge Criteria ====================

export const BADGE_CRITERIA: Record<VerificationBadge, { name: string; description: string; autoAwarded: boolean }> = {
  IDENTITY_VERIFIED: {
    name: 'Identity Verified',
    description: 'Has completed identity verification',
    autoAwarded: false,
  },
  BUSINESS_VERIFIED: {
    name: 'Business Verified',
    description: 'Business entity has been verified',
    autoAwarded: false,
  },
  TOP_CREATOR: {
    name: 'Top Creator',
    description: 'Consistently high ratings across 20+ collaborations',
    autoAwarded: true,
  },
  RISING_STAR: {
    name: 'Rising Star',
    description: 'Exceptional performance in first 5 collaborations',
    autoAwarded: true,
  },
  RELIABLE_PAYER: {
    name: 'Reliable Payer',
    description: 'Always pays on time with 10+ completed payments',
    autoAwarded: true,
  },
  FAST_RESPONDER: {
    name: 'Fast Responder',
    description: 'Average response time under 2 hours',
    autoAwarded: true,
  },
  QUALITY_CONTENT: {
    name: 'Quality Content',
    description: 'Average content quality rating above 4.5',
    autoAwarded: true,
  },
}
