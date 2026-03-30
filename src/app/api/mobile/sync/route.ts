/**
 * 🔔 SILEXAR PULSE - Mobile Push Notifications & Sync Service TIER 0
 * 
 * @description Servicios para:
 * - Notificaciones push (Firebase Cloud Messaging)
 * - Sincronización offline
 * - Cola de acciones pendientes
 * - Estado de conexión
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TIPOS - PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export interface PushToken {
  token: string;
  plataforma: 'ios' | 'android';
  dispositivoId: string;
  dispositivoNombre: string;
  usuarioId: string;
  activo: boolean;
  fechaRegistro: Date;
  ultimoUso?: Date;
}

export interface NotificacionPush {
  id: string;
  tipo: 'alerta' | 'aprobacion' | 'firma' | 'pago' | 'vencimiento' | 'mensaje' | 'sistema';
  titulo: string;
  cuerpo: string;
  icono?: string;
  imagen?: string;
  datos: {
    contratoId?: string;
    alertaId?: string;
    accion?: string;
    url?: string;
    [key: string]: unknown;
  };
  prioridad: 'alta' | 'normal' | 'baja';
  sonido: boolean;
  badge?: number;
  ttl?: number; // segundos
}

export interface ConfiguracionPush {
  usuarioId: string;
  alertasUrgentes: boolean;
  aprobacionesPendientes: boolean;
  vencimientos: boolean;
  pagos: boolean;
  firmasPendientes: boolean;
  mensajesEquipo: boolean;
  resumenDiario: boolean;
  horarioInicio: string; // "09:00"
  horarioFin: string; // "18:00"
  diasActivos: string[]; // ["L", "M", "X", "J", "V"]
  silenciarFinesSemana: boolean;
}

// ═══════════════════════════════════════════════════════════════
// TIPOS - OFFLINE SYNC
// ═══════════════════════════════════════════════════════════════

export interface AccionOffline {
  id: string;
  tipo: 'crear' | 'editar' | 'aprobar' | 'rechazar' | 'firmar' | 'comentar' | 'marcar_leida';
  entidad: 'contrato' | 'alerta' | 'comentario' | 'pago';
  entidadId: string;
  datos: Record<string, unknown>;
  timestamp: Date;
  dispositivoId: string;
  usuarioId: string;
  intentos: number;
  ultimoIntento?: Date;
  error?: string;
  completada: boolean;
}

export interface SyncState {
  ultimoSync: Date;
  syncToken: string;
  pendientes: number;
  enProgreso: boolean;
  error?: string;
}

export interface ConflictoSync {
  id: string;
  entidad: string;
  entidadId: string;
  versionLocal: Record<string, unknown>;
  versionServidor: Record<string, unknown>;
  fechaLocal: Date;
  fechaServidor: Date;
  resolucion?: 'local' | 'servidor' | 'merge' | 'pendiente';
}

export interface DeltaSync {
  tipo: 'crear' | 'actualizar' | 'eliminar';
  entidad: 'contrato' | 'alerta' | 'cliente' | 'configuracion';
  id: string;
  datos?: Record<string, unknown>;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO EN MEMORIA (En producción usar Redis/DB)
// ═══════════════════════════════════════════════════════════════

const pushTokens = new Map<string, PushToken>();
const configuracionesPush = new Map<string, ConfiguracionPush>();
const colasOffline = new Map<string, AccionOffline[]>();
const syncStates = new Map<string, SyncState>();

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accion = body.accion;

    // Validar auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 });
    }

    switch (accion) {
      // Push Notifications
      case 'registrar_token':
        return handleRegistrarToken(body);
      case 'actualizar_config_push':
        return handleActualizarConfigPush(body);
      case 'obtener_config_push':
        return handleObtenerConfigPush(body.usuarioId);
      case 'test_push':
        return handleTestPush(body.usuarioId);
        
      // Offline Sync
      case 'sync_pull':
        return handleSyncPull(body);
      case 'sync_push':
        return handleSyncPush(body);
      case 'resolver_conflicto':
        return handleResolverConflicto(body);
      case 'obtener_estado_sync':
        return handleObtenerEstadoSync(body.usuarioId, body.dispositivoId);
      case 'limpiar_cola':
        return handleLimpiarCola(body.usuarioId, body.dispositivoId);
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no válida'
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('[Mobile Sync] Error POST:', error instanceof Error ? error : undefined, { module: 'mobile/sync', action: 'POST' });
    return apiServerError()
  }
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS - PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

function handleRegistrarToken(body: {
  token: string;
  plataforma: 'ios' | 'android';
  dispositivoId: string;
  dispositivoNombre: string;
  usuarioId: string;
}) {
  const pushToken: PushToken = {
    token: body.token,
    plataforma: body.plataforma,
    dispositivoId: body.dispositivoId,
    dispositivoNombre: body.dispositivoNombre,
    usuarioId: body.usuarioId,
    activo: true,
    fechaRegistro: new Date()
  };

  pushTokens.set(body.dispositivoId, pushToken);
  
  // [STRUCTURED-LOG] // logger.info({ message: `[Push] Token registrado: ${body.dispositivoNombre} (${body.plataforma})`, module: 'sync' });

  return NextResponse.json({
    success: true,
    data: { registrado: true }
  });
}

function handleActualizarConfigPush(body: ConfiguracionPush) {
  configuracionesPush.set(body.usuarioId, body);
  
  // [STRUCTURED-LOG] // logger.info({ message: `[Push] Config actualizada para usuario ${body.usuarioId}`, module: 'sync' });

  return NextResponse.json({
    success: true,
    data: { actualizado: true }
  });
}

function handleObtenerConfigPush(usuarioId: string) {
  const config = configuracionesPush.get(usuarioId) || {
    usuarioId,
    alertasUrgentes: true,
    aprobacionesPendientes: true,
    vencimientos: true,
    pagos: true,
    firmasPendientes: true,
    mensajesEquipo: true,
    resumenDiario: false,
    horarioInicio: '08:00',
    horarioFin: '20:00',
    diasActivos: ['L', 'M', 'X', 'J', 'V'],
    silenciarFinesSemana: true
  };

  return NextResponse.json({
    success: true,
    data: config
  });
}

function handleTestPush(usuarioId: string) {
  // Simular envío de push
  const notificacion: NotificacionPush = {
    id: `push-${Date.now()}`,
    tipo: 'sistema',
    titulo: '🔔 Notificación de prueba',
    cuerpo: 'Si ves esto, las notificaciones push están funcionando correctamente.',
    datos: { test: true },
    prioridad: 'normal',
    sonido: true
  };

  // [STRUCTURED-LOG] // logger.info({ message: `[Push] Enviando test a usuario ${usuarioId}:`, notificacion, module: 'sync' });

  return NextResponse.json({
    success: true,
    data: { 
      enviado: true, 
      notificacion,
      mensaje: 'Notificación de prueba enviada'
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS - OFFLINE SYNC
// ═══════════════════════════════════════════════════════════════

function handleSyncPull(body: {
  usuarioId: string;
  dispositivoId: string;
  ultimoSyncToken?: string;
  entidades?: string[];
}) {
  // En producción: consultar cambios desde ultimoSyncToken
  const nuevoSyncToken = `sync-${Date.now()}`;
  
  // Simular deltas
  const deltas: DeltaSync[] = [
    {
      tipo: 'actualizar',
      entidad: 'contrato',
      id: 'ctr-001',
      datos: { estado: 'Activo', progreso: 40 },
      timestamp: new Date()
    }
  ];

  // Actualizar estado de sync
  syncStates.set(`${body.usuarioId}-${body.dispositivoId}`, {
    ultimoSync: new Date(),
    syncToken: nuevoSyncToken,
    pendientes: 0,
    enProgreso: false
  });

  // [STRUCTURED-LOG] // logger.info({ message: `[Sync] Pull para ${body.usuarioId}: ${deltas.length} cambios`, module: 'sync' });

  return NextResponse.json({
    success: true,
    data: {
      syncToken: nuevoSyncToken,
      deltas,
      tieneConflictos: false,
      conflictos: [],
      timestamp: new Date().toISOString()
    }
  });
}

function handleSyncPush(body: {
  usuarioId: string;
  dispositivoId: string;
  acciones: AccionOffline[];
}) {
  const resultados: { id: string; exito: boolean; error?: string }[] = [];
  
  for (const accion of body.acciones) {
    // En producción: procesar cada acción contra la DB
    // [STRUCTURED-LOG] // logger.info({ message: `[Sync] Procesando acción offline: ${accion.tipo} ${accion.entidad}/${accion.entidadId}`, module: 'sync' });
    
    // Simular procesamiento exitoso
    resultados.push({
      id: accion.id,
      exito: true
    });
  }

  // Limpiar cola local
  colasOffline.delete(`${body.usuarioId}-${body.dispositivoId}`);

  return NextResponse.json({
    success: true,
    data: {
      procesados: resultados.length,
      exitosos: resultados.filter(r => r.exito).length,
      fallidos: resultados.filter(r => !r.exito).length,
      resultados,
      nuevoSyncToken: `sync-${Date.now()}`
    }
  });
}

function handleResolverConflicto(body: {
  conflictoId: string;
  resolucion: 'local' | 'servidor' | 'merge';
  datosFinales?: Record<string, unknown>;
}) {
  // [STRUCTURED-LOG] // logger.info({ message: `[Sync] Resolviendo conflicto ${body.conflictoId} con ${body.resolucion}`, module: 'sync' });

  return NextResponse.json({
    success: true,
    data: {
      conflictoResuelto: true,
      resolucion: body.resolucion
    }
  });
}

function handleObtenerEstadoSync(usuarioId: string, dispositivoId: string) {
  const estado = syncStates.get(`${usuarioId}-${dispositivoId}`) || {
    ultimoSync: null,
    syncToken: null,
    pendientes: 0,
    enProgreso: false
  };

  const cola = colasOffline.get(`${usuarioId}-${dispositivoId}`) || [];

  return NextResponse.json({
    success: true,
    data: {
      ...estado,
      pendientesEnCola: cola.length,
      accionesPendientes: cola.filter(a => !a.completada)
    }
  });
}

function handleLimpiarCola(usuarioId: string, dispositivoId: string) {
  colasOffline.delete(`${usuarioId}-${dispositivoId}`);

  return NextResponse.json({
    success: true,
    data: { limpiado: true }
  });
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES PARA ENVÍO DE PUSH (Usar desde otros servicios)
// ═══════════════════════════════════════════════════════════════

export async function enviarPushNotificacion(
  usuarioId: string,
  notificacion: Omit<NotificacionPush, 'id'>
): Promise<{ enviados: number; errores: number }> {
  // Obtener todos los tokens del usuario
  const tokensUsuario = Array.from(pushTokens.values())
    .filter(t => t.usuarioId === usuarioId && t.activo);

  // Verificar configuración
  const config = configuracionesPush.get(usuarioId);
  if (config) {
    // Verificar horario
    const ahora = new Date();
    const hora = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    if (hora < config.horarioInicio || hora > config.horarioFin) {
      if (notificacion.prioridad !== 'alta') {
        // [STRUCTURED-LOG] // logger.info({ message: `[Push] Fuera de horario para ${usuarioId}`, module: 'sync' });
        return { enviados: 0, errores: 0 };
      }
    }

    // Verificar tipo de notificación habilitado
    const tipoPermitido = (
      (notificacion.tipo === 'alerta' && config.alertasUrgentes) ||
      (notificacion.tipo === 'aprobacion' && config.aprobacionesPendientes) ||
      (notificacion.tipo === 'vencimiento' && config.vencimientos) ||
      (notificacion.tipo === 'pago' && config.pagos) ||
      (notificacion.tipo === 'firma' && config.firmasPendientes) ||
      (notificacion.tipo === 'mensaje' && config.mensajesEquipo) ||
      notificacion.tipo === 'sistema'
    );

    if (!tipoPermitido) {
      // [STRUCTURED-LOG] // logger.info({ message: `[Push] Tipo ${notificacion.tipo} deshabilitado para ${usuarioId}`, module: 'sync' });
      return { enviados: 0, errores: 0 };
    }
  }

  let enviados = 0;
  let errores = 0;

  for (const token of tokensUsuario) {
    try {
      // En producción: enviar via Firebase Cloud Messaging
      // [STRUCTURED-LOG] // logger.info({ message: `[Push] Enviando a ${token.dispositivoNombre}:`, notificacion.titulo, module: 'sync' });
      
      // Simular envío
      token.ultimoUso = new Date();
      enviados++;
    } catch (error) {
      logger.error(`Push error sending to ${token.dispositivoId}`, error instanceof Error ? error : undefined, { module: 'sync' });
      errores++;
    }
  }

  return { enviados, errores };
}

export async function enviarPushMasivo(
  usuarioIds: string[],
  notificacion: Omit<NotificacionPush, 'id'>
): Promise<{ total: number; enviados: number; errores: number }> {
  let totalEnviados = 0;
  let totalErrores = 0;

  for (const usuarioId of usuarioIds) {
    const resultado = await enviarPushNotificacion(usuarioId, notificacion);
    totalEnviados += resultado.enviados;
    totalErrores += resultado.errores;
  }

  return {
    total: usuarioIds.length,
    enviados: totalEnviados,
    errores: totalErrores
  };
}
