import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { getCollaborationById, createMilestones } from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string }> }

const createMilestonesSchema = z.object({
  milestones: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      order: z.number().int().nonnegative(),
      amount: z.number().positive('Amount must be positive'),
      dueDate: z.string().datetime().optional(),
    })
  ).min(1, 'At least one milestone is required'),
})

/**
 * POST /api/collaborations/:id/milestones
 * Create milestones for the collaboration
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, createMilestonesSchema)

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Only brands can create milestones
    if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only brands can create milestones')
    }

    if (user.role === 'BRAND' && user.brandId !== collaboration.brandId) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    // Validate that milestone amounts sum to agreed amount
    const totalAmount = body.milestones.reduce((sum, m) => sum + m.amount, 0)
    if (Math.abs(totalAmount - collaboration.agreedAmount) > 0.01) {
      throw new ValidationError(
        `Milestone amounts (${totalAmount}) must equal the agreed collaboration amount (${collaboration.agreedAmount})`
      )
    }

    const milestones = await createMilestones(
      id,
      body.milestones.map((m) => ({
        ...m,
        dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
      }))
    )

    return successResponse(milestones, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations/:id/milestones
 * Get all milestones for the collaboration
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Check authorization
    const isAuthorized =
      user.role === 'ADMIN' ||
      (user.role === 'BRAND' && user.brandId === collaboration.brandId) ||
      (user.role === 'INFLUENCER' && user.influencerId === collaboration.influencerId)

    if (!isAuthorized) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    const milestones = await prisma.milestone.findMany({
      where: { collaborationId: id },
      include: {
        deliverables: {
          select: {
            id: true,
            type: true,
            platform: true,
            status: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return successResponse(
      milestones.map((m) => ({
        ...m,
        amount: m.amount.toNumber(),
        payment: m.payment
          ? {
              ...m.payment,
              amount: m.payment.amount.toNumber(),
            }
          : null,
      }))
    )
  } catch (error) {
    return errorHandler(error)
  }
})
