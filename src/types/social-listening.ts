export interface AddKeywordInput {
  keyword: string
  platforms: string[]
}

export interface BrandMentionSummary {
  id: string
  platform: string
  authorName: string
  authorHandle: string | null
  content: string
  url: string | null
  sentiment: string | null
  reach: number | null
  engagement: number | null
  detectedAt: Date
}

export interface SentimentReportSummary {
  id: string
  period: string
  periodStart: Date
  positive: number
  neutral: number
  negative: number
  topMentions: unknown
  createdAt: Date
}

export interface KeywordTrackerSummary {
  id: string
  keyword: string
  platforms: string[]
  isActive: boolean
  createdAt: Date
}

export interface MentionFilters {
  platform?: string
  sentiment?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}
