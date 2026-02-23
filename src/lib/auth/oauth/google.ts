import { OAuth2Client } from 'google-auth-library';
import { OAuthProvider, OAuthProfile, OAuthTokens } from './types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

function getClient() {
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export const googleOAuthProvider: OAuthProvider = {
  name: 'GOOGLE',

  getAuthorizationUrl(state: string): string {
    const client = getClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'consent',
    });
  },

  async exchangeCode(code: string): Promise<{ profile: OAuthProfile; tokens: OAuthTokens }> {
    const client = getClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload()!;

    const profile: OAuthProfile = {
      provider: 'GOOGLE',
      providerId: payload.sub,
      email: payload.email!,
      name: payload.name || payload.email!,
      avatar: payload.picture,
      emailVerified: payload.email_verified ?? false,
    };

    const oauthTokens: OAuthTokens = {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? undefined,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      idToken: tokens.id_token ?? undefined,
      scope: tokens.scope ?? undefined,
    };

    return { profile, tokens: oauthTokens };
  },
};
