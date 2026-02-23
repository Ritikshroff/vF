import { OAuthProvider } from './types';
import { googleOAuthProvider } from './google';

const providers: Record<string, OAuthProvider> = {
  google: googleOAuthProvider,
};

export function getOAuthProvider(providerName: string): OAuthProvider | null {
  return providers[providerName.toLowerCase()] ?? null;
}

export type { OAuthProvider, OAuthProfile, OAuthTokens } from './types';
