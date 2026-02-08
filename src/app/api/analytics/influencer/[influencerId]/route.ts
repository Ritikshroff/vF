import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getInfluencerAnalytics } from '@/services/analytics.service'

type RouteContext = { params: Promise<{ influencerId: string }> }

/**
 * GET /api/analytics/influencer/:influencerId
 * Get influencer analytics
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { influencerId } = await context!.params
    const analytics = await getInfluencerAnalytics(influencerId)
    return successResponse(analytics)
  } catch (error) {
    return errorHandler(error)
  }
})
