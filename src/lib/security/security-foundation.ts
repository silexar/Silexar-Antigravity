/**
 * 🏰 SILEXAR PULSE — Security Foundation
 * 
 * Orquestador de seguridad que inicializa y coordina todos los
 * subsistemas de seguridad del sistema.
 * 
 * @version 2026.3.0
 * @security OWASP A05 — Security Misconfiguration
 */

import { validateSecrets } from './secret-manager';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SecurityContext {
  readonly userId: string;
  readonly roles: string[];
  readonly permissions: string[];
  readonly sessionId: string;
  readonly tenantId?: string;
  readonly ipAddress?: string;
}

export interface SecurityPolicy {
  readonly name: string;
  readonly rules: SecurityRule[];
  readonly enforced: boolean;
}

interface SecurityRule {
  readonly type: 'rate-limit' | 'ip-whitelist' | 'role-required' | 'schema-validation';
  readonly config: Record<string, unknown>;
}

interface SecurityStatus {
  initialized: boolean;
  secretsValid: boolean;
  missingSecrets: string[];
  weakSecrets: string[];
  warnings: string[];
  environment: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// IMPLEMENTACIÓN
// ═══════════════════════════════════════════════════════════════

class SecurityFoundationImpl {
  private _initialized = false;
  private _status: SecurityStatus | null = null;

  /**
   * Inicializar el sistema de seguridad
   */
  async initialize(): Promise<SecurityStatus> {
    const secretsResult = await validateSecrets();
    
    this._status = {
      initialized: true,
      secretsValid: secretsResult.valid,
      missingSecrets: secretsResult.missing,
      weakSecrets: secretsResult.weak,
      warnings: secretsResult.warnings,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    this._initialized = true;

    if (!secretsResult.valid && process.env.NODE_ENV === 'production') {
      const errorMsg = [
        '🚨 SECURITY FOUNDATION: Critical security configuration issues detected!',
        `Missing secrets: ${secretsResult.missing.join(', ')}`,
        `Weak secrets: ${secretsResult.weak.join(', ')}`,
      ].join('\n');
      logger.error('Security check failed', new Error(errorMsg));
    }

    return this._status;
  }

  /**
   * Validar un contexto de seguridad
   */
  async validateContext(context: SecurityContext): Promise<boolean> {
    if (!context.userId || context.userId.trim() === '') return false;
    if (!context.sessionId || context.sessionId.trim() === '') return false;
    if (!context.roles || context.roles.length === 0) return false;
    return true;
  }

  /**
   * Verificar un permiso específico en el contexto
   */
  async checkPermission(context: SecurityContext, permission: string): Promise<boolean> {
    if (!await this.validateContext(context)) return false;
    
    // Admin tiene todos los permisos
    if (context.roles.includes('SUPER_CEO') || context.roles.includes('ADMIN')) {
      return true;
    }

    return context.permissions.includes(permission);
  }

  /**
   * Aplicar una política de seguridad
   */
  async applyPolicy(context: SecurityContext, policy: SecurityPolicy): Promise<boolean> {
    if (!policy.enforced) return true;
    if (!await this.validateContext(context)) return false;

    for (const rule of policy.rules) {
      const passed = await this.evaluateRule(context, rule);
      if (!passed) return false;
    }
    return true;
  }

  /**
   * Evaluar una regla de seguridad individual
   */
  private async evaluateRule(context: SecurityContext, rule: SecurityRule): Promise<boolean> {
    switch (rule.type) {
      case 'role-required': {
        const requiredRoles = rule.config.roles as string[];
        return requiredRoles.some(r => context.roles.includes(r));
      }
      case 'ip-whitelist': {
        const whitelist = rule.config.ips as string[];
        return !context.ipAddress || whitelist.includes(context.ipAddress);
      }
      default:
        return true;
    }
  }

  /**
   * Obtener el estado actual del sistema de seguridad
   */
  getStatus(): SecurityStatus | null {
    return this._status;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }
}

export const SecurityFoundation = new SecurityFoundationImpl();
export default SecurityFoundation;