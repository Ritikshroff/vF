import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createDispute, listDisputes } from '@/services/reputation.service'

const createDisputeSchema = z.object({
  collaborationId: z.string(),
  againstUserId: z.string(),
  type: z.enum(['NON_DELIVERY', 'QUALITY', 'PAYMENT', 'COMMUNICATION', 'CONTRACT_BREACH', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  evidence: z.array(z.string()).default([]),
})

/**
 * POST /api/disputes
 * Create a new dispute
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createDisputeSchema)
    const dispute = await createDispute(user.id, body)
    return successResponse(dispute, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/disputes
 * List disputes for the current user (or all for admin)
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const status = request.nextUrl.searchParams.get('status') || undefined
    const type = request.nextUrl.searchParams.get('type') || undefined

    const disputes = await listDisputes({
      userId: user.role === 'ADMIN' ? undefined : user.id,
      status: status as any,
      type: type as any,
      page,
      pageSize,
    })

    return successResponse(disputes)
  } catch (error) {
    return errorHandler(error)
  }
})
