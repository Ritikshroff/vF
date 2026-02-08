/**
 * Collaboration Workflow Service
 * Handles the complete campaign collaboration lifecycle
 */

import { prisma } from '@/lib/db/prisma'
import { CollaborationStatus, MilestoneStatus, DeliverableStatus, Prisma } from '@prisma/client'
import {
  COLLABORATION_TRANSITIONS,
  CreateCollaborationInput,
  CreateMilestoneInput,
  CreateDeliverableInput,
  SubmitDeliverableInput,
  ReviewDeliverableInput,
  TransitionInput,
  SignContractInput,
  CollaborationWithDetails,
  CollaborationFilters,
  PaginationParams,
  PaginatedResult,
} from '@/types/collaboration'

// Default platform commission percentage
const PLATFORM_COMMISSION_RATE = 0.10 // 10%

/**
 * Calculate platform fee and influencer payout
 */
function calculateFees(amount: number): { platformFee: number; influencerPayout: number } {
  const platformFee = amount * PLATFORM_COMMISSION_RATE
  const influencerPayout = amount - platformFee
  return { platformFee, influencerPayout }
}

/**
 * Create a new collaboration
 */
export async function createCollaboration(
  input: CreateCollaborationInput
): Promise<CollaborationWithDetails> {
  const { platformFee, influencerPayout } = calculateFees(input.agreedAmount)

  const collaboration = await prisma.collaboration.create({
    data: {
      campaignId: input.campaignId,
      influencerId: input.influencerId,
      brandId: input.brandId,
      status: CollaborationStatus.PROPOSAL_SENT,
      agreedAmount: new Prisma.Decimal(input.agreedAmount),
      platformFee: new Prisma.Decimal(platformFee),
      influencerPayout: new Prisma.Decimal(influencerPayout),
      startDate: input.startDate,
      endDate: input.endDate,
      contentDueDate: input.contentDueDate,
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: CollaborationStatus.PROPOSAL_SENT,
          changedBy: input.brandId,
          reason: input.message || 'Collaboration initiated',
        },
      },
      communications: input.message
        ? {
            create: {
              senderId: input.brandId,
              content: input.message,
              isSystemMessage: false,
              attachments: [],
            },
          }
        : undefined,
    },
    include: getCollaborationIncludes(),
  })

  return formatCollaboration(collaboration)
}

/**
 * Get collaboration by ID with full details
 */
export async function getCollaborationById(id: string): Promise<CollaborationWithDetails | null> {
  const collaboration = await prisma.collaboration.findUnique({
    where: { id },
    include: getCollaborationIncludes(),
  })

  if (!collaboration) return null
  return formatCollaboration(collaboration)
}

/**
 * List collaborations with filters and pagination
 */
