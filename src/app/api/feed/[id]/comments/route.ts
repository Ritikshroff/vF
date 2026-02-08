import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { addComment, getPostComments } from '@/services/feed.service'

type RouteContext = { params: Promise<{ id: string }> }

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
})

/**
 * POST /api/feed/:id/comments
 * Add a comment
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, commentSchema)
    const comment = await addComment(id, user.id, body)
    return successResponse(comment, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/feed/:id/comments
 * Get comments for a post
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const { page, pageSize } = getPagination(request)
    const comments = await getPostComments(id, page, pageSize)
    return successResponse(comments)
  } catch (error) {
    return errorHandler(error)
  }
})
