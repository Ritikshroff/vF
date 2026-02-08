import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createContact, listContacts } from '@/services/crm.service'
import { CRMContactStatus } from '@prisma/client'

const createContactSchema = z.object({
  influencerId: z.string(),
  status: z.nativeEnum(CRMContactStatus).optional(),
  customLabels: z.array(z.string()).optional(),
  internalNotes: z.string().optional(),
  source: z.string().optional(),
})

/**
 * POST /api/crm/contacts
 * Add an influencer as a CRM contact (Brand only)
 */
export const POST = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createContactSchema)
    const contact = await createContact(user.brandId!, body)
    return successResponse(contact, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/crm/contacts
 * List CRM contacts (Brand only)
 */
export const GET = withBrand(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const status = request.nextUrl.searchParams.get('status') as CRMContactStatus | undefined
    const search = request.nextUrl.searchParams.get('search') || undefined
    const labelsParam = request.nextUrl.searchParams.get('labels')
    const labels = labelsParam ? labelsParam.split(',') : undefined

    const contacts = await listContacts({
      brandId: user.brandId!,
      status,
      labels,
      search,
      page,
      pageSize,
    })

    return successResponse(contacts)
  } catch (error) {
    return errorHandler(error)
  }
})
