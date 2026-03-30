/**
 * Data integrity utilities for Next.js handlers (framework-agnostic)
 */

export interface RequestLike {
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  user?: Record<string, unknown>;
}

export async function validateDataIntegrity(req: RequestLike): Promise<{ ok: boolean; error?: string; sanitized?: { body?: Record<string, unknown>; query?: Record<string, unknown> } }> {
  try {
    validarTamanoPayload(req);
    const sanitizedBody = sanitizarObjeto(req.body) as Record<string, unknown>;
    const sanitizedQuery = sanitizarObjeto(req.query) as Record<string, unknown>;
    await validarEstructura(req.path || '', sanitizedBody);
    await verificarChecksums(req.headers, sanitizedBody);
    return { ok: true, sanitized: { body: sanitizedBody, query: sanitizedQuery } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Data Integrity Error';
    return { ok: false, error: msg };
  }
}

function validarTamanoPayload(req: RequestLike): void {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const len = parseInt((req.headers?.['content-length'] as string) || '0', 10);
  if (len > maxSize) {
    throw new Error('Payload excede el tamaño máximo permitido');
  }
}

function sanitizarObjeto(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizarObjeto);
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj)) out[k] = sanitizarObjeto((obj as Record<string, unknown>)[k]);
    return out;
  }
  return obj;
}

async function validarEstructura(path: string, body: Record<string, unknown>): Promise<void> {
  if (!body) return;
  if (path.endsWith('/api/campanas')) {
    const required = ['nombre', 'anunciante', 'fechaInicio', 'fechaTermino'];
    for (const c of required) if (body[c] === undefined || body[c] === null) throw new Error(`Campo requerido faltante: ${c}`);
  }
  if (path.endsWith('/api/campanas/lineas')) {
    const required = ['campanaId', 'horaInicio', 'horaFin', 'cantidadCunas'];
    for (const c of required) if (body[c] === undefined || body[c] === null) throw new Error(`Campo requerido faltante: ${c}`);
  }
}

async function verificarChecksums(headers: Record<string, string> | undefined, body: Record<string, unknown>): Promise<void> {
  const checksum = headers?.['x-data-checksum'] as string | undefined;
  if (!checksum || !body) return;
  const calculated = calcularChecksum(JSON.stringify(body));
  if (checksum !== calculated) throw new Error('Checksum de datos no coincide');
}

function calcularChecksum(_data: string): string {
  // Placeholder: implementar SHA-256 si se requiere
  return 'checksum_placeholder';
}

