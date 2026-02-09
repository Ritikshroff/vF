import { NextRequest, NextResponse } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { toggleLinkStatus } from '@/services/tracking.service'

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser, context: { params: Promise<any> }) => {
  try {
    if (!user.influencerId) return NextResponse.json({ error: 'Influencer only' }, { status: 403 })
    const { id } = await context.params
    const result = await toggleLinkStatus(id, user.influencerId)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
