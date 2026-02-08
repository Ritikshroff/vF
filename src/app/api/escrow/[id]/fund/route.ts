import { NextRequest } from 'next/server'
import { withBrand, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { fundEscrow } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/escrow/:id/fund
 * Fund an escrow account from brand's wallet (Brand only)
 */
export const POST = withBrand(async (
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

    if (user.role === 'BRAND' && user.brandId !== escrow.brandId) {
      throw new AuthorizationError('You do not have access to this escrow account')
    }

    if (escrow.status !== 'PENDING') {
      throw new ValidationError(`Escrow is already ${escrow.status.toLowerCase()}`)
    }

    const fundedEscrow = await fundEscrow(id, user.id)

    return successResponse(fundedEscrow)
  } catch (error) {
    return errorHandler(error)
  }
})
