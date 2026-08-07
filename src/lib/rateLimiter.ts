import { NextRequest } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitStore>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, store] of ipMap.entries()) {
      if (now > store.resetTime) {
        ipMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // max requests per window, default 10
  windowMs?: number; // time window in ms, default 60000 (1 min)
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }
  return '127.0.0.1';
}

export function checkRateLimit(req: NextRequest, options: RateLimitOptions = {}): {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
} {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60 * 1000;

  const ip = getClientIp(req);
  const now = Date.now();

  const current = ipMap.get(ip);

  if (!current || now > current.resetTime) {
    const resetTime = now + windowMs;
    ipMap.set(ip, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    const resetSeconds = Math.ceil((current.resetTime - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  current.count += 1;
  const resetSeconds = Math.ceil((current.resetTime - now) / 1000);

  return {
    success: true,
    limit,
    remaining: limit - current.count,
    resetSeconds: Math.max(1, resetSeconds),
  };
}
