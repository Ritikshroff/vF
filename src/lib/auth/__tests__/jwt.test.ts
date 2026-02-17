import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenWithExpiry,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  generateTokenPair,
  extractBearerToken,
  TOKEN_EXPIRY,
  AccessTokenPayload,
  RefreshTokenPayload,
} from '@/lib/auth/jwt';

// Use the same secrets from the test setup
const ACCESS_SECRET = 'test-access-secret-key-for-testing-only';
const REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';

// ─── generateAccessToken ─────────────────────────────────────────────────────

describe('generateAccessToken', () => {
  it('should return a valid JWT string', () => {
    const token = generateAccessToken({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'BRAND' as UserRole,
    });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should embed the correct payload (sub, email, role)', () => {
    const token = generateAccessToken({
      sub: 'user-42',
      email: 'brand@viralfluencer.com',
      role: 'BRAND' as UserRole,
    });

    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

    expect(decoded.sub).toBe('user-42');
    expect(decoded.email).toBe('brand@viralfluencer.com');
    expect(decoded.role).toBe('BRAND');
  });

  it('should set iat and exp claims', () => {
    const token = generateAccessToken({
      sub: 'user-1',
      email: 'a@b.com',
      role: 'INFLUENCER' as UserRole,
    });

    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    // exp should be ~15 minutes (900s) after iat
    expect(decoded.exp! - decoded.iat!).toBe(900);
  });

  it('should produce tokens verifiable with the access secret only', () => {
    const token = generateAccessToken({
      sub: 'user-1',
      email: 'a@b.com',
      role: 'ADMIN' as UserRole,
    });

    // Correct secret works
    expect(() => jwt.verify(token, ACCESS_SECRET)).not.toThrow();

    // Wrong secret fails
    expect(() => jwt.verify(token, REFRESH_SECRET)).toThrow();
  });
});

// ─── generateRefreshToken ────────────────────────────────────────────────────

describe('generateRefreshToken', () => {
  it('should return a valid JWT string', () => {
    const token = generateRefreshToken({
      sub: 'user-1',
      sessionId: 'session-abc',
    });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should embed sub and sessionId in the payload', () => {
    const token = generateRefreshToken({
      sub: 'user-99',
      sessionId: 'sess-xyz',
    });

    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;

    expect(decoded.sub).toBe('user-99');
    expect(decoded.sessionId).toBe('sess-xyz');
  });

  it('should set expiry to 7 days (604800s)', () => {
    const token = generateRefreshToken({
      sub: 'user-1',
      sessionId: 'sess-1',
    });

    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;

    expect(decoded.exp! - decoded.iat!).toBe(7 * 24 * 60 * 60);
  });

  it('should produce tokens verifiable with the refresh secret only', () => {
    const token = generateRefreshToken({
      sub: 'user-1',
      sessionId: 'sess-1',
    });

    expect(() => jwt.verify(token, REFRESH_SECRET)).not.toThrow();
    expect(() => jwt.verify(token, ACCESS_SECRET)).toThrow();
  });
});

// ─── generateRefreshTokenWithExpiry ──────────────────────────────────────────

describe('generateRefreshTokenWithExpiry', () => {
  it('should respect a custom expiry in seconds', () => {
    const customExpiry = 3600; // 1 hour

    const token = generateRefreshTokenWithExpiry(
      { sub: 'user-1', sessionId: 'sess-1' },
      customExpiry
    );

    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;

    expect(decoded.exp! - decoded.iat!).toBe(customExpiry);
  });

  it('should work with 30-day expiry (remember me)', () => {
    const thirtyDays = 30 * 24 * 60 * 60;

    const token = generateRefreshTokenWithExpiry(
      { sub: 'user-1', sessionId: 'sess-1' },
      thirtyDays
    );

    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;

    expect(decoded.exp! - decoded.iat!).toBe(thirtyDays);
  });
});

