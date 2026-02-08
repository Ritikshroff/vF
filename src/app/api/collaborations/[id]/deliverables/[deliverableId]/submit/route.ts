import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { getCollaborationById, submitDeliverable } from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string; deliverableId: string }> }

const submitSchema = z.object({
  mediaUrls: z.array(z.string().url()).min(1, 'At least one media URL is required'),
  caption: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * POST /api/collaborations/:id/deliverables/:deliverableId/submit
 * Submit a deliverable version (Influencer only)
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id, deliverableId } = await context!.params
    const body = await validateBody(request, submitSchema)

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Only influencers can submit deliverables
    if (user.role !== 'INFLUENCER' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only influencers can submit deliverables')
    }

    if (user.role === 'INFLUENCER' && user.influencerId !== collaboration.influencerId) {
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

    const version = await submitDeliverable(deliverableId, {
      mediaUrls: body.mediaUrls,
      caption: body.caption,
      notes: body.notes,
    })

    return successResponse(version, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
