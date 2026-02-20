import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authenticateRequest, AuthenticatedUser } from '@/middleware/auth.middleware';
import { errorHandler } from '@/middleware/error.middleware';
import { ZodSchema } from 'zod';

/**
 * Middleware function type
 */
type MiddlewareFn = (
  request: NextRequest
) => Promise<NextResponse | null> | NextResponse | null;

/**
 * Route context type (Next.js 16 uses Promise for params)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

/**
 * Route handler type
 */
type RouteHandler = (
  request: NextRequest,
  context?: RouteContext
) => Promise<NextResponse>;

/**
 * Route handler with authenticated user
 */
type AuthenticatedRouteHandler = (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: RouteContext
) => Promise<NextResponse>;

/**
 * Middleware options
 */
interface MiddlewareOptions {
  /** Require authentication (default: true) */
  auth?: boolean;
  /** Required roles (empty = any authenticated role) */
  roles?: UserRole[];
  /** Custom middlewares to run */
  middlewares?: MiddlewareFn[];
}

/**
 * Wrap an API route handler with middleware
 * Provides authentication, role checking, and error handling
 */
export function withMiddleware(
  handler: RouteHandler | AuthenticatedRouteHandler,
  options: MiddlewareOptions = {}
) {
  const { auth = true, roles = [], middlewares = [] } = options;

  return async (
    request: NextRequest,
    context?: RouteContext
  ): Promise<NextResponse> => {
    try {
      let user: AuthenticatedUser | null = null;

      // Run authentication if required
      if (auth) {
        const authResult = await authenticateRequest(request);
        if ('error' in authResult) return authResult.error;
        user = authResult.user;
      }

      // Run role middleware if roles specified
      if (roles.length > 0 && user) {
        if (!roles.includes(user.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions', code: 'FORBIDDEN' },
            { status: 403 }
          );
        }
      }

      // Run custom middlewares
      for (const middleware of middlewares) {
        const result = await middleware(request);
        if (result) return result;
      }

      // Call the handler
      if (auth && user) {
        return await (handler as AuthenticatedRouteHandler)(request, user, context);
      }

      return await (handler as RouteHandler)(request, context);
    } catch (error) {
      return errorHandler(error);
    }
  };
}

/**
 * Wrap a handler that requires authentication
 * Provides the authenticated user directly to the handler
 */
export function withAuth(handler: AuthenticatedRouteHandler) {
  return withMiddleware(handler, { auth: true });
}

/**
 * Wrap a handler that requires brand role
 */
export function withBrand(handler: AuthenticatedRouteHandler) {
  return withMiddleware(handler, { auth: true, roles: ['BRAND', 'ADMIN'] });
}

/**
 * Wrap a handler that requires influencer role
 */
export function withInfluencer(handler: AuthenticatedRouteHandler) {
  return withMiddleware(handler, { auth: true, roles: ['INFLUENCER', 'ADMIN'] });
}

/**
 * Wrap a handler that requires admin role
 */
export function withAdmin(handler: AuthenticatedRouteHandler) {
  return withMiddleware(handler, { auth: true, roles: ['ADMIN'] });
}

/**
 * Wrap a public handler (no authentication required)
 */
export function withPublic(handler: RouteHandler) {
  return withMiddleware(handler, { auth: false });
}

/**
 * Helper to validate request body with Zod schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Helper to validate query parameters with Zod schema
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  return schema.parse(params);
}

/**
 * Helper to get pagination from query params
 */
export function getPagination(request: NextRequest): { page: number; pageSize: number } {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
  return { page, pageSize };
}

/**
 * Helper to create a success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Helper to create an error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    { error: message, code, details },
    { status }
  );
}

/**
 * Set authentication cookies on response
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token cookie (shorter lived)
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  // Refresh token cookie (longer lived, restricted path)
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 or 7 days
    path: '/api/auth',
  });

  return response;
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}
