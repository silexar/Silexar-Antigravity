/**
 * 🛡️ SILEXAR PULSE — Tests de Seguridad
 * 
 * Tests unitarios para las capas de seguridad reescritas:
 * - RBAC (Role-Based Access Control)
 * - Encryption at Rest (AES-256-GCM)
 * - Secret Manager
 * - Redis Rate Limiter
 * 
 * @module security/tests
 * @version 2026.3.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// RBAC TESTS
// ============================================================================

describe('RBAC — Role-Based Access Control', () => {
  let rbac: Awaited<typeof import('../security/rbac')>['default'];

  beforeEach(async () => {
    const mod = await import('../security/rbac');
    rbac = mod.default;
  });

  describe('checkPermission', () => {
    it('should grant SUPER_CEO full access to any resource', () => {
      const ctx = { userId: '1', role: 'SUPER_CEO' as const, tenantId: 't1' };
      expect(rbac.checkPermission(ctx, 'campanas', 'create')).toBe(true);
      expect(rbac.checkPermission(ctx, 'configuracion', 'admin')).toBe(true);
    });

    it('should grant ADMIN access to campanas CRUD', () => {
      const ctx = { userId: '1', role: 'ADMIN' as const, tenantId: 't1' };
      expect(rbac.checkPermission(ctx, 'campanas', 'create')).toBe(true);
      expect(rbac.checkPermission(ctx, 'campanas', 'read')).toBe(true);
      expect(rbac.checkPermission(ctx, 'campanas', 'delete')).toBe(true);
    });

    it('should deny VIEWER write access to campanas', () => {
      const ctx = { userId: '1', role: 'VIEWER' as const, tenantId: 't1' };
      expect(rbac.checkPermission(ctx, 'campanas', 'create')).toBe(false);
      expect(rbac.checkPermission(ctx, 'campanas', 'delete')).toBe(false);
      expect(rbac.checkPermission(ctx, 'campanas', 'read')).toBe(true);
    });

    it('should allow EJECUTIVO_VENTAS to read contratos', () => {
      const ctx = { userId: '1', role: 'EJECUTIVO_VENTAS' as const, tenantId: 't1' };
      expect(rbac.checkPermission(ctx, 'contratos', 'read')).toBe(true);
    });
  });

  describe('requireRole', () => {
    it('should authorize when user has exact role', () => {
      const ctx = { userId: '1', role: 'ADMIN' as const, tenantId: 't1' };
      expect(rbac.requireRole(ctx, ['ADMIN'])).toBe(true);
    });

    it('should deny lower hierarchy role', () => {
      const ctx = { userId: '1', role: 'USER' as const, tenantId: 't1' };
      expect(rbac.requireRole(ctx, ['ADMIN'])).toBe(false);
    });

    it('should return false for null context', () => {
      expect(rbac.requireRole(null, ['ADMIN'])).toBe(false);
    });
  });
});

// ============================================================================
// ENCRYPTION AT REST TESTS
// ============================================================================

describe('Encryption at Rest — AES-256-GCM', () => {
  let encryptAtRest: typeof import('../security/encryption-at-rest')['encryptAtRest'];
  let decryptAtRest: typeof import('../security/encryption-at-rest')['decryptAtRest'];
  let verifyIntegrity: typeof import('../security/encryption-at-rest')['verifyIntegrity'];

  beforeEach(async () => {
    // Set a dev key so encryption works in test
    process.env.ENCRYPTION_MASTER_KEY = 'test-master-key-for-vitest-32-chars-minimum!!!!';
    const mod = await import('../security/encryption-at-rest');
    encryptAtRest = mod.encryptAtRest;
    decryptAtRest = mod.decryptAtRest;
    verifyIntegrity = mod.verifyIntegrity;
  });

  it('should encrypt and decrypt data correctly', async () => {
    const plaintext = 'Datos confidenciales de Silexar Pulse';
    const encrypted = await encryptAtRest(plaintext);
    expect(encrypted).not.toBe(plaintext);
    const decrypted = await decryptAtRest(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for same plaintext (random IV/salt)', async () => {
    const plaintext = 'Same data, different encryption';
    const encrypted1 = await encryptAtRest(plaintext);
    const encrypted2 = await encryptAtRest(plaintext);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should handle empty strings', async () => {
    const encrypted = await encryptAtRest('');
    const decrypted = await decryptAtRest(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle unicode characters', async () => {
    const plaintext = '¡Hólà Müñdö! 日本語テスト 🎵🔐';
    const encrypted = await encryptAtRest(plaintext);
    const decrypted = await decryptAtRest(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should verify integrity of valid encrypted data', async () => {
    const encrypted = await encryptAtRest('test data');
    const valid = await verifyIntegrity(encrypted);
    expect(valid).toBe(true);
  });

  it('should reject integrity of corrupted data', async () => {
    const valid = await verifyIntegrity('not-valid-base64-data');
    expect(valid).toBe(false);
  });
});

// ============================================================================
// SECRET MANAGER TESTS
// ============================================================================

describe('Secret Manager', () => {
  let secretManager: Awaited<typeof import('../security/secret-manager')>['default'];
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    vi.resetModules();
    process.env = { ...originalEnv };
    const mod = await import('../security/secret-manager');
    secretManager = mod.default;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getSecret', () => {
    it('should return secret from environment', async () => {
      process.env.JWT_SECRET = 'my-strong-secret-value-minimum-32-chars!';
      const result = await secretManager.getSecret('JWT_SECRET');
      expect(result).toBe('my-strong-secret-value-minimum-32-chars!');
    });

    it('should return null for missing secret', async () => {
      delete process.env.JWT_SECRET;
      const result = await secretManager.getSecret('JWT_SECRET');
      expect(result).toBeNull();
    });
  });

  describe('validateSecrets', () => {
    it('should detect missing required secrets', async () => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      delete process.env.BETTER_AUTH_SECRET;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_URL;
      
      const result = await secretManager.validateSecrets();
      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    it('should detect placeholder secrets', async () => {
      process.env.JWT_SECRET = 'your-secret-here-placeholder-that-is-long-enough';
      process.env.JWT_REFRESH_SECRET = 'your-secret-refresh-placeholder-long-enough';
      process.env.BETTER_AUTH_SECRET = 'real-better-auth-secret-32-chars-minimum!';
      process.env.DATABASE_PASSWORD = 'real-password-123';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/silexar';
      
      const result = await secretManager.validateSecrets();
      expect(result.valid).toBe(false);
      expect(result.weak.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// REDIS RATE LIMITER TESTS
// ============================================================================

describe('Redis Rate Limiter', () => {
  let rateLimiter: Awaited<typeof import('../security/redis-rate-limiter')>['RedisRateLimiter'];

  beforeEach(async () => {
    const mod = await import('../security/redis-rate-limiter');
    rateLimiter = mod.RedisRateLimiter;
  });

  it('should allow requests within the limit', async () => {
    const key = 'test-allow-' + Date.now();
    const result = await rateLimiter.evaluate(key, { maxRequests: 100, windowMs: 60000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('should check returns true within limit', async () => {
    const key = 'test-check-' + Date.now();
    const allowed = await rateLimiter.check(key, { maxRequests: 100, windowMs: 60000 });
    expect(allowed).toBe(true);
  });

  it('should block requests over the limit', async () => {
    const key = 'test-block-' + Date.now();
    const config = { maxRequests: 3, windowMs: 60000 };
    
    await rateLimiter.increment(key, config);
    await rateLimiter.increment(key, config);
    await rateLimiter.increment(key, config);
    
    const result = await rateLimiter.evaluate(key, config, false);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset counter after reset()', async () => {
    const key = 'test-reset-' + Date.now();
    const config = { maxRequests: 100, windowMs: 60000 };
    
    await rateLimiter.increment(key, config);
    await rateLimiter.increment(key, config);
    await rateLimiter.reset(key);
    
    const result = await rateLimiter.evaluate(key, config, false);
    expect(result.remaining).toBe(100);
  });
});
