/**
 * Analytics and metrics types
 */

export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export interface TimeSeriesData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface DashboardStats {
  totalCampaigns?: number
  activeCampaigns?: number
  totalSpend?: number
  totalReach?: number
  totalEngagement?: number
  averageROI?: number
  campaignCompletionRate?: number
  growthRate?: number
}

export interface InfluencerDashboardStats {
  totalEarnings: number
  activeCampaigns: number
  completedCampaigns: number
  totalReach: number
  avgEngagementRate: number
  pendingInvitations: number
  responseRate: number
  rating: number
}

export interface BrandDashboardStats {
  totalSpend: number
  activeCampaigns: number
  completedCampaigns: number
  totalReach: number
  avgEngagementRate: number
  influencersWorkedWith: number
  avgROI: number
  pendingApplications: number
}

export interface PerformanceMetrics {
  reach: number
  impressions: number
  engagements: number
  clicks?: number
  conversions?: number
  engagementRate: number
  clickThroughRate?: number
  conversionRate?: number
  costPerEngagement?: number
  costPerClick?: number
  roi?: number
}

export interface CampaignAnalytics {
  overview: PerformanceMetrics
  timeline: TimeSeriesData
  topPosts: ContentPerformance[]
  audienceDemographics?: {
    ageGroups: ChartDataPoint[]
    gender: ChartDataPoint[]
    locations: ChartDataPoint[]
  }
  platformBreakdown: ChartDataPoint[]
}

export interface ContentPerformance {
  id: string
  influencer: string
  influencerAvatar: string
  platform: string
  type: string
  url: string
  thumbnail?: string
  reach: number
  engagements: number
  engagementRate: number
  postedAt: string
}

export interface PaymentRecord {
  id: string
  campaignId: string
  campaignTitle: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  date: string
  paymentMethod?: string
  description?: string
}

export interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
  status: 'pending' | 'completed' | 'failed'
  reference?: string
}

export interface RevenueData {
  total: number
  growth: number
  monthlyData: TimeSeriesData
  breakdown: {
    category: string
    amount: number
    percentage: number
  }[]
}

// ==================== Phase 2: Advanced Analytics ====================

export type AnalyticsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface AnalyticsTimeRange {
  startDate: string
  endDate: string
  period?: AnalyticsPeriod
}

export interface CampaignPerformanceMetrics {
  totalReach: number
  totalImpressions: number
  totalEngagement: number
  totalClicks: number
  totalConversions: number
  totalSpend: number
  costPerClick: number | null
  costPerEngagement: number | null
  costPerConversion: number | null
  roi: number | null
  totalPosts: number
  avgEngagementRate: number | null
}

export interface InfluencerPerformanceMetrics {
  totalFollowers: number
  totalEngagement: number
  avgEngagementRate: number | null
  completedCampaigns: number
  averageRating: number | null
  onTimeDeliveryRate: number | null
  totalPostsCreated: number
  followerGrowthRate: number | null
}

export interface PlatformOverviewMetrics {
  totalUsers: number
  newUsers: number
  activeUsers: number
  totalBrands: number
  totalInfluencers: number
  activeCampaigns: number
  totalRevenue: number
  platformFeeRevenue: number
  totalCollaborations: number
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'list'
  title: string
  data: unknown
  config?: Record<string, unknown>
}
