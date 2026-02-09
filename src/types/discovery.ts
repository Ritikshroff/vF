export interface DiscoveryFilters {
  query?: string
  niches?: string[]
  platforms?: string[]
  minFollowers?: number
  maxFollowers?: number
  minEngagement?: number
  maxEngagement?: number
  location?: string
  minPrice?: number
  maxPrice?: number
  verified?: boolean
  page?: number
  pageSize?: number
}

export interface DiscoveryResult {
  id: string
  username: string
  fullName: string
  avatar: string | null
  bio: string | null
  location: string | null
  verified: boolean
  categories: string[]
  rating: number
  totalReviews: number
  platforms: { platform: string; handle: string; followerCount: number; engagementRate: number }[]
  pricing: { minRate: number; maxRate: number } | null
}

export interface ComparisonData {
  id: string
  influencers: DiscoveryResult[]
  createdAt: Date
}
