import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, ConflictError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { influencerOnboardingSchema } from '@/validators/auth.schema'

/**
 * POST /api/onboarding/influencer
 * Complete influencer onboarding - creates Influencer profile with platforms
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, influencerOnboardingSchema)

    // Check if influencer profile already exists
    const existing = await prisma.influencer.findUnique({
      where: { userId: user.id },
    })

    if (existing) {
      throw new ConflictError('Influencer profile already exists')
    }

    // Check username uniqueness
    const usernameExists = await prisma.influencer.findUnique({
      where: { username: body.username },
    })

    if (usernameExists) {
      throw new ConflictError('Username is already taken')
    }

    // Create influencer profile with platforms in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const influencer = await tx.influencer.create({
        data: {
          userId: user.id,
          username: body.username,
          fullName: body.fullName,
          bio: body.bio || null,
          location: body.location || null,
          categories: body.categories,
          contentTypes: body.contentTypes || [],
          platforms: {
            create: body.platforms.map((p) => ({
              platform: p.platform,
              handle: p.handle,
              followers: p.followers || 0,
              verified: false,
            })),
          },
        },
        include: {
          platforms: true,
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          role: 'INFLUENCER',
          onboardingCompleted: true,
        },
      })

      return influencer
    })

    return successResponse({ influencer: result }, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
