/**
 * GET /api/registro-emision  — List emission records
 * POST /api/registro-emision — Register an emission
 * PUT /api/registro-emision  — Confirm/update an emission record
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 * Resource: 'emisiones' — accessible by OPERADOR_EMISION, PROGRAMADOR, and above.
 */

import { logger } from '@/lib/observability';
import { z } from 'zod';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiServerError, getUserContext } from '@/lib/api/response';

import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { db } from '@/lib/db';
import { spotsTanda, estadoSpotPautaEnum, metodoConfirmacionEnum } from '@/lib/db/emision-schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// ─── Zod Schemas ──────────────────────────────────────────────

const createEmisionSchema = z.object({
  spotTandaId: z.string().uuid('spotTandaId debe ser un UUID válido'),
  cunaNombre: z.string().min(1).optional(),
  horaProgramada: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)').optional(),
  horaEmision: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)').optional(),
  metodo: z.enum(['manual', 'fingerprint', 'shazam', 'automatico', 'speech_to_text']).optional(),
  confianza: z.number().int().min(0).max(100).optional(),
});

const updateEmisionSchema = z.object({
  id: z.string().uuid('id debe ser un UUID válido'),
  confirmado: z.boolean().optional(),
  confianza: z.number().int().min(0).max(100).optional(),
  horaEmision: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)').optional(),
});

// ─── GET /api/registro-emision ───────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url)
      const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]
      const estado = searchParams.get('estado') || ''

      return await withTenantContext(ctx.tenantId, async () => {
        // Consultar spots con filtros de fecha y estado
        const spotsQuery = db.select()
          .from(spotsTanda)
          .where(
            estado === 'confirmado' ? eq(spotsTanda.estado, 'confirmado') :
              estado === 'pendiente' ? eq(spotsTanda.estado, 'programado') :
                estado === 'no_emitido' ? eq(spotsTanda.estado, 'no_emitido') :
                  undefined
          )
          .limit(100);

        const spots = await spotsQuery;

        // Calcular estadísticas
        const allSpots = spots.length > 0 ? spots : [];
        const stats = {
          total: allSpots.length,
          emitidos: allSpots.filter(s => s.estado === 'emitido' || s.estado === 'confirmado').length,
          confirmados: allSpots.filter(s => s.estado === 'confirmado').length,
          pendientes: allSpots.filter(s => s.estado === 'programado').length,
          noEmitidos: allSpots.filter(s => s.estado === 'no_emitido').length,
          porcentajeEmision: allSpots.length > 0
            ? Math.round((allSpots.filter(s => s.estado === 'emitido' || s.estado === 'confirmado').length / allSpots.length) * 100)
            : 0,
          confianzaPromedio: 0,
        }

        // Mapear datos para compatibilidad con frontend
        // Nota: spotsTanda no tiene horaProgramada, se usa valor por defecto
        const data = allSpots.map(spot => ({
          id: spot.id,
          spotTandaId: spot.id,
          cunaNombre: spot.cunaId || 'Sin nombre',
          horaProgra: '00:00',
          horaEmision: spot.horaEmisionReal?.toString() || null,
          emitido: spot.estado === 'emitido' || spot.estado === 'confirmado',
          confirmado: spot.estado === 'confirmado',
          metodo: spot.metodoConfirmacion || null,
          confianza: spot.confianzaConfirmacion || 0,
        }));

        return apiSuccess({ data, stats, fecha })
      });
    } catch (error) {
      logger.error('[API/RegistroEmision] Error GET:', error instanceof Error ? error : undefined, {
        module: 'registro-emision',
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al leer emisiones',
        metadata: { module: 'registro-emision', action: 'GET' }
      });
      return apiServerError()
    }
  }
)

