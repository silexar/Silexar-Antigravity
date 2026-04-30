/**
 * Health Monitoring API - Enterprise Health Monitoring System
 * CATEGORY: CRITICAL - DDD + CQRS
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { v4 as uuidv4 } from 'uuid';
import { MonitoreoSalud, MonitoreoSaludProps, HEALTH_STATUS_LABELS, INCIDENT_SEVERITY_LABELS } from '@/modules/configuracion/domain/entities/MonitoreoSalud';

// ==================== MOCK DATABASE ====================

const mockMonitoreos = new Map<string, MonitoreoSaludProps>();

function getMonitoreoByTenant(tenantId: string): MonitoreoSaludProps | undefined {
  return Array.from(mockMonitoreos.values()).find(m => m.tenantId === tenantId);
}

function createMonitoreo(data: Omit<MonitoreoSaludProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): MonitoreoSaludProps {
  const now = new Date().toISOString();
  const monitoreo: MonitoreoSaludProps = {
    ...data,
    id: uuidv4(),
    version: 1,
    ultimoCheck: now,
    siguienteCheck: new Date(Date.now() + 60000).toISOString(),
    creadoAt: now,
    actualizadoAt: now,
  } as MonitoreoSaludProps;
  mockMonitoreos.set(monitoreo.id, monitoreo);
  return monitoreo;
}

function updateMonitoreo(id: string, updates: Partial<MonitoreoSaludProps>): MonitoreoSaludProps | undefined {
  const existing = mockMonitoreos.get(id);
  if (!existing) return undefined;

  const updated: MonitoreoSaludProps = {
    ...existing,
    ...updates,
    version: existing.version + 1,
    actualizadoAt: new Date().toISOString(),
  } as MonitoreoSaludProps;
  mockMonitoreos.set(id, updated);
  return updated;
}

// ==================== SCHEMAS ====================

const CreateMonitoreoSchema = z.object({
  nombre: z.string().min(1).max(255),
});

const AddComponentSchema = z.object({
  nombre: z.string().min(1).max(255),
  tipo: z.string().min(1),
  region: z.string().optional(),
  umbrales: z.array(z.object({
    metrica: z.enum(['CPU', 'MEMORY', 'DISK', 'NETWORK', 'LATENCY', 'ERROR_RATE', 'REQUEST_RATE', 'AVAILABILITY']),
    warningThreshold: z.number(),
    criticalThreshold: z.number(),
  })).optional(),
});

const UpdateMetricsSchema = z.object({
  componentId: z.string().uuid(),
  metricas: z.array(z.object({
    tipo: z.enum(['CPU', 'MEMORY', 'DISK', 'NETWORK', 'LATENCY', 'ERROR_RATE', 'REQUEST_RATE', 'AVAILABILITY']),
    valor: z.number(),
    unidad: z.string().min(1),
  })),
});

const CreateIncidentSchema = z.object({
  titulo: z.string().min(1).max(255),
  descripcion: z.string().optional(),
  severity: z.enum(['P1', 'P2', 'P3', 'P4']),
  componentId: z.string().uuid().optional(),
  metricas: z.array(z.object({
    tipo: z.enum(['CPU', 'MEMORY', 'DISK', 'NETWORK', 'LATENCY', 'ERROR_RATE', 'REQUEST_RATE', 'AVAILABILITY']),
    valor: z.number(),
    umbral: z.number(),
  })).optional(),
});

const ResolveIncidentSchema = z.object({
  causaRaiz: z.string().optional(),
  solucion: z.string().optional(),
  impactedServices: z.array(z.string()).optional(),
  impactedUsers: z.number().optional(),
});

// ==================== GET /api/health ====================

export const GET = withApiRoute(
  { resource: 'health_monitoring', action: 'read', skipCsrf: true },
  async ({ ctx }) => {
    try {
      const tenantId = ctx.tenantId;
      let monitoreo = getMonitoreoByTenant(tenantId);

      // Create default if not exists
      if (!monitoreo) {
        const entity = MonitoreoSalud.createDefault(tenantId, 'Health Monitor');
        monitoreo = entity.toSnapshot();
        createMonitoreo(monitoreo);
      }

      const componentsSummary = monitoreo.componentes.map(c => ({
        id: c.id,
        nombre: c.nombre,
        tipo: c.tipo,
        region: c.region,
        estado: c.estado,
        estadoInfo: HEALTH_STATUS_LABELS[c.estado],
        metricasCount: c.metricas.length,
        uptimePercentage: c.uptimePercentage,
        consecutiveIncidents: c.consecutiveIncidents,
      }));

      return apiSuccess({
        id: monitoreo.id,
        nombre: monitoreo.nombre,
        estado: monitoreo.estado,
        estadoInfo: HEALTH_STATUS_LABELS[monitoreo.estado],
        ultimoCheck: monitoreo.ultimoCheck,
        siguienteCheck: monitoreo.siguienteCheck,
        componentes: componentsSummary,
        componentesCount: monitoreo.componentes.length,
        incidentesActivos: monitoreo.incidentesActivos.map(i => ({
          id: i.id,
          titulo: i.titulo,
          severity: i.severity,
          severityInfo: INCIDENT_SEVERITY_LABELS[i.severity],
          status: i.status,
          triggeredAt: i.triggeredAt,
        })),
        activeIncidentsCount: monitoreo.incidentesActivos.length,
        criticalIncidentsCount: monitoreo.incidentesActivos.filter(i => i.severity === 'P1').length,
        slas: monitoreo.slas.map(s => ({
          id: s.id,
          nombre: s.nombre,
          tipo: s.tipo,
          objetivo: s.objetivo,
          ventana: s.ventana,
          habilitado: s.habilitado,
        })),
        alertChannelsCount: monitoreo.canalesAlerta.filter(c => c.enabled).length,
      }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error GET /api/health', error instanceof Error ? error : undefined);
      return apiServerError() as unknown as NextResponse;
    }
  }
);

// ==================== POST /api/health ====================

export const POST = withApiRoute(
  { resource: 'health_monitoring', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const tenantId = ctx.tenantId;
      const userId = ctx.userId;
      const body = await req.json();
      const { action } = body;

      let monitoreo = getMonitoreoByTenant(tenantId);
      if (!monitoreo) {
        const entity = MonitoreoSalud.createDefault(tenantId, 'Health Monitor');
        monitoreo = entity.toSnapshot();
        createMonitoreo(monitoreo);
      }

      switch (action) {
        case 'create_incident': {
          const parsed = CreateIncidentSchema.safeParse(body.data || body);

          const entity = MonitoreoSalud.fromSnapshot(monitoreo);
          const incidentId = entity.createIncident({
            titulo: parsed.data?.titulo || body.titulo,
            descripcion: parsed.data?.descripcion || body.descripcion,
            severity: (parsed.data?.severity || body.severity) as 'P1' | 'P2' | 'P3' | 'P4',
            componentId: parsed.data?.componentId || body.componentId,
            metricas: parsed.data?.metricas || body.metricas,
          });

          updateMonitoreo(monitoreo.id, entity.toSnapshot());

          auditLogger.log({
            type: AuditEventType.INCIDENT_CREATED,
            userId,
            metadata: { incidentId, severity: body.severity },
          });

          return apiSuccess({
            id: incidentId,
            titulo: parsed.data?.titulo || body.titulo,
            severity: parsed.data?.severity || body.severity,
            severityInfo: INCIDENT_SEVERITY_LABELS[parsed.data?.severity as keyof typeof INCIDENT_SEVERITY_LABELS] || INCIDENT_SEVERITY_LABELS[body.severity as keyof typeof INCIDENT_SEVERITY_LABELS],
          }, 201) as unknown as NextResponse;
        }

        case 'acknowledge_incident': {
          const incidentId = body.incidentId;
          const entity = MonitoreoSalud.fromSnapshot(monitoreo);

          entity.acknowledgeIncident(incidentId, userId, userId);
          updateMonitoreo(monitoreo.id, entity.toSnapshot());

          return apiSuccess({ acknowledged: true, incidentId }) as unknown as NextResponse;
        }

        case 'resolve_incident': {
          const incidentId = body.incidentId;
          const resolveData = body.data || {};

          const entity = MonitoreoSalud.fromSnapshot(monitoreo);
          entity.resolveIncident(incidentId, {
            causaRaiz: resolveData.causaRaiz,
            solucion: resolveData.solucion,
            impactedServices: resolveData.impactedServices,
            impactedUsers: resolveData.impactedUsers,
          });
          updateMonitoreo(monitoreo.id, entity.toSnapshot());

          auditLogger.log({
            type: AuditEventType.INCIDENT_RESOLVED,
            userId,
            metadata: { incidentId, causaRaiz: resolveData.causaRaiz },
          });

          return apiSuccess({ resolved: true, incidentId }) as unknown as NextResponse;
        }

        case 'update_metrics': {
          const parsed = UpdateMetricsSchema.safeParse(body.data || body);
          if (!parsed.success) {
            return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
          }

          const entity = MonitoreoSalud.fromSnapshot(monitoreo);
          entity.updateComponentMetrics(parsed.data.componentId, parsed.data.metricas);
          updateMonitoreo(monitoreo.id, entity.toSnapshot());

          return apiSuccess({ updated: true }) as unknown as NextResponse;
        }

        case 'add_component': {
          const parsed = AddComponentSchema.safeParse(body.data || body);
          if (!parsed.success) {
            return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
          }

          const entity = MonitoreoSalud.fromSnapshot(monitoreo);
          const componentId = entity.addComponent({
            nombre: parsed.data.nombre,
            tipo: parsed.data.tipo,
            region: parsed.data.region,
            umbrales: parsed.data.umbrales,
          });
          updateMonitoreo(monitoreo.id, entity.toSnapshot());

          return apiSuccess({ id: componentId, nombre: parsed.data.nombre }, 201) as unknown as NextResponse;
        }

        case 'add_runbook': {
          const runbookData = body.data || body;
          const entity = MonitoreoSalud.fromSnapshot(monitoreo);
          const runbookId = entity.addRunbook({
            nombre: runbookData.nombre,
            descripcion: runbookData.descripcion,
            pasos: runbookData.pasos || [],
            applicableIncidents: runbookData.applicableIncidents,
          });
          updateMonitoreo(monitoreo.id, entity.toSnapshot());

          return apiSuccess({ id: runbookId, nombre: runbookData.nombre }, 201) as unknown as NextResponse;
        }

        default:
          return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
      }
    } catch (error) {
      logger.error('Error POST /api/health', error instanceof Error ? error : undefined);
      return apiServerError() as unknown as NextResponse;
    }
  }
);
