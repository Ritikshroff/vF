import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { refundEscrow } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

const refundSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

/**
 * POST /api/escrow/:id/refund
 * Refund escrow to brand (Admin only, or Brand with dispute resolution)
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, refundSchema)

    const escrow = await prisma.escrowAccount.findUnique({
      where: { id },
      include: {
        collaboration: {
          include: {
            disputes: {
              where: {
                status: 'RESOLVED',
                resolution: { contains: 'REFUND' },
              },
            },
          },
        },
      },
    })

    if (!escrow) {
      throw new NotFoundError('Escrow account not found')
    }

    // Only admin can refund, or brand if there's a resolved dispute allowing refund
    const hasResolvedRefundDispute = escrow.collaboration.disputes.length > 0
    const canRefund =
      user.role === 'ADMIN' ||
      (user.role === 'BRAND' && user.brandId === escrow.brandId && hasResolvedRefundDispute)

    if (!canRefund) {
      throw new AuthorizationError('You are not authorized to refund this escrow')
    }

    if (escrow.status === 'REFUNDED' || escrow.status === 'FULLY_RELEASED') {
      throw new ValidationError(`Escrow is already ${escrow.status.toLowerCase()}`)
    }

    const refundedEscrow = await refundEscrow(id, body.reason)

    return successResponse(refundedEscrow)
  } catch (error) {
    return errorHandler(error)
  }
})
