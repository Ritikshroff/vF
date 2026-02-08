import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getContactById, updateContact, deleteContact } from '@/services/crm.service'
import { CRMContactStatus } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/crm/contacts/:id
 */
export const GET = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const contact = await getContactById(id)
    if (!contact) throw new NotFoundError('Contact not found')
    return successResponse(contact)
  } catch (error) {
    return errorHandler(error)
  }
})

const updateSchema = z.object({
  status: z.nativeEnum(CRMContactStatus).optional(),
  customLabels: z.array(z.string()).optional(),
  internalNotes: z.string().optional(),
  nextFollowUpAt: z.string().datetime().optional(),
})

/**
 * PUT /api/crm/contacts/:id
 */
export const PUT = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, updateSchema)
    const contact = await updateContact(id, user.brandId!, body)
    return successResponse(contact)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * DELETE /api/crm/contacts/:id
 */
export const DELETE = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    await deleteContact(id, user.brandId!)
    return successResponse({ message: 'Contact deleted' })
  } catch (error) {
    return errorHandler(error)
  }
})
