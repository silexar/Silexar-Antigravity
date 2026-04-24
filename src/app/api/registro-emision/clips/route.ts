/**
 * POST /api/registro-emision/clips
 * Crea un clip de evidencia.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import {
  DrizzleClipEvidenciaRepository,
} from '@/modules/registro-emision';

import { db as _db } from '@/lib/db';
const db = _db!;
import { clipsEvidencia as clipsTable } from '@/lib/db/emision-schema';

const schema = z.object({
  verificacionId: z.string().uuid(),
  deteccionId: z.string().uuid().optional(),
  urlArchivo: z.string().min(1),
  duracionSegundos: z.number().int().positive(),
  formato: z.string().min(1).max(10),
  horaInicioClip: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  horaFinClip: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  hashSha256: z.string().length(64),
  transcripcion: z.string().optional(),
  fechaExpiracion: z.string().datetime(),
});

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en la validación de los datos', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const id = crypto.randomUUID();
      await db.insert(clipsTable).values({
        id,
        tenantId: ctx.tenantId,
        verificacionId: parsed.data.verificacionId,
        deteccionId: parsed.data.deteccionId ?? null,
        urlArchivo: parsed.data.urlArchivo,
        duracionSegundos: parsed.data.duracionSegundos,
        formato: parsed.data.formato,
        horaInicioClip: parsed.data.horaInicioClip,
        horaFinClip: parsed.data.horaFinClip,
        hashSha256: parsed.data.hashSha256,
        transcripcion: parsed.data.transcripcion ?? null,
        fechaExpiracion: new Date(parsed.data.fechaExpiracion),
        creadoPorId: ctx.userId,
      });

      return apiSuccess({ id }, 201, { message: 'Clip creado exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error creando clip', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'POST_CLIP' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
