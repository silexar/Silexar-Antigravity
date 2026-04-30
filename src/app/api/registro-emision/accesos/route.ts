/**
 * POST /api/registro-emision/accesos
 * Crea un acceso seguro (link temporal + código).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';

import {
  DrizzleLinkTemporalRepository,
  CrearAccesoSeguroUseCase,
} from '@/modules/registro-emision';

const repo = new DrizzleLinkTemporalRepository();
const crearUseCase = new CrearAccesoSeguroUseCase(repo);

const schema = z.object({
  verificacionId: z.string().uuid().optional(),
  clipEvidenciaId: z.string().uuid().optional(),
  tipoLink: z.enum(['unico', 'basket']).default('unico'),
  itemsJson: z.array(z.object({
    materialNombre: z.string(),
    spxCode: z.string().optional(),
    clipUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    esDigital: z.boolean().optional(),
    horaEmision: z.string().optional(),
  })).optional(),
  materialNombre: z.string().optional(),
  spxCode: z.string().optional(),
  clipUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  esDigital: z.boolean().optional(),
  clienteNombre: z.string().optional(),
  clienteEmail: z.string().email(),
  campanaNombre: z.string().optional(),
  usosPermitidos: z.number().int().min(0).default(0),
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

      const result = await crearUseCase.execute({
        tenantId: ctx.tenantId,
        creadoPorId: ctx.userId,
        ...parsed.data,
      });

      return apiSuccess(result, 201, { message: 'Acceso seguro creado' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error creando acceso seguro', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'POST_ACCESO', userId: ctx.userId });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al crear acceso seguro',
        metadata: { module: 'registro-emision', action: 'POST_ACCESO' }
      });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
