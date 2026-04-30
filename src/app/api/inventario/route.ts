/**
 * 🌐 SILEXAR PULSE - API Routes Inventario/Vencimientos
 * 
 * @description API REST endpoints para el "Torpedo Digital"
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';
import { DrizzleInventarioRepository } from '@/modules/inventario/infrastructure/repositories/DrizzleInventarioRepository';

// Repository instance
const repository = new DrizzleInventarioRepository();

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const createvencimientoschema = z.object({
  inventarioId: z.string().uuid('El ID del inventario debe ser un UUID válido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD'),
  estado: z.enum(['disponible', 'vendido', 'reservado', 'bloqueado', 'cortesia']).optional().default('reservado'),
  anuncianteId: z.string().uuid().optional().nullable(),
  precioVenta: z.number().optional().nullable(),
  notas: z.string().optional(),
});

// ─── GET /api/inventario ──────────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'inventario', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const tenantId = ctx.tenantId;
      const { searchParams } = new URL(req.url);
      const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];
      const emiId = searchParams.get('emisora') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // Get cupos and vencimientos in parallel
      const filters = { fecha, emiId: emiId || undefined };
      const pagination = { page, limit };

      const [cupos, stats, vencimientos] = await Promise.all([
        repository.findCupos(tenantId, filters, pagination),
        repository.getStats(tenantId, fecha),
        repository.findVencimientosByFecha(tenantId, fecha, emiId || undefined)
      ]);

      return NextResponse.json({
        success: true,
        data: cupos,
        vencimientos,
        stats,
        fecha
      });
    } catch (error) {
      logger.error('[API/Inventario] Error GET:', error instanceof Error ? error : undefined, { module: 'inventario', action: 'GET' });

      auditLogger.logEvent({
        eventType: AuditEventType.ACCESS_DENIED,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        resource: 'inventario',
        action: 'read',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error', module: 'inventario' }
      });

      return apiServerError();
    }
  }
);

// ─── POST /api/inventario ─────────────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'inventario', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const tenantId = ctx.tenantId;
      const userId = ctx.userId;

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ success: false, error: 'Request body must be valid JSON' }, { status: 400 });
      }

      const parseResult = createvencimientoschema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Datos inválidos',
          details: parseResult.error.flatten().fieldErrors
        }, { status: 400 });
      }

      const data = parseResult.data;

      const newVencimientos = await repository.createVencimientos(
        {
          inventarioId: data.inventarioId,
          fecha: data.fecha,
          estado: data.estado,
          anuncianteId: data.anuncianteId ?? undefined,
          precioVenta: data.precioVenta ?? undefined,
          notas: data.notas,
        },
        tenantId,
        userId
      );

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_CREATE,
        severity: AuditSeverity.LOW,
        userId: ctx.userId,
        resource: 'inventario',
        action: 'create',
        success: true,
        details: { vencimientosId: newVencimientos.id, inventarioId: data.inventarioId, module: 'inventario' }
      });

      return NextResponse.json({
        success: true,
        data: newVencimientos,
        message: 'Cupo reservado exitosamente'
      }, { status: 201 });
    } catch (error) {
      logger.error('[API/Inventario] Error POST:', error instanceof Error ? error : undefined, { module: 'inventario', action: 'POST' });

      auditLogger.logEvent({
        eventType: AuditEventType.ACCESS_DENIED,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        resource: 'inventario',
        action: 'create',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error', module: 'inventario' }
      });

      return apiServerError();
    }
  }
);
