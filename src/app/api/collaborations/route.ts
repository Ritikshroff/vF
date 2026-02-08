import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, getPagination, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, ValidationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import {
  createCollaboration,
  listCollaborations,
} from '@/services/collaboration.service'
import { CollaborationStatus } from '@prisma/client'

// Validation schemas
const createCollaborationSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  influencerId: z.string().min(1, 'Influencer ID is required'),
  agreedAmount: z.number().positive('Amount must be positive'),
  message: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  contentDueDate: z.string().datetime().optional(),
})

const listQuerySchema = z.object({
  status: z.nativeEnum(CollaborationStatus).optional(),
  campaignId: z.string().optional(),
  influencerId: z.string().optional(),
  brandId: z.string().optional(),
})

/**
 * POST /api/collaborations
 * Create a new collaboration (Brand only)
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Only brands can create collaborations
    if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only brands can create collaborations' },
        { status: 403 }
      )
    }

    const body = await validateBody(request, createCollaborationSchema)

    // Get brand ID from user
    const brandId = user.brandId
    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 400 }
      )
    }

    const collaboration = await createCollaboration({
      campaignId: body.campaignId,
      influencerId: body.influencerId,
      brandId,
      agreedAmount: body.agreedAmount,
      message: body.message,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      contentDueDate: body.contentDueDate ? new Date(body.contentDueDate) : undefined,
    })

    return successResponse(collaboration, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations
 * List collaborations with filters
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { page, pageSize } = getPagination(request)
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)

    // Parse and validate query params
    const filters = listQuerySchema.parse({
      status: searchParams.status,
      campaignId: searchParams.campaignId,
      influencerId: searchParams.influencerId,
      brandId: searchParams.brandId,
    })

    // Filter based on user role
    if (user.role === 'BRAND') {
      filters.brandId = user.brandId || undefined
    } else if (user.role === 'INFLUENCER') {
      filters.influencerId = user.influencerId || undefined
    }
    // Admins can see all

    const result = await listCollaborations(filters, { page, pageSize })

    return successResponse(result)
  } catch (error) {
    return errorHandler(error)
  }
})
