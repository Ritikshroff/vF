import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getDisputeById } from '@/services/reputation.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/disputes/:id
 * Get dispute details
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const dispute = await getDisputeById(id)

    if (!dispute) {
      throw new NotFoundError('Dispute not found')
    }

    // Only parties involved or admin can view
    const isAuthorized =
      user.role === 'ADMIN' ||
      dispute.raisedBy === user.id ||
      dispute.againstUserId === user.id

    if (!isAuthorized) {
      throw new AuthorizationError('You do not have access to this dispute')
    }

    return successResponse(dispute)
  } catch (error) {
    return errorHandler(error)
  }
})
