import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, ConflictError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { brandOnboardingSchema } from '@/validators/auth.schema'

/**
 * POST /api/onboarding/brand
 * Complete brand onboarding - creates Brand profile and links to user
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, brandOnboardingSchema)

    // Check if brand profile already exists
    const existing = await prisma.brand.findUnique({
      where: { userId: user.id },
    })

    if (existing) {
      throw new ConflictError('Brand profile already exists')
    }

    // Create brand profile and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const brand = await tx.brand.create({
        data: {
          userId: user.id,
          companyName: body.companyName,
          industry: body.industry,
          ...(body.website && { website: body.website }),
          ...(body.description && { description: body.description }),
          ...(body.location && { location: body.location }),
          ...(body.companySize && { companySize: body.companySize }),
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          role: 'BRAND',
          onboardingCompleted: true,
        },
      })

      return brand
    })

    return successResponse({ brand: result }, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
