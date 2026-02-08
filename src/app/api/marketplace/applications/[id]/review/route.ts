import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { reviewApplication } from '@/services/marketplace.service'
import { ApplicationStatus } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

const reviewSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  reviewNotes: z.string().optional(),
})

/**
 * POST /api/marketplace/applications/:id/review
 * Review an application (Brand only)
 */
export const POST = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, reviewSchema)
    const application = await reviewApplication(id, user.brandId!, body)
    return successResponse(application)
  } catch (error) {
    return errorHandler(error)
  }
})
