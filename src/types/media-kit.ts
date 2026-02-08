export interface CreateMediaKitInput {
  bio?: string
  headline?: string
  brandColors?: string[]
  coverImageUrl?: string
  isPublic?: boolean
  customSlug?: string
}

export interface MediaKitSectionInput {
  type: string
  title: string
  content: Record<string, unknown>
  order: number
  isVisible?: boolean
}

export interface RateCardInput {
  platform: string
  contentType: string
  price: number
  description?: string
  deliveryDays?: number
}

export interface MediaKitDetail {
  id: string
  influencerId: string
  bio: string | null
  headline: string | null
  brandColors: string[]
  coverImageUrl: string | null
  isPublic: boolean
  customSlug: string | null
  sections: { id: string; type: string; title: string; content: unknown; order: number; isVisible: boolean }[]
  rateCards: { id: string; platform: string; contentType: string; price: number; description: string | null; deliveryDays: number | null }[]
  influencer: { fullName: string; username: string; avatar: string | null; verified: boolean; categories: string[] }
  createdAt: Date
  updatedAt: Date
}
