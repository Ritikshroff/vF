import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import {
  getCollaborationById,
  sendCollaborationMessage,
  getCollaborationMessages,
} from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string }> }

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  attachments: z.array(z.string().url()).optional(),
})

/**
 * POST /api/collaborations/:id/messages
 * Send a message in the collaboration
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, sendMessageSchema)

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

    const senderId = user.id

    const message = await sendCollaborationMessage(
      id,
      senderId,
      body.content,
      body.attachments || []
    )

    return successResponse(message, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations/:id/messages
 * Get messages for the collaboration
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const { page, pageSize } = getPagination(request)

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

    const messages = await getCollaborationMessages(id, { page, pageSize })

    return successResponse(messages)
  } catch (error) {
    return errorHandler(error)
  }
})
