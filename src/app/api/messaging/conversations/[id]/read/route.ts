import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { markAsRead } from '@/services/messaging.service'

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: { params: Promise<any> }) => {
  try {
    if (!context) {
      return errorHandler(new Error('Route context is required'))
    }
    const { id } = await context.params
    const result = await markAsRead(id, user.id)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
