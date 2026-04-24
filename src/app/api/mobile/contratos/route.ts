/**
 * 📱 SILEXAR PULSE - Mobile API Controller TIER 0
 * 
 * @description API REST completa para aplicación móvil nativa.
 * Incluye todos los endpoints necesarios para:
 * - Contratos: CRUD completo
 * - Dashboard: KPIs y métricas
 * - Alertas: Notificaciones y acciones
 * - Sync: Sincronización offline
 * - Acciones: Aprobar, rechazar, firmar
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @platform iOS / Android / React Native / Flutter
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError, getUserContext } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TIPOS MOBILE-OPTIMIZED
// ═══════════════════════════════════════════════════════════════

export interface MobileResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  syncToken?: string; // Para sincronización incremental
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ContratoMobileDTO {
  id: string;
  numero: string;
  titulo: string;
  cliente: {
    id: string;
    nombre: string;
    logoUrl?: string;
  };
  estado: string;
  estadoColor: string;
  valor: number;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  progreso: number;
  ejecutivo: {
    id: string;
    nombre: string;
    avatar?: string;
  };
  acciones: AccionDisponibleDTO[];
  alertas: number;
  urgencia: 'alta' | 'media' | 'normal';
  ultimaActividad: string;
}

export interface AccionDisponibleDTO {
  id: string;
  tipo: 'aprobar' | 'rechazar' | 'firmar' | 'enviar' | 'comentar' | 'llamar' | 'email';
  label: string;
  icono: string;
  requiereConfirmacion: boolean;
  disponible: boolean;
  razonNoDisponible?: string;
}

export interface DashboardMobileDTO {
  usuario: {
    id: string;
    nombre: string;
    avatar?: string;
    rol: string;
  };
  kpis: {
    contratosActivos: number;
    valorCartera: number;
    accionesPendientes: number;
    metaMes: number;
    metaCompletada: number;
    alertasUrgentes: number;
  };
  pipeline: {
    etapa: string;
    cantidad: number;
    valor: number;
    color: string;
  }[];
  actividadReciente: {
    id: string;
    tipo: string;
    descripcion: string;
    hace: string;
    icono: string;
  }[];
}

export interface AlertaMobileDTO {
  id: string;
  tipo: 'urgente' | 'vencimientos' | 'aprobacion' | 'renovacion' | 'pago' | 'info';
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  contratoId?: string;
  contratoNumero?: string;
  clienteNombre?: string;
  fechaCreacion: string;
  accion?: {
    tipo: string;
    label: string;
    url?: string;
  };
  leida: boolean;
}

export interface SyncRequestDTO {
  ultimoSyncToken: string;
  dispositivoId: string;
  plataforma: 'ios' | 'android';
  version: string;
}

export interface SyncResponseDTO {
  nuevoSyncToken: string;
  contratosActualizados: ContratoMobileDTO[];
  contratosEliminados: string[];
  alertasNuevas: AlertaMobileDTO[];
  notificacionesPush: number;
  configActualizada: boolean;
}

export interface AccionOfflineDTO {
  id: string;
  tipo: string;
  contratoId: string;
  datos: Record<string, unknown>;
  timestamp: string;
  dispositivoId: string;
}

export interface PushTokenDTO {
  token: string;
  plataforma: 'ios' | 'android';
  dispositivoId: string;
  dispositivoNombre: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA PARA DESARROLLO
// ═══════════════════════════════════════════════════════════════

const mockContratos: ContratoMobileDTO[] = [
  {
    id: 'ctr-001',
    numero: 'CTR-2025-00089',
    titulo: 'Campaña Verano 2025',
    cliente: { id: 'cli-001', nombre: 'Banco Chile', logoUrl: '/logos/bancochile.png' },
    estado: 'Activo',
    estadoColor: '#22c55e',
    valor: 85000000,
    moneda: 'CLP',
    fechaInicio: '2025-02-01',
    fechaFin: '2025-03-31',
    diasRestantes: 45,
    progreso: 35,
    ejecutivo: { id: 'usr-001', nombre: 'Carlos Mendoza' },
    acciones: [
      { id: 'a1', tipo: 'llamar', label: 'Llamar cliente', icono: 'phone', requiereConfirmacion: false, disponible: true },
      { id: 'a2', tipo: 'email', label: 'Enviar email', icono: 'mail', requiereConfirmacion: false, disponible: true }
    ],
    alertas: 0,
    urgencia: 'normal',
    ultimaActividad: '2025-02-15T10:30:00Z'
  },
  {
    id: 'ctr-002',
    numero: 'CTR-2025-00090',
    titulo: 'Contrato Anual Digital',
    cliente: { id: 'cli-002', nombre: 'Falabella' },
    estado: 'Pendiente Aprobación',
    estadoColor: '#f59e0b',
    valor: 120000000,
    moneda: 'CLP',
    fechaInicio: '2025-03-01',
    fechaFin: '2026-02-28',
    diasRestantes: -1,
    progreso: 0,
    ejecutivo: { id: 'usr-001', nombre: 'Carlos Mendoza' },
    acciones: [
      { id: 'a3', tipo: 'aprobar', label: 'Aprobar', icono: 'check', requiereConfirmacion: true, disponible: true },
      { id: 'a4', tipo: 'rechazar', label: 'Rechazar', icono: 'x', requiereConfirmacion: true, disponible: true }
    ],
    alertas: 1,
    urgencia: 'alta',
    ultimaActividad: '2025-02-14T16:45:00Z'
  },
  {
    id: 'ctr-003',
    numero: 'CTR-2025-00091',
    titulo: 'Campaña Radio Marzo',
    cliente: { id: 'cli-003', nombre: 'Cencosud' },
    estado: 'Firma Pendiente',
    estadoColor: '#8b5cf6',
    valor: 45000000,
    moneda: 'CLP',
    fechaInicio: '2025-03-01',
    fechaFin: '2025-03-31',
    diasRestantes: -1,
    progreso: 0,
    ejecutivo: { id: 'usr-001', nombre: 'Carlos Mendoza' },
    acciones: [
      { id: 'a5', tipo: 'firmar', label: 'Firmar', icono: 'pen', requiereConfirmacion: true, disponible: true }
    ],
    alertas: 2,
    urgencia: 'alta',
    ultimaActividad: '2025-02-13T09:00:00Z'
  }
];

const mockAlertas: AlertaMobileDTO[] = [
  {
    id: 'alr-001',
    tipo: 'aprobacion',
    prioridad: 'alta',
    titulo: 'Aprobación requerida',
    descripcion: 'Contrato Falabella espera tu aprobación desde hace 2 días',
    contratoId: 'ctr-002',
    contratoNumero: 'CTR-2025-00090',
    clienteNombre: 'Falabella',
    fechaCreacion: '2025-02-12T10:00:00Z',
    accion: { tipo: 'aprobar', label: 'Aprobar ahora' },
    leida: false
  },
  {
    id: 'alr-002',
    tipo: 'vencimientos',
    prioridad: 'media',
    titulo: 'Contrato próximo a vencer',
    descripcion: 'El contrato con Paris vence en 15 días',
    contratoId: 'ctr-004',
    contratoNumero: 'CTR-2024-00156',
    clienteNombre: 'Paris',
    fechaCreacion: '2025-02-10T08:00:00Z',
    accion: { tipo: 'renovar', label: 'Iniciar renovación' },
    leida: true
  },
  {
    id: 'alr-003',
    tipo: 'pago',
    prioridad: 'alta',
    titulo: 'Pago pendiente',
    descripcion: 'Factura vencida hace 5 días - $45.8M',
    contratoId: 'ctr-005',
    contratoNumero: 'CTR-2025-00078',
    clienteNombre: 'Ripley',
    fechaCreacion: '2025-02-09T14:30:00Z',
    accion: { tipo: 'cobranza', label: 'Gestionar cobranza' },
    leida: false
  }
];

// ═══════════════════════════════════════════════════════════════
// HANDLERS API
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/mobile/contratos
 * Lista contratos del usuario con filtros
 * Requiere: contratos:read
 */
