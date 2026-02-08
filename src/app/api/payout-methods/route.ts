import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withInfluencer, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { addPayoutMethod, getPayoutMethods } from '@/services/payment.service'

const createPayoutMethodSchema = z.object({
  type: z.enum(['BANK_TRANSFER', 'PAYPAL', 'STRIPE_CONNECT']),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  paypalEmail: z.string().email().optional(),
  stripeConnectId: z.string().optional(),
  country: z.string().length(2, 'Country must be a 2-letter code'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  isDefault: z.boolean().optional(),
})

/**
 * POST /api/payout-methods
 * Add a new payout method (Influencer only)
 */
export const POST = withInfluencer(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createPayoutMethodSchema)

    const payoutMethod = await addPayoutMethod(user.id, {
      type: body.type,
      bankName: body.bankName,
      accountNumberLast4: body.accountNumber,
      routingNumber: body.routingNumber,
      swiftCode: body.swiftCode,
      paypalEmail: body.paypalEmail,
      country: body.country,
      currency: body.currency,
    })

    return successResponse(payoutMethod, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/payout-methods
 * Get all payout methods for the authenticated influencer
 */
export const GET = withInfluencer(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const payoutMethods = await getPayoutMethods(user.id)
    return successResponse(payoutMethods)
  } catch (error) {
    return errorHandler(error)
  }
})
