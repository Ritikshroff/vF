import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { releaseEscrow } from '@/services/payment.service'
import { audit, getClientInfo } from '@/lib/audit'

type RouteContext = { params: Promise<{ id: string }> }

const releaseSchema = z.object({
  milestoneId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
})

/**
 * POST /api/escrow/:id/release
 * Release funds from escrow to influencer (Brand only)
 */
export const POST = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, releaseSchema)

    const escrow = await prisma.escrowAccount.findUnique({
      where: { id },
    })

    if (!escrow) {
      throw new NotFoundError('Escrow account not found')
    }

    if (user.role === 'BRAND' && user.brandId !== escrow.brandId) {
      throw new AuthorizationError('You do not have access to this escrow account')
    }

    if (escrow.status !== 'FUNDED' && escrow.status !== 'PARTIALLY_RELEASED') {
      throw new ValidationError(`Cannot release from escrow with status: ${escrow.status}`)
    }

    // Validate milestone if provided
    if (body.milestoneId) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: body.milestoneId },
        include: { collaboration: true },
      })

      if (!milestone) {
        throw new NotFoundError('Milestone not found')
      }

      if (milestone.collaboration.id !== escrow.collaborationId) {
        throw new ValidationError('Milestone does not belong to this collaboration')
      }
    }

    const release = await releaseEscrow(id, user.id, {
      milestoneId: body.milestoneId,
      amount: body.amount,
      reason: 'Release approved by brand',
    })

    audit({
      action: 'escrow.release',
      userId: user.id,
      targetId: id,
      targetType: 'EscrowAccount',
      ...getClientInfo(request),
      metadata: { amount: body.amount, milestoneId: body.milestoneId },
    })

    return successResponse(release)
  } catch (error) {
    return errorHandler(error)
  }
})
