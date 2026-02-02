/**
 * Content Service
 * Simulates API calls for content library operations
 */

import {
  getInfluencerContent,
  getCampaignContent,
  getContentById,
  type ContentItem,
} from '@/mock-data/content'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface ContentFilters {
  type?: ContentItem['type']
  platform?: ContentItem['platform']
  status?: ContentItem['status']
  campaign_id?: string
  tags?: string[]
}

/**
 * Get content for an influencer
 */
export const fetchInfluencerContent = async (
  influencerId: string,
  filters?: ContentFilters
): Promise<ContentItem[]> => {
  await delay(400)

  let results = getInfluencerContent(influencerId)

  if (filters?.type) {
    results = results.filter((c) => c.type === filters.type)
  }

  if (filters?.platform) {
    results = results.filter((c) => c.platform === filters.platform)
  }

  if (filters?.status) {
    results = results.filter((c) => c.status === filters.status)
  }

  if (filters?.campaign_id) {
    results = results.filter((c) => c.campaign_id === filters.campaign_id)
  }

  if (filters?.tags && filters.tags.length > 0) {
    results = results.filter((c) =>
      filters.tags!.some((tag) => c.tags.includes(tag))
    )
  }

  // Sort by date, newest first
  return results.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * Get content for a campaign
 */
export const fetchCampaignContent = async (campaignId: string): Promise<ContentItem[]> => {
  await delay(400)
  return getCampaignContent(campaignId)
}

/**
 * Get content by ID
 */
export const fetchContentById = async (contentId: string): Promise<ContentItem | null> => {
  await delay(300)
  return getContentById(contentId) || null
}

/**
 * Upload new content
 */
export const uploadContent = async (
  contentData: Omit<ContentItem, 'id' | 'created_at'>
): Promise<ContentItem> => {
  await delay(800)

  const newContent: ContentItem = {
    ...contentData,
    id: `content_${Date.now()}`,
    created_at: new Date().toISOString(),
  }

  // In a real app, this would save to database
  return newContent
}

/**
 * Update content
 */
export const updateContent = async (
  contentId: string,
  updates: Partial<ContentItem>
): Promise<ContentItem> => {
  await delay(500)

  const existing = getContentById(contentId)
  if (!existing) {
    throw new Error('Content not found')
  }

  return {
    ...existing,
    ...updates,
  }
}

/**
 * Delete content
 */
export const deleteContent = async (contentId: string): Promise<boolean> => {
  await delay(400)

  const existing = getContentById(contentId)
  if (!existing) {
    throw new Error('Content not found')
  }

  // In a real app, this would delete from database
  return true
}

/**
 * Get content statistics
 */
export const fetchContentStats = async (influencerId: string) => {
  await delay(500)

  const content = getInfluencerContent(influencerId)

  const published = content.filter((c) => c.status === 'published')

  const totalViews = published.reduce((sum, c) => sum + (c.metrics?.views || 0), 0)
  const totalLikes = published.reduce((sum, c) => sum + (c.metrics?.likes || 0), 0)
  const totalComments = published.reduce((sum, c) => sum + (c.metrics?.comments || 0), 0)
  const avgEngagement =
    published.reduce((sum, c) => sum + (c.metrics?.engagement_rate || 0), 0) /
    (published.length || 1)

  return {
    total_content: content.length,
    published: published.length,
    draft: content.filter((c) => c.status === 'draft').length,
    archived: content.filter((c) => c.status === 'archived').length,
    total_views: totalViews,
    total_likes: totalLikes,
    total_comments: totalComments,
    avg_engagement: avgEngagement,
    by_platform: {
      Instagram: content.filter((c) => c.platform === 'Instagram').length,
      TikTok: content.filter((c) => c.platform === 'TikTok').length,
      YouTube: content.filter((c) => c.platform === 'YouTube').length,
      Facebook: content.filter((c) => c.platform === 'Facebook').length,
    },
    by_type: {
      image: content.filter((c) => c.type === 'image').length,
      video: content.filter((c) => c.type === 'video').length,
      reel: content.filter((c) => c.type === 'reel').length,
      story: content.filter((c) => c.type === 'story').length,
      post: content.filter((c) => c.type === 'post').length,
    },
  }
}
