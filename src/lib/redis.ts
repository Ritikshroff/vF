/**
 * Redis Caching Layer using Upstash
 * Provides typed cache operations with automatic serialization
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// Lazy initialization
let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    }

    redisClient = new Redis({ url, token });
  }
  return redisClient;
}

// ─── Cache Prefixes ─────────────────────────────────────────────────────────

export const CachePrefix = {
  USER: 'user:',
  SESSION: 'session:',
  WALLET: 'wallet:',
  SUBSCRIPTION: 'sub:',
  ANALYTICS: 'analytics:',
  RATE_LIMIT: 'rl:',
  FEED: 'feed:',
  MARKETPLACE: 'marketplace:',
} as const;

// ─── TTL Presets (seconds) ──────────────────────────────────────────────────

export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
  SESSION: 1800,       // 30 minutes
} as const;

// ─── Core Operations ────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    logger.warn('Redis GET failed, returning null', { key, error });
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    const redis = getRedis();
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    logger.warn('Redis SET failed', { key, error });
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    const redis = getRedis();
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.warn('Redis DEL failed', { keys, error });
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    logger.warn('Redis EXISTS failed', { key, error });
    return false;
  }
}

// ─── Pattern-based Invalidation ─────────────────────────────────────────────

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info('Cache invalidated', { pattern, keysCleared: keys.length });
    }
  } catch (error) {
    logger.warn('Redis pattern invalidation failed', { pattern, error });
  }
}

// ─── Cache-Aside Pattern ────────────────────────────────────────────────────

export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from source
  const value = await fetcher();

  // Store in cache (fire and forget)
  cacheSet(key, value, ttlSeconds);

  return value;
}

// ─── Rate Limiting (distributed) ────────────────────────────────────────────

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  try {
    const redis = getRedis();
    const key = `${CachePrefix.RATE_LIMIT}${identifier}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Use a sliding window with sorted sets
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zadd(key, { score: now, member: `${now}` });
    pipeline.zcard(key);
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();
    const count = (results[2] as number) || 0;

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const resetAt = new Date(now + windowMs);

    return { allowed, remaining, resetAt };
  } catch (error) {
    logger.warn('Redis rate limit check failed, allowing request', { identifier, error });
    return { allowed: true, remaining: limit, resetAt: new Date(Date.now() + windowSeconds * 1000) };
  }
}

// ─── Session Store ──────────────────────────────────────────────────────────

export async function setSession(sessionId: string, data: Record<string, unknown>, ttlSeconds = CacheTTL.SESSION): Promise<void> {
  const key = `${CachePrefix.SESSION}${sessionId}`;
  await cacheSet(key, data, ttlSeconds);
}

export async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const key = `${CachePrefix.SESSION}${sessionId}`;
  return cacheGet<Record<string, unknown>>(key);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const key = `${CachePrefix.SESSION}${sessionId}`;
  await cacheDel(key);
}

// ─── Convenience: User Cache ────────────────────────────────────────────────

export async function cacheUser<T>(userId: string, data: T, ttlSeconds = CacheTTL.MEDIUM): Promise<void> {
  await cacheSet(`${CachePrefix.USER}${userId}`, data, ttlSeconds);
}

export async function getCachedUser<T>(userId: string): Promise<T | null> {
  return cacheGet<T>(`${CachePrefix.USER}${userId}`);
}

export async function invalidateUserCache(userId: string): Promise<void> {
  await cacheDel(`${CachePrefix.USER}${userId}`);
}
