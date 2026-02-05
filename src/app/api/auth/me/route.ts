import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, validateBody } from '@/lib/api/with-middleware';
import { updateProfileSchema } from '@/validators/auth.schema';
import { AuthenticatedUser } from '@/middleware/auth.middleware';
import { errorHandler, NotFoundError } from '@/middleware/error.middleware';

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        emailVerified: true,
        onboardingCompleted: true,
        lastLoginAt: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            companyName: true,
            logo: true,
            industry: true,
            verified: true,
          },
        },
        influencer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            verified: true,
            rating: true,
            totalCampaigns: true,
          },
        },
      },
    });

    if (!fullUser) {
      throw new NotFoundError('User');
    }

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    return errorHandler(error);
  }
});

/**
 * PUT /api/auth/me
 * Update current user's profile
 */
export const PUT = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const data = await validateBody(request, updateProfileSchema);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return errorHandler(error);
  }
});

/**
 * DELETE /api/auth/me
 * Delete current user's account
 */
export const DELETE = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Soft delete by deactivating account
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      message: 'Account has been deactivated',
    });
  } catch (error) {
    return errorHandler(error);
  }
});
