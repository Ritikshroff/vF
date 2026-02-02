/**
 * Influencer-related types
 */

export interface SocialStats {
  followers: number
  engagement: number
  avgViews?: number
  posts?: number
}

export interface PlatformStats {
  instagram?: SocialStats
  tiktok?: SocialStats
  youtube?: SocialStats
  twitter?: SocialStats
  facebook?: SocialStats
}

export interface PricingInfo {
  post?: number
  story?: number
  reel?: number
  video?: number
  sponsored?: number
}

export interface Influencer {
  id: string
  name: string
  username: string
  avatar: string
  verified: boolean
  bio: string
  categories: string[]
  location: string
  language?: string[]
  stats: SocialStats
  platforms: PlatformStats
  pricing: PricingInfo
  rating: number
  reviewCount: number
  responseTime: string
  completionRate: number
  joinedDate?: string
  featured?: boolean
}

export interface InfluencerProfile extends Influencer {
  about: string
  website?: string
  email?: string
  phone?: string
  mediaKit?: string
  contentGallery: ContentItem[]
  reviews: Review[]
  collaborations: number
  totalReach: number
  audienceDemographics?: AudienceDemographics
}

export interface ContentItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  platform: string
  views?: number
  likes?: number
  comments?: number
  createdAt: string
}

export interface Review {
  id: string
  brandName: string
  brandLogo?: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

export interface AudienceDemographics {
  ageGroups: {
    '18-24': number
    '25-34': number
    '35-44': number
    '45-54': number
    '55+': number
  }
  gender: {
    male: number
    female: number
    other: number
  }
  topLocations: {
    country: string
    percentage: number
  }[]
  interests: string[]
}

export interface InfluencerFilters {
  categories?: string[]
  platforms?: string[]
  followerRange?: {
    min: number
    max: number
  }
  engagementRange?: {
    min: number
    max: number
  }
  location?: string[]
  language?: string[]
  verified?: boolean
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
}

export interface InfluencerSearchParams extends InfluencerFilters {
  query?: string
  sortBy?: 'relevance' | 'followers' | 'engagement' | 'price' | 'rating'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
