import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { compareInfluencers, saveComparison } from '@/services/discovery.service'

const compareSchema = z.object({
  influencerIds: z.array(z.string()).min(2).max(4),
  name: z.string().optional(),
})

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, compareSchema)
    const result = await compareInfluencers(body.influencerIds)
    if (user.brandId) {
      await saveComparison(user.brandId, body.influencerIds, body.name)
    }
    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
