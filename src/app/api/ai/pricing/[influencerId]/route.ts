import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getPricingRecommendation } from '@/services/ai.service'

type RouteContext = { params: Promise<{ influencerId: string }> }

/**
 * GET /api/ai/pricing/:influencerId
 * Get AI pricing recommendations for an influencer
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { influencerId } = await context!.params
    const recommendations = await getPricingRecommendation(influencerId)
    return successResponse(recommendations)
  } catch (error) {
    return errorHandler(error)
  }
})
