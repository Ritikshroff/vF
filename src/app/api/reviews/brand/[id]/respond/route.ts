import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { respondToBrandReview } from '@/services/reputation.service'

type RouteContext = { params: Promise<{ id: string }> }

const respondSchema = z.object({
  response: z.string().min(1).max(2000),
})

/**
 * POST /api/reviews/brand/:id/respond
 * Respond to a review (Brand only)
 */
export const POST = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, respondSchema)
    const review = await respondToBrandReview(id, user.brandId!, body.response)
    return successResponse(review)
  } catch (error) {
    return errorHandler(error)
  }
})
