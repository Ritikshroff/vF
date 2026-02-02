/**
 * Brand-related types
 */

export interface Brand {
  id: string
  name: string
  logo: string
  industry: string
  website?: string
  description: string
  size: 'startup' | 'small' | 'medium' | 'enterprise'
  verified: boolean
  joinedDate: string
}

export interface BrandProfile extends Brand {
  about: string
  email: string
  phone?: string
  headquarters: string
  founded?: string
  employees?: string
  socialLinks?: {
    instagram?: string
    twitter?: string
    facebook?: string
    linkedin?: string
  }
  stats: BrandStats
}

export interface BrandStats {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  totalSpend: number
  influencersWorkedWith: number
  avgRating: number
  totalReach: number
}

export interface BrandSettings {
  notifications: {
    email: boolean
    campaignUpdates: boolean
    newApplications: boolean
    messages: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showSpending: boolean
  }
  billing: {
    defaultPaymentMethod?: string
    autoRecharge: boolean
    billingEmail: string
  }
}
