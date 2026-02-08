import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { toggleLike } from '@/services/feed.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/feed/:id/like
 * Like/Unlike a post (toggle)
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const liked = await toggleLike(id, user.id)
    return successResponse({ liked })
  } catch (error) {
    return errorHandler(error)
  }
})
