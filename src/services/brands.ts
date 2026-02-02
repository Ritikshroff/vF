/**
 * Brands Service
 * Simulates API calls for brand-related operations
 */

import {
  getAllBrands,
  getBrandById,
  getBrandByUserId,
  type BrandProfile,
} from '@/mock-data/brands'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get brand profile by ID
 */
export const fetchBrandById = async (id: string): Promise<BrandProfile | null> => {
  await delay(300)
  return getBrandById(id) || null
}

/**
 * Get brand profile by user ID
 */
export const fetchBrandByUserId = async (userId: string): Promise<BrandProfile | null> => {
  await delay(300)
  return getBrandByUserId(userId) || null
}

/**
 * Update brand profile
 */
export const updateBrandProfile = async (
  userId: string,
  updates: Partial<BrandProfile>
): Promise<BrandProfile> => {
  await delay(500)

  const existing = getBrandByUserId(userId)
  if (!existing) {
    throw new Error('Brand not found')
  }

  return {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Save influencer to brand's favorites
 */
export const saveInfluencer = async (
  brandId: string,
  influencerId: string
): Promise<boolean> => {
  await delay(300)

  const brand = getBrandById(brandId)
  if (!brand) {
    throw new Error('Brand not found')
  }

  if (brand.saved_influencers.includes(influencerId)) {
    throw new Error('Influencer already saved')
  }

  // In a real app, this would update the database
  return true
}

/**
 * Remove influencer from brand's favorites
 */
export const unsaveInfluencer = async (
  brandId: string,
  influencerId: string
): Promise<boolean> => {
  await delay(300)

  const brand = getBrandById(brandId)
  if (!brand) {
    throw new Error('Brand not found')
  }

  // In a real app, this would update the database
  return true
}

/**
 * Get brand's saved influencers
 */
export const fetchSavedInfluencers = async (brandId: string): Promise<string[]> => {
  await delay(400)

  const brand = getBrandById(brandId)
  if (!brand) {
    throw new Error('Brand not found')
  }

  return brand.saved_influencers
}

/**
 * Get brand analytics/metrics
 */
export const fetchBrandAnalytics = async (brandId: string) => {
  await delay(600)

  const brand = getBrandById(brandId)
  if (!brand) {
    throw new Error('Brand not found')
  }

  return {
    overview: {
      total_campaigns: brand.total_campaigns,
      active_campaigns: brand.active_campaigns,
      completed_campaigns: brand.completed_campaigns,
      total_spend: brand.total_spent,
      total_reach: brand.metrics.total_reach,
      avg_roi: brand.metrics?.avg_campaign_roi,
      avg_campaign_budget: brand.avg_campaign_budget,
    },
    performance: brand.metrics,
    spending_trend: [
      { month: 'Aug 2025', amount: 42000 },
      { month: 'Sep 2025', amount: 38000 },
      { month: 'Oct 2025', amount: 52000 },
      { month: 'Nov 2025', amount: 48000 },
      { month: 'Dec 2025', amount: 65000 },
      { month: 'Jan 2026', amount: 40000 },
    ],
    roi_trend: [
      { month: 'Aug 2025', roi: 360 },
      { month: 'Sep 2025', roi: 375 },
      { month: 'Oct 2025', roi: 390 },
      { month: 'Nov 2025', roi: 385 },
      { month: 'Dec 2025', roi: 410 },
      { month: 'Jan 2026', roi: 380 },
    ],
    top_influencers: [
      {
        name: 'Sarah Anderson',
        campaigns_completed: 5,
        total_reach: 2400000,
        total_engagement: 192000,
        conversions: 8400,
        avg_roi: 450,
      },
      {
        name: 'Michael Chen',
        campaigns_completed: 4,
        total_reach: 1800000,
        total_engagement: 144000,
        conversions: 6200,
        avg_roi: 420,
      },
      {
        name: 'Emma Rodriguez',
        campaigns_completed: 6,
        total_reach: 3100000,
        total_engagement: 248000,
        conversions: 10500,
        avg_roi: 485,
      },
      {
        name: 'David Kim',
        campaigns_completed: 3,
        total_reach: 1200000,
        total_engagement: 96000,
        conversions: 4800,
        avg_roi: 395,
      },
    ],
  }
}
