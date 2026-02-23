import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyRefreshToken, generateAccessToken, generateTokenPair } from '@/lib/auth/jwt';
import { errorHandler, AuthenticationError } from '@/middleware/error.middleware';
import { setAuthCookies } from '@/lib/api/with-middleware';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const cookieToken = request.cookies.get('refresh_token')?.value;
    let refreshToken = cookieToken;

    // If not in cookie, try body
    if (!refreshToken) {
      try {
        const body = await request.json();
        refreshToken = body.refreshToken;
      } catch {
        // Body parsing failed, that's okay if we have cookie
      }
    }

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Find session in database
    const session = await prisma.session.findFirst({
      where: {
        userId: payload.sub,
        refreshToken: refreshToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            brand: { select: { id: true } },
            influencer: { select: { id: true } },
          },
        },
      },
    });

    if (!session) {
      throw new AuthenticationError('Session not found or expired');
    }

    if (!session.user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role!,
    });

    // Update session with new access token
    await prisma.session.update({
      where: { id: session.id },
      data: { token: newAccessToken },
    });

    // Calculate expiry
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Prepare response
    const responseData = {
      accessToken: newAccessToken,
      expiresAt: accessTokenExpiresAt.toISOString(),
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        brandId: session.user.brand?.id,
        influencerId: session.user.influencer?.id,
      },
    };

    const response = NextResponse.json(responseData, { status: 200 });

    // Update access token cookie
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}
