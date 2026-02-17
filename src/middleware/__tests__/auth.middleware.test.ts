import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mock dependencies ─────────────────────────────────────────────────────

const mockFindUnique = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const mockVerifyAccessToken = vi.fn();
const mockExtractBearerToken = vi.fn();

vi.mock('@/lib/auth/jwt', () => ({
  verifyAccessToken: (...args: unknown[]) => mockVerifyAccessToken(...args),
  extractBearerToken: (...args: unknown[]) => mockExtractBearerToken(...args),
}));

import {
  authMiddleware,
  optionalAuthMiddleware,
  getAuthUser,
  verifyOwnership,
  isAdmin,
  canAccessResource,
} from '@/middleware/auth.middleware';

// ─── authMiddleware ─────────────────────────────────────────────────────────

describe('authMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return 401 when no token present', async () => {
    mockExtractBearerToken.mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/test');
    const result = await authMiddleware(req);

    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(result!.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 when token is invalid', async () => {
    mockExtractBearerToken.mockReturnValue('bad-token');
    mockVerifyAccessToken.mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: 'Bearer bad-token' },
    });
    const result = await authMiddleware(req);

    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(result!.status).toBe(401);
    expect(body.code).toBe('INVALID_TOKEN');
  });

  it('should return 401 when user not found in DB', async () => {
    mockExtractBearerToken.mockReturnValue('valid-token');
    mockVerifyAccessToken.mockReturnValue({ sub: 'user-missing', email: 'a@b.com', role: 'BRAND' });
    mockFindUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const result = await authMiddleware(req);

    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(result!.status).toBe(401);
    expect(body.code).toBe('USER_NOT_FOUND');
  });

  it('should return 401 when user is deactivated', async () => {
    mockExtractBearerToken.mockReturnValue('valid-token');
    mockVerifyAccessToken.mockReturnValue({ sub: 'user-1', email: 'a@b.com', role: 'BRAND' });
    mockFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.com',
      role: 'BRAND',
      isActive: false,
      brand: { id: 'brand-1' },
      influencer: null,
    });

    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const result = await authMiddleware(req);

    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(result!.status).toBe(401);
    expect(body.code).toBe('ACCOUNT_DEACTIVATED');
  });

  it('should return null (success) for valid token and active user', async () => {
    mockExtractBearerToken.mockReturnValue('valid-token');
    mockVerifyAccessToken.mockReturnValue({ sub: 'user-1', email: 'brand@test.com', role: 'BRAND' });
    mockFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'brand@test.com',
      role: 'BRAND',
      isActive: true,
      brand: { id: 'brand-1' },
      influencer: null,
    });

    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const result = await authMiddleware(req);

    expect(result).toBeNull();
  });
});

// ─── optionalAuthMiddleware ─────────────────────────────────────────────────

describe('optionalAuthMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return null when no token present (doesnt fail)', async () => {
    mockExtractBearerToken.mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/public');
    const result = await optionalAuthMiddleware(req);

    expect(result).toBeNull();
  });

  it('should validate token when provided (delegates to authMiddleware)', async () => {
    mockExtractBearerToken.mockReturnValue('bad-token');
    mockVerifyAccessToken.mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/public', {
      headers: { authorization: 'Bearer bad-token' },
    });
    const result = await optionalAuthMiddleware(req);

    // Should return 401 because token is invalid
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});

// ─── getAuthUser ────────────────────────────────────────────────────────────

describe('getAuthUser', () => {
  it('should extract user from request headers', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-user-id': 'user-1',
        'x-user-email': 'test@example.com',
        'x-user-role': 'BRAND',
        'x-brand-id': 'brand-1',
      },
    });

    const user = getAuthUser(req);

    expect(user).not.toBeNull();
    expect(user!.id).toBe('user-1');
    expect(user!.email).toBe('test@example.com');
    expect(user!.role).toBe('BRAND');
    expect(user!.brandId).toBe('brand-1');
    expect(user!.influencerId).toBeUndefined();
  });

  it('should return null when required headers are missing', () => {
    const req = new NextRequest('http://localhost:3000/api/test');
    const user = getAuthUser(req);
    expect(user).toBeNull();
  });

  it('should extract influencerId when present', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-user-id': 'user-2',
        'x-user-email': 'inf@example.com',
        'x-user-role': 'INFLUENCER',
        'x-influencer-id': 'inf-1',
      },
    });

    const user = getAuthUser(req);
    expect(user!.influencerId).toBe('inf-1');
    expect(user!.brandId).toBeUndefined();
  });
});

// ─── verifyOwnership ────────────────────────────────────────────────────────

describe('verifyOwnership', () => {
  const brandUser = {
    id: 'user-1',
    email: 'brand@test.com',
    role: 'BRAND' as const,
    brandId: 'brand-1',
    influencerId: undefined,
  };

  const influencerUser = {
    id: 'user-2',
    email: 'inf@test.com',
    role: 'INFLUENCER' as const,
    brandId: undefined,
    influencerId: 'inf-1',
  };

  it('should return true for matching user ID', () => {
    expect(verifyOwnership(brandUser, 'user-1', 'user')).toBe(true);
  });

  it('should return false for non-matching user ID', () => {
    expect(verifyOwnership(brandUser, 'user-other', 'user')).toBe(false);
  });

  it('should return true for matching brand ID', () => {
    expect(verifyOwnership(brandUser, 'brand-1', 'brand')).toBe(true);
  });

  it('should return false for non-matching brand ID', () => {
    expect(verifyOwnership(brandUser, 'brand-other', 'brand')).toBe(false);
  });

  it('should return true for matching influencer ID', () => {
    expect(verifyOwnership(influencerUser, 'inf-1', 'influencer')).toBe(true);
  });

  it('should return false for non-matching influencer ID', () => {
    expect(verifyOwnership(influencerUser, 'inf-other', 'influencer')).toBe(false);
  });
});

// ─── isAdmin ────────────────────────────────────────────────────────────────

describe('isAdmin', () => {
  it('should return true for ADMIN role', () => {
    expect(isAdmin({ id: 'u1', email: 'a@b.com', role: 'ADMIN' as any })).toBe(true);
  });

  it('should return false for BRAND role', () => {
    expect(isAdmin({ id: 'u1', email: 'a@b.com', role: 'BRAND' as any })).toBe(false);
  });

  it('should return false for INFLUENCER role', () => {
    expect(isAdmin({ id: 'u1', email: 'a@b.com', role: 'INFLUENCER' as any })).toBe(false);
  });
});

// ─── canAccessResource ──────────────────────────────────────────────────────

describe('canAccessResource', () => {
  const adminUser = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' as any };
  const brandUser = { id: 'user-1', email: 'brand@test.com', role: 'BRAND' as any, brandId: 'brand-1' };

  it('should return true for admin (any resource)', () => {
    expect(canAccessResource(adminUser, 'any-id', 'brand')).toBe(true);
    expect(canAccessResource(adminUser, 'any-id', 'user')).toBe(true);
    expect(canAccessResource(adminUser, 'any-id', 'influencer')).toBe(true);
  });

  it('should return true for resource owner', () => {
    expect(canAccessResource(brandUser, 'brand-1', 'brand')).toBe(true);
  });

  it('should return false for non-owner non-admin', () => {
    expect(canAccessResource(brandUser, 'brand-other', 'brand')).toBe(false);
  });
});
