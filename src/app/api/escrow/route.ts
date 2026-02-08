import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { createEscrowAccount, getEscrowByCollaboration } from '@/services/payment.service'

const createEscrowSchema = z.object({
  collaborationId: z.string().min(1, 'Collaboration ID is required'),
  amount: z.number().positive('Amount must be positive'),
  platformFeePercentage: z.number().min(0).max(1).optional(),
})

/**
 * POST /api/escrow
 * Create an escrow account for a collaboration (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createEscrowSchema)

    // Verify collaboration exists and belongs to brand
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: body.collaborationId },
    })

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    if (user.role === 'BRAND' && collaboration.brandId !== user.brandId) {
      return successResponse({ error: 'Collaboration does not belong to your brand' }, 403)
    }

    // Check if escrow already exists
    const existingEscrow = await getEscrowByCollaboration(body.collaborationId)
    if (existingEscrow) {
      return successResponse({ error: 'Escrow already exists for this collaboration' }, 400)
    }

    const escrow = await createEscrowAccount({
      collaborationId: body.collaborationId,
      brandId: collaboration.brandId,
      influencerId: collaboration.influencerId,
      amount: body.amount,
      platformFeePercentage: body.platformFeePercentage,
    })

    return successResponse(escrow, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
