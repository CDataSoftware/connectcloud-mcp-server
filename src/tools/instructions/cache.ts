import { DriverInstructions, CacheEntry } from './types';

class InstructionsCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 15 * 60 * 1000; // 15 minutes

  get(driverName: string): DriverInstructions | null {
    const entry = this.cache.get(driverName.toLowerCase());
    if (!entry) return null;
    
    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(driverName.toLowerCase());
      return null;
    }
    
    return entry.data;
  }

  set(driverName: string, data: DriverInstructions, ttl?: number): void {
    this.cache.set(driverName.toLowerCase(), {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const instructionsCache = new InstructionsCache();

// Optional: Run cleanup every 5 minutes
setInterval(
  () => {
    instructionsCache.cleanup();
  },
  5 * 60 * 1000,
);
