import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { createInvoice, listInvoices } from '@/services/payment.service'
import { InvoiceType, InvoiceStatus } from '@prisma/client'

const createInvoiceSchema = z.object({
  type: z.nativeEnum(InvoiceType),
  collaborationId: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      amount: z.number().nonnegative(),
    })
  ).min(1, 'At least one line item is required'),
  taxRate: z.number().min(0).max(100).optional(),
  gstNumber: z.string().optional(),
  taxType: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

/**
 * POST /api/invoices
 * Create a new invoice
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await validateBody(request, createInvoiceSchema)

    // Role-based access
    if (body.type === 'BRAND_DEPOSIT' && user.role !== 'BRAND' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only brands can create deposit invoices')
    }

    if (body.type === 'INFLUENCER_PAYOUT' && user.role !== 'INFLUENCER' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only influencers can create payout invoices')
    }

    const invoice = await createInvoice({
      brandId: user.role === 'BRAND' ? user.brandId : undefined,
      influencerId: user.role === 'INFLUENCER' ? user.influencerId : undefined,
      type: body.type,
      collaborationId: body.collaborationId,
      lineItems: body.lineItems,
      taxRate: body.taxRate,
      gstNumber: body.gstNumber,
      taxType: body.taxType,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    })

    return successResponse(invoice, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/invoices
 * List invoices for the authenticated user
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as InvoiceStatus | undefined
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const userType = user.role === 'BRAND' ? 'brand' as const : 'influencer' as const
    const userId = user.role === 'BRAND' ? user.brandId! : user.influencerId!

    const result = await listInvoices(userId, userType, { page, pageSize, status })

    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
