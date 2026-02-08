import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAdmin, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { resolveDispute } from '@/services/reputation.service'

type RouteContext = { params: Promise<{ id: string }> }

const resolveSchema = z.object({
  resolution: z.string().min(1, 'Resolution is required'),
  impactsReputation: z.boolean(),
  reputationAction: z.string().optional(),
})

/**
 * POST /api/disputes/:id/resolve
 * Resolve a dispute (Admin only)
 */
export const POST = withAdmin(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, resolveSchema)
    const dispute = await resolveDispute(id, user.id, body)
    return successResponse(dispute)
  } catch (error) {
    return errorHandler(error)
  }
})
