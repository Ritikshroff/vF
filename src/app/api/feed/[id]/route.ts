import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getFeedPostById, updateFeedPost, deleteFeedPost } from '@/services/feed.service'
import { FeedPostVisibility } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/feed/:id
 * Get a single feed post
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const post = await getFeedPostById(id, user.id)
    if (!post) throw new NotFoundError('Post not found')
    return successResponse(post)
  } catch (error) {
    return errorHandler(error)
  }
})

const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  visibility: z.nativeEnum(FeedPostVisibility).optional(),
  mediaUrls: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
})

/**
 * PUT /api/feed/:id
 * Update a feed post
 */
export const PUT = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, updatePostSchema)
    const post = await updateFeedPost(id, user.id, body)
    return successResponse(post)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * DELETE /api/feed/:id
 * Delete a feed post (soft delete)
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    await deleteFeedPost(id, user.id)
    return successResponse({ message: 'Post deleted' })
  } catch (error) {
    return errorHandler(error)
  }
})
