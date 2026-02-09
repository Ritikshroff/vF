import { NextRequest, NextResponse } from 'next/server'
import { withAuth, getPagination, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listFTCChecks } from '@/services/contract-legal.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.brandId) return NextResponse.json({ error: 'Brand only' }, { status: 403 })
    const { page, pageSize } = getPagination(request)
    const result = await listFTCChecks(user.brandId, page, pageSize)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
