import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAccessToken, extractBearerToken } from '@/lib/auth/jwt';
import { errorHandler } from '@/middleware/error.middleware';
import { clearAuthCookies } from '@/lib/api/with-middleware';

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('access_token')?.value;
    const token = extractBearerToken(authHeader) || cookieToken;

    if (token) {
      // Verify token to get user ID
      const payload = verifyAccessToken(token);

      if (payload) {
        // Delete the session from database
        await prisma.session.deleteMany({
          where: {
            userId: payload.sub,
            token: token,
          },
        });
      }
    }

    // Prepare response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear authentication cookies
    clearAuthCookies(response);

    return response;
  } catch (error) {
    // Even if there's an error, we should clear cookies and return success
    // to ensure the user is logged out on the client side
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    clearAuthCookies(response);
    return response;
  }
}

/**
 * DELETE /api/auth/logout
 * Alternative logout endpoint (alias for POST)
 */
export async function DELETE(request: NextRequest) {
  return POST(request);
}
