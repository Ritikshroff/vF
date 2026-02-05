import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateSecureToken, hashToken } from '@/lib/auth/password';
import { TOKEN_EXPIRY } from '@/lib/auth/jwt';
import { forgotPasswordSchema } from '@/validators/auth.schema';
import { errorHandler } from '@/middleware/error.middleware';

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user (don't reveal if user exists)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
    });

    if (!user) {
      // User doesn't exist, but return success anyway
      return successResponse;
    }

    if (!user.isActive) {
      // Account deactivated, return success anyway
      return successResponse;
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Generate reset token
    const resetToken = generateSecureToken();
    const tokenHash = hashToken(resetToken);

    // Store hashed token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET),
      },
    });

    // TODO: Send password reset email
    // In production, integrate with email service
    console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

    // In development, include token in response
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link.',
        resetToken, // Only in development!
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
      });
    }

    return successResponse;
  } catch (error) {
    return errorHandler(error);
  }
}
