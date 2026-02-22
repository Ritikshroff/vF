import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { withdrawFromWallet, getWalletBalance } from '@/services/payment.service'
import { audit, getClientInfo } from '@/lib/audit'

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
      return NextResponse.json({
        error: `Insufficient balance. Available: $${balance.available.toFixed(2)}, Requested: $${body.amount.toFixed(2)}`,
      }, { status: 400 })
    }

    const transaction = await withdrawFromWallet(user.id, {
      amount: body.amount,
      payoutMethodId: body.payoutMethodId,
    })

    audit({
      action: 'payment.withdraw',
      userId: user.id,
      ...getClientInfo(request),
      metadata: { amount: body.amount, payoutMethodId: body.payoutMethodId },
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
