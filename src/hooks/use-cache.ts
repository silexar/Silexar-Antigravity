import { useState, useEffect, useCallback, useRef } from 'react';
import { globalCache as cacheService } from '@/lib/cache/redis-cache';

export interface UseCacheOptions {
  key: string;
  ttl?: number;
  enabled?: boolean;
  staleWhileRevalidate?: boolean;
}

export interface CacheState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: number | null;
}

export function useCache<T>(
  options: UseCacheOptions,
  fetcher: () => Promise<T>
): CacheState<T> & {
  refetch: () => Promise<void>;
  clearCache: () => Promise<void>;
} {
  const { key, ttl = 3600, enabled = true, staleWhileRevalidate = true } = options;
  const [state, setState] = useState<CacheState<T>>({
    data: null,
    loading: true,
    error: null,
    isStale: false,
    lastUpdated: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (forceRefresh = false): Promise<void> => {
    if (!enabled) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      // Try to get from cache first
      if (!forceRefresh) {
        const cachedData = await cacheService.get<T>(key);
        if (cachedData && mountedRef.current) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            loading: false,
            lastUpdated: Date.now(),
          }));

          if (!staleWhileRevalidate) {
            return;
          }
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        // Update cache
        await cacheService.set(key, freshData, ttl);
        
        setState({
          data: freshData,
          loading: false,
          error: null,
          isStale: false,
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }));
      }
    }
  }, [key, ttl, enabled, staleWhileRevalidate, fetcher]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(async () => {
    await cacheService.delete(key);
    setState(prev => ({ ...prev, data: null, lastUpdated: null }));
  }, [key]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    ...state,
    refetch,
    clearCache,
  };
}

export function useCacheWithOptimisticUpdate<T>(
  options: UseCacheOptions,
  fetcher: () => Promise<T>,
  updater: (data: T) => Promise<T>
) {
  const { data, loading, error, isStale, lastUpdated, refetch, clearCache } = useCache(options, fetcher);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(async (updateFn: (data: T) => T) => {
    if (!data) return;

    const newData = updateFn(data);
    setOptimisticData(newData);
    setIsUpdating(true);

    try {
      const result = await updater(newData);
      await cacheService.set(options.key, result, options.ttl);
      setOptimisticData(null);
      await refetch();
    } catch (error) {
      setOptimisticData(null);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [data, options.key, options.ttl, updater, refetch]);

  return {
    data: optimisticData || data,
    loading: loading || isUpdating,
    error,
    isStale,
    lastUpdated,
    refetch,
    clearCache,
    update,
  };
}

export function useCacheInvalidation() {
  const invalidate = useCallback(async (pattern?: string) => {
    await cacheService.clear(pattern);
  }, []);

  const invalidateByTags = useCallback(async (tags: string[]) => {
    for (const tag of tags) {
      await cacheService.clear(`*:${tag}:*`);
    }
  }, []);

  return {
    invalidate,
    invalidateByTags,
  };
}

export function useCacheStats() {
  const [stats, setStats] = useState<{
    connected: boolean;
    keys: number;
    memory: number; // mapped from memoryUsage
    hitRate?: number;
    missRate?: number;
    hits?: number;
    misses?: number;
    size?: number;
  }>({ connected: false, keys: 0, memory: 0 });
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      const cacheStats = await cacheService.getStats();
      setStats({
        ...cacheStats,
        memory: cacheStats.memoryUsage,
        keys: cacheStats.size
      });
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    loading,
    refreshStats,
  };
}