export async function listCollaborations(
  filters: CollaborationFilters,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<CollaborationWithDetails>> {
  const { page = 1, pageSize = 10 } = pagination
  const skip = (page - 1) * pageSize

  const where: Prisma.CollaborationWhereInput = {}
  if (filters.status) where.status = filters.status
  if (filters.campaignId) where.campaignId = filters.campaignId
  if (filters.influencerId) where.influencerId = filters.influencerId
  if (filters.brandId) where.brandId = filters.brandId

  const [collaborations, total] = await Promise.all([
    prisma.collaboration.findMany({
      where,
      include: getCollaborationIncludes(),
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.collaboration.count({ where }),
  ])

  return {
    data: collaborations.map(formatCollaboration),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Validate and perform a status transition
 */
export async function transitionCollaboration(
  collaborationId: string,
  userId: string,
  input: TransitionInput
): Promise<CollaborationWithDetails> {
  const collaboration = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: { contract: true },
  })

  if (!collaboration) {
    throw new Error('Collaboration not found')
  }

  // Validate the transition
  const validTransitions = COLLABORATION_TRANSITIONS[collaboration.status]
  const transition = validTransitions.find((t) => t.action === input.action)

  if (!transition) {
    throw new Error(
      `Invalid transition: ${input.action} is not allowed from status ${collaboration.status}`
    )
  }

  // Special handling for contract signing
  if (transition.to === CollaborationStatus.CONTRACT_SIGNED && collaboration.contract) {
    if (!collaboration.contract.isFullySigned) {
      throw new Error('Both parties must sign the contract before proceeding')
    }
  }

  // Update the collaboration status
  const updated = await prisma.collaboration.update({
    where: { id: collaborationId },
    data: {
      status: transition.to,
      completedAt: transition.to === CollaborationStatus.COMPLETED ? new Date() : undefined,
      cancelledAt: transition.to === CollaborationStatus.CANCELLED ? new Date() : undefined,
      statusHistory: {
        create: {
          fromStatus: collaboration.status,
          toStatus: transition.to,
          changedBy: userId,
          reason: input.reason,
          metadata: input.metadata as Prisma.InputJsonValue,
        },
      },
    },
    include: getCollaborationIncludes(),
  })

  return formatCollaboration(updated)
}

/**
 * Get available actions for a collaboration
 */
export function getAvailableActions(
  status: CollaborationStatus,
  userRole: 'brand' | 'influencer' | 'admin'
): string[] {
  const transitions = COLLABORATION_TRANSITIONS[status]

  // Filter based on role permissions
  return transitions
    .filter((t) => {
      // Brands can accept, reject, approve content, release payment
      if (userRole === 'brand') {
        return ['ACCEPT', 'REJECT', 'SEND_CONTRACT', 'SIGN', 'APPROVE', 'REQUEST_REVISION', 'RELEASE_PAYMENT', 'RESOLVE', 'REFUND'].includes(t.action)
      }
      // Influencers can accept proposals, sign contracts, submit content
      if (userRole === 'influencer') {
        return ['ACCEPT', 'COUNTER', 'SIGN', 'START_PRODUCTION', 'SUBMIT_CONTENT', 'SUBMIT_REVISION', 'PUBLISH'].includes(t.action)
      }
      // Admins can do everything
      return true
    })
    .map((t) => t.action)
}

// ==================== CONTRACT MANAGEMENT ====================

/**
 * Generate a contract for a collaboration
 */
export async function generateContract(
  collaborationId: string,
  templateId?: string,
  customTerms?: string
) {
  const collaboration = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: {
      campaign: true,
      influencer: { include: { user: true } },
      brand: { include: { user: true } },
      deliverables: true,
    },
  })

  if (!collaboration) {
    throw new Error('Collaboration not found')
  }

  // Get template if specified
  let terms = customTerms || ''
  if (templateId) {
    const template = await prisma.contractTemplate.findUnique({ where: { id: templateId } })
    if (template) {
      terms = template.content
        .replace('{{brand_name}}', collaboration.brand.companyName)
        .replace('{{influencer_name}}', collaboration.influencer.fullName)
        .replace('{{campaign_title}}', collaboration.campaign.title)
        .replace('{{agreed_amount}}', collaboration.agreedAmount.toString())
    }
  }

  // Build deliverable terms from collaboration deliverables
  const deliverableTerms = collaboration.deliverables.map((d) => ({
    type: d.type,
    platform: d.platform,
    quantity: d.quantity,
    dueDate: d.dueDate,
  }))

  const contract = await prisma.collaborationContract.create({
    data: {
      collaborationId,
      templateId,
      terms,
      deliverableTerms: deliverableTerms as Prisma.InputJsonValue,
      paymentTerms: {
        totalAmount: collaboration.agreedAmount.toNumber(),
        platformFee: collaboration.platformFee.toNumber(),
        influencerPayout: collaboration.influencerPayout.toNumber(),
        currency: collaboration.currency,
      } as Prisma.InputJsonValue,
    },
  })

  // Transition collaboration to CONTRACT_PENDING
  await prisma.collaboration.update({
    where: { id: collaborationId },
    data: {
      status: CollaborationStatus.CONTRACT_PENDING,
      statusHistory: {
        create: {
          fromStatus: collaboration.status,
          toStatus: CollaborationStatus.CONTRACT_PENDING,
          changedBy: collaboration.brandId,
          reason: 'Contract generated',
        },
      },
    },
  })

  return contract
}

/**
 * Sign a contract
 */
export async function signContract(
  collaborationId: string,
  userId: string,
  userRole: 'brand' | 'influencer',
  input: SignContractInput
) {
  const contract = await prisma.collaborationContract.findUnique({
    where: { collaborationId },
    include: { collaboration: true },
  })

  if (!contract) {
    throw new Error('Contract not found')
  }

  const updateData: Prisma.CollaborationContractUpdateInput = {}

  if (userRole === 'brand') {
    if (contract.brandSignedAt) {
      throw new Error('Brand has already signed this contract')
    }
    updateData.brandSignature = input.signature
    updateData.brandSignedAt = new Date()
    updateData.brandSignedIp = input.ipAddress
  } else {
    if (contract.influencerSignedAt) {
      throw new Error('Influencer has already signed this contract')
    }
    updateData.influencerSignature = input.signature
    updateData.influencerSignedAt = new Date()
    updateData.influencerSignedIp = input.ipAddress
  }

  // Check if both have now signed
  const willBeFullySigned =
    (userRole === 'brand' && contract.influencerSignedAt) ||
    (userRole === 'influencer' && contract.brandSignedAt)

  if (willBeFullySigned) {
    updateData.isFullySigned = true
  }

  const updatedContract = await prisma.collaborationContract.update({
    where: { id: contract.id },
    data: updateData,
  })

  // If fully signed, transition to CONTRACT_SIGNED
  if (updatedContract.isFullySigned) {
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        status: CollaborationStatus.CONTRACT_SIGNED,
        statusHistory: {
          create: {
            fromStatus: CollaborationStatus.CONTRACT_PENDING,
            toStatus: CollaborationStatus.CONTRACT_SIGNED,
            changedBy: userId,
            reason: 'Contract signed by both parties',
          },
        },
      },
    })
  }

  return updatedContract
}

