import { prisma } from '@/lib/db/prisma'
import { Prisma, ApprovalStatus } from '@prisma/client'
import { ReviewContentInput, ApprovalFilters } from '@/types/content-approval'

export async function submitForApproval(contentId: string, userId: string, reviewerIds: string[]) {
  // Verify content belongs to user (through influencer)
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { influencer: { select: { userId: true } } },
  })
  if (!content || content.influencer.userId !== userId) {
    throw new Error('Content not found or unauthorized')
  }
  // Create approval steps in transaction
  return prisma.$transaction(async (tx) => {
    // Delete any existing steps
    await tx.contentApprovalStep.deleteMany({ where: { contentId } })
    // Create new steps for each reviewer
    const steps = await Promise.all(
      reviewerIds.map((reviewerId, index) =>
        tx.contentApprovalStep.create({
          data: {
            contentId,
            reviewerId,
            stepOrder: index + 1,
            status: 'SUBMITTED',
          },
          include: { reviewer: { select: { id: true, name: true } } },
        })
      )
    )
    return { contentId, steps }
  })
}

export async function reviewContent(stepId: string, reviewerId: string, input: ReviewContentInput) {
  const step = await prisma.contentApprovalStep.findUnique({ where: { id: stepId } })
  if (!step || step.reviewerId !== reviewerId) throw new Error('Unauthorized')
  return prisma.contentApprovalStep.update({
    where: { id: stepId },
    data: {
      status: input.status as ApprovalStatus,
      feedback: input.feedback,
      approvedAt: input.status === 'APPROVED' ? new Date() : null,
    },
    include: {
      content: { select: { id: true, title: true, type: true, platform: true } },
      reviewer: { select: { id: true, name: true } },
    },
  })
}

export async function listPendingApprovals(userId: string, role: string, filters: ApprovalFilters) {
  const { status, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize
  const where: Prisma.ContentApprovalStepWhereInput = {}
  if (role === 'BRAND' || role === 'ADMIN') {
    if (role !== 'ADMIN') where.reviewerId = userId
  }
  if (status) where.status = status
  const [data, total] = await Promise.all([
    prisma.contentApprovalStep.findMany({
      where,
      include: {
        content: {
          select: {
            id: true, title: true, description: true, type: true, platform: true, status: true, createdAt: true,
            influencer: { select: { id: true, fullName: true, avatar: true } },
          },
        },
        reviewer: { select: { id: true, name: true } },
      },
      skip, take: pageSize, orderBy: { createdAt: 'desc' },
    }),
    prisma.contentApprovalStep.count({ where }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getApprovalTimeline(contentId: string) {
  return prisma.contentApprovalStep.findMany({
    where: { contentId },
    include: { reviewer: { select: { id: true, name: true } } },
    orderBy: { stepOrder: 'asc' },
  })
}
