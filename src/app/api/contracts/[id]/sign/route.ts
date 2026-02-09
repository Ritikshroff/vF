import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { signContract } from '@/services/contract-legal.service'

const signSchema = z.object({ signature: z.string().min(1) })

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context?: { params: Promise<any> }) => {
  try {
    if (!context) {
      return errorHandler(new Error('Route context is required'))
    }
    const { id } = await context.params
    await validateBody(request, signSchema)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const result = await signContract(id, user.id, user.role, ipAddress, userAgent)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
