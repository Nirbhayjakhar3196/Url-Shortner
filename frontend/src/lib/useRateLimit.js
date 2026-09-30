import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for handling backend 429 rate limit responses
 * Reads Retry-After (seconds) and runs a local countdown timer to disable actions.
 */
export function useRateLimit() {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cooldown]);

  const handleRateLimit = useCallback((err) => {
    if (err && err.status === 429) {
      const seconds = Number.isInteger(err.retryAfter) && err.retryAfter > 0 ? err.retryAfter : 60;
      setCooldown(seconds);
      return `Too many requests. Please try again in ${seconds} seconds.`;
    }
    return null;
  }, []);

  return {
    cooldown,
    setCooldown,
    handleRateLimit,
    isRateLimited: cooldown > 0,
  };
}

export default useRateLimit;
