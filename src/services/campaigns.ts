/**
 * Campaigns Service
 * Simulates API calls for campaign-related operations
 */

import {
  getAllCampaigns,
  getCampaignById,
  getActiveCampaigns,
  getCampaignsByBrand,
  getInfluencerCampaigns,
  type Campaign,
} from '@/mock-data/campaigns'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface CampaignFilters {
  category?: string
  platforms?: string[]
  min_budget?: number
  max_budget?: number
  status?: Campaign['status']
  visibility?: Campaign['visibility']
}

/**
 * Get all campaigns with optional filters
 */
export const fetchCampaigns = async (filters?: CampaignFilters): Promise<Campaign[]> => {
  await delay(500)

  let results = getAllCampaigns()

  if (filters?.category) {
    results = results.filter((c) => c.category === filters.category)
  }

  if (filters?.platforms && filters.platforms.length > 0) {
    results = results.filter((c) => c.platforms.some((p) => filters.platforms?.includes(p)))
  }

  if (filters?.min_budget) {
    results = results.filter((c) => c.budget.max >= filters.min_budget!)
  }

  if (filters?.max_budget) {
    results = results.filter((c) => c.budget.min <= filters.max_budget!)
  }

  if (filters?.status) {
    results = results.filter((c) => c.status === filters.status)
  }

  if (filters?.visibility) {
    results = results.filter((c) => c.visibility === filters.visibility)
  }

  return results
}

/**
 * Get campaign by ID
 */
export const fetchCampaignById = async (id: string): Promise<Campaign | null> => {
  await delay(300)
  return getCampaignById(id) || null
}

/**
 * Get active campaigns (public)
 */
export const fetchActiveCampaigns = async (): Promise<Campaign[]> => {
  await delay(400)
  return getActiveCampaigns()
}

/**
 * Get campaigns for a specific brand
 */
export const fetchBrandCampaigns = async (brandId: string): Promise<Campaign[]> => {
  await delay(400)
  return getCampaignsByBrand(brandId)
}

/**
 * Get campaigns for a specific influencer (categorized)
 */
export const fetchInfluencerCampaignStatus = async (influencerId: string) => {
  await delay(400)
  return getInfluencerCampaigns(influencerId)
}

/**
 * Get all campaigns (for influencer browse page)
 */
export const fetchInfluencerCampaigns = async (influencerId: string): Promise<Campaign[]> => {
  await delay(400)
  // Return all campaigns - the page will handle filtering
  return getAllCampaigns()
}

/**
 * Create a new campaign
 */
export const createCampaign = async (
  campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
): Promise<Campaign> => {
  await delay(600)

  const newCampaign: Campaign = {
    ...campaignData,
    id: `camp_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // In a real app, this would save to database
  return newCampaign
}

/**
 * Update a campaign
 */
export const updateCampaign = async (
  id: string,
  updates: Partial<Campaign>
): Promise<Campaign> => {
  await delay(500)

  const existing = getCampaignById(id)
  if (!existing) {
    throw new Error('Campaign not found')
  }

  return {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Invite influencer to campaign
 */
export const inviteInfluencerToCampaign = async (
  campaignId: string,
  influencerId: string
): Promise<boolean> => {
  await delay(400)

  const campaign = getCampaignById(campaignId)
  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // In a real app, this would update database and send notification
  // For mock, just simulate success
  return true
}

/**
 * Influencer applies to campaign
 */
export const applyToCampaign = async (
  campaignId: string,
  influencerId: string,
  message?: string
): Promise<boolean> => {
  await delay(500)

  const campaign = getCampaignById(campaignId)
  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.applied_influencers.includes(influencerId)) {
    throw new Error('Already applied to this campaign')
  }

  // In a real app, this would update database and notify brand
  return true
}

/**
 * Brand accepts influencer for campaign
 */
export const acceptInfluencerForCampaign = async (
  campaignId: string,
  influencerId: string
): Promise<boolean> => {
  await delay(400)

  const campaign = getCampaignById(campaignId)
  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.accepted_influencers.length >= campaign.max_influencers) {
    throw new Error('Campaign is full')
  }

  // In a real app, this would update database and send contract
  return true
}

/**
 * Get campaign analytics
 */
export const fetchCampaignAnalytics = async (campaignId: string) => {
  await delay(600)

  const campaign = getCampaignById(campaignId)
  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // Mock analytics data
  return {
    overview: {
      total_influencers: campaign.accepted_influencers.length,
      total_reach: campaign.performance?.total_reach || 0,
      total_engagement: campaign.performance?.total_engagement || 0,
      total_conversions: campaign.performance?.total_conversions || 0,
      roi: campaign.performance?.roi || 0,
    },
    influencer_performance: campaign.accepted_influencers.map((infId) => ({
      influencer_id: infId,
      reach: Math.floor(Math.random() * 500000) + 100000,
      engagement: Math.floor(Math.random() * 50000) + 10000,
      conversions: Math.floor(Math.random() * 5000) + 500,
    })),
    timeline: {
      applications: Math.floor(Math.random() * 20) + 10,
      accepted: campaign.accepted_influencers.length,
      content_submitted: Math.floor(campaign.accepted_influencers.length * 0.8),
      content_approved: Math.floor(campaign.accepted_influencers.length * 0.6),
    },
  }
}

/**
 * Get campaign recommendations for influencer
 */
export const getRecommendedCampaigns = async (
  influencerId: string,
  limit: number = 5
): Promise<Campaign[]> => {
  await delay(500)

  // In a real app, this would use ML to recommend based on influencer profile
  // For mock, return active public campaigns
  const activeCampaigns = getActiveCampaigns()

  return activeCampaigns.filter((c) => c.visibility === 'public').slice(0, limit)
}
