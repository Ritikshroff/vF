import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { addReaction, removeReaction } from '@/services/messaging.service'

const reactionSchema = z.object({ emoji: z.string().min(1) })

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context: { params: Promise<any> }) => {
  try {
    const { id } = await context.params
    const body = await validateBody(request, reactionSchema)
    const result = await addReaction(id, user.id, body.emoji)
    return successResponse(result, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

export const DELETE = withAuth(async (request: NextRequest, user: AuthenticatedUser, context: { params: Promise<any> }) => {
  try {
    const { id } = await context.params
    const emoji = request.nextUrl.searchParams.get('emoji')
    if (!emoji) return new Response('emoji required', { status: 400 })
    const result = await removeReaction(id, user.id, emoji)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
