import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getInvoiceById, sendInvoice } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/invoices/:id/send
 * Send an invoice
 */
export const POST = withAuth(async (
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

    if (invoice.status !== 'DRAFT') {
      throw new ValidationError(`Invoice is already ${invoice.status.toLowerCase()}`)
    }

    const sentInvoice = await sendInvoice(id)

    return successResponse(sentInvoice)
  } catch (error) {
    return errorHandler(error)
  }
})
