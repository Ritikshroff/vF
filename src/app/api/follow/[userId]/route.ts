import { NextRequest } from 'next/server'
import { withAuth, successResponse, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { toggleFollow, getFollowers, getFollowing } from '@/services/feed.service'

type RouteContext = { params: Promise<{ userId: string }> }

/**
 * POST /api/follow/:userId
 * Follow/Unfollow a user (toggle)
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { userId } = await context!.params
    const isFollowing = await toggleFollow(user.id, userId)
    return successResponse({ isFollowing })
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/follow/:userId?type=followers|following
 * Get followers or following list
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { userId } = await context!.params
    const { page, pageSize } = getPagination(request)
    const type = request.nextUrl.searchParams.get('type') || 'followers'

    const result = type === 'following'
      ? await getFollowing(userId, page, pageSize)
      : await getFollowers(userId, page, pageSize)

    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
