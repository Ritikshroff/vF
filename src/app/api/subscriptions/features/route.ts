import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getFeatureGates } from '@/services/subscription.service'

/**
 * GET /api/subscriptions/features
 * Get feature access status for current user
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const features = await getFeatureGates(user.id)
    return successResponse(features)
  } catch (error) {
    return errorHandler(error)
  }
})
