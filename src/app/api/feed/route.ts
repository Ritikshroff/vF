import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createFeedPost, getFeed } from '@/services/feed.service'
import { FeedPostType, FeedPostVisibility } from '@prisma/client'

const createPostSchema = z.object({
  type: z.nativeEnum(FeedPostType),
  visibility: z.nativeEnum(FeedPostVisibility).optional(),
  content: z.string().min(1).max(5000),
  mediaUrls: z.array(z.string()).optional(),
  thumbnails: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
})

/**
 * POST /api/feed
 * Create a new feed post
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createPostSchema)
    const post = await createFeedPost(user.id, body)
    return successResponse(post, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/feed
 * Get personalized feed
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const followingOnly = request.nextUrl.searchParams.get('followingOnly') === 'true'
    const authorId = request.nextUrl.searchParams.get('authorId') || undefined
    const hashtag = request.nextUrl.searchParams.get('hashtag') || undefined
    const type = request.nextUrl.searchParams.get('type') as FeedPostType | undefined

    const feed = await getFeed(user.id, {
      authorId,
      type,
      hashtag,
      followingOnly,
      page,
      pageSize,
    })

    return successResponse(feed)
  } catch (error) {
    return errorHandler(error)
  }
})
