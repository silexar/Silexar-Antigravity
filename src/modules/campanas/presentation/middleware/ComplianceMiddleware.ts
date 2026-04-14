// @ts-nocheck

/**
 * Compliance utilities for Next.js handlers (framework-agnostic)
 */

export interface RequestLike {
  ip?: string;
  headers?: Record<string, string>;
  path?: string;
  method?: string;
  body?: Record<string, unknown>;
  user?: Record<string, unknown>;
}

export interface ComplianceResult {
  ok: boolean;
  error?: string;
  headers?: Record<string, string>;
}

export async function enforceCompliance(req: RequestLike): Promise<ComplianceResult> {
  try {
    await verificarGDPR(req);
    await verificarRetencionDatos(req);
    await verificarAccesoGeografico(req);
    return {
      ok: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      }
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Compliance error';
    return { ok: false, error: msg };
  }
}

async function verificarGDPR(req: RequestLike): Promise<void> {
  if (req.body && contieneDatosPersonales(req.body)) {
    if (!req.user?.consentimientoGDPR) {
      throw new Error('Consentimiento GDPR requerido para procesar datos personales');
    }
  }
}

async function verificarRetencionDatos(_req: RequestLike): Promise<void> {
  // Placeholder de políticas de retención configurables
}

async function verificarAccesoGeografico(req: RequestLike): Promise<void> {
  const paisOrigen = obtenerPaisIP(req.ip || '');
  const paisesPermitidos = ['CL', 'AR', 'PE', 'CO'];
  if (paisOrigen && !paisesPermitidos.includes(paisOrigen)) {
    // Registrar advertencia si se desea
  }
}

function contieneDatosPersonales(data: unknown): boolean {
  const campos = ['email', 'telefono', 'direccion', 'rut', 'nombre'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!data && typeof data === 'object' && campos.some(c => (data as Record<string, unknown>)[c] != null);
}

function obtenerPaisIP(_ip: string): string {
  return 'CL';
}

