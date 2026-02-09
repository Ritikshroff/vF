import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { checkFTCCompliance } from '@/services/contract-legal.service'

const checkSchema = z.object({ contentId: z.string().min(1) })

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, checkSchema)
    const result = await checkFTCCompliance(body.contentId)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
