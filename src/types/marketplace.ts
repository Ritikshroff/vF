import { MarketplaceListingStatus, CompensationType, ApplicationStatus } from '@prisma/client'

export interface CreateListingInput {
  campaignId: string
  title: string
  description: string
  requirements?: string
  budgetMin?: number
  budgetMax?: number
  compensationType: CompensationType
  targetNiches?: string[]
  targetPlatforms?: string[]
  minFollowers?: number
  maxFollowers?: number
  targetLocations?: string[]
  targetAgeRange?: string
  targetGender?: string
  totalSlots?: number
  applicationDeadline?: string
  campaignStartDate?: string
  campaignEndDate?: string
}

export interface UpdateListingInput {
  title?: string
  description?: string
  requirements?: string
  status?: MarketplaceListingStatus
  budgetMin?: number
  budgetMax?: number
  targetNiches?: string[]
  targetPlatforms?: string[]
  totalSlots?: number
  applicationDeadline?: string
  isFeatured?: boolean
}

export interface ListingFilters {
  status?: MarketplaceListingStatus
  compensationType?: CompensationType
  niches?: string[]
  platforms?: string[]
  minBudget?: number
  maxBudget?: number
  minFollowers?: number
  maxFollowers?: number
  search?: string
  isFeatured?: boolean
  page?: number
  pageSize?: number
}

export interface CreateApplicationInput {
  coverLetter?: string
  proposedRate?: number
  portfolio?: string[]
  availability?: string
}

export interface ReviewApplicationInput {
  status: ApplicationStatus
  reviewNotes?: string
}
