import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken, AccessTokenPayload } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';

// Extended request with authenticated user
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  brandId?: string;
  influencerId?: string;
}

// Type for request with user attached
export type AuthenticatedRequest = NextRequest & {
  user: AuthenticatedUser;
};

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('access_token')?.value;

    const token = extractBearerToken(authHeader) || cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        brand: { select: { id: true } },
        influencer: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' },
        { status: 401 }
      );
    }

    // Attach user to request for downstream handlers
    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      brandId: user.brand?.id,
      influencerId: user.influencer?.id,
    };

    // Store user in request headers (Next.js way of passing data)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', authUser.id);
    requestHeaders.set('x-user-email', authUser.email);
    requestHeaders.set('x-user-role', authUser.role);
    if (authUser.brandId) {
      requestHeaders.set('x-brand-id', authUser.brandId);
    }
    if (authUser.influencerId) {
      requestHeaders.set('x-influencer-id', authUser.influencerId);
    }

    // Continue to the next middleware/handler
    return null;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', code: 'AUTH_ERROR' },
      { status: 401 }
    );
  }
}

/**
 * Authenticate request and return the user directly
 * Returns { user } on success or { error: NextResponse } on failure
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('access_token')?.value;
    const token = extractBearerToken(authHeader) || cookieToken;

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        ),
      };
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return {
        error: NextResponse.json(
          { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
          { status: 401 }
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        brand: { select: { id: true } },
        influencer: { select: { id: true } },
      },
    });

    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 401 }
        ),
      };
    }

    if (!user.isActive) {
      return {
        error: NextResponse.json(
          { error: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' },
          { status: 401 }
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        brandId: user.brand?.id,
        influencerId: user.influencer?.id,
      },
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      error: NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Extract authenticated user from request headers
 * Use this in API route handlers after auth middleware
 */
export function getAuthUser(request: NextRequest): AuthenticatedUser | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role') as UserRole | null;

  if (!userId || !email || !role) {
    return null;
  }

  return {
    id: userId,
    email,
    role,
    brandId: request.headers.get('x-brand-id') || undefined,
    influencerId: request.headers.get('x-influencer-id') || undefined,
  };
}

/**
 * Optional authentication - doesn't fail if no token present
 * but still validates token if provided
 */
export async function optionalAuthMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('access_token')?.value;
  const token = extractBearerToken(authHeader) || cookieToken;

  // No token is okay for optional auth
  if (!token) {
    return null;
  }

  // If token exists, validate it
  return authMiddleware(request);
}

/**
 * Verify user ownership of a resource
 */
export function verifyOwnership(
  authUser: AuthenticatedUser,
  resourceOwnerId: string,
  resourceType: 'user' | 'brand' | 'influencer'
): boolean {
  switch (resourceType) {
    case 'user':
      return authUser.id === resourceOwnerId;
    case 'brand':
      return authUser.brandId === resourceOwnerId;
    case 'influencer':
      return authUser.influencerId === resourceOwnerId;
    default:
      return false;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(authUser: AuthenticatedUser): boolean {
  return authUser.role === 'ADMIN';
}

/**
 * Check if user can access resource (owner or admin)
 */
export function canAccessResource(
  authUser: AuthenticatedUser,
  resourceOwnerId: string,
  resourceType: 'user' | 'brand' | 'influencer'
): boolean {
  return isAdmin(authUser) || verifyOwnership(authUser, resourceOwnerId, resourceType);
}
