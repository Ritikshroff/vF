import { NextRequest } from 'next/server'
import { withBrand, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getCRMDashboard } from '@/services/crm.service'

/**
 * GET /api/crm/dashboard
 * Get CRM dashboard summary (Brand only)
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const dashboard = await getCRMDashboard(user.brandId!)
    return successResponse(dashboard)
  } catch (error) {
    return errorHandler(error)
  }
})
