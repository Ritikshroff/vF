import { NextRequest, NextResponse } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getTrackingDashboard } from '@/services/tracking.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.influencerId) return NextResponse.json({ error: 'Influencer only' }, { status: 403 })
    const result = await getTrackingDashboard(user.influencerId)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
