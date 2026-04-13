/**
 * SILEXAR PULSE - Mobile Authentication API
 *
 * Endpoints for mobile app authentication:
 * - Login with email/password (Argon2id verification via PasswordSecurityEngine)
 * - JWT token refresh
 * - Logout (single device / all devices)
 * - Token verification
 * - Biometria (prepared)
 * - Device listing
 *
 * SECURITY: Uses PasswordSecurityEngine (Argon2id) — bcryptjs removed.
 * Migration path: users with legacy bcrypt hashes must reset their password.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { PasswordSecurityEngine } from '@/lib/security/password-security';
import { eq, and } from 'drizzle-orm';
import { signToken, signRefreshToken, verifyTokenServer } from '@/lib/api/jwt';
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiValidationError,
  apiServerError,
  getUserContext,
} from '@/lib/api/response';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/tenant-context';
import { authRateLimiter } from '@/lib/security/rate-limiter';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════

const LoginSchema = z.object({
  accion: z.literal('login'),
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
  dispositivoId: z.string().min(1, 'ID de dispositivo requerido'),
  dispositivoNombre: z.string().min(1, 'Nombre de dispositivo requerido'),
  plataforma: z.enum(['ios', 'android']),
  versionApp: z.string().min(1),
  biometriaDisponible: z.boolean().optional(),
});

const RefreshSchema = z.object({
  accion: z.literal('refresh'),
  refreshToken: z.string().min(1, 'Refresh token requerido'),
  dispositivoId: z.string().min(1),
});

const LogoutSchema = z.object({
  accion: z.literal('logout'),
  refreshToken: z.string().min(1),
  dispositivoId: z.string().min(1),
});

const LogoutAllSchema = z.object({
  accion: z.literal('logout_all'),
});

const VerificarSchema = z.object({
  accion: z.literal('verificar'),
});

const DispositivosSchema = z.object({
  accion: z.literal('dispositivos'),
});

const ActionSchema = z.object({
  accion: z.enum(['login', 'refresh', 'logout', 'logout_all', 'biometria', 'verificar', 'dispositivos']),
}).passthrough();

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface UsuarioMobile {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  rol: string;
  cargo: string;
  empresa: string;
  empresaLogo?: string;
}

interface ConfiguracionMobile {
  tema: 'light' | 'dark' | 'system';
  notificacionesPush: boolean;
  notificacionesEmail: boolean;
  biometriaHabilitada: boolean;
  idiomaPreferido: string;
  monedaPredeterminada: string;
  formatoFecha: string;
  formatoNumero: string;
  syncAutomatico: boolean;
  intervaloSync: number;
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate action field
    const actionParsed = ActionSchema.safeParse(body);
    if (!actionParsed.success) {
      return apiValidationError(actionParsed.error.flatten());
    }

    const { accion } = actionParsed.data;

    switch (accion) {
      case 'login':
        return handleLogin(body, request);
      case 'refresh':
        return handleRefresh(body);
      case 'logout':
        return handleLogout(body, request);
      case 'logout_all':
        return handleLogoutAll(request);
      case 'verificar':
        return handleVerificarToken(request);
      case 'dispositivos':
        return handleListarDispositivos(request);
      case 'biometria':
        return apiError('NOT_IMPLEMENTED', 'Biometría no implementada aún', 501);
      default:
        return apiError('INVALID_ACTION', 'Acción no válida', 400);
    }
  } catch (error) {
    logger.error('Error in mobile-auth POST', error instanceof Error ? error : undefined, { module: 'mobile-auth', action: 'POST' });
    return apiServerError('Error de autenticación');
  }
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════

async function handleLogin(body: unknown, request: NextRequest) {
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.flatten());
  }

  const { email, password, dispositivoId, dispositivoNombre, plataforma, biometriaDisponible } = parsed.data;

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await authRateLimiter.checkRateLimit(request);
  if (!rateLimitResult.success) {
    return apiError('RATE_LIMITED', 'Demasiados intentos. Intenta nuevamente en unos minutos.', 429);
  }

  try {
    if (!db) return apiServerError('Database not available');
    // Query user from DB
    const userRows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        passwordHash: users.passwordHash,
        role: users.category,
        status: users.status,
        tenantId: users.tenantId,
        category: users.category,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (userRows.length === 0) {
      auditLogger.log({ type: AuditEventType.LOGIN_FAILURE, userId: '', metadata: { module: 'mobile-auth', email, reason: 'user_not_found', ip } });
      return apiUnauthorized('Credenciales inválidas');
    }

    const user = userRows[0];

    // Check account status
    if (user.status !== 'active') {
      auditLogger.log({ type: AuditEventType.LOGIN_FAILURE, userId: user.id, metadata: { module: 'mobile-auth', email, reason: 'account_inactive', status: user.status } });
      return apiError('ACCOUNT_INACTIVE', 'Cuenta no activa. Contacta al administrador.', 403);
    }

    // Verify password with PasswordSecurityEngine (Argon2id)
    // Supports Argon2id (new) and PBKDF2 (legacy) hashes via PasswordSecurityEngine.verifyPassword()
    // Legacy bcrypt hashes will NOT verify — affected users must reset their password.
    if (!user.passwordHash) {
      return apiUnauthorized('Credenciales inválidas');
    }

    const passwordValid = await PasswordSecurityEngine.verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      auditLogger.log({ type: AuditEventType.LOGIN_FAILURE, userId: user.id, metadata: { module: 'mobile-auth', email, reason: 'invalid_password', ip } });
      return apiUnauthorized('Credenciales inválidas');
    }

    // Generate real JWT tokens
    const sessionId = crypto.randomUUID();
    const accessToken = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'USER',
      tenantId: user.tenantId || '',
      tenantSlug: '',
      sessionId,
    }, '1h');

    const refreshToken = await signRefreshToken(user.id, sessionId);

    // Build mobile user response
    const usuarioMobile: UsuarioMobile = {
      id: user.id,
      nombre: user.name || '',
      email: user.email,
      rol: user.role || 'USER',
      cargo: user.category || '',
      empresa: 'Silexar Pulse',
    };

    const configuracion: ConfiguracionMobile = {
      tema: 'system',
      notificacionesPush: true,
      notificacionesEmail: true,
      biometriaHabilitada: biometriaDisponible || false,
      idiomaPreferido: 'es',
      monedaPredeterminada: 'CLP',
      formatoFecha: 'DD/MM/YYYY',
      formatoNumero: '1.000,00',
      syncAutomatico: true,
      intervaloSync: 5,
    };

    // Audit log
    auditLogger.log({ type: AuditEventType.LOGIN_SUCCESS, userId: user.id, metadata: { module: 'mobile-auth', email,
        dispositivo: dispositivoNombre,
        plataforma,
        dispositivoId, } });

    logger.info('mobile-auth login_success', { module: 'mobile-auth', action: 'login_success', userId: user.id,
      plataforma,
    });

    return apiSuccess({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      usuario: usuarioMobile,
      permisos: [],
      configuracion,
    });
  } catch (error) {
    logger.error('Error in mobile-auth login', error instanceof Error ? error : undefined, { module: 'mobile-auth', action: 'login' });
    return apiServerError('Error al procesar el login');
  }
}

// ═══════════════════════════════════════════════════════════════
// REFRESH TOKEN
// ═══════════════════════════════════════════════════════════════

async function handleRefresh(body: unknown) {
  const parsed = RefreshSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.flatten());
  }

  const { refreshToken } = parsed.data;

  try {
    // Verify the refresh token
    const payload = await verifyTokenServer(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return apiUnauthorized('Refresh token inválido');
    }

    const userId = payload.userId as string;
    const sessionId = payload.sessionId as string;

    // Query user to verify still active
    if (!db) return apiServerError('Database not available');
    const userRows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.category,
        status: users.status,
        tenantId: users.tenantId,
      })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.status, 'active')))
      .limit(1);

    if (userRows.length === 0) {
      return apiUnauthorized('Usuario no encontrado o inactivo');
    }

    const user = userRows[0];

    // Generate new tokens
    const newSessionId = crypto.randomUUID();
    const newAccessToken = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'USER',
      tenantId: user.tenantId || '',
      tenantSlug: '',
      sessionId: newSessionId,
    }, '1h');

    const newRefreshToken = await signRefreshToken(user.id, newSessionId);

    logger.info('mobile-auth token_refresh', { module: 'mobile-auth', action: 'token_refresh', userId: user.id,
    });

    return apiSuccess({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
    });
  } catch (error) {
    logger.error('Error in mobile-auth refresh', error instanceof Error ? error : undefined, { module: 'mobile-auth', action: 'refresh' });
    return apiUnauthorized('Refresh token inválido o expirado');
  }
}

// ═══════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════

async function handleLogout(body: unknown, request: NextRequest) {
  const parsed = LogoutSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.flatten());
  }

  const ctx = getUserContext(request);

  auditLogger.log({ type: AuditEventType.LOGOUT, userId: ctx.userId || 'unknown', metadata: { module: 'mobile-auth', dispositivoId: parsed.data.dispositivoId } });

  logger.info('mobile-auth logout', { module: 'mobile-auth', action: 'logout', userId: ctx.userId,
    dispositivoId: parsed.data.dispositivoId,
  });

  return apiSuccess({ loggedOut: true });
}

// ═══════════════════════════════════════════════════════════════
// LOGOUT ALL DEVICES
// ═══════════════════════════════════════════════════════════════

async function handleLogoutAll(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  auditLogger.log({ type: AuditEventType.LOGOUT, userId: ctx.userId, metadata: { module: 'mobile-auth', scope: 'all_devices' } });

  logger.info('mobile-auth logout_all', { module: 'mobile-auth', action: 'logout_all', userId: ctx.userId,
  });

  return apiSuccess({ loggedOutAll: true });
}

// ═══════════════════════════════════════════════════════════════
// VERIFY TOKEN
// ═══════════════════════════════════════════════════════════════

async function handleVerificarToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return apiUnauthorized('Token no proporcionado');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = await verifyTokenServer(token);
    if (!payload) {
      return apiUnauthorized('Token inválido o expirado');
    }

    return apiSuccess({
      valido: true,
      payload: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      },
    });
  } catch {
    return apiUnauthorized('Token inválido o expirado');
  }
}

// ═══════════════════════════════════════════════════════════════
// LIST DEVICES (requires auth)
// ═══════════════════════════════════════════════════════════════

async function handleListarDispositivos(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  // Device tracking is not yet implemented in DB
  // Return empty array until device registration table is added
  return apiSuccess([]);
}
