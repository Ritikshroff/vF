import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getContractAuditTrail } from '@/services/contract-legal.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser, context: { params: Promise<any> }) => {
  try {
    const { id } = await context.params
    const result = await getContractAuditTrail(id)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
