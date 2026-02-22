import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = 15 * 60;            // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 24 * 60 * 60;       // 24 hours in seconds

// Token payload interfaces
export interface AccessTokenPayload {
  sub: string;       // User ID
  email: string;
  role: UserRole;
  iat?: number;      // Issued at
  exp?: number;      // Expires
}

export interface RefreshTokenPayload {
  sub: string;       // User ID
  sessionId: string; // Session ID for revocation
  iat?: number;
  exp?: number;
}

// Token generation
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function generateRefreshTokenWithExpiry(
  payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
  expiresIn: number
): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn,
  });
}

// Token verification
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return payload;
  } catch {
    return null;
  }
}

// Token decoding (without verification - useful for getting expired token data)
export function decodeToken(token: string): AccessTokenPayload | RefreshTokenPayload | null {
  try {
    return jwt.decode(token) as AccessTokenPayload | RefreshTokenPayload | null;
  } catch {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

// Generate token pair for login
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export function generateTokenPair(
  userId: string,
  email: string,
  role: UserRole,
  sessionId: string,
  rememberMe: boolean = false
): TokenPair {
  const accessToken = generateAccessToken({ sub: userId, email, role });

  // Use longer expiry for "remember me"
  const refreshExpiresIn = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
  const refreshToken = generateRefreshTokenWithExpiry(
    { sub: userId, sessionId },
    refreshExpiresIn
  );

  // Calculate expiry dates
  const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const refreshTokenExpiresAt = new Date(
    Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) // 30 days or 24 hours
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
}

// Extract token from Authorization header
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

// Token expiry constants (in milliseconds)
export const TOKEN_EXPIRY = {
  ACCESS: 15 * 60 * 1000,           // 15 minutes
  REFRESH: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_REMEMBER: 30 * 24 * 60 * 60 * 1000, // 30 days
  PASSWORD_RESET: 60 * 60 * 1000,   // 1 hour
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
};