// ─── verifyAccessToken ───────────────────────────────────────────────────────

describe('verifyAccessToken', () => {
  it('should return payload for a valid access token', () => {
    const token = generateAccessToken({
      sub: 'user-5',
      email: 'test@test.com',
      role: 'INFLUENCER' as UserRole,
    });

    const payload = verifyAccessToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user-5');
    expect(payload!.email).toBe('test@test.com');
    expect(payload!.role).toBe('INFLUENCER');
  });

  it('should return null for an invalid token', () => {
    expect(verifyAccessToken('totally.invalid.token')).toBeNull();
  });

  it('should return null for a token signed with the wrong secret', () => {
    const token = jwt.sign({ sub: 'user-1' }, 'wrong-secret', {
      expiresIn: 900,
    });

    expect(verifyAccessToken(token)).toBeNull();
  });

  it('should return null for an expired token', () => {
    // Create a token that expired 10 seconds ago
    const token = jwt.sign(
      { sub: 'user-1', email: 'a@b.com', role: 'ADMIN' },
      ACCESS_SECRET,
      { expiresIn: -10 }
    );

    expect(verifyAccessToken(token)).toBeNull();
  });

  it('should return null for a refresh token (wrong secret)', () => {
    const refreshToken = generateRefreshToken({
      sub: 'user-1',
      sessionId: 'sess-1',
    });

    expect(verifyAccessToken(refreshToken)).toBeNull();
  });
});

// ─── verifyRefreshToken ──────────────────────────────────────────────────────

describe('verifyRefreshToken', () => {
  it('should return payload for a valid refresh token', () => {
    const token = generateRefreshToken({
      sub: 'user-7',
      sessionId: 'sess-abc',
    });

    const payload = verifyRefreshToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user-7');
    expect(payload!.sessionId).toBe('sess-abc');
  });

  it('should return null for an invalid token', () => {
    expect(verifyRefreshToken('garbage-token')).toBeNull();
  });

  it('should return null for a token signed with the wrong secret', () => {
    const token = jwt.sign({ sub: 'user-1' }, 'wrong-secret', {
      expiresIn: 3600,
    });

    expect(verifyRefreshToken(token)).toBeNull();
  });

  it('should return null for an expired refresh token', () => {
    const token = jwt.sign(
      { sub: 'user-1', sessionId: 'sess-1' },
      REFRESH_SECRET,
      { expiresIn: -10 }
    );

    expect(verifyRefreshToken(token)).toBeNull();
  });

  it('should return null for an access token (wrong secret)', () => {
    const accessToken = generateAccessToken({
      sub: 'user-1',
      email: 'a@b.com',
      role: 'BRAND' as UserRole,
    });

    expect(verifyRefreshToken(accessToken)).toBeNull();
  });
});

// ─── decodeToken ─────────────────────────────────────────────────────────────

describe('decodeToken', () => {
  it('should decode a valid access token without verification', () => {
    const token = generateAccessToken({
      sub: 'user-10',
      email: 'decode@test.com',
      role: 'ADMIN' as UserRole,
    });

    const decoded = decodeToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe('user-10');
    expect((decoded as AccessTokenPayload).email).toBe('decode@test.com');
  });

  it('should decode a valid refresh token without verification', () => {
    const token = generateRefreshToken({
      sub: 'user-11',
      sessionId: 'sess-decode',
    });

    const decoded = decodeToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe('user-11');
    expect((decoded as RefreshTokenPayload).sessionId).toBe('sess-decode');
  });

  it('should decode an expired token (no verification)', () => {
    const token = jwt.sign(
      { sub: 'user-expired', email: 'expired@test.com', role: 'BRAND' },
      ACCESS_SECRET,
      { expiresIn: -10 }
    );

    // verify would fail, but decode should work
    expect(verifyAccessToken(token)).toBeNull();

    const decoded = decodeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe('user-expired');
  });

  it('should return null for completely malformed input', () => {
    // jwt.decode returns null for invalid strings, not throw
    const decoded = decodeToken('not-a-jwt');
    expect(decoded).toBeNull();
  });
});

