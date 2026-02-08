import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { generateContentSuggestions } from '@/services/ai.service'

const suggestionsSchema = z.object({
  campaignId: z.string(),
  influencerId: z.string().optional(),
  platform: z.string().optional(),
  contentType: z.string().optional(),
  brandVoice: z.string().optional(),
  targetAudience: z.string().optional(),
})

/**
 * POST /api/ai/content-suggestions
 * Generate AI content suggestions for a campaign (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, suggestionsSchema)
    const suggestions = await generateContentSuggestions(body)
    return successResponse(suggestions, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
