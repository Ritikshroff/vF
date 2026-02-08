import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Platform } from '@prisma/client'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { getCollaborationById, createDeliverables } from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string }> }

const createDeliverablesSchema = z.object({
  deliverables: z.array(
    z.object({
      type: z.string().min(1, 'Type is required'),
      platform: z.nativeEnum(Platform),
      description: z.string().optional(),
      quantity: z.number().int().positive().optional(),
      dueDate: z.string().datetime().optional(),
      milestoneId: z.string().optional(),
    })
  ).min(1, 'At least one deliverable is required'),
})

/**
 * POST /api/collaborations/:id/deliverables
 * Create deliverables for the collaboration
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, createDeliverablesSchema)

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Only brands can define deliverables
    if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only brands can define deliverables')
    }

    if (user.role === 'BRAND' && user.brandId !== collaboration.brandId) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    const deliverables = await createDeliverables(
      id,
      body.deliverables.map((d) => ({
        ...d,
        dueDate: d.dueDate ? new Date(d.dueDate) : undefined,
      }))
    )

    return successResponse(deliverables, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations/:id/deliverables
 * Get all deliverables for the collaboration
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Check authorization
    const isAuthorized =
      user.role === 'ADMIN' ||
      (user.role === 'BRAND' && user.brandId === collaboration.brandId) ||
      (user.role === 'INFLUENCER' && user.influencerId === collaboration.influencerId)

    if (!isAuthorized) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    const deliverables = await prisma.collaborationDeliverable.findMany({
      where: { collaborationId: id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
        milestone: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return successResponse(deliverables)
  } catch (error) {
    return errorHandler(error)
  }
})
