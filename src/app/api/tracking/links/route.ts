import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, getPagination, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createTrackingLink, listTrackingLinks } from '@/services/tracking.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.influencerId) return NextResponse.json({ error: 'Influencer only' }, { status: 403 })
    const { page, pageSize } = getPagination(request)
    const result = await listTrackingLinks(user.influencerId, page, pageSize)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})

const createLinkSchema = z.object({
  originalUrl: z.string().url(),
  campaignId: z.string().optional(),
  collaborationId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.influencerId) return NextResponse.json({ error: 'Influencer only' }, { status: 403 })
    const body = await validateBody(request, createLinkSchema)
    const result = await createTrackingLink(user.influencerId, body)
    return successResponse(result, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