// ==================== MILESTONE MANAGEMENT ====================

/**
 * Create milestones for a collaboration
 */
export async function createMilestones(
  collaborationId: string,
  milestones: CreateMilestoneInput[]
) {
  const collaboration = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
  })

  if (!collaboration) {
    throw new Error('Collaboration not found')
  }

  // Validate that milestone amounts sum to agreed amount
  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0)
  if (Math.abs(totalMilestoneAmount - collaboration.agreedAmount.toNumber()) > 0.01) {
    throw new Error('Milestone amounts must sum to the agreed collaboration amount')
  }

  const createdMilestones = await Promise.all(
    milestones.map((m) =>
      prisma.milestone.create({
        data: {
          collaborationId,
          title: m.title,
          description: m.description,
          order: m.order,
          amount: new Prisma.Decimal(m.amount),
          dueDate: m.dueDate,
          status: MilestoneStatus.PENDING,
        },
      })
    )
  )

  return createdMilestones
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  status: MilestoneStatus
) {
  const updateData: Prisma.MilestoneUpdateInput = { status }

  if (status === MilestoneStatus.APPROVED) {
    updateData.approvedAt = new Date()
  } else if (status === MilestoneStatus.PAID) {
    updateData.paidAt = new Date()
  }

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: updateData,
  })
}

// ==================== DELIVERABLE MANAGEMENT ====================

/**
 * Create deliverables for a collaboration
 */
export async function createDeliverables(
  collaborationId: string,
  deliverables: CreateDeliverableInput[]
) {
  return Promise.all(
    deliverables.map((d) =>
      prisma.collaborationDeliverable.create({
        data: {
          collaborationId,
          milestoneId: d.milestoneId,
          type: d.type,
          platform: d.platform,
          description: d.description,
          quantity: d.quantity ?? 1,
          dueDate: d.dueDate,
          status: DeliverableStatus.PENDING,
        },
      })
    )
  )
}

/**
 * Submit a deliverable version
 */
