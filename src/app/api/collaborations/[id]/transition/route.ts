import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import {
  getCollaborationById,
  transitionCollaboration,
  getAvailableActions,
} from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string }> }

const transitionSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * POST /api/collaborations/:id/transition
 * Transition collaboration status
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, transitionSchema)

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

    // Check if the action is valid for this user's role
    const userRole = user.role === 'ADMIN' ? 'admin' : user.role!.toLowerCase() as 'brand' | 'influencer'
    const availableActions = getAvailableActions(collaboration.status, userRole)

    if (!availableActions.includes(body.action)) {
      return NextResponse.json(
        {
          error: `Action '${body.action}' is not available for your role in the current status`,
          availableActions,
        },
        { status: 400 }
      )
    }

    // Get the user ID to record who made the change
    const userId = user.brandId || user.influencerId || user.id

    const updated = await transitionCollaboration(id, userId, {
      action: body.action,
      reason: body.reason,
      metadata: body.metadata,
    })

    return successResponse(updated)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations/:id/transition
 * Get available actions for the collaboration
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

    const userRole = user.role === 'ADMIN' ? 'admin' : user.role!.toLowerCase() as 'brand' | 'influencer'
    const availableActions = getAvailableActions(collaboration.status, userRole)

    return successResponse({
      currentStatus: collaboration.status,
      availableActions,
    })
  } catch (error) {
    return errorHandler(error)
  }
})
