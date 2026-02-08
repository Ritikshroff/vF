import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware'
import { errorHandler, NotFoundError, AuthorizationError } from '@/middleware/error.middleware'
import { AuthenticatedUser } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/db/prisma'
import { getCollaborationById, generateContract, signContract } from '@/services/collaboration.service'

type RouteContext = { params: Promise<{ id: string }> }

const generateContractSchema = z.object({
  templateId: z.string().optional(),
  customTerms: z.string().optional(),
})

const signContractSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
})

/**
 * POST /api/collaborations/:id/contract
 * Generate a contract for the collaboration
 */
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, generateContractSchema)

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Only brands can generate contracts
    if (user.role !== 'BRAND' && user.role !== 'ADMIN') {
      throw new AuthorizationError('Only brands can generate contracts')
    }

    if (user.role === 'BRAND' && user.brandId !== collaboration.brandId) {
      throw new AuthorizationError('You do not have access to this collaboration')
    }

    const contract = await generateContract(id, body.templateId, body.customTerms)

    return successResponse(contract, 201)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * GET /api/collaborations/:id/contract
 * Get the contract for the collaboration
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

    const contract = await prisma.collaborationContract.findUnique({
      where: { collaborationId: id },
    })

    if (!contract) {
      throw new NotFoundError('Contract not found')
    }

    return successResponse(contract)
  } catch (error) {
    return errorHandler(error)
  }
})

/**
 * PUT /api/collaborations/:id/contract
 * Sign the contract
 */
export const PUT = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => {
  try {
    const { id } = await context!.params
    const body = await validateBody(request, signContractSchema)

    const collaboration = await getCollaborationById(id)

    if (!collaboration) {
      throw new NotFoundError('Collaboration not found')
    }

    // Determine user role in this collaboration
    let userRole: 'brand' | 'influencer'
    let userId: string

    if (user.role === 'BRAND' && user.brandId === collaboration.brandId) {
      userRole = 'brand'
      userId = user.brandId
    } else if (user.role === 'INFLUENCER' && user.influencerId === collaboration.influencerId) {
      userRole = 'influencer'
      userId = user.influencerId
    } else if (user.role === 'ADMIN') {
      // Admin can sign on behalf of brand
      userRole = 'brand'
      userId = collaboration.brandId
    } else {
      throw new AuthorizationError('You do not have access to sign this contract')
    }

    // Get IP address
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined

    const contract = await signContract(id, userId, userRole, {
      signature: body.signature,
      ipAddress: ipAddress || undefined,
    })

    return successResponse(contract)
  } catch (error) {
    return errorHandler(error)
  }
})
