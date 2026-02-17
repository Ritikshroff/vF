import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { comparePassword } from '@/lib/auth/password';
import { generateTokenPair } from '@/lib/auth/jwt';
import { loginSchema } from '@/validators/auth.schema';
import { errorHandler, AuthenticationError } from '@/middleware/error.middleware';
import { setAuthCookies } from '@/lib/api/with-middleware';
import { audit, getClientInfo } from '@/lib/audit';

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { email, password, rememberMe } = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        brand: { select: { id: true } },
        influencer: { select: { id: true } },
      },
    });

    const clientInfo = getClientInfo(request);

    if (!user) {
      audit({ action: 'auth.failed_login', ...clientInfo, metadata: { email, reason: 'user_not_found' } });
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      audit({ action: 'auth.failed_login', userId: user.id, ...clientInfo, metadata: { reason: 'deactivated' } });
      throw new AuthenticationError('This account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      audit({ action: 'auth.failed_login', userId: user.id, ...clientInfo, metadata: { reason: 'wrong_password' } });
      throw new AuthenticationError('Invalid email or password');
    }

    // Create session
    const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } =
      generateTokenPair(user.id, user.email, user.role, '', rememberMe);

    // Store session in database
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          undefined,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Prepare response
    const responseData = {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        brandId: user.brand?.id,
        influencerId: user.influencer?.id,
      },
      accessToken,
      expiresAt: accessTokenExpiresAt.toISOString(),
    };

    // Create response with cookies
    const response = NextResponse.json(responseData, { status: 200 });

    // Set HTTP-only cookies for tokens
    setAuthCookies(response, accessToken, refreshToken, rememberMe);

    audit({ action: 'auth.login', userId: user.id, ...clientInfo });

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}
