/**
 * 🚨 API Alertas de Programación TIER 0
 * 
 * Sistema de alertas interdepartamental
 * 
 * @version 2050.1.0
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';
import { db } from '@/lib/db';
import { alertasProgramacion } from '@/lib/db/emision-schema';
import { eq, and } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const estado = searchParams.get('estado');
        const prioridad = searchParams.get('prioridad');

        // Construir condiciones de filtro
        const condiciones: ReturnType<typeof eq>[] = [];
        if (estado && estado !== 'todas') {
          condiciones.push(eq(alertasProgramacion.estado, estado as 'nueva' | 'en_revision' | 'asignada' | 'resuelta' | 'escalada' | 'cerrada'));
        }
        if (prioridad && prioridad !== 'todas') {
          condiciones.push(eq(alertasProgramacion.prioridad, prioridad as 'baja' | 'media' | 'alta' | 'critica'));
        }

        // Consultar alertas desde la base de datos
        const alertasDB = await db.select().from(alertasProgramacion)
          .where(condiciones.length > 0 ? and(...condiciones) : undefined)
          .limit(100);

        // Mapear datos al formato esperado por el frontend
        const alertas = alertasDB.map(alerta => ({
          id: alerta.id,
          anunciante: alerta.anuncianteNombre || '',
          campana: alerta.campanaNombre || '',
          material: alerta.materialNombre || '',
          tipoProblema: alerta.tipoProblema,
          descripcion: alerta.descripcionProblema || '',
          fechaProgramada: alerta.fechaProgramada?.toString() || '',
          horaProgramada: alerta.horaProgramada?.toString() || '',
          prioridad: alerta.prioridad,
          estado: alerta.estado,
          causasPosibles: alerta.causasPosiblesIa || [],
          recomendacionIa: alerta.recomendacionIa,
          fechaCreacion: alerta.fechaCreacion.toISOString(),
        }));

        return NextResponse.json({
          success: true,
          data: alertas,
          stats: {
            total: alertas.length,
            nuevas: alertas.filter(a => a.estado === 'nueva').length,
            enRevision: alertas.filter(a => a.estado === 'en_revision').length,
            resueltas: alertas.filter(a => a.estado === 'resuelta').length,
            criticas: alertas.filter(a => a.prioridad === 'critica').length
          }
        });
      });
    } catch (error) {
      logger.error('[API/RegistroEmision/Alertas] Error GET:', error instanceof Error ? error : undefined, { module: 'registro-emision/alertas', action: 'GET', userId: ctx.userId });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al leer alertas',
        metadata: { module: 'registro-emision/alertas', action: 'GET' }
      });
      return apiServerError()
    }
  }
);

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        const {
          anunciante,
          campana,
          material,
          tipoProblema,
          descripcion,
          fechaProgramada,
          horaProgramada,
          prioridad
        } = body;

        // Insertar alerta en la base de datos
        const [nuevaAlerta] = await db.insert(alertasProgramacion).values({
          tenantId: ctx.tenantId,
          tipoProblema,
          descripcionProblema: descripcion,
          fechaProgramada: fechaProgramada || null,
          horaProgramada: horaProgramada || null,
          prioridad: prioridad || 'media',
          estado: 'nueva' as const,
          causasPosiblesIa: [
            'Cambio de programación de última hora',
            'Problema técnico en sistema de emisión',
            'Material no cargado en playout',
            'Conflicto de horarios no detectado'
          ],
          recomendacionIa: 'Verificar con el programador de turno y revisar el log de sistema',
          creadoPorId: ctx.userId,
        }).returning();

        return NextResponse.json({
          success: true,
          data: {
            id: nuevaAlerta.id,
            anunciante,
            campana,
            material,
            tipoProblema,
            descripcion,
            fechaProgramada,
            horaProgramada,
            prioridad: prioridad || 'media',
            estado: 'nueva',
            causasPosibles: [
              'Cambio de programación de última hora',
              'Problema técnico en sistema de emisión',
              'Material no cargado en playout',
              'Conflicto de horarios no detectado'
            ],
            recomendacionIa: 'Verificar con el programador de turno y revisar el log de sistema',
            fechaCreacion: nuevaAlerta.fechaCreacion.toISOString(),
          },
          message: 'Alerta creada y notificaciones enviadas'
        });
      });
    } catch (error) {
      logger.error('[API/RegistroEmision/Alertas] Error POST:', error instanceof Error ? error : undefined, { module: 'registro-emision/alertas', action: 'POST', userId: ctx.userId });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al crear alerta',
        metadata: { module: 'registro-emision/alertas', action: 'POST' }
      });
      return apiServerError()
    }
  }
);

export const PUT = withApiRoute(
  { resource: 'emisiones', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        const { id, estado, asignadoA, resolucion } = body;

        // Buscar alerta en la base de datos
        const [alertaExistente] = await db.select().from(alertasProgramacion).where(eq(alertasProgramacion.id, id)).limit(1);

        if (!alertaExistente) {
          return NextResponse.json({
            success: false,
            error: 'Alerta no encontrada'
          }, { status: 404 });
        }

        // Construir objeto de actualización
        const actualizaciones: Record<string, unknown> = {};
        if (estado) actualizaciones.estado = estado;
        if (asignadoA) {
          actualizaciones.asignadoAId = ctx.userId;
          actualizaciones.asignadoANombre = asignadoA;
          actualizaciones.fechaAsignacion = new Date();
        }
        if (estado === 'resuelta' && resolucion) {
          actualizaciones.resolucion = resolucion;
          actualizaciones.fechaResolucion = new Date();
          actualizaciones.resueltoPorId = ctx.userId;
        }

        const [alertaActualizada] = await db.update(alertasProgramacion)
          .set(actualizaciones)
          .where(eq(alertasProgramacion.id, id))
          .returning();

        return NextResponse.json({
          success: true,
          data: {
            id: alertaActualizada.id,
            anunciante: alertaActualizada.anuncianteNombre || '',
            campana: alertaActualizada.campanaNombre || '',
            material: alertaActualizada.materialNombre || '',
            tipoProblema: alertaActualizada.tipoProblema,
            descripcion: alertaActualizada.descripcionProblema || '',
            prioridad: alertaActualizada.prioridad,
            estado: alertaActualizada.estado,
            asignadoA: alertaActualizada.asignadoANombre,
          },
          message: estado === 'resuelta'
            ? `Alerta resuelta: ${resolucion}`
            : 'Alerta actualizada correctamente'
        });
      });
    } catch (error) {
      logger.error('[API/RegistroEmision/Alertas] Error PUT:', error instanceof Error ? error : undefined, { module: 'registro-emision/alertas', action: 'PUT', userId: ctx.userId });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al actualizar alerta',
        metadata: { module: 'registro-emision/alertas', action: 'PUT' }
      });
      return apiServerError()
    }
  }
);
