import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { listScheduledReports, scheduleReport } from '@/services/reporting.service'

const scheduleReportSchema = z.object({
  templateId: z.string(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  recipients: z.array(z.string().email()),
})

/**
 * GET /api/reports/schedule
 * List scheduled reports (Brand only)
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const schedules = await listScheduledReports(user.brandId!)
    return successResponse(schedules)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * POST /api/reports/schedule
 * Schedule a report (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, scheduleReportSchema)
    const schedule = await scheduleReport(user.brandId!, body)
    return successResponse(schedule, 201)
  } catch (error) {
    return errorHandler(error)
  }
})
