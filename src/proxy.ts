import { NextRequest, NextResponse } from 'next/server';

/**
 * Root proxy for Viralfluencer
 * Handles: route protection, rate limiting headers, security
 *
 * Note: This is an Edge proxy - it runs BEFORE the request reaches
 * the API route or page. Keep it lightweight (no Prisma, no heavy imports).
 * Detailed auth checks happen in the API-level middleware (withAuth, etc.)
 */

// Routes that require authentication (redirect to login if no token)
const PROTECTED_ROUTES = ['/brand', '/influencer', '/feed', '/marketplace', '/subscriptions'];

// Routes that authenticated users shouldn't access (redirect to dashboard)
const AUTH_ROUTES = ['/login', '/sign-up', '/forgot-password'];

// API routes that are public (no token needed)
const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/verify-email',
  '/api/auth/reset-password',
];

// Rate limit config (in-memory, per-IP)
// In production, replace with Redis/Upstash for distributed rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP
const AUTH_RATE_LIMIT_MAX = 10; // 10 auth attempts per minute per IP

// In-memory rate limit store (cleared on restart, suitable for single-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string, prefix: string = ''): string {
  return `${prefix}:${ip}`;
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { allowed: entry.count <= maxRequests, remaining, resetTime: entry.resetTime };
}

// Periodically clean up expired entries (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // --- Rate Limiting ---
  if (pathname.startsWith('/api/')) {
    const isAuthRoute = pathname.startsWith('/api/auth/');
    const maxRequests = isAuthRoute ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
    const prefix = isAuthRoute ? 'auth' : 'api';
    const key = getRateLimitKey(ip, prefix);
    const { allowed, remaining, resetTime } = checkRateLimit(key, maxRequests);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        }
      );
    }

    // For API routes, just add rate limit headers and continue
    // (API-level middleware handles auth)
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
    return response;
  }

  // --- Route Protection (Pages) ---
  const hasToken = request.cookies.has('access_token');

  // Protected routes: redirect to login if no token
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes: redirect to dashboard if already logged in
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && hasToken) {
    // We don't know the role here (can't decode JWT in edge without importing jsonwebtoken)
    // so redirect to a generic page. The page itself can handle role-based redirects.
    return NextResponse.redirect(new URL('/brand/dashboard', request.url));
  }

  // Onboarding routes: must be authenticated
  if (pathname.startsWith('/onboarding') && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
};
