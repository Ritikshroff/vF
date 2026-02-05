import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { getAuthUser, AuthenticatedUser } from './auth.middleware';

/**
 * Role-based authorization middleware factory
 * Creates a middleware that checks if user has one of the allowed roles
 */
export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (request: NextRequest): NextResponse | null => {
    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Admin can always access
    if (authUser.role === 'ADMIN') {
      return null;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(authUser.role)) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          required: allowedRoles,
          current: authUser.role,
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Require brand role
 */
export function requireBrand(request: NextRequest): NextResponse | null {
  return roleMiddleware('BRAND', 'ADMIN')(request);
}

/**
 * Require influencer role
 */
export function requireInfluencer(request: NextRequest): NextResponse | null {
  return roleMiddleware('INFLUENCER', 'ADMIN')(request);
}

/**
 * Require admin role
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  return roleMiddleware('ADMIN')(request);
}

/**
 * Require brand has completed profile
 */
export async function requireBrandProfile(request: NextRequest): Promise<NextResponse | null> {
  const authUser = getAuthUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  if (authUser.role === 'ADMIN') {
    return null;
  }

  if (authUser.role !== 'BRAND') {
    return NextResponse.json(
      { error: 'Brand account required', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  if (!authUser.brandId) {
    return NextResponse.json(
      { error: 'Brand profile not completed', code: 'PROFILE_INCOMPLETE' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Require influencer has completed profile
 */
export async function requireInfluencerProfile(request: NextRequest): Promise<NextResponse | null> {
  const authUser = getAuthUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  if (authUser.role === 'ADMIN') {
    return null;
  }

  if (authUser.role !== 'INFLUENCER') {
    return NextResponse.json(
      { error: 'Influencer account required', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  if (!authUser.influencerId) {
    return NextResponse.json(
      { error: 'Influencer profile not completed', code: 'PROFILE_INCOMPLETE' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if user can perform action on a resource
 * Combines role check with ownership verification
 */
export function canPerformAction(
  authUser: AuthenticatedUser,
  action: 'create' | 'read' | 'update' | 'delete',
  resourceOwner?: { type: 'brand' | 'influencer' | 'user'; id: string }
): boolean {
  // Admin can do anything
  if (authUser.role === 'ADMIN') {
    return true;
  }

  // If no resource owner specified, allow based on role
  if (!resourceOwner) {
    return true;
  }

  // Check ownership for update/delete operations
  if (action === 'update' || action === 'delete') {
    switch (resourceOwner.type) {
      case 'brand':
        return authUser.brandId === resourceOwner.id;
      case 'influencer':
        return authUser.influencerId === resourceOwner.id;
      case 'user':
        return authUser.id === resourceOwner.id;
      default:
        return false;
    }
  }

  // Read operations are generally allowed
  return true;
}

/**
 * Resource ownership check middleware factory
 */
export function requireOwnership(
  resourceType: 'brand' | 'influencer' | 'user',
  getResourceId: (request: NextRequest) => string | null
) {
  return (request: NextRequest): NextResponse | null => {
    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Admin can access any resource
    if (authUser.role === 'ADMIN') {
      return null;
    }

    const resourceId = getResourceId(request);

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID not found', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    let hasAccess = false;

    switch (resourceType) {
      case 'brand':
        hasAccess = authUser.brandId === resourceId;
        break;
      case 'influencer':
        hasAccess = authUser.influencerId === resourceId;
        break;
      case 'user':
        hasAccess = authUser.id === resourceId;
        break;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this resource', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return null;
  };
}
