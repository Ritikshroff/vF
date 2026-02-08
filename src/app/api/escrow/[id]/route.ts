import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { getEscrowByCollaboration } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/escrow/:id
 * Get escrow account details
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const escrow = await prisma.escrowAccount.findUnique({
      where: { id },
    })

    if (!escrow) {
      throw new NotFoundError('Escrow account not found')
    }

    // Check authorization
    const isAuthorized =
      user.role === 'ADMIN' ||
      (user.role === 'BRAND' && user.brandId === escrow.brandId) ||
      (user.role === 'INFLUENCER' && user.influencerId === escrow.influencerId)

    if (!isAuthorized) {
      throw new AuthorizationError('You do not have access to this escrow account')
    }

    const escrowSummary = await getEscrowByCollaboration(escrow.collaborationId)

    return successResponse(escrowSummary)
  } catch (error) {
    return errorHandler(error)
  }
})
