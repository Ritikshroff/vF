import { NextRequest } from 'next/server'
import { withBrand, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getReport } from '@/services/reporting.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/reports/:id
 * Get a single report (Brand only)
 */
export const GET = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const report = await getReport(id, user.brandId!)
    return successResponse(report)
  } catch (error) {
    return errorHandler(error)
  }
})
