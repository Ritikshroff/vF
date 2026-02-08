import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createList, getLists } from '@/services/crm.service'

const createListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isSmartList: z.boolean().optional(),
  criteria: z.record(z.string(), z.unknown()).optional(),
})

/**
 * POST /api/crm/lists
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createListSchema)
    const list = await createList(user.brandId!, body)
    return successResponse(list, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/crm/lists
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const lists = await getLists(user.brandId!)
    return successResponse(lists)
  } catch (error) {
    return errorHandler(error)
  }
})
