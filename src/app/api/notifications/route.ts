import { NextRequest } from 'next/server'
import { withAuth, successResponse, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import {
  listNotifications,
  markAllRead,
  getUnreadCount,
} from '@/services/notification-center.service'

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 * Query params: ?type=...&read=true|false&page=1&pageSize=20&countOnly=true
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const countOnly = searchParams.get('countOnly') === 'true'

    if (countOnly) {
      const result = await getUnreadCount(user.id)
      return successResponse(result)
    }

    const { page, pageSize } = getPagination(request)
    const type = searchParams.get('type') || undefined
    const readParam = searchParams.get('read')
    const read = readParam === 'true' ? true : readParam === 'false' ? false : undefined

    const result = await listNotifications(user.id, { type, read, page, pageSize })
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * PATCH /api/notifications
 * Mark all notifications as read
 */
export const PATCH = withAuth(async (_request: NextRequest, user: AuthenticatedUser) => {
  try {
    const result = await markAllRead(user.id)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
