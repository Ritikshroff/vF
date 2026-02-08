import { NextRequest } from 'next/server'
import { withInfluencer, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { setDefaultPayoutMethod } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/payout-methods/:id/default
 * Set a payout method as default
 */
export const POST = withInfluencer(async (
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

    const updatedMethod = await setDefaultPayoutMethod(user.id, id)

    return successResponse(updatedMethod)
  } catch (error) {
    return errorHandler(error)
  }
})
