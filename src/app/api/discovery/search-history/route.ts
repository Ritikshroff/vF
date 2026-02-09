import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getSearchHistory } from '@/services/discovery.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10
    const result = await getSearchHistory(user.id, limit)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
