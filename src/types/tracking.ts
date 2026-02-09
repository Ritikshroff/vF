export interface CreateTrackingLinkInput {
  originalUrl: string
  campaignId?: string
  collaborationId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface CreatePromoCodeInput {
  campaignId?: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  maxUses?: number
  expiresAt?: string
}

export interface TrackingLinkSummary {
  id: string
  shortCode: string
  originalUrl: string
  utmSource: string | null
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  isActive: boolean
  createdAt: Date
}

export interface TrackingDashboard {
  totalLinks: number
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  conversionRate: number
  recentClicks: { date: string; count: number }[]
}

export interface PromoCodeSummary {
  id: string
  code: string
  discountType: string
  discountValue: number
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: Date | null
}
