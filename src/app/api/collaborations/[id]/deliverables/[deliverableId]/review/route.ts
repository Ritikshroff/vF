import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { getCollaborationById, reviewDeliverable, getDeliverableVersions } from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string; deliverableId: string }> }

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REVISION_NEEDED', 'REJECTED']),
  feedback: z.string().optional(),
})

/**
 * POST /api/collaborations/:id/deliverables/:deliverableId/review
 * Review a deliverable (Brand only)
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id, deliverableId } = await context!.params
    const body = await validateBody(request, reviewSchema)

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Only brands can review deliverables
    if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only brands can review deliverables')
    }

    if (user.role === 'BRAND' && user.brandId !== collaboration.brandId) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    // Verify the deliverable belongs to this collaboration
    const deliverable = await prisma.collaborationDeliverable.findFirst({
      where: {
        id: deliverableId,
        collaborationId: id,
      },
    })

    if (!deliverable) {
      throw new NotFoundError('Deliverable not found')
    }

    const reviewerId = user.brandId || user.id

    const updated = await reviewDeliverable(deliverableId, reviewerId, {
      status: body.status,
      feedback: body.feedback,
    })

    return successResponse(updated)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations/:id/deliverables/:deliverableId/versions
 * Get version history for a deliverable
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id, deliverableId } = await context!.params

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

    const versions = await getDeliverableVersions(deliverableId)

    return successResponse(versions)
  } catch (error) {
    return errorHandler(error)
  }
})
