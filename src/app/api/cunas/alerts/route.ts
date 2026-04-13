/**
 * SILEXAR PULSE - API Gestión de Alertas Enterprise TIER 0
 *
 * Endpoint para programar y gestionar alertas de vencimiento
 * Sistema de notificaciones automáticas 24/7
 *
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AlertConfig {
  id: string;
  cunaId: string;
  spxCodigo: string;
  cunaNombre: string;

  alertas: {
    diasAntes7: boolean;
    diasAntes1: boolean;
    alertarEjecutivo: boolean;
    alertarOperador: boolean;
    alertarComercial: boolean;
  };

  fechaFinVigencia: string;
  fechaAlerta7Dias?: string;
  fechaAlerta1Dia?: string;

  ejecutivoId?: string;
  ejecutivoEmail?: string;
  operadorId?: string;
  comercialId?: string;

  estado: 'activo' | 'pausado' | 'completado';
  createdAt: string;
  updatedAt: string;
}

interface ScheduledAlert {
  id: string;
  alertConfigId: string;
  cunaId: string;
  spxCodigo: string;
  tipo: 'weekly_warning' | 'urgent_warning' | 'expiration_notice';
  mensaje: string;
  fechaProgramada: string;
  horaProgramada: string;
  estado: 'pendiente' | 'enviada' | 'fallida' | 'cancelada';
  destinatarios: string[];
  prioridad: 'normal' | 'alta' | 'critica';
  acciones: string[];
  createdAt: string;
  sentAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS
// ═══════════════════════════════════════════════════════════════

const AlertasConfigSchema = z.object({
  diasAntes7: z.boolean().optional(),
  diasAntes1: z.boolean().optional(),
  alertarEjecutivo: z.boolean().optional(),
  alertarOperador: z.boolean().optional(),
  alertarComercial: z.boolean().optional(),
});

const CreateAlertConfigSchema = z.object({
  cunaId: z.string().min(1, 'cunaId es requerido'),
  spxCodigo: z.string().optional(),
  cunaNombre: z.string().optional(),
  fechaFinVigencia: z.string().min(1, 'fechaFinVigencia es requerida'),
  tipoCuna: z.string().optional(),
  alertas: AlertasConfigSchema.optional(),
  ejecutivoId: z.string().optional(),
  ejecutivoEmail: z.string().email().optional(),
  operadorId: z.string().optional(),
  comercialId: z.string().optional(),
});

const UpdateAlertConfigSchema = z.object({
  configId: z.string().min(1, 'configId es requerido'),
  alertas: AlertasConfigSchema.optional(),
  estado: z.enum(['activo', 'pausado', 'completado']).optional(),
});

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO EN MEMORIA (En producción: Base de datos)
// ═══════════════════════════════════════════════════════════════

const alertConfigs: Map<string, AlertConfig> = new Map();
let scheduledAlerts: ScheduledAlert[] = [];

// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDurationAnalysis(tipoCuna: string, diasRestantes: number): {
  duracionTipica: number;
  recomendacion: string;
  estado: 'ok' | 'corta' | 'larga';
} {
  const duracionesTipicas: Record<string, number> = {
    audio: 90,
    mencion: 30,
    presentacion: 180,
    cierre: 180,
    promo_ida: 14,
    jingle: 365
  };

  const tipica = duracionesTipicas[tipoCuna] || 90;

  if (diasRestantes < tipica * 0.3) {
    return { duracionTipica: tipica, recomendacion: 'Vigencia muy corta para este tipo', estado: 'corta' };
  } else if (diasRestantes > tipica * 3) {
    return { duracionTipica: tipica, recomendacion: 'Vigencia extendida - considere revisión periódica', estado: 'larga' };
  }

  return { duracionTipica: tipica, recomendacion: 'Vigencia adecuada', estado: 'ok' };
}

function scheduleAlertsForCuna(config: AlertConfig): ScheduledAlert[] {
  const alerts: ScheduledAlert[] = [];
  const fechaFin = new Date(config.fechaFinVigencia);

  if (config.alertas.diasAntes7) {
    const fecha7dias = subDays(fechaFin, 7);
    if (fecha7dias > new Date()) {
      alerts.push({
        id: `alert-${Date.now()}-7d`,
        alertConfigId: config.id,
        cunaId: config.cunaId,
        spxCodigo: config.spxCodigo,
        tipo: 'weekly_warning',
        mensaje: `La cuña "${config.cunaNombre}" (${config.spxCodigo}) vence en 7 días`,
        fechaProgramada: fecha7dias.toISOString().split('T')[0],
        horaProgramada: '09:00',
        estado: 'pendiente',
        destinatarios: [config.ejecutivoEmail || 'operaciones@silexar.cl'],
        prioridad: 'normal',
        acciones: ['extend', 'replace', 'review'],
        createdAt: new Date().toISOString()
      });
    }
  }

  if (config.alertas.diasAntes1) {
    const fecha1dia = subDays(fechaFin, 1);
    if (fecha1dia > new Date()) {
      const destinatarios = [config.ejecutivoEmail || 'operaciones@silexar.cl'];
      if (config.alertas.alertarOperador && config.operadorId) {
        destinatarios.push(config.operadorId);
      }
      if (config.alertas.alertarComercial && config.comercialId) {
        destinatarios.push(config.comercialId);
      }

      alerts.push({
        id: `alert-${Date.now()}-1d`,
        alertConfigId: config.id,
        cunaId: config.cunaId,
        spxCodigo: config.spxCodigo,
        tipo: 'urgent_warning',
        mensaje: `URGENTE: La cuña "${config.cunaNombre}" (${config.spxCodigo}) vence MAÑANA`,
        fechaProgramada: fecha1dia.toISOString().split('T')[0],
        horaProgramada: '12:00',
        estado: 'pendiente',
        destinatarios,
        prioridad: 'critica',
        acciones: ['extend_immediately', 'deactivate', 'emergency_replace'],
        createdAt: new Date().toISOString()
      });
    }
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════
// POST - Crear configuración de alertas
// Requiere: cunas:create
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'cunas', action: 'create' },
  async ({ ctx, req }) => {
    try {
      // Validate input with Zod
      let body: unknown;
      try { body = await req.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
      const parsed = CreateAlertConfigSchema.safeParse(body);
      if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

      return await withTenantContext(ctx.tenantId, async () => {
        const {
          cunaId, spxCodigo, cunaNombre, fechaFinVigencia,
          alertas, ejecutivoId, ejecutivoEmail, tipoCuna
        } = parsed.data;

        const configId = `alert-config-${Date.now()}`;

        const config: AlertConfig = {
          id: configId,
          cunaId,
          spxCodigo: spxCodigo || 'SPX000000',
          cunaNombre: cunaNombre || 'Cuña sin nombre',
          alertas: {
            diasAntes7: alertas?.diasAntes7 ?? true,
            diasAntes1: alertas?.diasAntes1 ?? true,
            alertarEjecutivo: alertas?.alertarEjecutivo ?? true,
            alertarOperador: alertas?.alertarOperador ?? false,
            alertarComercial: alertas?.alertarComercial ?? false
          },
          fechaFinVigencia,
          fechaAlerta7Dias: subDays(new Date(fechaFinVigencia), 7).toISOString().split('T')[0],
          fechaAlerta1Dia: subDays(new Date(fechaFinVigencia), 1).toISOString().split('T')[0],
          ejecutivoId,
          ejecutivoEmail,
          estado: 'activo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        alertConfigs.set(configId, config);

        const newAlerts = scheduleAlertsForCuna(config);
        scheduledAlerts.push(...newAlerts);

        const diasRestantes = calculateDaysRemaining(fechaFinVigencia);
        const analisis = getDurationAnalysis(tipoCuna || 'audio', diasRestantes);

        return apiSuccess({ 
          config, 
          alertasProgramadas: newAlerts.length, 
          diasRestantes, 
          analisis 
        }, 201);
      });
    } catch (error) {
      logger.error('[API/Alerts] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'alerts',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// GET - Obtener análisis de vigencia y alertas
// Requiere: cunas:read
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'cunas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const cunaId = searchParams.get('cunaId');
        const fechaFin = searchParams.get('fechaFin');
        const tipoCuna = searchParams.get('tipoCuna') || 'audio';

        // Duration analysis only
        if (fechaFin) {
          const diasRestantes = calculateDaysRemaining(fechaFin);
          const analisis = getDurationAnalysis(tipoCuna, diasRestantes);

          return apiSuccess({
            diasRestantes,
            diasRestantesFormateado: diasRestantes > 0
              ? `${diasRestantes} días restantes`
              : diasRestantes === 0
                ? '¡Vence hoy!'
                : `Venció hace ${Math.abs(diasRestantes)} días`,
            analisis,
            alertasRecomendadas: {
              diasAntes7: diasRestantes > 7,
              diasAntes1: diasRestantes > 1,
              alertarEjecutivo: true
            }
          });
        }

        // Alert config for a specific cuna
        if (cunaId) {
          const config = Array.from(alertConfigs.values()).find(c => c.cunaId === cunaId);
          const cunaAlerts = scheduledAlerts.filter(a => a.cunaId === cunaId);

          return apiSuccess({
            config: config ?? null,
            alertas: cunaAlerts,
            totalAlertas: cunaAlerts.length
          });
        }

        // General stats
        const pendientes = scheduledAlerts.filter(a => a.estado === 'pendiente').length;
        const hoy = new Date().toISOString().split('T')[0];
        const alertasHoy = scheduledAlerts.filter(a => a.fechaProgramada === hoy && a.estado === 'pendiente');

        return apiSuccess({
          totalConfigs: alertConfigs.size,
          alertasPendientes: pendientes,
          alertasHoy: alertasHoy.length,
          proximasAlertas: scheduledAlerts
            .filter(a => a.estado === 'pendiente')
            .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada))
            .slice(0, 10)
        });
      });
    } catch (error) {
      logger.error('[API/Alerts] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'alerts',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// PUT - Actualizar configuración de alertas
// Requiere: cunas:update
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
  { resource: 'cunas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      // Validate input with Zod
      let body: unknown;
      try { body = await req.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
      const parsed = UpdateAlertConfigSchema.safeParse(body);
      if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

      return await withTenantContext(ctx.tenantId, async () => {
        const config = alertConfigs.get(parsed.data.configId);
        if (!config) return apiError('NOT_FOUND', 'Configuración no encontrada', 404);

        if (parsed.data.alertas) {
          config.alertas = { ...config.alertas, ...parsed.data.alertas };
        }
        if (parsed.data.estado) {
          config.estado = parsed.data.estado;
        }
        config.updatedAt = new Date().toISOString();

        alertConfigs.set(parsed.data.configId, config);

        // Reschedule alerts if needed
        if (parsed.data.alertas && config.estado === 'activo') {
          scheduledAlerts = scheduledAlerts.map(a =>
            a.alertConfigId === parsed.data.configId
              ? { ...a, estado: 'cancelada' as const }
              : a
          );
          const newAlerts = scheduleAlertsForCuna(config);
          scheduledAlerts.push(...newAlerts);
        }

        return apiSuccess({
          config,
          actualizadoPor: ctx.userId,
          fechaActualizacion: new Date().toISOString()
        });
      });
    } catch (error) {
      logger.error('[API/Alerts] Error PUT:', error instanceof Error ? error : undefined, { 
        module: 'alerts',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
