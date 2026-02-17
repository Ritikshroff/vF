import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { generateSecureToken, hashToken } from '@/lib/auth/password';
import { TOKEN_EXPIRY } from '@/lib/auth/jwt';
import { registerSchema } from '@/validators/auth.schema';
import { errorHandler, ConflictError } from '@/middleware/error.middleware';
import { audit, getClientInfo } from '@/lib/audit';

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash the password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user (role will be set during onboarding)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        role: validatedData.role || 'BRAND', // Default to BRAND, can be changed in onboarding
        emailVerified: false,
        onboardingCompleted: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const tokenHash = hashToken(verificationToken);

    await prisma.emailVerification.create({
      data: {
        email: user.email,
        token: tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION),
      },
    });

    // TODO: Send verification email
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[DEV] Verification token for ${user.email}: ${verificationToken}`);

    audit({ action: 'auth.register', userId: user.id, ...getClientInfo(request) });

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
        },
        // Include token in response for development
        ...(process.env.NODE_ENV === 'development' && {
          verificationToken,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
