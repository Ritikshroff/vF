import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { reviewContent } from '@/services/content-approval.service'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
  feedback: z.string().optional(),
})

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context: { params: Promise<any> }) => {
  try {
    const { id } = await context.params
    const body = await validateBody(request, reviewSchema)
    const result = await reviewContent(id, user.id, body)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
