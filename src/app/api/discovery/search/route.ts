import { NextRequest } from 'next/server'
import { withAuth, getPagination, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { searchInfluencers, saveSearch } from '@/services/discovery.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const sp = request.nextUrl.searchParams
    const filters = {
      query: sp.get('query') || undefined,
      niches: sp.get('niches')?.split(',').filter(Boolean),
      platforms: sp.get('platforms')?.split(',').filter(Boolean),
      minFollowers: sp.get('minFollowers') ? Number(sp.get('minFollowers')) : undefined,
      maxFollowers: sp.get('maxFollowers') ? Number(sp.get('maxFollowers')) : undefined,
      location: sp.get('location') || undefined,
      verified: sp.get('verified') === 'true' ? true : sp.get('verified') === 'false' ? false : undefined,
      page, pageSize,
    }
    const result = await searchInfluencers(filters)
    // Save search history
    if (filters.query) {
      await saveSearch(user.id, filters.query, filters, result.total)
    }
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
