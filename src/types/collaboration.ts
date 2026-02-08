/**
 * Collaboration Workflow Types
 */

import { CollaborationStatus, MilestoneStatus, DeliverableStatus, Platform } from '@prisma/client'

export { CollaborationStatus, MilestoneStatus }

// State machine transitions
export const COLLABORATION_TRANSITIONS: Record<CollaborationStatus, { action: string; to: CollaborationStatus }[]> = {
  PROPOSAL_SENT: [
    { action: 'ACCEPT', to: 'PROPOSAL_ACCEPTED' },
    { action: 'REJECT', to: 'CANCELLED' },
    { action: 'COUNTER', to: 'NEGOTIATING' },
  ],
  PROPOSAL_ACCEPTED: [
    { action: 'NEGOTIATE', to: 'NEGOTIATING' },
    { action: 'SEND_CONTRACT', to: 'CONTRACT_PENDING' },
  ],
  NEGOTIATING: [
    { action: 'AGREE', to: 'CONTRACT_PENDING' },
    { action: 'CANCEL', to: 'CANCELLED' },
  ],
  CONTRACT_PENDING: [
    { action: 'SIGN', to: 'CONTRACT_SIGNED' },
    { action: 'CANCEL', to: 'CANCELLED' },
  ],
  CONTRACT_SIGNED: [
    { action: 'START_PRODUCTION', to: 'IN_PRODUCTION' },
  ],
  IN_PRODUCTION: [
    { action: 'SUBMIT_CONTENT', to: 'CONTENT_SUBMITTED' },
    { action: 'CANCEL', to: 'CANCELLED' },
  ],
  CONTENT_SUBMITTED: [
    { action: 'APPROVE', to: 'CONTENT_APPROVED' },
    { action: 'REQUEST_REVISION', to: 'REVISION_REQUESTED' },
    { action: 'REJECT', to: 'DISPUTED' },
  ],
  REVISION_REQUESTED: [
    { action: 'SUBMIT_REVISION', to: 'CONTENT_SUBMITTED' },
    { action: 'CANCEL', to: 'DISPUTED' },
  ],
  CONTENT_APPROVED: [
    { action: 'PUBLISH', to: 'PUBLISHED' },
  ],
  PUBLISHED: [
    { action: 'RELEASE_PAYMENT', to: 'PAYMENT_PENDING' },
  ],
  PAYMENT_PENDING: [
    { action: 'PAYMENT_COMPLETE', to: 'COMPLETED' },
    { action: 'PAYMENT_FAILED', to: 'DISPUTED' },
  ],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: [
    { action: 'RESOLVE', to: 'COMPLETED' },
    { action: 'REFUND', to: 'CANCELLED' },
  ],
}

export interface CreateCollaborationInput {
  campaignId: string
  influencerId: string
  brandId: string
  agreedAmount: number
  message?: string
  startDate?: Date
  endDate?: Date
  contentDueDate?: Date
}

export interface CreateMilestoneInput {
  title: string
  description?: string
  order: number
  amount: number
  dueDate?: Date
}

export interface CreateDeliverableInput {
  type: string
  platform: Platform
  description?: string
  quantity?: number
  dueDate?: Date
  milestoneId?: string
}

export interface SubmitDeliverableInput {
  mediaUrls: string[]
  caption?: string
  notes?: string
}

export interface ReviewDeliverableInput {
  status: 'APPROVED' | 'REVISION_NEEDED' | 'REJECTED'
  feedback?: string
}

export interface TransitionInput {
  action: string
  reason?: string
  metadata?: Record<string, unknown>
}

export interface SignContractInput {
  signature: string
  ipAddress?: string
}

export interface CollaborationWithDetails {
  id: string
  campaignId: string
  influencerId: string
  brandId: string
  status: CollaborationStatus
  agreedAmount: number
  platformFee: number
  influencerPayout: number
  currency: string
  startDate: Date | null
  endDate: Date | null
  contentDueDate: Date | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  cancelledAt: Date | null
  campaign: {
    id: string
    title: string
    category: string
  }
  influencer: {
    id: string
    username: string
    fullName: string
    avatar: string | null
  }
  brand: {
    id: string
    companyName: string
    logo: string | null
  }
  contract: {
    id: string
    isFullySigned: boolean
    brandSignedAt: Date | null
    influencerSignedAt: Date | null
  } | null
  milestones: {
    id: string
    title: string
    amount: number
    status: MilestoneStatus
    order: number
    dueDate: Date | null
  }[]
  deliverables: {
    id: string
    type: string
    platform: Platform
    status: DeliverableStatus
    currentVersion: number
  }[]
}

export interface CollaborationFilters {
  status?: CollaborationStatus
  campaignId?: string
  influencerId?: string
  brandId?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
