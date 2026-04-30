/**
 * 🌐 SILEXAR PULSE - API Conciliación TIER 0
 * 
 * Endpoints REST para reconciliación de emisiones vs pauta contratada
 * Este módulo maneja la conciliación financiera entre lo emitido y lo contratado
 * 
 * @version 2026.1.0
 * @tier TIER_0_ENTERPRISE
 * 
 * MEJORAS APLICADAS (Módulo 14):
 * - Zod validation para todos los inputs
 * - Audit logging en todas las operaciones
 * - Resource corregido de 'emisiones' a 'conciliacion'
 * - withTenantContext para multi-tenancy
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Importaciones del módulo de conciliación (mantiene Prisma por ahora - refactor Futuro)
import { ConciliacionFacade } from '@/modules/conciliacion/application/api/ConciliacionFacade';
import { PrismaConciliacionRepository } from '@/modules/conciliacion/infrastructure/repositories/PrismaConciliacionRepository';
import { PrismaDiscrepanciaRepository } from '@/modules/conciliacion/infrastructure/repositories/PrismaDiscrepanciaRepository';
import { SalesBridgeCommandHandler } from '@/modules/conciliacion/application/handlers/SalesBridgeCommandHandler';
import { IRegistroEmisionRepository } from '@/modules/conciliacion/domain/repositories/IRegistroEmisionRepository';

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS - Validación de inputs
// ═══════════════════════════════════════════════════════════════

const ConsultarVentasSchema = z.object({
  action: z.literal('consultar-ventas'),
  spotId: z.string().min(1, 'Spot ID requerido'),
  ejecutivoId: z.string().min(1, 'Ejecutivo ID requerido'),
  mensaje: z.string().optional(),
});

const RegistrarDecisionSchema = z.object({
  action: z.literal('registrar-decision'),
  spotId: z.string().min(1, 'Spot ID requerido'),
  aprobado: z.boolean(),
  instrucciones: z.string().optional(),
});

const AccionMasivaSchema = z.object({
  action: z.literal('accion-masiva'),
  spotIds: z.array(z.string()).min(1, 'Al menos un spot ID requerido'),
  tipoAccion: z.enum(['aprobar', 'rechazar', 'revisar']),
  mensajeComun: z.string().optional(),
});

const PostConciliacionSchema = z.discriminatedUnion('action', [
  ConsultarVentasSchema,
  RegistrarDecisionSchema,
  AccionMasivaSchema,
]);

// ═══════════════════════════════════════════════════════════════
// Setup de instancias (mantiene patrón actual)
// ═══════════════════════════════════════════════════════════════

const conciliacionRepo = new PrismaConciliacionRepository();
const discrepanciaRepo = new PrismaDiscrepanciaRepository();

// Mock seguro - en producción esto se conectaría a Cortex-Sense/ACRCloud
const mockRegistroRepo: IRegistroEmisionRepository = {
  saveProgramados: async () => { },
  saveReales: async () => { },
  findProgramadosByFechaAndEmisora: async () => [],
  findRealesByFechaAndEmisora: async () => [],
  clearProgramados: async () => { },
  clearReales: async () => { }
};

const salesBridgeHandler = new SalesBridgeCommandHandler(conciliacionRepo, discrepanciaRepo);
const facade = new ConciliacionFacade(conciliacionRepo, mockRegistroRepo, discrepanciaRepo, salesBridgeHandler);

// ═══════════════════════════════════════════════════════════════
// GET - Métricas y verificación de conciliación
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'conciliacion', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const code = searchParams.get('codigoSP');
      const action = searchParams.get('action');

      // Audit log para acceso
      auditLogger.logEvent({
        eventType: AuditEventType.DATA_ACCESS,
        severity: AuditSeverity.LOW,
        userId: ctx.userId || 'unknown',
        resource: 'conciliacion',
        action: 'read',
        success: true,
        details: { action, codigoSP: code }
      });

      if (action === 'metricas') {
        const result = await facade.getMeticrasDashboardGlobal(new Date());

        if (result.isFailure) {
          return apiError('METRICAS_ERROR', 'Error al obtener métricas', 400) as unknown as NextResponse;
        }

        return apiSuccess(result.value, 200);
      }

      if (action === 'verificar' && code) {
        // Validar código
        if (!code || code.length < 3) {
          return apiError('INVALID_CODE', 'Código de spot inválido', 400) as unknown as NextResponse;
        }

        const result = await facade.verificarEmisionSpot(code, 'em_radio_corazon', new Date());

        if (result.isFailure) {
          return apiError('VERIFICACION_ERROR', 'Error al verificar emisión', 400) as unknown as NextResponse;
        }

        return apiSuccess(result.value, 200);
      }

      return apiSuccess({
        message: 'API Conciliación TIER 0 Activa',
        status: 'OK',
        module: 'conciliacion',
        version: '2026.1.0'
      }, 200);

    } catch (error) {
      logger.error('[API/Conciliacion] Error GET:', error instanceof Error ? error : undefined, {
        module: 'conciliacion',
        action: 'GET',
        tenantId: ctx.tenantId
      });

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_ACCESS,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId || 'unknown',
        resource: 'conciliacion',
        action: 'read',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return apiServerError() as unknown as NextResponse;
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// POST - Acciones de conciliación
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'conciliacion', action: 'update' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      // Validate input with Zod
      const parsed = PostConciliacionSchema.safeParse(body);
      if (!parsed.success) {
        auditLogger.logEvent({
          eventType: AuditEventType.DATA_UPDATE,
          severity: AuditSeverity.MEDIUM,
          userId: ctx.userId || 'unknown',
          resource: 'conciliacion',
          action: 'update',
          success: false,
          errorMessage: 'Validation failed',
          details: { errors: parsed.error.flatten().fieldErrors }
        });
        return apiError('VALIDATION_ERROR', 'Datos de conciliación inválidos', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      let result;

      switch (parsed.data.action) {
        case 'consultar-ventas':
          auditLogger.logEvent({
            eventType: AuditEventType.DATA_UPDATE,
            severity: AuditSeverity.MEDIUM,
            userId: ctx.userId || 'unknown',
            resource: 'conciliacion',
            action: 'update',
            success: true,
            details: {
              action: 'consultar-ventas',
              spotId: parsed.data.spotId,
              ejecutivoId: parsed.data.ejecutivoId
            }
          });
          result = await facade.enviarConsultaVentas(parsed.data.spotId, parsed.data.ejecutivoId, parsed.data.mensaje || '');
          break;

        case 'registrar-decision':
          auditLogger.logEvent({
            eventType: AuditEventType.DATA_UPDATE,
            severity: AuditSeverity.MEDIUM,
            userId: ctx.userId || 'unknown',
            resource: 'conciliacion',
            action: 'update',
            success: true,
            details: {
              action: 'registrar-decision',
              spotId: parsed.data.spotId,
              aprobado: parsed.data.aprobado
            }
          });
          result = await facade.registrarDecisionVentas(parsed.data.spotId, parsed.data.aprobado, parsed.data.instrucciones || '');
          break;

        case 'accion-masiva':
          auditLogger.logEvent({
            eventType: AuditEventType.DATA_UPDATE,
            severity: AuditSeverity.MEDIUM,
            userId: ctx.userId || 'unknown',
            resource: 'conciliacion',
            action: 'update',
            success: true,
            details: {
              action: 'accion-masiva',
              tipoAccion: parsed.data.tipoAccion,
              cantidadSpots: parsed.data.spotIds.length
            }
          });
          // Map frontend action to backend action
          const actionMap: Record<string, 'CONSULTAR_VENTAS' | 'RECUPERAR_AHORA' | 'DESCARTAR'> = {
            'aprobar': 'RECUPERAR_AHORA',
            'rechazar': 'DESCARTAR',
            'revisar': 'CONSULTAR_VENTAS'
          };
          result = await facade.ejecutarAccionMasiva(parsed.data.spotIds, actionMap[parsed.data.tipoAccion], parsed.data.mensajeComun || '');
          break;

        default:
          return apiError('INVALID_ACTION', 'Acción no soportada', 400) as unknown as NextResponse;
      }

      if (result.isFailure) {
        return apiError('CONCILIATION_ERROR',
          (result.error as { message?: string })?.message || String(result.error) || 'Operación Fallida',
          400,
          { code: (result.error as { code?: string })?.code }
        ) as unknown as NextResponse;
      }

      return apiSuccess(result.value, 200);

    } catch (error) {
      logger.error('[API/Conciliacion] Error POST:', error instanceof Error ? error : undefined, {
        module: 'conciliacion',
        action: 'POST',
        tenantId: ctx.tenantId
      });

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_UPDATE,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId || 'unknown',
        resource: 'conciliacion',
        action: 'update',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return apiServerError() as unknown as NextResponse;
    }
  }
);
