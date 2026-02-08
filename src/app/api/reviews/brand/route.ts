import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withInfluencer, withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createBrandReview, getBrandReviews } from '@/services/reputation.service'

const createReviewSchema = z.object({
  brandId: z.string(),
  campaignId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  paymentSpeedRating: z.number().int().min(1).max(5).optional(),
  professionalismRating: z.number().int().min(1).max(5).optional(),
  briefClarityRating: z.number().int().min(1).max(5).optional(),
})

/**
 * POST /api/reviews/brand
 * Create a review for a brand (Influencer only)
 */
export const POST = withInfluencer(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createReviewSchema)
    const review = await createBrandReview(user.influencerId!, body)
    return successResponse(review, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/reviews/brand?brandId=xxx
 * Get reviews for a brand
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const brandId = request.nextUrl.searchParams.get('brandId')
    if (!brandId) {
      return successResponse({ error: 'brandId is required' }, 400)
    }

    const { page, pageSize } = getPagination(request)
    const reviews = await getBrandReviews(brandId, { page, pageSize })
    return successResponse(reviews)
  } catch (error) {
    return errorHandler(error)
  }
})
