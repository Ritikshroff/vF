import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { depositToWallet } from '@/services/payment.service'

const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethodId: z.string().optional(),
  currency: z.string().optional(),
})

/**
 * POST /api/wallet/deposit
 * Deposit funds to wallet (Brand only)
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Only brands can deposit
    if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only brands can deposit funds')
    }

    const body = await validateBody(request, depositSchema)

    const transaction = await depositToWallet(user.id, {
      amount: body.amount,
      paymentMethodId: body.paymentMethodId,
      currency: body.currency,
    })

    return successResponse({
      message: 'Deposit successful',
      transaction,
    }, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
