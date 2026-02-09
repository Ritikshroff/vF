import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getSimilarInfluencers } from '@/services/discovery.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: { params: Promise<any> }) => {
  try {
    if (!context) {
      return errorHandler(new Error('Route context is required'))
    }
    const { id } = await context.params
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 5
    const result = await getSimilarInfluencers(id, limit)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
