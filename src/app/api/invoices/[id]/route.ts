import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getInvoiceById } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/invoices/:id
 * Get invoice details
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const invoice = await getInvoiceById(id)

    if (!invoice) {
      throw new NotFoundError('Invoice not found')
    }

    return successResponse(invoice)
  } catch (error) {
    return errorHandler(error)
  }
})
