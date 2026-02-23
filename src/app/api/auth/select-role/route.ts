import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { withAuth, successResponse, validateBody } from '@/lib/api/with-middleware';
import { errorHandler, ValidationError } from '@/middleware/error.middleware';
import { AuthenticatedUser } from '@/middleware/auth.middleware';
import { generateTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/api/with-middleware';
import { audit, getClientInfo } from '@/lib/audit';

const selectRoleSchema = z.object({
  role: z.enum(['BRAND', 'INFLUENCER']),
});

/**
 * POST /api/auth/select-role
 * Set role for OAuth users who registered without one
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { role } = await validateBody(request, selectRoleSchema);

    // Verify user doesn't already have a role
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (currentUser?.role) {
      throw new ValidationError('Role has already been selected');
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        authProvider: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
    });

    // Regenerate JWT pair with the correct role
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      generateTokenPair(updatedUser.id, updatedUser.email, role, '', false);

    // Update existing session with new tokens
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: {
        token: accessToken,
        refreshToken,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    audit({
      action: 'user.role_change',
      userId: user.id,
      ...getClientInfo(request),
      metadata: { role, method: 'oauth_select' },
    });

    const response = successResponse({
      message: 'Role selected successfully',
      user: updatedUser,
    });

    setAuthCookies(response, accessToken, refreshToken, false);
    return response;
  } catch (error) {
    return errorHandler(error);
  }
});
