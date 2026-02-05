import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, hashToken } from '@/lib/auth/password';
import { resetPasswordSchema } from '@/validators/auth.schema';
import { errorHandler, ValidationError, NotFoundError } from '@/middleware/error.middleware';

/**
 * POST /api/auth/reset-password
 * Reset password using reset token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token);

    // Find reset record
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new NotFoundError('Reset token');
    }

    // Check if already used
    if (resetRecord.usedAt) {
      throw new ValidationError('This reset link has already been used');
    }

    // Check if expired
    if (resetRecord.expiresAt < new Date()) {
      throw new ValidationError('This reset link has expired. Please request a new one.');
    }

    // Check if user is active
    if (!resetRecord.user.isActive) {
      throw new ValidationError('This account has been deactivated');
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and mark token as used in transaction
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      // Mark token as used
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all existing sessions (force re-login)
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return NextResponse.json({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * GET /api/auth/reset-password
 * Verify reset token is valid (for frontend validation)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      throw new ValidationError('Reset token is required');
    }

    // Hash the token
    const tokenHash = hashToken(token);

    // Find reset record
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: tokenHash },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { valid: false, error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { valid: false, error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return errorHandler(error);
  }
}
