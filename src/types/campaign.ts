/**
 * Campaign-related types
 */

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type DeliverableStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested'

export interface Deliverable {
  id: string
  type: string
  quantity: number
  description?: string
  compensation: number
  deadline?: string
  status?: DeliverableStatus
}

export interface TargetAudience {
  ageRange?: string
  gender?: 'male' | 'female' | 'all'
  interests?: string[]
  locations?: string[]
  languages?: string[]
}

export interface Campaign {
  id: string
  title: string
  brand: string
  brandId: string
  brandLogo: string
  status: CampaignStatus
  budget: number
  spent?: number
  startDate: string
  endDate: string
  description?: string
  deliverables: Deliverable[]
  targetAudience?: TargetAudience
  requirements?: string[]
  hashtags?: string[]
  applications: number
  accepted: number
  completed: number
  createdAt: string
  updatedAt?: string
}

export interface CampaignDetails extends Campaign {
  longDescription: string
  objectives: string[]
  dosList?: string[]
  dontsList?: string[]
  brandGuidelines?: string
  exampleContent?: string[]
  applicants?: CampaignApplication[]
  metrics?: CampaignMetrics
}

export interface CampaignApplication {
  id: string
  campaignId: string
  influencerId: string
  influencerName: string
  influencerAvatar: string
  influencerUsername: string
  influencerStats: {
    followers: number
    engagement: number
  }
  status: ApplicationStatus
  appliedAt: string
  updatedAt?: string
  proposal?: string
  proposedPrice?: number
  estimatedReach?: number
  message?: string
}

export interface CampaignMetrics {
  totalReach: number
  totalEngagement: number
  totalImpressions: number
  totalClicks?: number
  totalConversions?: number
  roi?: number
  costPerEngagement?: number
  costPerClick?: number
}

export interface CampaignInvitation {
  id: string
  campaign: Campaign
  invitedAt: string
  expiresAt: string
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

export interface CampaignFilters {
  status?: CampaignStatus[]
  budgetRange?: {
    min: number
    max: number
  }
  dateRange?: {
    start: string
    end: string
  }
  categories?: string[]
  platforms?: string[]
}

export interface CreateCampaignInput {
  title: string
  description: string
  longDescription?: string
  budget: number
  startDate: string
  endDate: string
  deliverables: Omit<Deliverable, 'id' | 'status'>[]
  targetAudience?: TargetAudience
  requirements?: string[]
  hashtags?: string[]
  objectives?: string[]
}
