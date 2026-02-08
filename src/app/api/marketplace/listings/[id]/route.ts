import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getListingById, updateListing } from '@/services/marketplace.service'
import { MarketplaceListingStatus } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/marketplace/listings/:id
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const listing = await getListingById(id)
    if (!listing) throw new NotFoundError('Listing not found')

    return successResponse({
      ...listing,
      budgetMin: listing.budgetMin?.toNumber() ?? null,
      budgetMax: listing.budgetMax?.toNumber() ?? null,
    })
  } catch (error) {
    return errorHandler(error)
  }
})

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.nativeEnum(MarketplaceListingStatus).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  targetNiches: z.array(z.string()).optional(),
  targetPlatforms: z.array(z.string()).optional(),
  totalSlots: z.number().int().positive().optional(),
  applicationDeadline: z.string().datetime().optional(),
  isFeatured: z.boolean().optional(),
})

/**
 * PUT /api/marketplace/listings/:id
 */
export const PUT = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, updateSchema)
    const listing = await updateListing(id, user.brandId!, body)
    return successResponse(listing)
  } catch (error) {
    return errorHandler(error)
  }
})
