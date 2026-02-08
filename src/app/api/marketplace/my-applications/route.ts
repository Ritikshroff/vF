import { NextRequest } from 'next/server'
import { withInfluencer, successResponse, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getInfluencerApplications } from '@/services/marketplace.service'

/**
 * GET /api/marketplace/my-applications
 * Get current influencer's applications
 */
export const GET = withInfluencer(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const status = request.nextUrl.searchParams.get('status') || undefined
    const applications = await getInfluencerApplications(user.influencerId!, { status, page, pageSize })
    return successResponse(applications)
  } catch (error) {
    return errorHandler(error)
  }
})
