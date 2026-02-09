import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listTemplates, createTemplate } from '@/services/reporting.service'

const createTemplateSchema = z.object({
  name: z.string(),
  sections: z.array(z.string()),
  format: z.string().optional(),
})

/**
 * GET /api/reports/templates
 * List report templates (Brand only)
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const templates = await listTemplates(user.brandId!)
    return successResponse(templates)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * POST /api/reports/templates
 * Create a report template (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createTemplateSchema)
    const template = await createTemplate(user.brandId!, body)
    return successResponse(template, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
