import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAdmin, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { reviewVerificationRequest } from '@/services/reputation.service'

type RouteContext = { params: Promise<{ id: string }> }

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

/**
 * POST /api/verification/:id/review
 * Review a verification request (Admin only)
 */
export const POST = withAdmin(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, reviewSchema)
    const result = await reviewVerificationRequest(id, user.id, body)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
