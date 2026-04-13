import { timingSafeEqual } from 'crypto';
import { logger } from '@/lib/observability';

export const VencimientosAuthMiddleware = (req: { headers: Record<string, string | undefined> }, res: { status: (c: number) => { json: (d: unknown) => unknown } }, next: () => void) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Acceso Denegado: Token Requerido' });
  }

  // Token leído desde variable de entorno — NUNCA hardcodeado en código fuente
  // Configurar INTERNAL_SERVICE_TOKEN en .env con un valor seguro >= 32 chars
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  if (!expectedToken || expectedToken.length < 32) {
    logger.error('[Seguridad] INTERNAL_SERVICE_TOKEN no configurado o demasiado corto');
    return res.status(503).json({ error: 'Servicio de autenticación no disponible' });
  }

  const expected = `Bearer ${expectedToken}`;

  // Comparación en tiempo constante para prevenir timing attacks
  let isEqual = false;
  try {
    isEqual =
      token.length === expected.length &&
      timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    isEqual = false;
  }

  if (!isEqual) {
    return res.status(403).json({ error: 'Acceso Denegado: Token Inválido o Expirado' });
  }

  logger.info(`[Seguridad] Usuario Autorizado en Módulo Vencimientos`);
  next();
};

export const TarifarioSecurityMiddleware = (req: { headers: Record<string, string | undefined> }, res: { status: (c: number) => { json: (d: unknown) => unknown } }, next: () => void) => {
    // Validar jerarquía de rol (Ej: Sólo Gerentes pueden reconfigurar Pricing)
    const userRole = req.headers['x-user-role'];
    
    if (userRole !== 'GERENTE_VENTAS' && userRole !== 'ADMIN_SISTEMA') {
        return res.status(403).json({ error: 'Acceso Denegado: Privilegios de Gerencia Requeridos para Pricing' });
    }

    logger.info(`[Seguridad] Acceso a Pricing autorizado para Rol: ${userRole}`);
    next();
};
