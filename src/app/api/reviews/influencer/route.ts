import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createInfluencerReview, getInfluencerReviews } from '@/services/reputation.service'

const createReviewSchema = z.object({
  influencerId: z.string(),
  campaignId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  contentQualityRating: z.number().int().min(1).max(5).optional(),
  professionalismRating: z.number().int().min(1).max(5).optional(),
  valueForMoneyRating: z.number().int().min(1).max(5).optional(),
  wasOnTime: z.boolean().optional(),
  deliveryDaysLate: z.number().int().min(0).optional(),
})

/**
 * POST /api/reviews/influencer
 * Create a review for an influencer (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createReviewSchema)
    const review = await createInfluencerReview(user.brandId!, body)
    return successResponse(review, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/reviews/influencer?influencerId=xxx
 * Get reviews for an influencer
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const influencerId = request.nextUrl.searchParams.get('influencerId')
    if (!influencerId) {
      return successResponse({ error: 'influencerId is required' }, 400)
    }

    const { page, pageSize } = getPagination(request)
    const reviews = await getInfluencerReviews(influencerId, { page, pageSize })
    return successResponse(reviews)
  } catch (error) {
    return errorHandler(error)
  }
})
