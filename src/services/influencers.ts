/**
 * Influencer Service
 * Simulates API calls for influencer-related operations
 */

import {
  getAllInfluencers,
  getInfluencerById,
  getInfluencerByUserId,
  type InfluencerProfile,
} from '@/mock-data/influencers'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface InfluencerSearchFilters {
  categories?: string[]
  platforms?: string[]
  min_followers?: number
  max_followers?: number
  min_engagement?: number
  max_engagement?: number
  locations?: string[]
  min_price?: number
  max_price?: number
  availability?: 'available' | 'busy' | 'booked' | 'all'
  verified_only?: boolean
  sort_by?: 'followers' | 'engagement' | 'price' | 'rating' | 'relevance'
  sort_order?: 'asc' | 'desc'
}

export interface InfluencerSearchResult {
  influencers: InfluencerProfile[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

/**
 * Search and filter influencers
 */
export const searchInfluencers = async (
  filters: InfluencerSearchFilters = {},
  page: number = 1,
  per_page: number = 12
): Promise<InfluencerSearchResult> => {
  await delay(800) // Simulate network latency

  let results = getAllInfluencers()

  // Apply filters
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter((inf) =>
      inf.categories.some((cat) => filters.categories?.includes(cat))
    )
  }

  if (filters.platforms && filters.platforms.length > 0) {
    results = results.filter((inf) =>
      inf.platforms.some((p) => filters.platforms?.includes(p.platform))
    )
  }

  if (filters.min_followers) {
    results = results.filter((inf) =>
      inf.platforms.some((p) => p.followers >= (filters.min_followers || 0))
    )
  }

  if (filters.max_followers) {
    results = results.filter((inf) =>
      inf.platforms.every((p) => p.followers <= (filters.max_followers || Infinity))
    )
  }

  if (filters.min_engagement) {
    results = results.filter((inf) =>
      inf.metrics.avg_engagement_rate >= (filters.min_engagement || 0)
    )
  }

  if (filters.max_engagement) {
    results = results.filter((inf) =>
      inf.metrics.avg_engagement_rate <= (filters.max_engagement || 100)
    )
  }

  if (filters.locations && filters.locations.length > 0) {
    results = results.filter((inf) =>
      filters.locations?.some((loc) => inf.location.includes(loc))
    )
  }

  if (filters.min_price && filters.min_price > 0) {
    results = results.filter((inf) => inf.pricing.instagram_post >= filters.min_price!)
  }

  if (filters.max_price && filters.max_price > 0) {
    results = results.filter((inf) => inf.pricing.instagram_post <= filters.max_price!)
  }

  if (filters.availability && filters.availability !== 'all') {
    results = results.filter((inf) => inf.availability === filters.availability)
  }

  if (filters.verified_only) {
    results = results.filter((inf) => inf.verified)
  }

  // Sorting
  const sortBy = filters.sort_by || 'relevance'
  const sortOrder = filters.sort_order || 'desc'

  results.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'followers':
        comparison =
          Math.max(...a.platforms.map((p) => p.followers)) -
          Math.max(...b.platforms.map((p) => p.followers))
        break
      case 'engagement':
        comparison = a.metrics.avg_engagement_rate - b.metrics.avg_engagement_rate
        break
      case 'price':
        comparison = a.pricing.instagram_post - b.pricing.instagram_post
        break
      case 'rating':
        comparison = a.rating - b.rating
        break
      case 'relevance':
      default:
        // Relevance = combination of engagement, authenticity, and brand safety
        const scoreA =
          (a.metrics.avg_engagement_rate +
            a.metrics.authenticity_score +
            a.metrics.brand_safety_score) /
          3
        const scoreB =
          (b.metrics.avg_engagement_rate +
            b.metrics.authenticity_score +
            b.metrics.brand_safety_score) /
          3
        comparison = scoreA - scoreB
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Pagination
  const total = results.length
  const total_pages = Math.ceil(total / per_page)
  const start = (page - 1) * per_page
  const end = start + per_page
  const paginatedResults = results.slice(start, end)

  return {
    influencers: paginatedResults,
    total,
    page,
    per_page,
    total_pages,
  }
}

/**
 * Get influencer by ID
 */
export const fetchInfluencerById = async (id: string): Promise<InfluencerProfile | null> => {
  await delay(300)
  return getInfluencerById(id) || null
}

/**
 * Get influencer profile by user ID
 */
export const fetchInfluencerByUserId = async (
  userId: string
): Promise<InfluencerProfile | null> => {
  await delay(300)
  return getInfluencerByUserId(userId) || null
}

/**
 * Get multiple influencers by IDs
 */
export const fetchInfluencersByIds = async (ids: string[]): Promise<InfluencerProfile[]> => {
  await delay(400)
  return ids.map((id) => getInfluencerById(id)).filter((inf): inf is InfluencerProfile => !!inf)
}

/**
 * Get recommended influencers based on brand preferences
 */
export const getRecommendedInfluencers = async (
  brandId: string,
  limit: number = 10
): Promise<InfluencerProfile[]> => {
  await delay(600)

  // In a real app, this would use ML/AI to recommend based on brand history
  // For now, return top-rated influencers with high engagement
  const allInfluencers = getAllInfluencers()

  return allInfluencers
    .sort((a, b) => {
      const scoreA = a.rating * a.metrics.avg_engagement_rate
      const scoreB = b.rating * b.metrics.avg_engagement_rate
      return scoreB - scoreA
    })
    .slice(0, limit)
}

/**
 * Update influencer profile
 */
export const updateInfluencerProfile = async (
  userId: string,
  updates: Partial<InfluencerProfile>
): Promise<InfluencerProfile> => {
  await delay(500)

  // In a real app, this would update the database
  // For mock, just return the merged data
  const existing = getInfluencerByUserId(userId)
  if (!existing) {
    throw new Error('Influencer not found')
  }

  return {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Get influencer analytics data
 */
export const fetchInfluencerAnalytics = async (influencerId: string) => {
  await delay(600)

  const influencer = getInfluencerById(influencerId)
  if (!influencer) {
    throw new Error('Influencer not found')
  }

  return {
    overview: {
      total_followers: influencer.platforms.reduce((sum, p) => sum + p.followers, 0),
      avg_engagement_rate: influencer.metrics.avg_engagement_rate,
      total_reach: influencer.metrics.total_reach,
      authenticity_score: influencer.metrics.authenticity_score,
    },
    growth_trend: influencer.growth_trend,
    audience_demographics: influencer.audience,
    recent_performance: influencer.recent_posts,
    platform_breakdown: influencer.platforms.map((p) => ({
      platform: p.platform,
      followers: p.followers,
      engagement_rate: p.engagement_rate,
      avg_reach: p.avg_views || p.followers * 0.3,
    })),
  }
}
