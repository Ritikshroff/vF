import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createListing, searchListings } from '@/services/marketplace.service'
import { CompensationType, MarketplaceListingStatus } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

const createListingSchema = z.object({
  campaignId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  category: z.string().optional(),
  requirements: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  compensationType: z.nativeEnum(CompensationType).optional().default('FIXED'),
  targetNiches: z.array(z.string()).optional(),
  targetPlatforms: z.array(z.string()).optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  maxFollowers: z.number().int().nonnegative().optional(),
  targetLocations: z.array(z.string()).optional(),
  targetAgeRange: z.string().optional(),
  targetGender: z.string().optional(),
  totalSlots: z.number().int().positive().optional(),
  applicationDeadline: z.string().datetime().optional(),
  campaignStartDate: z.string().datetime().optional(),
  campaignEndDate: z.string().datetime().optional(),
})

/**
 * POST /api/marketplace/listings
 * Create a marketplace listing (Brand only)
 * If no campaignId is provided, auto-creates a Campaign first.
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createListingSchema)

    let campaignId = body.campaignId
    if (!campaignId) {
      // Auto-create a Campaign from the listing data
      const campaign = await prisma.campaign.create({
        data: {
          brandId: user.brandId!,
          title: body.title,
          description: body.description,
          category: body.category || 'General',
          budgetMin: body.budgetMin || 0,
          budgetMax: body.budgetMax || 0,
          compensationType: body.compensationType || 'FIXED',
          startDate: body.campaignStartDate ? new Date(body.campaignStartDate) : new Date(),
          endDate: body.campaignEndDate ? new Date(body.campaignEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined,
          maxInfluencers: body.totalSlots || 10,
        },
      })
      campaignId = campaign.id
    }

    const listing = await createListing(user.brandId!, { ...body, campaignId })
    return successResponse(listing, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/marketplace/listings
 * Search marketplace listings (any authenticated user)
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const search = request.nextUrl.searchParams.get('search') || undefined
    const status = request.nextUrl.searchParams.get('status') as MarketplaceListingStatus | undefined
    const compensationType = request.nextUrl.searchParams.get('compensationType') as CompensationType | undefined
    const nichesParam = request.nextUrl.searchParams.get('niches')
    const platformsParam = request.nextUrl.searchParams.get('platforms')
    const minBudget = request.nextUrl.searchParams.get('minBudget')
    const maxBudget = request.nextUrl.searchParams.get('maxBudget')
    const isFeatured = request.nextUrl.searchParams.get('isFeatured')
    const myListings = request.nextUrl.searchParams.get('myListings')

    const listings = await searchListings({
      status,
      brandId: myListings === 'true' && user.brandId ? user.brandId : undefined,
      compensationType,
      niches: nichesParam ? nichesParam.split(',') : undefined,
      platforms: platformsParam ? platformsParam.split(',') : undefined,
      minBudget: minBudget ? parseFloat(minBudget) : undefined,
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
      search,
      isFeatured: isFeatured !== null ? isFeatured === 'true' : undefined,
      page,
      pageSize,
    })

    return successResponse(listings)
  } catch (error) {
    return errorHandler(error)
  }
})
