import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withInfluencer, withBrand, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { applyToListing, getListingApplications } from '@/services/marketplace.service'

type RouteContext = { params: Promise<{ id: string }> }

const applicationSchema = z.object({
  coverLetter: z.string().max(3000).optional(),
  proposedRate: z.number().positive().optional(),
  portfolio: z.array(z.string()).optional(),
  availability: z.string().optional(),
})

/**
 * POST /api/marketplace/listings/:id/applications
 * Apply to a listing (Influencer only)
 */
export const POST = withInfluencer(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, applicationSchema)
    const application = await applyToListing(id, user.influencerId!, body)
    return successResponse(application, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/marketplace/listings/:id/applications
 * Get applications for a listing (Brand only)
 */
export const GET = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const { page, pageSize } = getPagination(request)
    const status = request.nextUrl.searchParams.get('status') || undefined
    const applications = await getListingApplications(id, { status, page, pageSize })
    return successResponse(applications)
  } catch (error) {
    return errorHandler(error)
  }
})
