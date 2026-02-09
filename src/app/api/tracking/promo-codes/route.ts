import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, getPagination, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createPromoCode, listPromoCodes } from '@/services/tracking.service'

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.influencerId) return NextResponse.json({ error: 'Influencer only' }, { status: 403 })
    const { page, pageSize } = getPagination(request)
    const result = await listPromoCodes(user.influencerId, page, pageSize)
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})

const createCodeSchema = z.object({
  code: z.string().min(3),
  campaignId: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    if (!user.influencerId) return NextResponse.json({ error: 'Influencer only' }, { status: 403 })
    const body = await validateBody(request, createCodeSchema)
    const result = await createPromoCode(user.influencerId, body)
    return successResponse(result, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
