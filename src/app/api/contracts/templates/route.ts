import { NextRequest, NextResponse } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listTemplates } from '@/services/contract-legal.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.brandId) return NextResponse.json({ error: 'Brand only' }, { status: 403 })
    const result = await listTemplates(user.brandId)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
