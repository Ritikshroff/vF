import { NextRequest, NextResponse } from 'next/server';
import { getOAuthProvider } from '@/lib/auth/oauth';
import { generateUrlSafeToken } from '@/lib/auth/password';
import { errorHandler } from '@/middleware/error.middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

/**
 * GET /api/auth/google
 * Redirect to OAuth provider's authorization page
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { provider: providerName } = await context.params;
    const provider = getOAuthProvider(providerName);

    if (!provider) {
      return NextResponse.json(
        { error: `Unknown OAuth provider: ${providerName}`, code: 'INVALID_PROVIDER' },
        { status: 400 }
      );
    }

    // Generate CSRF state token
    const state = generateUrlSafeToken(32);

    // Build authorization URL
    const authUrl = provider.getAuthorizationUrl(state);

    // Redirect to provider with state cookie for CSRF protection
    const response = NextResponse.redirect(authUrl);

    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60, // 5 minutes
      path: '/api/auth',
    });

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}
