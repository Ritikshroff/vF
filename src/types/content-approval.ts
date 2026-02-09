export type ApprovalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'

export interface SubmitContentInput {
  contentId: string
  reviewerIds: string[]
}

export interface ReviewContentInput {
  status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
  feedback?: string
}

export interface ContentWithApproval {
  id: string
  title: string
  description: string | null
  type: string
  platform: string
  status: string
  influencer: { id: string; fullName: string; avatar: string | null }
  approvalSteps: {
    id: string
    stepOrder: number
    reviewerId: string
    reviewer: { id: string; name: string }
    status: string
    feedback: string | null
    approvedAt: Date | null
    createdAt: Date
  }[]
  createdAt: Date
}

export interface ApprovalFilters {
  status?: ApprovalStatus
  reviewerId?: string
  page?: number
  pageSize?: number
}
