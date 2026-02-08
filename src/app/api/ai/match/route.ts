import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { findInfluencerMatches, getCachedMatches } from '@/services/ai.service'

const matchSchema = z.object({
  campaignId: z.string().optional(),
  filters: z.object({
    minFollowers: z.number().int().nonnegative().optional(),
    maxFollowers: z.number().int().nonnegative().optional(),
    categories: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    minEngagementRate: z.number().nonnegative().optional(),
    locations: z.array(z.string()).optional(),
  }).optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

/**
 * POST /api/ai/match
 * Find matching influencers (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, matchSchema)
    const matches = await findInfluencerMatches({
      brandId: user.brandId!,
      campaignId: body.campaignId,
      filters: body.filters,
      limit: body.limit,
    })
    return successResponse(matches)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/ai/match?campaignId=xxx
 * Get cached match scores
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const campaignId = request.nextUrl.searchParams.get('campaignId') || undefined
    const matches = await getCachedMatches(user.brandId!, campaignId)
    return successResponse(
      matches.map((m) => ({
        ...m,
        overallScore: m.overallScore.toNumber(),
        audienceScore: m.audienceScore.toNumber(),
        contentScore: m.contentScore.toNumber(),
        engagementScore: m.engagementScore.toNumber(),
        budgetFitScore: m.budgetFitScore.toNumber(),
        brandSafetyScore: m.brandSafetyScore.toNumber(),
      }))
    )
  } catch (error) {
    return errorHandler(error)
  }
})
