import { NextRequest } from 'next/server'
import { withBrand, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { toggleScheduledReport } from '@/services/reporting.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/reports/schedule/:id/toggle
 * Toggle a scheduled report on/off (Brand only)
 */
export const POST = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const schedule = await toggleScheduledReport(id, user.brandId!)
    return successResponse(schedule)
  } catch (error) {
    return errorHandler(error)
  }
})