export async function submitDeliverable(
  deliverableId: string,
  input: SubmitDeliverableInput
) {
  const deliverable = await prisma.collaborationDeliverable.findUnique({
    where: { id: deliverableId },
  })

  if (!deliverable) {
    throw new Error('Deliverable not found')
  }

  const newVersion = deliverable.currentVersion + 1

  // Create new version
  const version = await prisma.deliverableVersion.create({
    data: {
      deliverableId,
      version: newVersion,
      mediaUrls: input.mediaUrls,
      caption: input.caption,
      notes: input.notes,
    },
  })

  // Update deliverable
  await prisma.collaborationDeliverable.update({
    where: { id: deliverableId },
    data: {
      currentVersion: newVersion,
      status: DeliverableStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  })

  return version
}

/**
 * Review a deliverable version
 */
export async function reviewDeliverable(
  deliverableId: string,
  reviewerId: string,
  input: ReviewDeliverableInput
) {
  const deliverable = await prisma.collaborationDeliverable.findUnique({
    where: { id: deliverableId },
  })

  if (!deliverable) {
    throw new Error('Deliverable not found')
  }

  // Update the latest version with review
  await prisma.deliverableVersion.updateMany({
    where: {
      deliverableId,
      version: deliverable.currentVersion,
    },
    data: {
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      reviewStatus: input.status,
      feedback: input.feedback,
    },
  })

  // Map review status to deliverable status
  const statusMap: Record<string, DeliverableStatus> = {
    APPROVED: DeliverableStatus.APPROVED,
    REVISION_NEEDED: DeliverableStatus.REVISION_REQUESTED,
    REJECTED: DeliverableStatus.REJECTED,
  }

  // Update deliverable status
  return prisma.collaborationDeliverable.update({
    where: { id: deliverableId },
    data: {
      status: statusMap[input.status],
      approvedAt: input.status === 'APPROVED' ? new Date() : undefined,
    },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
  })
}

/**
 * Get deliverable version history
 */
export async function getDeliverableVersions(deliverableId: string) {
  return prisma.deliverableVersion.findMany({
    where: { deliverableId },
    orderBy: { version: 'desc' },
  })
}

// ==================== COMMUNICATION ====================

/**
 * Send a message in the collaboration
 */
export async function sendCollaborationMessage(
  collaborationId: string,
  senderId: string,
  content: string,
  attachments: string[] = []
) {
  return prisma.collaborationMessage.create({
    data: {
      collaborationId,
      senderId,
      content,
      attachments,
      isSystemMessage: false,
    },
  })
}

/**
 * Get collaboration messages
 */
export async function getCollaborationMessages(
  collaborationId: string,
  pagination: PaginationParams = {}
) {
  const { page = 1, pageSize = 50 } = pagination
  const skip = (page - 1) * pageSize

  const [messages, total] = await Promise.all([
    prisma.collaborationMessage.findMany({
      where: { collaborationId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.collaborationMessage.count({ where: { collaborationId } }),
  ])

  return {
    data: messages,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get collaboration status history
 */
export async function getCollaborationHistory(collaborationId: string) {
  return prisma.collaborationStatusHistory.findMany({
    where: { collaborationId },
    orderBy: { createdAt: 'desc' },
  })
}

// ==================== HELPERS ====================

function getCollaborationIncludes() {
  return {
    campaign: {
      select: { id: true, title: true, category: true },
    },
    influencer: {
      select: { id: true, username: true, fullName: true, avatar: true },
    },
    brand: {
      select: { id: true, companyName: true, logo: true },
    },
    contract: {
      select: {
        id: true,
        isFullySigned: true,
        brandSignedAt: true,
        influencerSignedAt: true,
      },
    },
    milestones: {
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        order: true,
        dueDate: true,
      },
      orderBy: { order: 'asc' as const },
    },
    deliverables: {
      select: {
        id: true,
        type: true,
        platform: true,
        status: true,
        currentVersion: true,
      },
    },
  }
}

function formatCollaboration(collaboration: any): CollaborationWithDetails {
  return {
    id: collaboration.id,
    campaignId: collaboration.campaignId,
    influencerId: collaboration.influencerId,
    brandId: collaboration.brandId,
    status: collaboration.status,
    agreedAmount: collaboration.agreedAmount.toNumber(),
    platformFee: collaboration.platformFee.toNumber(),
    influencerPayout: collaboration.influencerPayout.toNumber(),
    currency: collaboration.currency,
    startDate: collaboration.startDate,
    endDate: collaboration.endDate,
    contentDueDate: collaboration.contentDueDate,
    createdAt: collaboration.createdAt,
    updatedAt: collaboration.updatedAt,
    completedAt: collaboration.completedAt,
    cancelledAt: collaboration.cancelledAt,
    campaign: collaboration.campaign,
    influencer: collaboration.influencer,
    brand: collaboration.brand,
    contract: collaboration.contract,
    milestones: collaboration.milestones.map((m: any) => ({
      ...m,
      amount: m.amount.toNumber(),
    })),
    deliverables: collaboration.deliverables,
  }
}
