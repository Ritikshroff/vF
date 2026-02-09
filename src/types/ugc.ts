export interface AddUGCContentInput {
  influencerId?: string
  collaborationId?: string
  title?: string
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO' | 'STORY' | 'REEL'
  platform?: string
  tags?: string[]
}

export interface SetContentRightsInput {
  licenseType: 'EXCLUSIVE' | 'NON_EXCLUSIVE' | 'LIMITED'
  usageRights: string[]
  territory?: string
  duration?: number
  expiresAt?: string
  agreementUrl?: string
}

export interface TrackUsageInput {
  platform: string
  usageType: 'AD' | 'SOCIAL_POST' | 'WEBSITE' | 'EMAIL'
  url?: string
}

export interface UGCContentSummary {
  id: string
  title: string | null
  mediaUrl: string
  mediaType: string
  platform: string | null
  tags: string[]
  influencer: { id: string; fullName: string; avatar: string | null } | null
  rights: { licenseType: string; usageRights: string[]; expiresAt: Date | null } | null
  usageCount: number
  createdAt: Date
}

export interface UGCFilters {
  mediaType?: string
  platform?: string
  influencerId?: string
  tag?: string
  hasRights?: boolean
  page?: number
  pageSize?: number
}

export interface ExpiringRightsSummary {
  contentId: string
  title: string | null
  mediaUrl: string
  licenseType: string
  expiresAt: Date
  daysRemaining: number
}
