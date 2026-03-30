/**
 * SILEXAR PULSE - TIER0+ MEMOIZATION SYSTEM
 */
export const memoize = <T>(fn: (...args: unknown[]) => T): ((...args: unknown[]) => T) => {
    const cache = new Map<string, T>();
    return (...args: unknown[]): T => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key)!;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};
export default { memoize };