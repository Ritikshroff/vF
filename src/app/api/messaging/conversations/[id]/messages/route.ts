import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { sendMessage } from '@/services/messaging.service'

const sendMessageSchema = z.object({
  content: z.string().min(1),
  attachments: z.array(z.object({
    type: z.string(), url: z.string(), filename: z.string(), size: z.number(),
  })).optional(),
})

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: { params: Promise<any> }) => {
  try {
    if (!context) {
      return errorHandler(new Error('Route context is required'))
    }
    const { id } = await context.params
    const body = await validateBody(request, sendMessageSchema)
    const result = await sendMessage(id, user.id, body)
    return successResponse(result, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
