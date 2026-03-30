export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
  compression: boolean;
  encryption: boolean;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  hits: number;
  size: number;
  key: string;
  ttl?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

import type { Redis } from 'ioredis'
import { getRedisClient } from './redis-client'

export class RedisCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private prefix: string;

  constructor(config: Partial<CacheConfig> & { prefix?: string } = {}) {
    this.prefix = config.prefix || 'cache:';
    this.config = {
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      strategy: 'lru',
      compression: true,
      encryption: false,
      ...config
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      memoryUsage: 0
    };

    this.startCleanupInterval();
  }

  private getRedis(): Redis | null {
    return getRedisClient();
  }

  async connect(): Promise<void> {
    // Connection handled by redis-client.ts singleton
    return Promise.resolve();
  }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    const redis = this.getRedis();
    if (redis) {
      try {
        const raw = await redis.get(this.prefix + key);
        if (raw !== null) {
          this.stats.hits++;
          this.updateStats();
          return JSON.parse(raw) as T;
        }
        this.stats.misses++;
        this.updateStats();
        return null;
      } catch {
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if entry has expired
    const ttl = entry.ttl || this.config.ttl;
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateStats();
      return null;
    }

    // Update hit count and timestamp for LRU
    entry.hits++;
    entry.timestamp = Date.now();
    this.stats.hits++;
    this.updateStats();

    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const effectiveTtl = ttl || this.config.ttl;

    // Try Redis first
    const redis = this.getRedis();
    if (redis) {
      try {
        await redis.setex(
          this.prefix + key,
          Math.ceil(effectiveTtl / 1000),
          JSON.stringify(data)
        );
        return;
      } catch {
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hits: 0,
      size: this.estimateSize(data),
      key,
      ttl: effectiveTtl
    };

    if (this.cache.size >= this.config.maxSize) {
      this.evictEntry();
    }

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
    this.updateMemoryUsage();
  }

  async delete(key: string): Promise<boolean> {
    // Try Redis first
    const redis = this.getRedis();
    if (redis) {
      try {
        const count = await redis.del(this.prefix + key);
        return count > 0;
      } catch {
        // Fall through to in-memory
      }
    }

    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    }
    return deleted;
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      await this.invalidatePattern(pattern);
      return;
    }
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      memoryUsage: 0
    };
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async getStatsData(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async getStats(): Promise<CacheStats & { connected: boolean }> {
    return { ...this.stats, connected: true };
  }

  async getMany<T>(keys: string[]): Promise<Array<T | null>> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  async setMany(entries: Array<{ key: string; data: unknown; ttl?: number }>): Promise<void> {
    await Promise.all(entries.map(entry => this.set(entry.key, entry.data, entry.ttl)));
  }

  async deleteMany(keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (await this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  private evictEntry(): void {
    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.findLRUEntry();
        break;
      case 'lfu':
        keyToEvict = this.findLFUEntry();
        break;
      case 'fifo':
        keyToEvict = this.findFIFOEntry();
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    }
  }

  private findLRUEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFUEntry(): string | null {
    let lfuKey: string | null = null;
    let minHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        lfuKey = key;
      }
    }

    return lfuKey;
  }

  private findFIFOEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private estimateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 100; // Default size estimate
    }
  }

  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    this.stats.memoryUsage = totalSize;
  }

  private updateStats(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.config.ttl) {
          this.cache.delete(key);
          this.stats.evictions++;
        }
      }
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    }, 60000);
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Advanced caching strategies
  async getWithFallback<T>(
    key: string, 
    fallback: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    let data = await this.get<T>(key);
    
    if (data === null) {
      data = await fallback();
      await this.set(key, data, ttl);
    }
    
    return data;
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const keys = await this.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    return await this.deleteMany(matchingKeys);
  }

  async warmCache(entries: Array<{ key: string; data: unknown; ttl?: number }>): Promise<void> {
    await this.setMany(entries);
  }

  // Cache warming for common patterns
  async warmCommonPatterns(): Promise<void> {
    const commonPatterns = [
      { key: 'api:users:list', data: [], ttl: 300000 },
      { key: 'api:config:general', data: {}, ttl: 600000 },
      { key: 'api:analytics:dashboard', data: {}, ttl: 180000 }
    ];
    
    await this.warmCache(commonPatterns);
  }
}

// Singleton instance for global cache
export const globalCache = new RedisCache({
  prefix: 'global:',
  ttl: 300000, // 5 minutes
  maxSize: 5000,
  strategy: 'lru',
  compression: true,
  encryption: false
});

// Specialized cache instances
export const apiCache = new RedisCache({
  prefix: 'api:',
  ttl: 180000, // 3 minutes
  maxSize: 2000,
  strategy: 'lru',
  compression: true
});

export const sessionCache = new RedisCache({
  prefix: 'sess:',
  ttl: 1800000, // 30 minutes
  maxSize: 1000,
  strategy: 'lru',
  compression: false,
  encryption: true
});

export const analyticsCache = new RedisCache({
  prefix: 'analytics:',
  ttl: 300000, // 5 minutes
  maxSize: 1000,
  strategy: 'lfu',
  compression: true
});