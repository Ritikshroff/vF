import { NextRequest } from 'next/server'
import { withAdmin, successResponse, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listPendingVerifications } from '@/services/reputation.service'

/**
 * GET /api/verification/admin
 * List all pending verification requests (Admin only)
 */
export const GET = withAdmin(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const results = await listPendingVerifications({ page, pageSize })
    return successResponse(results)
  } catch (error) {
    return errorHandler(error)
  }
})
