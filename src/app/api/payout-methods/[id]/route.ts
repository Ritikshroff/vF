import { NextRequest } from 'next/server'
import { withInfluencer, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { deletePayoutMethod } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/payout-methods/:id
 * Get a specific payout method
 */
export const GET = withInfluencer(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const payoutMethod = await prisma.payoutMethod.findUnique({
      where: { id },
    })

    if (!payoutMethod) {
      throw new NotFoundError('Payout method not found')
    }

    if (payoutMethod.userId !== user.id) {
      throw new AuthorizationError('You do not have access to this payout method')
    }

    return successResponse(payoutMethod)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * DELETE /api/payout-methods/:id
 * Delete a payout method
 */
export const DELETE = withInfluencer(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const payoutMethod = await prisma.payoutMethod.findUnique({
      where: { id },
    })

    if (!payoutMethod) {
      throw new NotFoundError('Payout method not found')
    }

    if (payoutMethod.userId !== user.id) {
      throw new AuthorizationError('You do not have access to this payout method')
    }

    await deletePayoutMethod(user.id, id)

    return successResponse({ message: 'Payout method deleted successfully' })
  } catch (error) {
    return errorHandler(error)
  }
})
