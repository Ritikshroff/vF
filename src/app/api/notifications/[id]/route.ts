import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { markAsRead } from '@/services/notification-center.service'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> }

/**
 * PATCH /api/notifications/:id
 * Mark a single notification as read
 */
export const PATCH = withAuth(async (_request: NextRequest, user: AuthenticatedUser, context?: RouteContext) => {
  try {
    const { id } = await context!.params
    const result = await markAsRead(id, user.id)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
