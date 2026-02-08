import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { sharePost } from '@/services/feed.service'

type RouteContext = { params: Promise<{ id: string }> }

const shareSchema = z.object({
  note: z.string().max(500).optional(),
})

/**
 * POST /api/feed/:id/share
 * Share a post
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, shareSchema)
    const share = await sharePost(id, user.id, body.note)
    return successResponse(share, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
