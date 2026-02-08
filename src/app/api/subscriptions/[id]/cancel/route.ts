import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { cancelSubscription } from '@/services/subscription.service'

type RouteContext = { params: Promise<{ id: string }> }

const cancelSchema = z.object({
  immediate: z.boolean().optional(),
})

/**
 * POST /api/subscriptions/:id/cancel
 * Cancel a subscription
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, cancelSchema)
    const subscription = await cancelSubscription(id, user.id, body.immediate)
    return successResponse(subscription)
  } catch (error) {
    return errorHandler(error)
  }
})