// ─── POST /api/registro-emision ──────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400)
      }

      // Validar con Zod
      const parsed = createEmisionSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en la validación de los datos', 422, parsed.error.flatten().fieldErrors)
      }

      const { spotTandaId, cunaNombre, horaProgramada, horaEmision, metodo, confianza } = parsed.data;

      // Actualizar el spot_tanda con los datos de emisión
      await db.update(spotsTanda)
        .set({
          estado: metodo === 'manual' ? 'confirmado' : 'emitido',
          horaEmisionReal: horaEmision || new Date().toISOString(),
          metodoConfirmacion: metodo || 'manual',
          confianzaConfirmacion: confianza ?? (metodo === 'manual' ? 100 : 0),
          fechaHoraConfirmacion: new Date(),
        })
        .where(eq(spotsTanda.id, spotTandaId));

      // Obtener el registro actualizado
      const [updatedSpot] = await db.select().from(spotsTanda).where(eq(spotsTanda.id, spotTandaId)).limit(1);

      const newRegistro = {
        id: updatedSpot?.id || spotTandaId,
        spotTandaId,
        cunaNombre: cunaNombre || 'Sin nombre',
        horaProgra: horaProgramada || '00:00',
        horaEmision: horaEmision || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        emitido: true,
        confirmado: metodo === 'manual',
        metodo: metodo || 'manual',
        confianza: confianza ?? (metodo === 'manual' ? 100 : 0),
      };

      // Log de auditoría exitoso
      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        message: 'Emisión registrada exitosamente',
        metadata: { module: 'registro-emision', spotTandaId, metodo, confianza }
      });

      return apiSuccess(newRegistro, 201, { message: 'Emisión registrada' })
    } catch (error) {
      logger.error('[API/RegistroEmision] Error POST:', error instanceof Error ? error : undefined, {
        module: 'registro-emision',
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al registrar emisión',
        metadata: { module: 'registro-emision', action: 'POST' }
      });
      return apiServerError()
    }
  }
)

// ─── PUT /api/registro-emision ───────────────────────────────────────────────

export const PUT = withApiRoute(
  { resource: 'emisiones', action: 'update' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400)
      }

      // Validar con Zod
      const parsed = updateEmisionSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en la validación de los datos', 422, parsed.error.flatten().fieldErrors)
      }

      const { id, confirmado, confianza, horaEmision } = parsed.data;

      // Buscar el registro actual
      const [existingSpot] = await db.select().from(spotsTanda).where(eq(spotsTanda.id, id)).limit(1);
      if (!existingSpot) {
        return apiNotFound('registro-emision')
      }

      // Actualizar con los nuevos valores
      await db.update(spotsTanda)
        .set({
          estado: confirmado ? 'confirmado' : existingSpot.estado,
          confianzaConfirmacion: confianza ?? existingSpot.confianzaConfirmacion,
          horaEmisionReal: horaEmision || existingSpot.horaEmisionReal?.toString(),
          fechaHoraConfirmacion: confirmado ? new Date() : existingSpot.fechaHoraConfirmacion,
        })
        .where(eq(spotsTanda.id, id));

      // Obtener el registro actualizado
      const [updatedSpot] = await db.select().from(spotsTanda).where(eq(spotsTanda.id, id)).limit(1);

      const registro = {
        id: updatedSpot.id,
        spotTandaId: updatedSpot.id,
        cunaNombre: updatedSpot.cunaId || 'Sin nombre',
        horaProgra: '00:00',
        horaEmision: updatedSpot.horaEmisionReal?.toString() || null,
        emitido: updatedSpot.estado === 'emitido' || updatedSpot.estado === 'confirmado',
        confirmado: updatedSpot.estado === 'confirmado',
        metodo: updatedSpot.metodoConfirmacion || null,
        confianza: updatedSpot.confianzaConfirmacion || 0,
      };

      // Log de auditoría exitoso
      auditLogger.log({
        type: AuditEventType.DATA_UPDATE,
        message: 'Emisión actualizada exitosamente',
        metadata: { module: 'registro-emision', id, confirmado, confianza }
      });

      return apiSuccess(registro, 200, { message: 'Registro actualizado' })
    } catch (error) {
      logger.error('[API/RegistroEmision] Error PUT:', error instanceof Error ? error : undefined, {
        module: 'registro-emision',
        action: 'PUT',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al actualizar emisión',
        metadata: { module: 'registro-emision', action: 'PUT' }
      });
      return apiServerError()
    }
  }
)
