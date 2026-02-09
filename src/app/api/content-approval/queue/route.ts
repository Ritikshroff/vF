import { NextRequest } from 'next/server'
import { withAuth, getPagination, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listPendingApprovals } from '@/services/content-approval.service'
import { ApprovalStatus } from '@prisma/client'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const status = request.nextUrl.searchParams.get('status') as ApprovalStatus | null
    const result = await listPendingApprovals(user.id, user.role, { status: status || undefined, page, pageSize })
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
