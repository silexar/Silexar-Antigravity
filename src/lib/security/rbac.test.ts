/**
 * Tests unitarios para RBAC (Role-Based Access Control)
 * @module rbac.test
 */

import { describe, it, expect } from 'vitest';
import {
  checkPermission,
  requireRole,
  validatePolicy,
  forbid,
  unauthorized,
  requirePermission,
  getAuthContext,
  ROLE_HIERARCHY,
  type AuthContext,
  type UserRole,
  type Resource,
  type PermissionAction,
} from './rbac';

describe('RBAC - Role-Based Access Control', () => {
  const mockSuperCEO: AuthContext = {
    userId: 'user-1',
    role: 'SUPER_CEO',
    tenantId: 'tenant-1',
  };

  const mockAdmin: AuthContext = {
    userId: 'user-2',
    role: 'ADMIN',
    tenantId: 'tenant-1',
  };

  const mockViewer: AuthContext = {
    userId: 'user-3',
    role: 'VIEWER',
    tenantId: 'tenant-1',
  };

  const mockUser: AuthContext = {
    userId: 'user-4',
    role: 'USER',
    tenantId: 'tenant-1',
  };

  describe('checkPermission', () => {
    it('should grant SUPER_CEO all permissions', () => {
      expect(checkPermission(mockSuperCEO, 'contratos', 'create')).toBe(true);
      expect(checkPermission(mockSuperCEO, 'contratos', 'delete')).toBe(true);
      expect(checkPermission(mockSuperCEO, 'contratos', 'admin')).toBe(true);
      expect(checkPermission(mockSuperCEO, 'usuarios', 'admin')).toBe(true);
    });

    it('should grant ADMIN appropriate permissions', () => {
      expect(checkPermission(mockAdmin, 'contratos', 'create')).toBe(true);
      expect(checkPermission(mockAdmin, 'contratos', 'delete')).toBe(true);
      expect(checkPermission(mockAdmin, 'contratos', 'admin')).toBe(false); // ADMIN no tiene 'admin'
    });

    it('should grant VIEWER only read permissions', () => {
      expect(checkPermission(mockViewer, 'contratos', 'read')).toBe(true);
      expect(checkPermission(mockViewer, 'contratos', 'create')).toBe(false);
      expect(checkPermission(mockViewer, 'contratos', 'update')).toBe(false);
      expect(checkPermission(mockViewer, 'contratos', 'delete')).toBe(false);
    });

    it('should deny access for null context', () => {
      expect(checkPermission(null as unknown as AuthContext, 'contratos', 'read')).toBe(false);
    });

    it('should deny access for undefined context', () => {
      expect(checkPermission(undefined as unknown as AuthContext, 'contratos', 'read')).toBe(false);
    });

    it('should handle invalid role gracefully', () => {
      const invalidContext = { ...mockUser, role: 'INVALID_ROLE' };
      expect(checkPermission(invalidContext, 'contratos', 'read')).toBe(false);
    });
  });

  describe('requireRole', () => {
    it('should allow access when role matches exactly', () => {
      expect(requireRole(mockAdmin, ['ADMIN'])).toBe(true);
      expect(requireRole(mockViewer, ['VIEWER'])).toBe(true);
    });

    it('should allow access when user has higher role in hierarchy', () => {
      // SUPER_CEO (100) >= ADMIN (90)
      expect(requireRole(mockSuperCEO, ['ADMIN'])).toBe(true);
      // ADMIN (90) >= VIEWER (20)
      expect(requireRole(mockAdmin, ['VIEWER'])).toBe(true);
    });

    it('should deny access when user has lower role in hierarchy', () => {
      // VIEWER (20) < ADMIN (90)
      expect(requireRole(mockViewer, ['ADMIN'])).toBe(false);
      // USER (10) < VIEWER (20)
      expect(requireRole(mockUser, ['VIEWER'])).toBe(false);
    });

    it('should handle multiple allowed roles', () => {
      expect(requireRole(mockAdmin, ['VIEWER', 'ADMIN', 'SUPER_CEO'])).toBe(true);
      expect(requireRole(mockViewer, ['ADMIN', 'SUPER_CEO'])).toBe(false);
    });

    it('should deny access for null context', () => {
      expect(requireRole(null, ['ADMIN'])).toBe(false);
    });

    it('should deny access for empty roles array', () => {
      expect(requireRole(mockAdmin, [])).toBe(false);
    });
  });

  describe('ROLE_HIERARCHY', () => {
    it('should have correct hierarchy levels', () => {
      expect(ROLE_HIERARCHY.SUPER_CEO).toBe(100);
      expect(ROLE_HIERARCHY.ADMIN).toBe(90);
      expect(ROLE_HIERARCHY.VIEWER).toBe(20);
      expect(ROLE_HIERARCHY.USER).toBe(10);
    });

    it('should have decreasing hierarchy values', () => {
      const roles = Object.entries(ROLE_HIERARCHY) as [UserRole, number][];
      const values = roles.map(([, v]) => v).sort((a, b) => b - a);
      expect(roles.map(([, v]) => v)).toEqual(expect.arrayContaining(values));
    });
  });

  describe('validatePolicy', () => {
    it('should validate policy with matching role', () => {
      const policy = {
        resource: 'contratos' as Resource,
        actions: ['read' as PermissionAction],
        roles: ['ADMIN' as UserRole],
      };
      expect(validatePolicy(mockAdmin, policy)).toBe(true);
    });

    it('should validate policy with higher role in hierarchy', () => {
      const policy = {
        resource: 'contratos' as Resource,
        actions: ['read' as PermissionAction],
        roles: ['VIEWER' as UserRole],
      };
      expect(validatePolicy(mockSuperCEO, policy)).toBe(true);
    });

    it('should reject policy with insufficient permissions', () => {
      const policy = {
        resource: 'contratos' as Resource,
        actions: ['create' as PermissionAction],
        roles: ['VIEWER' as UserRole],
      };
      expect(validatePolicy(mockViewer, policy)).toBe(false);
    });

    it('should handle multiple actions in policy', () => {
      const policy = {
        resource: 'contratos' as Resource,
        actions: ['read', 'create'] as PermissionAction[],
        roles: ['ADMIN' as UserRole],
      };
      expect(validatePolicy(mockAdmin, policy)).toBe(true);
    });
  });

  describe('forbid', () => {
    it('should return 403 response with correct structure', () => {
      const response = forbid('Custom forbidden message');
      expect(response.status).toBe(403);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include error details in response body', async () => {
      const response = forbid();
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('unauthorized', () => {
    it('should return 401 response with correct structure', () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toContain('Bearer');
    });

    it('should include error details in response body', async () => {
      const response = unauthorized('Custom auth message');
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('requirePermission', () => {
    it('should return null when permission is granted', () => {
      const result = requirePermission(mockSuperCEO, 'contratos', 'delete');
      expect(result).toBeNull();
    });

    it('should return 403 response when permission is denied', async () => {
      const result = requirePermission(mockViewer, 'contratos', 'delete');
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    it('should return 401 response when context is null', async () => {
      const result = requirePermission(null, 'contratos', 'read');
      expect(result).not.toBeNull();
      expect(result!.status).toBe(401);
    });
  });

  describe('getAuthContext', () => {
    it('should return null for request without auth header', () => {
      const request = new Request('http://localhost');
      expect(getAuthContext(request)).toBeNull();
    });

    it('should extract context from headers', () => {
      const headers = new Headers({
        'authorization': 'Bearer token123',
        'x-silexar-user-id': 'user-1',
        'x-silexar-user-role': 'ADMIN',
        'x-silexar-tenant-id': 'tenant-1',
      });
      const request = new Request('http://localhost', { headers });
      const context = getAuthContext(request);
      
      expect(context).not.toBeNull();
      expect(context!.userId).toBe('user-1');
      expect(context!.role).toBe('ADMIN');
      expect(context!.tenantId).toBe('tenant-1');
    });
  });
});
