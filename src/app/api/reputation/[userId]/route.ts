import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getReputationBreakdown } from '@/services/reputation.service'

type RouteContext = { params: Promise<{ userId: string }> }

/**
 * GET /api/reputation/:userId
 * Get reputation breakdown for a user
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { userId } = await context!.params
    const breakdown = await getReputationBreakdown(userId)
    return successResponse(breakdown)
  } catch (error) {
    return errorHandler(error)
  }
})
