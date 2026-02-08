import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withInfluencer, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { respondToInfluencerReview } from '@/services/reputation.service'

type RouteContext = { params: Promise<{ id: string }> }

const respondSchema = z.object({
  response: z.string().min(1).max(2000),
})

/**
 * POST /api/reviews/influencer/:id/respond
 * Respond to a review (Influencer only)
 */
export const POST = withInfluencer(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, respondSchema)
    const review = await respondToInfluencerReview(id, user.influencerId!, body.response)
    return successResponse(review)
  } catch (error) {
    return errorHandler(error)
  }
})
