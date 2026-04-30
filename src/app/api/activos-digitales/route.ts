/**
 * 🌐 SILEXAR PULSE - API Activos Digitales TIER 0
 * 
 * Endpoints REST para gestión de activos publicitarios digitales
 * con segmentación avanzada
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 * 
 * MEJORAS APLICADAS (Módulo 13):
 * - Zod validation para todos los inputs
 * - Audit logging en todas las operaciones CRUD
 * - withTenantContext para multi-tenancy
 * - Resource type 'activos-digitales' en RBAC
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';
import { db } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS - Validación de inputs
// ═══════════════════════════════════════════════════════════════

const CreateActivoDigitalSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(255),
  tipo: z.string().min(1, 'Tipo requerido'),
  tipoCategoria: z.string().min(1, 'Categoría requerida'),
  anuncianteId: z.string().uuid().optional(),
  anuncianteNombre: z.string().optional(),
  campanaId: z.string().uuid().optional(),
  campanaNombre: z.string().optional(),
  formatoPrincipal: z.string().optional(),
  segDemografica: z.object({
    edadRangos: z.array(z.string()).optional(),
  }).optional(),
  segGeografica: z.object({
    regiones: z.array(z.string()).optional(),
  }).optional(),
  segDispositivo: z.object({
    tipos: z.array(z.string()).optional(),
  }).optional(),
  segConductual: z.object({
    intereses: z.array(z.string()).optional(),
  }).optional(),
  alcanceEstimado: z.string().optional(),
  presupuesto: z.object({
    tipo: z.enum(['diario', 'total', 'mensual']).optional(),
    monto: z.number().positive().optional(),
  }).optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  plataformas: z.array(z.string()).optional(),
});

const UpdateMasivoSchema = z.object({
  activoIds: z.array(z.string()).min(1, 'Al menos un ID requerido'),
  accion: z.enum(['activar', 'pausar', 'archivar']),
});

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ActivoDigitalData {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  tipoCategoria: string;
  estado: string;
  tenantId: string;
  anuncianteId: string;
  anuncianteNombre: string;
  campanaId?: string;
  campanaNombre?: string;

  // Creatividad
  formatoPrincipal: string;
  urlPreview?: string;

  // Segmentación resumen
  segmentacionResumen: {
    demografica: string[];
    geografica: string[];
    dispositivos: string[];
    intereses: string[];
  };
  alcanceEstimado: string;

  // Métricas
  impresiones: number;
  clics: number;
  ctr: number;
  conversiones: number;
  costoTotal: number;
  roas: number;

  // Presupuesto
  presupuestoTipo: string;
  presupuestoMonto: number;
  presupuestoGastado: number;

  // Programación
  fechaInicio: string;
  fechaFin: string;
  plataformas: string[];

  // Auditoría
  fechaCreacion: string;
  creadoPor: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA (en memoria - refactorizar a BD en Fase 2)
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line prefer-const
let mockActivos: ActivoDigitalData[] = [
  {
    id: 'adx-001',
    codigo: 'ADX000001',
    nombre: 'Banner Verano Banco Chile 300x250',
    tipo: 'banner_display',
    tipoCategoria: 'banner',
    estado: 'activo',
    tenantId: 'tenant-001',
    anuncianteId: 'anc-001',
    anuncianteNombre: 'Banco de Chile',
    campanaId: 'camp-001',
    campanaNombre: 'Verano 2025',
    formatoPrincipal: '300x250',
    urlPreview: '/assets/banners/banco-chile-300x250.png',
    segmentacionResumen: {
      demografica: ['25-44 años', 'ABC1-C2'],
      geografica: ['RM', 'Valparaíso'],
      dispositivos: ['Mobile', 'Desktop'],
      intereses: ['Finanzas', 'Inversiones']
    },
    alcanceEstimado: '1.2M',
    impresiones: 458720,
    clics: 8456,
    ctr: 1.84,
    conversiones: 234,
    costoTotal: 2450000,
    roas: 3.2,
    presupuestoTipo: 'diario',
    presupuestoMonto: 150000,
    presupuestoGastado: 2450000,
    fechaInicio: '2025-01-15',
    fechaFin: '2025-02-28',
    plataformas: ['google_ads', 'meta_ads'],
    fechaCreacion: '2025-01-10T14:30:00Z',
    creadoPor: 'María García'
  },
  {
    id: 'adx-002',
    codigo: 'ADX000002',
    nombre: 'Video Pre-roll Coca-Cola 15s',
    tipo: 'video_preroll',
    tipoCategoria: 'video',
    estado: 'activo',
    tenantId: 'tenant-001',
    anuncianteId: 'anc-002',
    anuncianteNombre: 'Coca-Cola Chile',
    formatoPrincipal: '1920x1080',
    segmentacionResumen: {
      demografica: ['18-34 años', 'Todos'],
      geografica: ['Todo Chile'],
      dispositivos: ['Mobile', 'Smart TV'],
      intereses: ['Entretenimiento', 'Música', 'Deportes']
    },
    alcanceEstimado: '3.5M',
    impresiones: 1254800,
    clics: 45620,
    ctr: 3.64,
    conversiones: 890,
    costoTotal: 8500000,
    roas: 4.1,
    presupuestoTipo: 'total',
    presupuestoMonto: 15000000,
    presupuestoGastado: 8500000,
    fechaInicio: '2025-01-20',
    fechaFin: '2025-03-15',
    plataformas: ['google_dv360', 'tiktok_ads'],
    fechaCreacion: '2025-01-18T10:00:00Z',
    creadoPor: 'Carlos López'
  },
  {
    id: 'adx-003',
    codigo: 'ADX000003',
    nombre: 'Story IG LATAM Vuelos',
    tipo: 'story_ad',
    tipoCategoria: 'native',
    estado: 'programado',
    tenantId: 'tenant-001',
    anuncianteId: 'anc-003',
    anuncianteNombre: 'LATAM Airlines',
    formatoPrincipal: '1080x1920',
    segmentacionResumen: {
      demografica: ['25-54 años', 'ABC1'],
      geografica: ['Santiago', 'Concepción'],
      dispositivos: ['Mobile'],
      intereses: ['Viajes', 'Negocios']
    },
    alcanceEstimado: '800K',
    impresiones: 0,
    clics: 0,
    ctr: 0,
    conversiones: 0,
    costoTotal: 0,
    roas: 0,
    presupuestoTipo: 'diario',
    presupuestoMonto: 200000,
    presupuestoGastado: 0,
    fechaInicio: '2025-02-15',
    fechaFin: '2025-03-30',
    plataformas: ['meta_ads'],
    fechaCreacion: '2025-02-05T16:00:00Z',
    creadoPor: 'Ana Martínez'
  },
  {
    id: 'adx-004',
    codigo: 'ADX000004',
    nombre: 'Audio Spotify Entel 30s',
    tipo: 'audio_spot',
    tipoCategoria: 'audio',
    estado: 'pausado',
    tenantId: 'tenant-002',
    anuncianteId: 'anc-005',
    anuncianteNombre: 'Entel',
    formatoPrincipal: 'Audio 30s',
    segmentacionResumen: {
      demografica: ['18-44 años'],
      geografica: ['Todo Chile'],
      dispositivos: ['Mobile'],
      intereses: ['Música', 'Tecnología']
    },
    alcanceEstimado: '2.1M',
    impresiones: 567890,
    clics: 12340,
    ctr: 2.17,
    conversiones: 456,
    costoTotal: 3200000,
    roas: 2.8,
    presupuestoTipo: 'diario',
    presupuestoMonto: 100000,
    presupuestoGastado: 3200000,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-02-15',
    plataformas: ['spotify'],
    fechaCreacion: '2024-12-28T09:00:00Z',
    creadoPor: 'Pedro Soto'
  },
  {
    id: 'adx-005',
    codigo: 'ADX000005',
    nombre: 'Carousel Falabella Black Friday',
    tipo: 'carousel',
    tipoCategoria: 'native',
    estado: 'completado',
    tenantId: 'tenant-002',
    anuncianteId: 'anc-004',
    anuncianteNombre: 'Falabella',
    formatoPrincipal: '1080x1080',
    segmentacionResumen: {
      demografica: ['25-54 años', 'Mujeres 60%'],
      geografica: ['RM', 'Regiones principales'],
      dispositivos: ['Mobile', 'Desktop'],
      intereses: ['Moda', 'Hogar', 'Tecnología']
    },
    alcanceEstimado: '2.8M',
    impresiones: 3456780,
    clics: 156890,
    ctr: 4.54,
    conversiones: 8945,
    costoTotal: 25000000,
    roas: 6.2,
    presupuestoTipo: 'total',
    presupuestoMonto: 25000000,
    presupuestoGastado: 25000000,
    fechaInicio: '2024-11-20',
    fechaFin: '2024-11-30',
    plataformas: ['meta_ads', 'google_ads'],
    fechaCreacion: '2024-11-15T11:00:00Z',
    creadoPor: 'María García'
  }
];

let secuencia = 5;

// ═══════════════════════════════════════════════════════════════
// GET - Listar activos con filtros (multi-tenant)
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'activos-digitales', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);

      const search = searchParams.get('search') || '';
      const tipo = searchParams.get('tipo') || '';
      const estado = searchParams.get('estado') || '';
      const plataforma = searchParams.get('plataforma') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

      // Filter by tenant using withTenantContext
      let filtered = await withTenantContext(ctx.tenantId, async () => {
        return mockActivos.filter(a => a.tenantId === ctx.tenantId);
      });

      // Apply search filter
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(a =>
          a.nombre.toLowerCase().includes(s) ||
          a.codigo.toLowerCase().includes(s) ||
          a.anuncianteNombre.toLowerCase().includes(s)
        );
      }

      // Apply type filter
      if (tipo) {
        filtered = filtered.filter(a => a.tipoCategoria === tipo);
      }

      // Apply status filter
      if (estado) {
        filtered = filtered.filter(a => a.estado === estado);
      }

      // Apply platform filter
      if (plataforma) {
        filtered = filtered.filter(a => a.plataformas.includes(plataforma));
      }

      // Calculate metrics for the tenant's assets
      const metricas = {
        total: filtered.length,
        activos: filtered.filter(a => a.estado === 'activo').length,
        programados: filtered.filter(a => a.estado === 'programado').length,
        pausados: filtered.filter(a => a.estado === 'pausado').length,
        impresionesTotales: filtered.reduce((sum, a) => sum + a.impresiones, 0),
        clicsTotales: filtered.reduce((sum, a) => sum + a.clics, 0),
        inversionTotal: filtered.reduce((sum, a) => sum + a.costoTotal, 0),
        roasPromedio: filtered.filter(a => a.roas > 0).reduce((sum, a) => sum + a.roas, 0) /
          Math.max(filtered.filter(a => a.roas > 0).length, 1)
      };

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const data = filtered.slice(offset, offset + limit);

      // Audit log for data access
      auditLogger.logEvent({
        eventType: AuditEventType.DATA_ACCESS,
        severity: AuditSeverity.LOW,
        userId: ctx.userId,
        resource: 'activos-digitales',
        action: 'read',
        success: true,
        details: {
          filters: { search, tipo, estado, plataforma },
          resultCount: data.length,
          totalFiltered: total,
          tenantId: ctx.tenantId
        }
      });

      return apiSuccess({
        data,
        metricas,
        pagination: { total, page, limit, totalPages }
      }, 200);

    } catch (error) {
      logger.error('[API/ActivosDigitales] Error GET:', error instanceof Error ? error : undefined, {
        module: 'activos-digitales',
        action: 'GET',
        tenantId: ctx.tenantId
      });

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_ACCESS,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        resource: 'activos-digitales',
        action: 'read',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error', tenantId: ctx.tenantId }
      });

      return apiServerError() as unknown as NextResponse;
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// POST - Crear activo digital (con validación Zod)
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'activos-digitales', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      // Validate input with Zod
      const parsed = CreateActivoDigitalSchema.safeParse(body);
      if (!parsed.success) {
        auditLogger.logEvent({
          eventType: AuditEventType.API_ERROR,
          severity: AuditSeverity.MEDIUM,
          userId: ctx.userId,
          resource: 'activos-digitales',
          action: 'create',
          success: false,
          details: { errors: parsed.error.flatten().fieldErrors, tenantId: ctx.tenantId }
        });
        return apiError('VALIDATION_ERROR', 'Datos de activo digital inválidos', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      secuencia += 1;
      const codigo = `ADX${secuencia.toString().padStart(6, '0')}`;

      const newActivo: ActivoDigitalData = {
        id: `adx-${Date.now()}`,
        codigo,
        nombre: parsed.data.nombre,
        tipo: parsed.data.tipo,
        tipoCategoria: parsed.data.tipoCategoria,
        estado: 'borrador',
        tenantId: ctx.tenantId,
        anuncianteId: parsed.data.anuncianteId || '',
        anuncianteNombre: parsed.data.anuncianteNombre || 'Nuevo Anunciante',
        formatoPrincipal: parsed.data.formatoPrincipal || '300x250',
        segmentacionResumen: {
          demografica: parsed.data.segDemografica?.edadRangos || [],
          geografica: parsed.data.segGeografica?.regiones || [],
          dispositivos: parsed.data.segDispositivo?.tipos || [],
          intereses: parsed.data.segConductual?.intereses || []
        },
        alcanceEstimado: parsed.data.alcanceEstimado || '0',
        impresiones: 0,
        clics: 0,
        ctr: 0,
        conversiones: 0,
        costoTotal: 0,
        roas: 0,
        presupuestoTipo: parsed.data.presupuesto?.tipo || 'diario',
        presupuestoMonto: parsed.data.presupuesto?.monto || 0,
        presupuestoGastado: 0,
        fechaInicio: parsed.data.fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: parsed.data.fechaFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plataformas: parsed.data.plataformas || [],
        fechaCreacion: new Date().toISOString(),
        creadoPor: ctx.userId || 'Usuario'
      };

      mockActivos.push(newActivo);

      // Audit log for creation
      auditLogger.logEvent({
        eventType: AuditEventType.DATA_CREATE,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        resource: 'activos-digitales',
        action: 'create',
        success: true,
        details: {
          activoId: newActivo.id,
          codigo: newActivo.codigo,
          nombre: newActivo.nombre,
          tipo: newActivo.tipo,
          tenantId: ctx.tenantId
        }
      });

      logger.info('[API/ActivosDigitales] Activo creado', {
        module: 'activos-digitales',
        action: 'POST',
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        activoId: newActivo.id
      });

      return apiSuccess(newActivo, 201);

    } catch (error) {
      logger.error('[API/ActivosDigitales] Error POST:', error instanceof Error ? error : undefined, {
        module: 'activos-digitales',
        action: 'POST',
        tenantId: ctx.tenantId
      });

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_CREATE,
        severity: AuditSeverity.HIGH,
        userId: ctx.userId,
        resource: 'activos-digitales',
        action: 'create',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error', tenantId: ctx.tenantId }
      });

      return apiServerError() as unknown as NextResponse;
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// PUT - Actualización masiva (con validación Zod)
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
  { resource: 'activos-digitales', action: 'update' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      // Validate input with Zod
      const parsed = UpdateMasivoSchema.safeParse(body);
      if (!parsed.success) {
        auditLogger.logEvent({
          eventType: AuditEventType.API_ERROR,
          severity: AuditSeverity.MEDIUM,
          userId: ctx.userId,
          resource: 'activos-digitales',
          action: 'update',
          success: false,
          details: { errors: parsed.error.flatten().fieldErrors, tenantId: ctx.tenantId }
        });
        return apiError('VALIDATION_ERROR', 'Datos de actualización inválidos', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      // Filter by tenant before updating
      let actualizados = 0;
      const activosParaAudit: string[] = [];

      for (const id of parsed.data.activoIds) {
        const idx = mockActivos.findIndex(a => a.id === id && a.tenantId === ctx.tenantId);
        if (idx !== -1) {
          switch (parsed.data.accion) {
            case 'activar':
              mockActivos[idx].estado = 'activo';
              break;
            case 'pausar':
              mockActivos[idx].estado = 'pausado';
              break;
            case 'archivar':
              mockActivos[idx].estado = 'archivado';
              break;
          }
          actualizados++;
          activosParaAudit.push(id);
        }
      }

      // Audit log for bulk update
      auditLogger.logEvent({
        eventType: AuditEventType.DATA_UPDATE,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        resource: 'activos-digitales',
        action: 'update',
        success: true,
        details: {
          accion: parsed.data.accion,
          cantidadActualizados: actualizados,
          activosIds: activosParaAudit,
          tenantId: ctx.tenantId
        }
      });

      logger.info('[API/ActivosDigitales] Activos actualizados', {
        module: 'activos-digitales',
        action: 'PUT',
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        accion: parsed.data.accion,
        cantidad: actualizados
      });

      return apiSuccess({
        message: `${actualizados} activos actualizados`,
        actualizados
      });

    } catch (error) {
      logger.error('[API/ActivosDigitales] Error PUT:', error instanceof Error ? error : undefined, {
        module: 'activos-digitales',
        action: 'PUT',
        tenantId: ctx.tenantId
      });

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_UPDATE,
        severity: AuditSeverity.HIGH,
        userId: ctx.userId,
        resource: 'activos-digitales',
        action: 'update',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error', tenantId: ctx.tenantId }
      });

      return apiServerError() as unknown as NextResponse;
    }
  }
);
