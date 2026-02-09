export interface CreateBudgetPlanInput {
  campaignId?: string
  name: string
  totalBudget: number
  allocations: {
    influencerFees: number
    platformFees: number
    adSpend: number
    production: number
    other: number
  }
}

export interface CalculateROIInput {
  campaignId?: string
  budget: number
  estimatedReach: number
  estimatedEngagement: number
  estimatedConversions: number
  assumptions: Record<string, unknown>
}

export interface BudgetPlanSummary {
  id: string
  name: string
  campaignId: string | null
  totalBudget: number
  allocations: unknown
  createdAt: Date
}

export interface ROIProjectionSummary {
  id: string
  budget: number
  estimatedReach: number
  estimatedEngagement: number
  estimatedConversions: number
  estimatedROI: number
  assumptions: unknown
  createdAt: Date
}

export interface IndustryBenchmark {
  niche: string
  avgCPE: number
  avgCPM: number
  avgROI: number
  avgEngagementRate: number
}
