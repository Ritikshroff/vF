import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { submitForApproval } from '@/services/content-approval.service'

const submitSchema = z.object({ reviewerIds: z.array(z.string().min(1)).min(1) })

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: { params: Promise<any> }) => {
  try {
    if (!context) {
      return errorHandler(new Error('Route context is required'))
    }
    const { id } = await context.params
    const body = await validateBody(request, submitSchema)
    const result = await submitForApproval(id, user.id, body.reviewerIds)
    return successResponse(result, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