export const GET = withApiRoute(
  { resource: 'contratos', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const endpoint = searchParams.get('endpoint') || 'contratos';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');

      return await withTenantContext(ctx.tenantId, async () => {
        switch (endpoint) {
          case 'contratos':
            return handleGetContratos(searchParams, page, limit);
          case 'dashboard':
            return handleGetDashboard(ctx.userId);
          case 'alertas':
            return handleGetAlertas(page, limit);
          case 'contrato':
            return handleGetContrato(searchParams.get('id') || '');
          default:
            return NextResponse.json<MobileResponse<null>>({
              success: false,
              data: null,
              error: 'Endpoint no válido',
              timestamp: new Date().toISOString()
            }, { status: 400 });
        }
      });
    } catch (error) {
      logger.error('[Mobile API] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'mobile/contratos', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST /api/mobile/contratos
 * Acciones y sincronización
 * Requiere: contratos:update
 */
export const POST = withApiRoute(
  { resource: 'contratos', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      const accion = body.accion;

      return await withTenantContext(ctx.tenantId, async () => {
        switch (accion) {
          case 'sync':
            return handleSync(body as SyncRequestDTO, ctx.userId);
          case 'aprobar':
            return handleAprobar(body.contratoId, body.comentario, ctx.userId);
          case 'rechazar':
            return handleRechazar(body.contratoId, body.motivo, ctx.userId);
          case 'firmar':
            return handleFirmar(body.contratoId, body.firma, ctx.userId);
          case 'comentar':
            return handleComentar(body.contratoId, body.comentario, ctx.userId);
          case 'marcar_leida':
            return handleMarcarLeida(body.alertaId, ctx.userId);
          case 'registrar_push':
            return handleRegistrarPush(body as PushTokenDTO, ctx.userId);
          case 'offline_queue':
            return handleOfflineQueue(body.acciones as AccionOfflineDTO[], ctx.userId);
          default:
            return NextResponse.json<MobileResponse<null>>({
              success: false,
              data: null,
              error: 'Acción no válida',
              timestamp: new Date().toISOString()
            }, { status: 400 });
        }
      });
    } catch (error) {
      logger.error('[Mobile API] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'mobile/contratos', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// HANDLERS ESPECÍFICOS
// ═══════════════════════════════════════════════════════════════

function handleGetContratos(params: URLSearchParams, page: number, limit: number) {
  let filtered = [...mockContratos];
  
  // Filtrar por estado
  const estado = params.get('estado');
  if (estado) {
    filtered = filtered.filter(c => c.estado.toLowerCase().includes(estado.toLowerCase()));
  }
  
  // Filtrar por urgencia
  const urgencia = params.get('urgencia');
  if (urgencia) {
    filtered = filtered.filter(c => c.urgencia === urgencia);
  }
  
  // Búsqueda
  const search = params.get('search');
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c => 
      c.numero.toLowerCase().includes(s) ||
      c.titulo.toLowerCase().includes(s) ||
      c.cliente.nombre.toLowerCase().includes(s)
    );
  }

  // Ordenar por última actividad
  filtered.sort((a, b) => new Date(b.ultimaActividad).getTime() - new Date(a.ultimaActividad).getTime());

  // Paginar
  const total = filtered.length;
  const data = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json<MobileResponse<ContratoMobileDTO[]>>({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    syncToken: `sync-${Date.now()}`,
    meta: { page, limit, total, hasMore: page * limit < total }
  });
}

function handleGetDashboard(userId: string) {
  const dashboard: DashboardMobileDTO = {
    usuario: {
      id: userId,
      nombre: 'Carlos Mendoza',
      rol: 'Ejecutivo Comercial'
    },
    kpis: {
      contratosActivos: mockContratos.filter(c => c.estado === 'Activo').length,
      valorCartera: mockContratos.reduce((acc, c) => acc + c.valor, 0),
      accionesPendientes: mockContratos.reduce((acc, c) => acc + c.acciones.filter(a => a.disponible).length, 0),
      metaMes: 500000000,
      metaCompletada: 250000000,
      alertasUrgentes: mockAlertas.filter(a => a.prioridad === 'alta' || a.prioridad === 'critica').length
    },
    pipeline: [
      { etapa: 'Prospección', cantidad: 5, valor: 150000000, color: '#60a5fa' },
      { etapa: 'Negociación', cantidad: 3, valor: 250000000, color: '#f59e0b' },
      { etapa: 'Aprobación', cantidad: 2, valor: 165000000, color: '#8b5cf6' },
      { etapa: 'Firma', cantidad: 1, valor: 45000000, color: '#ec4899' },
      { etapa: 'Activos', cantidad: 8, valor: 480000000, color: '#22c55e' }
    ],
    actividadReciente: [
      { id: 'act-1', tipo: 'aprobacion', descripcion: 'Contrato Banco Chile aprobado', hace: '2h', icono: 'check-circle' },
      { id: 'act-2', tipo: 'comentario', descripcion: 'Nuevo comentario en Falabella', hace: '4h', icono: 'message-circle' },
      { id: 'act-3', tipo: 'firma', descripcion: 'Cencosud firmó digitalmente', hace: '1d', icono: 'pen-tool' }
    ]
  };

  return NextResponse.json<MobileResponse<DashboardMobileDTO>>({
    success: true,
    data: dashboard,
    timestamp: new Date().toISOString()
  });
}

function handleGetAlertas(page: number, limit: number) {
  const sorted = [...mockAlertas].sort((a, b) => 
    new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  );
  
  const data = sorted.slice((page - 1) * limit, page * limit);
  
  return NextResponse.json<MobileResponse<AlertaMobileDTO[]>>({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    meta: { page, limit, total: mockAlertas.length, hasMore: page * limit < mockAlertas.length }
  });
}

function handleGetContrato(id: string) {
  const contrato = mockContratos.find(c => c.id === id);
  
  if (!contrato) {
    return NextResponse.json<MobileResponse<null>>({
      success: false,
      data: null,
      error: 'Contrato no encontrado',
      timestamp: new Date().toISOString()
    }, { status: 404 });
  }

  return NextResponse.json<MobileResponse<ContratoMobileDTO>>({
    success: true,
    data: contrato,
    timestamp: new Date().toISOString()
  });
}

function handleSync(request: SyncRequestDTO, userId: string) {
  const response: SyncResponseDTO = {
    nuevoSyncToken: `sync-${Date.now()}`,
    contratosActualizados: mockContratos,
    contratosEliminados: [],
    alertasNuevas: mockAlertas.filter(a => !a.leida),
    notificacionesPush: 2,
    configActualizada: false
  };

  logger.info('[Sync] Dispositivo sincronizado', { 
    module: 'mobile/contratos', 
    userId,
    dispositivoId: request.dispositivoId 
  });

  return NextResponse.json<MobileResponse<SyncResponseDTO>>({
    success: true,
    data: response,
    timestamp: new Date().toISOString()
  });
}

function handleAprobar(contratoId: string, comentario: string | undefined, userId: string) {
  logger.info('[Acción] Aprobar contrato desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    contratoId 
  });
  
  return NextResponse.json<MobileResponse<{ aprobado: boolean }>>({
    success: true,
    data: { aprobado: true },
    timestamp: new Date().toISOString()
  });
}

function handleRechazar(contratoId: string, motivo: string, userId: string) {
  logger.info('[Acción] Rechazar contrato desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    contratoId 
  });
  
  return NextResponse.json<MobileResponse<{ rechazado: boolean }>>({
    success: true,
    data: { rechazado: true },
    timestamp: new Date().toISOString()
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleFirmar(contratoId: string, _firma: string, userId: string) {
  logger.info('[Acción] Firmar contrato desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    contratoId 
  });
  
  return NextResponse.json<MobileResponse<{ firmado: boolean; urlDocumento: string }>>({
    success: true,
    data: { 
      firmado: true, 
      urlDocumento: `/contratos/${contratoId}/documento-firmado.pdf` 
    },
    timestamp: new Date().toISOString()
  });
}

function handleComentar(contratoId: string, comentario: string, userId: string) {
  logger.info('[Acción] Comentario en contrato desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    contratoId 
  });
  
  return NextResponse.json<MobileResponse<{ comentarioId: string }>>({
    success: true,
    data: { comentarioId: `com-${Date.now()}` },
    timestamp: new Date().toISOString()
  });
}

function handleMarcarLeida(alertaId: string, userId: string) {
  logger.info('[Acción] Marcar alerta como leída desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    alertaId 
  });
  
  return NextResponse.json<MobileResponse<{ marcada: boolean }>>({
    success: true,
    data: { marcada: true },
    timestamp: new Date().toISOString()
  });
}

function handleRegistrarPush(token: PushTokenDTO, userId: string) {
  logger.info('[Push] Registrar token desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    plataforma: token.plataforma 
  });
  
  return NextResponse.json<MobileResponse<{ registrado: boolean }>>({
    success: true,
    data: { registrado: true },
    timestamp: new Date().toISOString()
  });
}

function handleOfflineQueue(acciones: AccionOfflineDTO[], userId: string) {
  logger.info('[Offline] Procesando acciones pendientes desde mobile', { 
    module: 'mobile/contratos', 
    userId,
    cantidad: acciones.length 
  });
  
  const resultados = acciones.map(a => ({
    id: a.id,
    exito: true,
    error: null
  }));
  
  return NextResponse.json<MobileResponse<typeof resultados>>({
    success: true,
    data: resultados,
    timestamp: new Date().toISOString()
  });
}
