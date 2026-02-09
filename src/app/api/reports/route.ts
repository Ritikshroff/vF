import { NextRequest } from 'next/server'
import { withBrand, successResponse, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listReports } from '@/services/reporting.service'

/**
 * GET /api/reports
 * List reports (Brand only)
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const reports = await listReports(user.brandId!, page, pageSize)
    return successResponse(reports)
  } catch (error) {
    return errorHandler(error)
  }
})
