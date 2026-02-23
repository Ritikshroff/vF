import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getOAuthProvider } from '@/lib/auth/oauth';
import { generateTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/api/with-middleware';
import { audit, getClientInfo } from '@/lib/audit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback — exchange code, create/find user, issue JWT, redirect
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { provider: providerName } = await context.params;
    const provider = getOAuthProvider(providerName);

    if (!provider) {
      return NextResponse.redirect(`${BASE_URL}/login?error=unknown_provider`);
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    // Handle user denial on Google consent screen
    if (errorParam) {
      return NextResponse.redirect(`${BASE_URL}/login?error=oauth_denied`);
    }

    // CSRF validation: state param must match cookie
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(`${BASE_URL}/login?error=invalid_state`);
    }

    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/login?error=no_code`);
    }

    // Exchange authorization code for tokens + profile
    const { profile, tokens: oauthTokens } = await provider.exchangeCode(code);
    const clientInfo = getClientInfo(request);

    // Look up existing user by email OR by provider ID
    let existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
      include: {
        brand: { select: { id: true } },
        influencer: { select: { id: true } },
      },
    });

    // Also check by googleId in case email changed on Google side
    if (!existingUser && providerName === 'google') {
      existingUser = await prisma.user.findUnique({
        where: { googleId: profile.providerId },
        include: {
          brand: { select: { id: true } },
          influencer: { select: { id: true } },
        },
      });
    }

    let user;
    let isNewUser = false;

    if (existingUser) {
      // CASE 1: Existing user — link/update Google account
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: existingUser.googleId ?? profile.providerId,
          ...(existingUser.authProvider === 'LOCAL' && { authProvider: 'LOCAL' }),
          ...(profile.emailVerified && !existingUser.emailVerified && {
            emailVerified: true,
            emailVerifiedAt: new Date(),
          }),
          avatar: existingUser.avatar ?? profile.avatar ?? undefined,
          lastLoginAt: new Date(),
        },
        include: {
          brand: { select: { id: true } },
          influencer: { select: { id: true } },
        },
      });

      audit({
        action: 'auth.login',
        userId: user.id,
        ...clientInfo,
        metadata: { provider: providerName, method: 'oauth' },
      });
    } else {
      // CASE 2: New user — create with no password, no role yet
      user = await prisma.user.create({
        data: {
          email: profile.email,
          passwordHash: null,
          name: profile.name,
          role: null,
          authProvider: provider.name,
          googleId: profile.providerId,
          emailVerified: profile.emailVerified,
          emailVerifiedAt: profile.emailVerified ? new Date() : null,
          avatar: profile.avatar,
          lastLoginAt: new Date(),
        },
        include: {
          brand: { select: { id: true } },
          influencer: { select: { id: true } },
        },
      });

      isNewUser = true;
      audit({
        action: 'auth.register',
        userId: user.id,
        ...clientInfo,
        metadata: { provider: providerName, method: 'oauth' },
      });
    }

    // Store OAuth tokens in ConnectedApp for future API access
    await prisma.connectedApp.upsert({
      where: {
        userId_appName: { userId: user.id, appName: provider.name },
      },
      update: {
        accessToken: oauthTokens.accessToken,
        refreshToken: oauthTokens.refreshToken,
        expiresAt: oauthTokens.expiresAt,
        isActive: true,
      },
      create: {
        userId: user.id,
        appName: provider.name,
        accessToken: oauthTokens.accessToken,
        refreshToken: oauthTokens.refreshToken,
        expiresAt: oauthTokens.expiresAt,
      },
    });

    // Generate JWT pair and create session (same as normal login)
    // For new users with null role, use a temporary value — the real check happens via DB in middleware
    const jwtRole = user.role ?? 'BRAND';
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      generateTokenPair(user.id, user.email, jwtRole, '', false);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        userAgent: request.headers.get('user-agent') ?? undefined,
        ipAddress: request.headers.get('x-forwarded-for')
          ?? request.headers.get('x-real-ip')
          ?? undefined,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Determine redirect path
    let redirectPath: string;
    if (isNewUser || !user.role) {
      redirectPath = '/select-role';
    } else if (!user.onboardingCompleted) {
      redirectPath = `/onboarding/${user.role.toLowerCase()}`;
    } else {
      redirectPath = `/${user.role.toLowerCase()}/dashboard`;
    }

    const response = NextResponse.redirect(`${BASE_URL}${redirectPath}`);
    setAuthCookies(response, accessToken, refreshToken, false);

    // Clear the CSRF state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${BASE_URL}/login?error=oauth_failed`);
  }
}
