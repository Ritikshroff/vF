/**
 * Mock Content Library Data
 */

export interface ContentItem {
  id: string
  influencer_id: string
  campaign_id?: string
  campaign_name?: string
  title: string
  description: string
  type: 'image' | 'video' | 'reel' | 'story' | 'post'
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook'
  url: string
  thumbnail: string
  metrics?: {
    views: number
    likes: number
    comments: number
    shares: number
    engagement_rate: number
  }
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  created_at: string
  published_at?: string
}

export const mockContent: ContentItem[] = [
  {
    id: 'content_001',
    influencer_id: 'inf_001',
    campaign_id: 'camp_001',
    campaign_name: 'Spring Fashion Launch',
    title: 'Spring Collection Reveal',
    description: 'Showcasing the new sustainable fashion pieces from EcoWear',
    type: 'reel',
    platform: 'Instagram',
    url: 'https://instagram.com/p/example1',
    thumbnail: 'https://picsum.photos/seed/content1/400/600',
    metrics: {
      views: 125000,
      likes: 8500,
      comments: 340,
      shares: 210,
      engagement_rate: 7.2,
    },
    status: 'published',
    tags: ['Fashion', 'Sustainable', 'Spring'],
    created_at: '2026-01-10',
    published_at: '2026-01-15',
  },
  {
    id: 'content_002',
    influencer_id: 'inf_001',
    campaign_id: 'camp_001',
    campaign_name: 'Spring Fashion Launch',
    title: 'Styling Tips Tutorial',
    description: 'How to style the new spring pieces for different occasions',
    type: 'video',
    platform: 'YouTube',
    url: 'https://youtube.com/watch?v=example2',
    thumbnail: 'https://picsum.photos/seed/content2/400/300',
    metrics: {
      views: 45000,
      likes: 3200,
      comments: 180,
      shares: 95,
      engagement_rate: 7.7,
    },
    status: 'published',
    tags: ['Fashion', 'Tutorial', 'Styling'],
    created_at: '2026-01-12',
    published_at: '2026-01-17',
  },
  {
    id: 'content_003',
    influencer_id: 'inf_001',
    title: 'My Daily Routine',
    description: 'A day in my life - morning to night routine',
    type: 'video',
    platform: 'YouTube',
    url: 'https://youtube.com/watch?v=example3',
    thumbnail: 'https://picsum.photos/seed/content3/400/300',
    metrics: {
      views: 89000,
      likes: 5600,
      comments: 420,
      shares: 180,
      engagement_rate: 7.0,
    },
    status: 'published',
    tags: ['Lifestyle', 'Daily Routine', 'Personal'],
    created_at: '2025-12-20',
    published_at: '2025-12-22',
  },
  {
    id: 'content_004',
    influencer_id: 'inf_001',
    campaign_id: 'camp_005',
    campaign_name: 'Holiday Gift Guide',
    title: 'Holiday Gift Guide 2025',
    description: 'My top sustainable fashion picks for holiday gifting',
    type: 'post',
    platform: 'Instagram',
    url: 'https://instagram.com/p/example4',
    thumbnail: 'https://picsum.photos/seed/content4/400/400',
    metrics: {
      views: 156000,
      likes: 12400,
      comments: 580,
      shares: 340,
      engagement_rate: 8.5,
    },
    status: 'published',
    tags: ['Holiday', 'Gift Guide', 'Fashion'],
    created_at: '2025-12-01',
    published_at: '2025-12-05',
  },
  {
    id: 'content_005',
    influencer_id: 'inf_001',
    title: 'Behind The Scenes',
    description: 'BTS from my latest photoshoot',
    type: 'story',
    platform: 'Instagram',
    url: 'https://instagram.com/stories/example5',
    thumbnail: 'https://picsum.photos/seed/content5/400/700',
    metrics: {
      views: 42000,
      likes: 2800,
      comments: 120,
      shares: 85,
      engagement_rate: 7.1,
    },
    status: 'archived',
    tags: ['BTS', 'Photoshoot', 'Personal'],
    created_at: '2025-11-15',
    published_at: '2025-11-15',
  },
  {
    id: 'content_006',
    influencer_id: 'inf_001',
    title: 'Summer Lookbook Coming Soon',
    description: 'Teaser for upcoming summer fashion content',
    type: 'reel',
    platform: 'Instagram',
    url: '',
    thumbnail: 'https://picsum.photos/seed/content6/400/600',
    status: 'draft',
    tags: ['Fashion', 'Summer', 'Teaser'],
    created_at: '2026-02-01',
  },
]

export const getInfluencerContent = (influencerId: string): ContentItem[] => {
  return mockContent.filter((content) => content.influencer_id === influencerId)
}

export const getCampaignContent = (campaignId: string): ContentItem[] => {
  return mockContent.filter((content) => content.campaign_id === campaignId)
}

export const getContentById = (contentId: string): ContentItem | undefined => {
  return mockContent.find((content) => content.id === contentId)
}
