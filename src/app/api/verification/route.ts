import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { submitVerificationRequest, getUserVerificationRequests } from '@/services/reputation.service'

const submitSchema = z.object({
  verificationType: z.enum(['IDENTITY', 'BUSINESS', 'PORTFOLIO', 'SOCIAL_ACCOUNT']),
  documents: z.array(z.string()).min(1, 'At least one document is required'),
})

/**
 * POST /api/verification
 * Submit a verification request
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, submitSchema)
    const request_ = await submitVerificationRequest(user.id, body)
    return successResponse(request_, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/verification
 * Get current user's verification requests
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const requests = await getUserVerificationRequests(user.id)
    return successResponse(requests)
  } catch (error) {
    return errorHandler(error)
  }
})
