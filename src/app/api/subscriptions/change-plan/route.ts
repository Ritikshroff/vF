import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { changeSubscription } from '@/services/subscription.service'

const changePlanSchema = z.object({
  newPlanId: z.string(),
})

/**
 * POST /api/subscriptions/change-plan
 * Upgrade or downgrade subscription
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, changePlanSchema)
    const subscription = await changeSubscription(user.id, body.newPlanId)
    return successResponse({
      ...subscription,
      plan: {
        ...subscription.plan,
        monthlyPrice: subscription.plan.monthlyPrice.toNumber(),
        yearlyPrice: subscription.plan.yearlyPrice.toNumber(),
      },
    })
  } catch (error) {
    return errorHandler(error)
  }
})
