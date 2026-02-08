import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getUsageSummary } from '@/services/subscription.service'

/**
 * GET /api/subscriptions/usage
 * Get current usage summary
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const usage = await getUsageSummary(user.id)
    return successResponse(usage)
  } catch (error) {
    return errorHandler(error)
  }
})
