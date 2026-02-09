import { NextRequest } from 'next/server'
import { withAuth, getPagination, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getConversationMessages } from '@/services/messaging.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: { params: Promise<any> }) => {
  try {
    if (!context) {
      return errorHandler(new Error('Route context is required'))
    }
    const { id } = await context.params
    const { page, pageSize } = getPagination(request)
    const result = await getConversationMessages(id, user.id, page, pageSize)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
