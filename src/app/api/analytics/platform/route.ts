import { NextRequest } from 'next/server'
import { withAdmin, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getPlatformOverview, getAnalyticsHistory } from '@/services/analytics.service'

/**
 * GET /api/analytics/platform
 * Get platform overview metrics (Admin only)
 */
export const GET = withAdmin(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')
    const period = request.nextUrl.searchParams.get('period') || 'DAILY'

    if (startDate && endDate) {
      const history = await getAnalyticsHistory({ startDate, endDate, period: period as any })
      return successResponse(history)
    }

    const overview = await getPlatformOverview()
    return successResponse(overview)
  } catch (error) {
    return errorHandler(error)
  }
})
