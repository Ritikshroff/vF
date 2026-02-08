import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { getInvoiceById, markInvoicePaid } from '@/services/payment.service'

type RouteContext = { params: Promise<{ id: string }> }

const paySchema = z.object({
  paymentReference: z.string().min(1, 'Payment reference is required'),
})

/**
 * POST /api/invoices/:id/pay
 * Mark an invoice as paid
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, paySchema)

    const invoice = await getInvoiceById(id)

    if (!invoice) {
      throw new NotFoundError('Invoice not found')
    }

    if (invoice.status !== 'SENT') {
      throw new ValidationError(`Invoice must be sent before it can be paid. Current status: ${invoice.status}`)
    }

    const paidInvoice = await markInvoicePaid(id)

    return successResponse(paidInvoice)
  } catch (error) {
    return errorHandler(error)
  }
})
