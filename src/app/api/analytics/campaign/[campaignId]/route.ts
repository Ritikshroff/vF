import { NextRequest } from 'next/server'
import { withBrand, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getCampaignAnalytics } from '@/services/analytics.service'

type RouteContext = { params: Promise<{ campaignId: string }> }

/**
 * GET /api/analytics/campaign/:campaignId
 * Get campaign analytics (Brand only)
 */
export const GET = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { campaignId } = await context!.params
    const analytics = await getCampaignAnalytics(campaignId)
    return successResponse(analytics)
  } catch (error) {
    return errorHandler(error)
  }
})
