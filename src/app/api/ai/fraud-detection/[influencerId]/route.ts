import { NextRequest } from 'next/server'
import { withBrand, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { detectFraud } from '@/services/ai.service'

type RouteContext = { params: Promise<{ influencerId: string }> }

/**
 * GET /api/ai/fraud-detection/:influencerId
 * Run fraud detection on an influencer (Brand only)
 */
export const GET = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { influencerId } = await context!.params
    const result = await detectFraud(influencerId)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
