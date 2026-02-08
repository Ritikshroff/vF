import { CRMContactStatus } from '@prisma/client'

export interface CreateCRMContactInput {
  influencerId: string
  status?: CRMContactStatus
  customLabels?: string[]
  internalNotes?: string
  source?: string
}

export interface UpdateCRMContactInput {
  status?: CRMContactStatus
  customLabels?: string[]
  internalNotes?: string
  nextFollowUpAt?: string
}

export interface CRMContactFilters {
  brandId: string
  status?: CRMContactStatus
  labels?: string[]
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateCRMNoteInput {
  content: string
  isPinned?: boolean
}

export interface CreateCRMListInput {
  name: string
  description?: string
  isSmartList?: boolean
  criteria?: Record<string, unknown>
}

export interface CRMDashboardSummary {
  totalContacts: number
  byStatus: Record<string, number>
  recentActivity: number
  upcomingFollowUps: number
}
