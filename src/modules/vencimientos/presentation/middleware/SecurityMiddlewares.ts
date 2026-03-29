import { logger } from '@/lib/observability';
export const VencimientosAuthMiddleware = (req: { headers: Record<string, string | undefined> }, res: { status: (c: number) => { json: (d: unknown) => unknown } }, next: () => void) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Acceso Denegado: Token Requerido' });
  }

  // Validación Dummy de Token
  if (token !== 'Bearer SILEXAR-TIER0-TOKEN') {
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
