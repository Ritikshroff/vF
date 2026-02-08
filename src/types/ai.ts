export interface AIMatchRequest {
  brandId: string
  campaignId?: string
  filters?: {
    minFollowers?: number
    maxFollowers?: number
    categories?: string[]
    platforms?: string[]
    minEngagementRate?: number
    locations?: string[]
  }
  limit?: number
}

export interface AIMatchResult {
  influencerId: string
  overallScore: number
  audienceScore: number
  contentScore: number
  engagementScore: number
  budgetFitScore: number
  brandSafetyScore: number
  matchReasons: string[]
  warnings: string[]
  recommendation: string | null
}

export interface ContentSuggestionRequest {
  campaignId: string
  influencerId?: string
  platform?: string
  contentType?: string
  brandVoice?: string
  targetAudience?: string
}

export interface ContentSuggestionResult {
  type: string
  title: string
  description: string
  suggestedHooks: string[]
  suggestedHashtags: string[]
  toneGuidance: string | null
  formatTips: string | null
  predictedEngagementRate: number | null
  predictedReach: number | null
  confidenceScore: number | null
}

export interface PricingRecommendation {
  platform: string
  contentType: string
  recommendedPrice: number
  priceRangeMin: number
  priceRangeMax: number
  factors: Record<string, unknown>
}

export interface FraudDetectionResult {
  influencerId: string
  flags: {
    type: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: string
    evidence: Record<string, unknown>
  }[]
  riskScore: number
}
