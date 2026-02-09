import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, getPagination, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listConversations, startConversation } from '@/services/messaging.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const search = request.nextUrl.searchParams.get('search') || undefined
    const result = await listConversations(user.id, { search, page, pageSize })
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})

const startConversationSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1),
  initialMessage: z.string().min(1),
  campaignId: z.string().optional(),
})

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, startConversationSchema)
    const result = await startConversation(user.id, body.participantIds, body.initialMessage, body.campaignId)
    return successResponse(result, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
