/**
 * Tests for RBAC (Role-Based Access Control)
 * src/lib/security/rbac.ts
 */

import { describe, it, expect } from 'vitest'
import {
  checkPermission,
  requireRole,
  validatePolicy,
  forbid,
  unauthorized,
  requirePermission,
  type AuthContext,
  type UserRole,
  type Resource,
  type PermissionAction,
} from '@/lib/security/rbac'

// ── Helpers ───────────────────────────────────────────────────────────────────

function ctx(role: UserRole, userId = 'user-001', tenantId = 'tenant-001'): AuthContext {
  return { userId, role, tenantId }
}

// ── checkPermission ───────────────────────────────────────────────────────────

describe('checkPermission', () => {
  describe('SUPER_CEO', () => {
    const superCtx = ctx('SUPER_CEO')

    it('has all permissions on contratos', () => {
      const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve']
      actions.forEach(action => {
        expect(checkPermission(superCtx, 'contratos', action)).toBe(true)
      })
    })

    it('has all permissions on campanas', () => {
      expect(checkPermission(superCtx, 'campanas', 'admin')).toBe(true)
      expect(checkPermission(superCtx, 'campanas', 'delete')).toBe(true)
    })
  })

  describe('ADMIN', () => {
    const adminCtx = ctx('ADMIN')

    it('can read, create, update, delete contratos', () => {
      expect(checkPermission(adminCtx, 'contratos', 'create')).toBe(true)
      expect(checkPermission(adminCtx, 'contratos', 'read')).toBe(true)
      expect(checkPermission(adminCtx, 'contratos', 'delete')).toBe(true)
    })

    it('cannot admin contratos (no admin permission)', () => {
      expect(checkPermission(adminCtx, 'contratos', 'admin')).toBe(false)
    })

    it('can read dashboard', () => {
      expect(checkPermission(adminCtx, 'dashboard', 'read')).toBe(true)
    })
  })

  describe('EJECUTIVO_VENTAS', () => {
    const execCtx = ctx('EJECUTIVO_VENTAS')

    it('can create and read contratos', () => {
      expect(checkPermission(execCtx, 'contratos', 'create')).toBe(true)
      expect(checkPermission(execCtx, 'contratos', 'read')).toBe(true)
    })

    it('cannot delete contratos', () => {
      expect(checkPermission(execCtx, 'contratos', 'delete')).toBe(false)
    })

    it('cannot manage usuarios', () => {
      expect(checkPermission(execCtx, 'usuarios', 'create')).toBe(false)
      expect(checkPermission(execCtx, 'usuarios', 'read')).toBe(false)
    })

    it('has read access to dashboard', () => {
      expect(checkPermission(execCtx, 'dashboard', 'read')).toBe(true)
    })
  })

  describe('FINANCIERO', () => {
    const finCtx = ctx('FINANCIERO')

    it('can manage facturacion fully', () => {
      const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'export', 'approve']
      actions.forEach(action => {
        expect(checkPermission(finCtx, 'facturacion', action)).toBe(true)
      })
    })

    it('cannot create cunas', () => {
      expect(checkPermission(finCtx, 'cunas', 'create')).toBe(false)
    })

    it('cannot access emisoras', () => {
      expect(checkPermission(finCtx, 'emisoras', 'read')).toBe(false)
    })
  })

  describe('OPERADOR_EMISION', () => {
    const opCtx = ctx('OPERADOR_EMISION')

    it('can create and update cunas', () => {
      expect(checkPermission(opCtx, 'cunas', 'create')).toBe(true)
      expect(checkPermission(opCtx, 'cunas', 'update')).toBe(true)
    })

    it('cannot delete cunas', () => {
      expect(checkPermission(opCtx, 'cunas', 'delete')).toBe(false)
    })

    it('cannot access facturacion', () => {
      expect(checkPermission(opCtx, 'facturacion', 'read')).toBe(false)
    })
  })

  describe('ANUNCIANTE', () => {
    const anuCtx = ctx('ANUNCIANTE')

    it('can only read contratos and campanas', () => {
      expect(checkPermission(anuCtx, 'contratos', 'read')).toBe(true)
      expect(checkPermission(anuCtx, 'contratos', 'create')).toBe(false)
      expect(checkPermission(anuCtx, 'campanas', 'read')).toBe(true)
      expect(checkPermission(anuCtx, 'campanas', 'create')).toBe(false)
    })

    it('cannot access equipos-ventas', () => {
      expect(checkPermission(anuCtx, 'equipos-ventas', 'read')).toBe(false)
    })
  })

  describe('VIEWER', () => {
    const viewCtx = ctx('VIEWER')

    it('can read most resources', () => {
      const readable: Resource[] = ['contratos', 'campanas', 'cunas', 'emisiones', 'anunciantes', 'dashboard']
      readable.forEach(resource => {
        expect(checkPermission(viewCtx, resource, 'read')).toBe(true)
      })
    })

    it('cannot create or delete anything', () => {
      expect(checkPermission(viewCtx, 'contratos', 'create')).toBe(false)
      expect(checkPermission(viewCtx, 'campanas', 'delete')).toBe(false)
      expect(checkPermission(viewCtx, 'cunas', 'update')).toBe(false)
    })

    it('cannot access usuarios', () => {
      expect(checkPermission(viewCtx, 'usuarios', 'read')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('returns false for null/undefined context', () => {
      expect(checkPermission(null as unknown as AuthContext, 'contratos', 'read')).toBe(false)
    })

    it('returns false for unknown role', () => {
      const unknownCtx = ctx('UNKNOWN_ROLE' as UserRole)
      expect(checkPermission(unknownCtx, 'contratos', 'read')).toBe(false)
    })
  })
})

// ── requireRole ───────────────────────────────────────────────────────────────

describe('requireRole', () => {
  it('allows when user has exact matching role', () => {
    expect(requireRole(ctx('ADMIN'), ['ADMIN'])).toBe(true)
    expect(requireRole(ctx('GERENTE_VENTAS'), ['GERENTE_VENTAS'])).toBe(true)
  })

  it('allows SUPER_CEO for any role (highest hierarchy)', () => {
    const superCtx = ctx('SUPER_CEO')
    const allRoles: UserRole[] = ['ADMIN', 'CLIENT_ADMIN', 'GERENTE_VENTAS', 'EJECUTIVO_VENTAS',
      'FINANCIERO', 'VIEWER', 'USER', 'ANUNCIANTE']
    allRoles.forEach(role => {
      expect(requireRole(superCtx, [role])).toBe(true)
    })
  })

  it('denies VIEWER when ADMIN is required', () => {
    expect(requireRole(ctx('VIEWER'), ['ADMIN'])).toBe(false)
  })

  it('denies ANUNCIANTE when EJECUTIVO_VENTAS is required', () => {
    expect(requireRole(ctx('ANUNCIANTE'), ['EJECUTIVO_VENTAS'])).toBe(false)
  })

  it('allows multiple role options (any match)', () => {
    expect(requireRole(ctx('GERENTE_VENTAS'), ['ADMIN', 'GERENTE_VENTAS', 'EJECUTIVO_VENTAS'])).toBe(true)
    expect(requireRole(ctx('EJECUTIVO_VENTAS'), ['ADMIN', 'GERENTE_VENTAS', 'EJECUTIVO_VENTAS'])).toBe(true)
  })

  it('allows via hierarchy (ADMIN satisfies EJECUTIVO_VENTAS requirement)', () => {
    // ADMIN (90) > EJECUTIVO_VENTAS (60)
    expect(requireRole(ctx('ADMIN'), ['EJECUTIVO_VENTAS'])).toBe(true)
  })

  it('returns false for null context', () => {
    expect(requireRole(null, ['ADMIN'])).toBe(false)
  })

  it('returns false for empty roles array', () => {
    expect(requireRole(ctx('SUPER_CEO'), [])).toBe(false)
  })
})

// ── validatePolicy ────────────────────────────────────────────────────────────

describe('validatePolicy', () => {
  it('validates a policy the user satisfies', () => {
    const policy = {
      resource: 'contratos' as Resource,
      actions: ['read'] as PermissionAction[],
      roles: ['EJECUTIVO_VENTAS'] as UserRole[],
    }
    expect(validatePolicy(ctx('EJECUTIVO_VENTAS'), policy)).toBe(true)
  })

  it('denies when user lacks required action', () => {
    const policy = {
      resource: 'usuarios' as Resource,
      actions: ['create'] as PermissionAction[],
      roles: ['ADMIN'] as UserRole[],
    }
    // EJECUTIVO_VENTAS cannot create usuarios
    expect(validatePolicy(ctx('EJECUTIVO_VENTAS'), policy)).toBe(false)
  })

  it('allows via role hierarchy', () => {
    const policy = {
      resource: 'campanas' as Resource,
      actions: ['create'] as PermissionAction[],
      roles: ['EJECUTIVO_VENTAS'] as UserRole[],
    }
    // ADMIN is higher than EJECUTIVO_VENTAS and can create campanas
    expect(validatePolicy(ctx('ADMIN'), policy)).toBe(true)
  })

  it('returns false for null ctx', () => {
    const policy = {
      resource: 'contratos' as Resource,
      actions: ['read'] as PermissionAction[],
      roles: ['VIEWER'] as UserRole[],
    }
    expect(validatePolicy(null as unknown as AuthContext, policy)).toBe(false)
  })
})

// ── forbid ────────────────────────────────────────────────────────────────────

describe('forbid', () => {
  it('returns a 403 Response', async () => {
    const response = forbid()
    expect(response.status).toBe(403)
  })

  it('returns JSON content-type', () => {
    const response = forbid()
    expect(response.headers.get('content-type')).toBe('application/json')
  })

  it('response body has success: false and FORBIDDEN code', async () => {
    const response = forbid()
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('FORBIDDEN')
  })

  it('uses custom message', async () => {
    const response = forbid('Custom forbidden message')
    const body = await response.json()
    expect(body.error.message).toBe('Custom forbidden message')
  })
})

// ── unauthorized ──────────────────────────────────────────────────────────────

describe('unauthorized', () => {
  it('returns a 401 Response', () => {
    const response = unauthorized()
    expect(response.status).toBe(401)
  })

  it('includes WWW-Authenticate header', () => {
    const response = unauthorized()
    expect(response.headers.get('www-authenticate')).toContain('Bearer')
  })

  it('response body has UNAUTHORIZED code', async () => {
    const body = await unauthorized().json()
    expect(body.error.code).toBe('UNAUTHORIZED')
    expect(body.success).toBe(false)
  })
})

// ── requirePermission ─────────────────────────────────────────────────────────

describe('requirePermission', () => {
  it('returns null when authorized (proceed)', () => {
    const result = requirePermission(ctx('ADMIN'), 'contratos', 'read')
    expect(result).toBeNull()
  })

  it('returns 401 response when context is null', async () => {
    const result = requirePermission(null, 'contratos', 'read')
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('returns 403 response when permission is denied', async () => {
    // VIEWER cannot create contratos
    const result = requirePermission(ctx('VIEWER'), 'contratos', 'create')
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
  })

  it('returns null for SUPER_CEO on any resource/action', () => {
    const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve']
    const resources: Resource[] = ['contratos', 'campanas', 'cunas', 'usuarios', 'facturacion']
    actions.forEach(action => {
      resources.forEach(resource => {
        expect(requirePermission(ctx('SUPER_CEO'), resource, action)).toBeNull()
      })
    })
  })
})
