import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { TransactionType } from '@prisma/client'
import {
  getWalletBalance,
  depositToWallet,
  withdrawFromWallet,
  getWalletTransactions,
} from '@/services/payment.service'

const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethodId: z.string().optional(),
  currency: z.string().optional(),
})

const withdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  payoutMethodId: z.string().min(1, 'Payout method ID is required'),
})

/**
 * GET /api/wallet
 * Get current user's wallet balance and recent transactions
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const typeParam = request.nextUrl.searchParams.get('type')
    const type = typeParam ? (typeParam as TransactionType) : undefined

    const [balance, transactions] = await Promise.all([
      getWalletBalance(user.id),
      getWalletTransactions(user.id, { page, pageSize, type }),
    ])

    return successResponse({
      balance,
      transactions: transactions.data,
      totalTransactions: transactions.total,
      page,
      pageSize,
    })
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * POST /api/wallet/deposit
 * Deposit funds to wallet (Brand only)
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const url = new URL(request.url)
    const action = url.pathname.split('/').pop()

    if (action === 'deposit') {
      // Only brands can deposit
      if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
        return successResponse({ error: 'Only brands can deposit funds' }, 403)
      }

      const body = await validateBody(request, depositSchema)
      const transaction = await depositToWallet(user.id, body)

      return successResponse(transaction, 201)
    }

    if (action === 'withdraw') {
      // Only influencers can withdraw
      if (user.role !== 'INFLUENCER' && user.role !== 'ADMIN') {
        return successResponse({ error: 'Only influencers can withdraw funds' }, 403)
      }

      const body = await validateBody(request, withdrawSchema)
      const transaction = await withdrawFromWallet(user.id, body)

      return successResponse(transaction)
    }

    return successResponse({ error: 'Invalid action' }, 400)
  } catch (error) {
    return errorHandler(error)
  }
})
