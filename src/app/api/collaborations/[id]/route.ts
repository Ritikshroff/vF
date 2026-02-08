import { NextRequest, NextResponse } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getCollaborationById, getCollaborationHistory } from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/collaborations/:id
 * Get collaboration details
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Check authorization
    const isAuthorized =
      user.role === 'ADMIN' ||
      (user.role === 'BRAND' && user.brandId === collaboration.brandId) ||
      (user.role === 'INFLUENCER' && user.influencerId === collaboration.influencerId)

    if (!isAuthorized) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    // Get history
    const history = await getCollaborationHistory(id)

    return successResponse({
      ...collaboration,
      history,
    })
  } catch (error) {
    return errorHandler(error)
  }
})
