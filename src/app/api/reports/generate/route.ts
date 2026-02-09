import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { generateReport } from '@/services/reporting.service'

const generateReportSchema = z.object({
  templateId: z.string().optional(),
  campaignId: z.string().optional(),
  reportType: z.enum(['CAMPAIGN', 'INFLUENCER', 'PLATFORM', 'CUSTOM']),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }),
})

/**
 * POST /api/reports/generate
 * Generate a report (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, generateReportSchema)
    const report = await generateReport(user.brandId!, body)
    return successResponse(report, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
