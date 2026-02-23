/**
 * Provider-agnostic OAuth interfaces
 * Add new providers (GitHub, Apple, etc.) by implementing OAuthProvider
 */

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  idToken?: string;
  scope?: string;
}

export interface OAuthProvider {
  name: string;
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<{ profile: OAuthProfile; tokens: OAuthTokens }>;
}
