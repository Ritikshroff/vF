import { NextRequest } from 'next/server'
import { withAuth, withPublic, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getPlans, getPlanComparison } from '@/services/subscription.service'

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans (public)
 */
export const GET = withPublic(async (request: NextRequest) => {
  try {
    const plans = await getPlans()
    return successResponse(
      plans.map((p) => ({
        ...p,
        monthlyPrice: p.monthlyPrice.toNumber(),
        yearlyPrice: p.yearlyPrice.toNumber(),
      }))
    )
  } catch (error) {
    return errorHandler(error)
  }
})
