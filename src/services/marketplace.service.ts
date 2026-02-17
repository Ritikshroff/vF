import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import {
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  CreateApplicationInput,
  ReviewApplicationInput,
} from '@/types/marketplace'

// ==================== Listing Operations ====================

/**
 * Create a marketplace listing
 */
export async function createListing(brandId: string, input: CreateListingInput) {
  return prisma.marketplaceListing.create({
    data: {
      brandId,
      campaignId: input.campaignId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      compensationType: input.compensationType,
      targetNiches: input.targetNiches || [],
      targetPlatforms: input.targetPlatforms || [],
      minFollowers: input.minFollowers,
      maxFollowers: input.maxFollowers,
      targetLocations: input.targetLocations || [],
      targetAgeRange: input.targetAgeRange,
      targetGender: input.targetGender,
      totalSlots: input.totalSlots || 1,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
      campaignStartDate: input.campaignStartDate ? new Date(input.campaignStartDate) : undefined,
      campaignEndDate: input.campaignEndDate ? new Date(input.campaignEndDate) : undefined,
    },
    include: {
      campaign: {
        select: { id: true, title: true, status: true },
      },
      brand: {
        select: { id: true, companyName: true, logo: true },
      },
    },
  })
}

/**
 * Get listing by ID
 */
export async function getListingById(listingId: string) {
  return prisma.marketplaceListing.findUnique({
    where: { id: listingId },
    include: {
      campaign: {
        select: { id: true, title: true, description: true, status: true },
      },
      brand: {
        select: { id: true, companyName: true, logo: true, industry: true, verified: true },
      },
      _count: { select: { applications: true } },
    },
  })
}

/**
 * Search marketplace listings
 */
export async function searchListings(filters: ListingFilters) {
  const {
    status,
    brandId,
    compensationType,
    niches,
    platforms,
    minBudget,
    maxBudget,
    minFollowers,
    maxFollowers,
    search,
    isFeatured,
    page = 1,
    pageSize = 20,
  } = filters

  const skip = (page - 1) * pageSize

  const where: Prisma.MarketplaceListingWhereInput = {
    ...(brandId ? { brandId } : { status: status || 'ACTIVE' }),
    ...(brandId && status && { status }),
    ...(compensationType && { compensationType }),
    ...(niches && niches.length > 0 && { targetNiches: { hasSome: niches } }),
    ...(platforms && platforms.length > 0 && { targetPlatforms: { hasSome: platforms } }),
    ...(minBudget && { budgetMax: { gte: minBudget } }),
    ...(maxBudget && { budgetMin: { lte: maxBudget } }),
    ...(minFollowers && { minFollowers: { lte: minFollowers } }),
    ...(maxFollowers && { maxFollowers: { gte: maxFollowers } }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where,
      include: {
        brand: {
          select: { id: true, companyName: true, logo: true, verified: true },
        },
        _count: { select: { applications: true } },
      },
      skip,
      take: pageSize,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.marketplaceListing.count({ where }),
  ])

  return {
    data: data.map((listing) => ({
      ...listing,
      budgetMin: listing.budgetMin?.toNumber() ?? null,
      budgetMax: listing.budgetMax?.toNumber() ?? null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Update a listing
 */
export async function updateListing(listingId: string, brandId: string, input: UpdateListingInput) {
  return prisma.marketplaceListing.update({
    where: { id: listingId, brandId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.requirements !== undefined && { requirements: input.requirements }),
      ...(input.status && { status: input.status }),
      ...(input.budgetMin !== undefined && { budgetMin: input.budgetMin }),
      ...(input.budgetMax !== undefined && { budgetMax: input.budgetMax }),
      ...(input.targetNiches && { targetNiches: input.targetNiches }),
      ...(input.targetPlatforms && { targetPlatforms: input.targetPlatforms }),
      ...(input.totalSlots && { totalSlots: input.totalSlots }),
      ...(input.applicationDeadline && { applicationDeadline: new Date(input.applicationDeadline) }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
    },
  })
}

// ==================== Application Operations ====================

/**
 * Apply to a marketplace listing
 */
export async function applyToListing(listingId: string, influencerId: string, input: CreateApplicationInput) {
  const [application] = await prisma.$transaction([
    prisma.marketplaceApplication.create({
      data: {
        listingId,
        influencerId,
        coverLetter: input.coverLetter,
        proposedRate: input.proposedRate,
        portfolio: input.portfolio || [],
        availability: input.availability,
      },
      include: {
        influencer: {
          select: { id: true, fullName: true, avatar: true, rating: true },
        },
      },
    }),
    prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { applicantCount: { increment: 1 } },
    }),
  ])

  return application
}

/**
 * Get applications for a listing
 */
export async function getListingApplications(
  listingId: string,
  options: { status?: string; page?: number; pageSize?: number } = {}
) {
  const { status, page = 1, pageSize = 20 } = options
  const skip = (page - 1) * pageSize

  const where: Prisma.MarketplaceApplicationWhereInput = {
    listingId,
    ...(status && { status: status as any }),
  }

  const [data, total] = await Promise.all([
    prisma.marketplaceApplication.findMany({
      where,
      include: {
        influencer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            categories: true,
            rating: true,
            totalCampaigns: true,
            platforms: {
              select: { platform: true, followers: true, engagementRate: true },
            },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.marketplaceApplication.count({ where }),
  ])

  return {
    data: data.map((app) => ({
      ...app,
      proposedRate: app.proposedRate?.toNumber() ?? null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Review an application
 */
export async function reviewApplication(
  applicationId: string,
  brandId: string,
  input: ReviewApplicationInput
) {
  const application = await prisma.marketplaceApplication.findUnique({
    where: { id: applicationId },
    include: { listing: true },
  })

  if (!application || application.listing.brandId !== brandId) {
    throw new Error('Application not found or unauthorized')
  }

  const updated = await prisma.marketplaceApplication.update({
    where: { id: applicationId },
    data: {
      status: input.status,
      reviewNotes: input.reviewNotes,
      reviewedAt: new Date(),
    },
  })

  // If accepted, increment filled slots
  if (input.status === 'ACCEPTED') {
    await prisma.marketplaceListing.update({
      where: { id: application.listingId },
      data: { filledSlots: { increment: 1 } },
    })

    // Close listing if all slots filled
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: application.listingId },
    })
    if (listing && listing.filledSlots + 1 >= listing.totalSlots) {
      await prisma.marketplaceListing.update({
        where: { id: application.listingId },
        data: { status: 'FILLED' },
      })
    }
  }

  return updated
}

/**
 * Withdraw an application
 */
export async function withdrawApplication(applicationId: string, influencerId: string) {
  return prisma.marketplaceApplication.update({
    where: { id: applicationId, influencerId },
    data: { status: 'WITHDRAWN' },
  })
}

/**
 * Get an influencer's applications
 */
export async function getInfluencerApplications(
  influencerId: string,
  options: { status?: string; page?: number; pageSize?: number } = {}
) {
  const { status, page = 1, pageSize = 20 } = options
  const skip = (page - 1) * pageSize

  const where: Prisma.MarketplaceApplicationWhereInput = {
    influencerId,
    ...(status && { status: status as any }),
  }

  const [data, total] = await Promise.all([
    prisma.marketplaceApplication.findMany({
      where,
      include: {
        listing: {
          include: {
            brand: {
              select: { id: true, companyName: true, logo: true },
            },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.marketplaceApplication.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
