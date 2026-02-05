import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashToken } from '@/lib/auth/password';
import { verifyEmailSchema } from '@/validators/auth.schema';
import { errorHandler, ValidationError, NotFoundError } from '@/middleware/error.middleware';

/**
 * POST /api/auth/verify-email
 * Verify user's email address with token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token);

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token: tokenHash },
    });

    if (!verification) {
      throw new NotFoundError('Verification token');
    }

    // Check if already verified
    if (verification.verifiedAt) {
      return NextResponse.json({
        message: 'Email already verified',
        alreadyVerified: true,
      });
    }

    // Check if token expired
    if (verification.expiresAt < new Date()) {
      throw new ValidationError('Verification token has expired. Please request a new one.');
    }

    // Find and update user
    const user = await prisma.user.findUnique({
      where: { email: verification.email },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Update user and verification record in transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: 'Email verified successfully',
      email: verification.email,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * GET /api/auth/verify-email
 * Verify email via query parameter (for email link clicks)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    // Hash the token
    const tokenHash = hashToken(token);

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token: tokenHash },
    });

    if (!verification) {
      // Redirect to error page
      return NextResponse.redirect(
        new URL('/verify-email?error=invalid', request.url)
      );
    }

    if (verification.verifiedAt) {
      // Already verified, redirect to success
      return NextResponse.redirect(
        new URL('/verify-email?success=already', request.url)
      );
    }

    if (verification.expiresAt < new Date()) {
      // Token expired
      return NextResponse.redirect(
        new URL('/verify-email?error=expired', request.url)
      );
    }

    // Find and update user
    const user = await prisma.user.findUnique({
      where: { email: verification.email },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/verify-email?error=user-not-found', request.url)
      );
    }

    // Update user and verification
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/verify-email?success=true', request.url)
    );
  } catch (error) {
    return NextResponse.redirect(
      new URL('/verify-email?error=unknown', request.url)
    );
  }
}
