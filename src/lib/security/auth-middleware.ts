/**
 * 🛡️ SILEXAR PULSE — Auth Middleware
 *
 * Middleware de autenticación real para API routes.
 * Valida JWT tokens, extrae contexto de usuario, y aplica guards.
 *
 * @version 2026.3.0
 * @security OWASP A07 — Identification and Authentication Failures
 */

import { type AuthContext, type UserRole } from './rbac';
import { verifyTokenServer } from '@/lib/api/jwt';

// ═══════════════════════════════════════════════════════════════
// INTERFAZ
// ═══════════════════════════════════════════════════════════════

export type { AuthContext };

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string;
  permissions?: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

interface ValidationResult {
  valid: boolean;
  context: AuthContext | null;
  error?: string;
  statusCode?: number;
}

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

class AuthMiddlewareService {
  private readonly JWT_ISSUER = 'silexar-pulse';
  private readonly JWT_AUDIENCE = 'silexar-api';

  /**
   * Validar un request y extraer el contexto de autenticación
   */
  async validate(request?: Request): Promise<ValidationResult> {
    if (!request) {
      return { valid: false, context: null, error: 'Request requerido', statusCode: 400 };
    }

    // Extraer token del header Authorization o cookies
    const token = this.extractToken(request);
    if (!token) {
      return { valid: false, context: null, error: 'Token de autenticación requerido', statusCode: 401 };
    }

    // Verificar firma y decodificar payload usando verifyTokenServer (HS256 + issuer + audience)
    const payload = await verifyTokenServer(token) as (TokenPayload & { iss?: string; aud?: string }) | null;

    if (!payload) {
      return { valid: false, context: null, error: 'Token inválido, expirado o firma incorrecta', statusCode: 401 };
    }

    // Validar campos obligatorios
    if (!payload.userId || !payload.role || !payload.sessionId) {
      return { valid: false, context: null, error: 'Token incompleto', statusCode: 401 };
    }

    const context: AuthContext = {
      userId: payload.userId,
      role: payload.role,
      tenantId: payload.tenantId || 'default',
      permissions: payload.permissions,
    };

    return { valid: true, context };
  }

  /**
   * Verificar si el usuario tiene los roles requeridos
   */
  async authorize(context: AuthContext | null, requiredRoles?: UserRole[]): Promise<boolean> {
    if (!context) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true; // Sin roles requeridos = acceso libre

    return requiredRoles.includes(context.role as UserRole);
  }

  /**
   * Obtener contexto de autenticación desde el request
   */
  async getContext(request?: Request): Promise<AuthContext | null> {
    const result = await this.validate(request);
    return result.context;
  }

  /**
   * Extraer token del request (header Authorization o cookie)
   */
  private extractToken(request: Request): string | null {
    // 1. Intentar desde header Authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Intentar desde cookie
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('silexar_token='));
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }

    return null;
  }
}

export const AuthMiddleware = new AuthMiddlewareService();
export default AuthMiddleware;