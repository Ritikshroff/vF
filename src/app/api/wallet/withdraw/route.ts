import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { withdrawFromWallet, getWalletBalance } from '@/services/payment.service'

const withdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  payoutMethodId: z.string().min(1, 'Payout method ID is required'),
})

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from wallet (Influencer only)
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Only influencers can withdraw
    if (user.role !== 'INFLUENCER' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only influencers can withdraw funds')
    }

    const body = await validateBody(request, withdrawSchema)

    // Check balance first
    const balance = await getWalletBalance(user.id)
    if (balance.available < body.amount) {
      return successResponse({
        error: 'Insufficient balance',
        available: balance.available,
        requested: body.amount,
      }, 400)
    }

    const transaction = await withdrawFromWallet(user.id, {
      amount: body.amount,
      payoutMethodId: body.payoutMethodId,
    })

    return successResponse({
      message: 'Withdrawal initiated',
      transaction,
      estimatedArrival: '3-5 business days',
    })
  } catch (error) {
    return errorHandler(error)
  }
})