// ─── isTokenExpired ──────────────────────────────────────────────────────────

describe('isTokenExpired', () => {
  it('should return false for a freshly generated access token', () => {
    const token = generateAccessToken({
      sub: 'user-1',
      email: 'a@b.com',
      role: 'BRAND' as UserRole,
    });

    expect(isTokenExpired(token)).toBe(false);
  });

  it('should return true for an expired token', () => {
    const token = jwt.sign(
      { sub: 'user-1', email: 'a@b.com', role: 'BRAND' },
      ACCESS_SECRET,
      { expiresIn: -10 }
    );

    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return true for a malformed token', () => {
    expect(isTokenExpired('not-a-token')).toBe(true);
  });

  it('should return true for a token without an exp claim', () => {
    // Sign without expiresIn to omit the exp claim
    const token = jwt.sign({ sub: 'user-1' }, ACCESS_SECRET);
    // jwt.sign without expiresIn actually still won't include exp
    // unless we explicitly pass it; let's force no exp by using a manual payload
    const noExpToken = jwt.sign(
      { sub: 'user-1', iat: Math.floor(Date.now() / 1000) },
      ACCESS_SECRET,
      { noTimestamp: true }
    );

    // This token has iat but no exp; the function checks decoded.exp
    // jwt.sign with noTimestamp:true and an explicit iat but no exp should work
    // Actually, jwt.sign always adds iat unless noTimestamp.
    // Let's just create a token with payload { sub: 'x' } only.
    const bareToken = jwt.sign({ sub: 'user-1' }, ACCESS_SECRET, {
      noTimestamp: true,
    });

    expect(isTokenExpired(bareToken)).toBe(true);
  });
});

// ─── generateTokenPair ───────────────────────────────────────────────────────

describe('generateTokenPair', () => {
  it('should return an object with accessToken, refreshToken, and both expiry dates', () => {
    const pair = generateTokenPair(
      'user-100',
      'pair@test.com',
      'BRAND' as UserRole,
      'session-pair'
    );

    expect(pair).toHaveProperty('accessToken');
    expect(pair).toHaveProperty('refreshToken');
    expect(pair).toHaveProperty('accessTokenExpiresAt');
    expect(pair).toHaveProperty('refreshTokenExpiresAt');
    expect(typeof pair.accessToken).toBe('string');
    expect(typeof pair.refreshToken).toBe('string');
    expect(pair.accessTokenExpiresAt).toBeInstanceOf(Date);
    expect(pair.refreshTokenExpiresAt).toBeInstanceOf(Date);
  });

  it('should produce a valid access token with correct payload', () => {
    const pair = generateTokenPair(
      'user-100',
      'pair@test.com',
      'INFLUENCER' as UserRole,
      'session-pair'
    );

    const payload = verifyAccessToken(pair.accessToken);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user-100');
    expect(payload!.email).toBe('pair@test.com');
    expect(payload!.role).toBe('INFLUENCER');
  });

  it('should produce a valid refresh token with correct payload', () => {
    const pair = generateTokenPair(
      'user-100',
      'pair@test.com',
      'ADMIN' as UserRole,
      'session-xyz'
    );

    const payload = verifyRefreshToken(pair.refreshToken);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user-100');
    expect(payload!.sessionId).toBe('session-xyz');
  });

  it('should use 7-day refresh expiry by default (rememberMe = false)', () => {
    const now = Date.now();
    const pair = generateTokenPair(
      'user-1',
      'a@b.com',
      'BRAND' as UserRole,
      'sess-1'
    );

    const refreshPayload = verifyRefreshToken(pair.refreshToken)!;
    expect(refreshPayload.exp! - refreshPayload.iat!).toBe(7 * 24 * 60 * 60);

    // The refreshTokenExpiresAt date should be ~7 days from now
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const diff = pair.refreshTokenExpiresAt.getTime() - now;
    expect(diff).toBeGreaterThan(sevenDaysMs - 5000);
    expect(diff).toBeLessThanOrEqual(sevenDaysMs + 5000);
  });

  it('should use 30-day refresh expiry when rememberMe is true', () => {
    const now = Date.now();
    const pair = generateTokenPair(
      'user-1',
      'a@b.com',
      'BRAND' as UserRole,
      'sess-1',
      true // rememberMe
    );

    const refreshPayload = verifyRefreshToken(pair.refreshToken)!;
    expect(refreshPayload.exp! - refreshPayload.iat!).toBe(30 * 24 * 60 * 60);

    // The refreshTokenExpiresAt date should be ~30 days from now
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const diff = pair.refreshTokenExpiresAt.getTime() - now;
    expect(diff).toBeGreaterThan(thirtyDaysMs - 5000);
    expect(diff).toBeLessThanOrEqual(thirtyDaysMs + 5000);
  });

  it('should set accessTokenExpiresAt to ~15 minutes from now', () => {
    const now = Date.now();
    const pair = generateTokenPair(
      'user-1',
      'a@b.com',
      'BRAND' as UserRole,
      'sess-1'
    );

    const fifteenMinMs = 15 * 60 * 1000;
    const diff = pair.accessTokenExpiresAt.getTime() - now;
    expect(diff).toBeGreaterThan(fifteenMinMs - 5000);
    expect(diff).toBeLessThanOrEqual(fifteenMinMs + 5000);
  });
});

