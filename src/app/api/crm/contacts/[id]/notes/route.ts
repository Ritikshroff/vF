import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withBrand, successResponse, validateBody, getPagination } from '@/lib/api/with-middleware'
import { errorHandler } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { addNote, getContactNotes } from '@/services/crm.service'

type RouteContext = { params: Promise<{ id: string }> }

const noteSchema = z.object({
  content: z.string().min(1).max(5000),
  isPinned: z.boolean().optional(),
})

/**
 * POST /api/crm/contacts/:id/notes
 */
export const POST = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, noteSchema)
    const note = await addNote(id, user.id, body)
    return successResponse(note, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/crm/contacts/:id/notes
 */
export const GET = withBrand(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const { page, pageSize } = getPagination(request)
    const notes = await getContactNotes(id, page, pageSize)
    return successResponse(notes)
  } catch (error) {
    return errorHandler(error)
  }
})
