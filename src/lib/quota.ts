import { Redis } from "@upstash/redis";

function createRedisClient(): Redis | null {
  try {
    return Redis.fromEnv();
  } catch {
    console.warn("Redis environment variables not configured. Using in-memory fallback.");
    return null;
  }
}

const redis = createRedisClient();

const DAILY_FREE_LIMIT = 3;
export const BONUS_CREDITS = 10;

// In-memory fallback for local dev when Redis is unavailable
const memoryStore = new Map<string, number | Record<string, any>>();

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getQuotaKey(ip: string, date: string): string {
  return `quota:${ip}:${date}`;
}

export function getBonusKey(email: string, ip: string, date: string): string {
  return `bonus:${email.toLowerCase().trim()}:${ip}:${date}`;
}

export function getRateLimitKey(ip: string): string {
  const minute = Math.floor(Date.now() / 60000);
  return `rate:${ip}:${minute}`;
}

export function getCacheKey(hash: string): string {
  return `cache:${hash}`;
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (redis) {
    return await redis.get<T>(key);
  }
  const value = memoryStore.get(key);
  return value !== undefined ? (value as T) : null;
}

async function kvIncr(key: string): Promise<number> {
  if (redis) {
    return await redis.incr(key);
  }
  const current = (memoryStore.get(key) as number | undefined) || 0;
  memoryStore.set(key, current + 1);
  return current + 1;
}

async function kvDecr(key: string): Promise<void> {
  if (redis) {
    await redis.decr(key);
    return;
  }
  const current = (memoryStore.get(key) as number | undefined) || 0;
  memoryStore.set(key, Math.max(0, current - 1));
}

async function kvExpire(key: string, seconds: number): Promise<void> {
  if (redis) {
    await redis.expire(key, seconds);
    return;
  }
  // Memory fallback: keep for the session; dev only
}

async function kvTtl(key: string): Promise<number> {
  if (redis) {
    return await redis.ttl(key);
  }
  return 60;
}

async function kvSet(
  key: string,
  value: number | Record<string, any>,
  options?: { ex: number }
): Promise<void> {
  if (redis) {
    await redis.set(key, value, options);
    return;
  }
  memoryStore.set(key, value);
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const key = getRateLimitKey(ip);
    const current = await kvIncr(key);
    if (current === 1) {
      await kvExpire(key, 60);
    }
    if (current > 10) {
      const ttl = await kvTtl(key);
      return { allowed: false, retryAfter: ttl > 0 ? ttl : 60 };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export async function getRemainingQuota(ip: string, email?: string): Promise<number> {
  try {
    const date = getTodayKey();
    const used = (await kvGet<number>(getQuotaKey(ip, date))) || 0;
    const remaining = DAILY_FREE_LIMIT - used;
    if (remaining > 0) return remaining;

    if (email) {
      const bonus = (await kvGet<number>(getBonusKey(email, ip, date))) || 0;
      return bonus;
    }
    return 0;
  } catch {
    return DAILY_FREE_LIMIT;
  }
}

export async function consumeQuota(ip: string, email?: string): Promise<void> {
  const date = getTodayKey();
  const quotaKey = getQuotaKey(ip, date);
  const used = (await kvGet<number>(quotaKey)) || 0;

  if (used < DAILY_FREE_LIMIT) {
    await kvIncr(quotaKey);
    if (used === 0) {
      await kvExpire(quotaKey, 86400);
    }
    return;
  }

  if (email) {
    const bonusKey = getBonusKey(email, ip, date);
    const bonus = (await kvGet<number>(bonusKey)) || 0;
    if (bonus > 0) {
      await kvDecr(bonusKey);
      return;
    }
  }

  throw new Error("QUOTA_EXHAUSTED");
}

export async function grantBonusCredits(email: string, ip: string): Promise<void> {
  const date = getTodayKey();
  const key = getBonusKey(email, ip, date);
  await kvSet(key, BONUS_CREDITS, { ex: 86400 });
}

export async function getCachedResult(hash: string): Promise<Record<string, any> | null> {
  try {
    return await kvGet<Record<string, any>>(getCacheKey(hash));
  } catch {
    return null;
  }
}

export async function setCachedResult(
  hash: string,
  result: Record<string, any>
): Promise<void> {
  try {
    await kvSet(getCacheKey(hash), result, { ex: 86400 });
  } catch {
    // ignore cache write failures
  }
}