// ─── extractBearerToken ──────────────────────────────────────────────────────

describe('extractBearerToken', () => {
  it('should extract the token from a valid Bearer header', () => {
    expect(extractBearerToken('Bearer my-jwt-token')).toBe('my-jwt-token');
  });

  it('should handle tokens with dots (real JWTs)', () => {
    const realToken = 'eyJhbGciOi.eyJzdWIi.SflKxwRJ';
    expect(extractBearerToken(`Bearer ${realToken}`)).toBe(realToken);
  });

  it('should return null when header is null', () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it('should return null when header is empty string', () => {
    expect(extractBearerToken('')).toBeNull();
  });

  it('should return null when header does not start with "Bearer "', () => {
    expect(extractBearerToken('Basic abc123')).toBeNull();
    expect(extractBearerToken('Token abc123')).toBeNull();
    expect(extractBearerToken('bearer token')).toBeNull(); // lowercase
  });

  it('should return null for "Bearer" without a space and token', () => {
    expect(extractBearerToken('Bearer')).toBeNull();
  });

  it('should return empty string for "Bearer " with trailing space but no token', () => {
    // "Bearer ".slice(7) is ""
    expect(extractBearerToken('Bearer ')).toBe('');
  });
});

// ─── TOKEN_EXPIRY constants ──────────────────────────────────────────────────

describe('TOKEN_EXPIRY', () => {
  it('should have ACCESS set to 15 minutes in milliseconds', () => {
    expect(TOKEN_EXPIRY.ACCESS).toBe(15 * 60 * 1000);
  });

  it('should have REFRESH set to 7 days in milliseconds', () => {
    expect(TOKEN_EXPIRY.REFRESH).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('should have REFRESH_REMEMBER set to 30 days in milliseconds', () => {
    expect(TOKEN_EXPIRY.REFRESH_REMEMBER).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('should have PASSWORD_RESET set to 1 hour in milliseconds', () => {
    expect(TOKEN_EXPIRY.PASSWORD_RESET).toBe(60 * 60 * 1000);
  });

  it('should have EMAIL_VERIFICATION set to 24 hours in milliseconds', () => {
    expect(TOKEN_EXPIRY.EMAIL_VERIFICATION).toBe(24 * 60 * 60 * 1000);
  });
});
