import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createSubscription, getUserSubscription } from '@/services/subscription.service'
import { BillingInterval } from '@prisma/client'

const createSubscriptionSchema = z.object({
  planId: z.string(),
  billingInterval: z.nativeEnum(BillingInterval),
  paymentMethodId: z.string().optional(),
})

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createSubscriptionSchema)
    const subscription = await createSubscription(user.id, body)
    return successResponse(
      {
        ...subscription,
        plan: {
          ...subscription.plan,
          monthlyPrice: subscription.plan.monthlyPrice.toNumber(),
          yearlyPrice: subscription.plan.yearlyPrice.toNumber(),
        },
      },
      201
    )
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/subscriptions
 * Get current user's subscription
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const subscription = await getUserSubscription(user.id)
    return successResponse(subscription)
  } catch (error) {
    return errorHandler(error)
  }
})
