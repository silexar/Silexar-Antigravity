import { logger } from '@/lib/observability';
/**
 * ✅ SILEXAR PULSE - Approval Workflow Service TIER 0
 * 
 * Sistema de flujos de aprobación con portal cliente,
 * notificaciones, escalamiento y firma digital
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface AprobadorConfig {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'interno' | 'cliente' | 'legal' | 'gerencia';
  esObligatorio: boolean;
  orden: number;
  tiempoLimiteHoras: number;
}

export interface SolicitudAprobacion {
  id: string;
  tenantId: string;
  
  // Recurso a aprobar
  tipoRecurso: 'cuna' | 'activo_digital' | 'campana';
  recursoId: string;
  recursoNombre: string;
  recursoPreviewUrl?: string;
  
  // Estado
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | 'expirada' | 'cancelada';
  
  // Workflow
  flujoId: string;
  aprobacionesRequeridas: AprobacionIndividual[];
  
  // Notificaciones
  notificacionesEnviadas: NotificacionAprobacion[];
  recordatoriosEnviados: number;
  
  // Escalamiento
  escalamientoActivo: boolean;
  escaladoAId?: string;
  escaladoFecha?: Date;
  
  // Comentarios
  comentarios: ComentarioAprobacion[];
  
  // Fechas
  fechaCreacion: Date;
  fechaLimite: Date;
  fechaResolucion?: Date;
  
  // Metadata
  creadoPorId: string;
  urlPortalCliente?: string;
  tokenAcceso?: string;
}

export interface AprobacionIndividual {
  aprobadorId: string;
  aprobadorNombre: string;
  aprobadorEmail: string;
  aprobadorRol: string;
  
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'omitida';
  esObligatorio: boolean;
  orden: number;
  
  fechaNotificacion?: Date;
  fechaRespuesta?: Date;
  comentario?: string;
  firmaDigitalUrl?: string;
}

export interface NotificacionAprobacion {
  id: string;
  canal: 'email' | 'whatsapp' | 'sms' | 'push' | 'slack';
  destinatario: string;
  enviada: boolean;
  fechaEnvio: Date;
  tipo: 'solicitud' | 'recordatorio' | 'escalamiento' | 'resolucion';
}

export interface ComentarioAprobacion {
  id: string;
  autorId: string;
  autorNombre: string;
  texto: string;
  timestamp: Date;
  tipo: 'comentario' | 'revision' | 'condicion';
  adjuntoUrl?: string;
}

export interface FlujoAprobacion {
  id: string;
  nombre: string;
  descripcion: string;
  
  // Configuración
  aprobadores: AprobadorConfig[];
  requiereTodosObligatorios: boolean;
  permitirAprobacionParcial: boolean;
  
  // Timeouts
  tiempoLimiteTotal: number; // horas
  intervaloRecordatorio: number; // horas
  maxRecordatorios: number;
  
  // Escalamiento
  habilitarEscalamiento: boolean;
  escalamientoHoras: number;
  escalamientoDestinatarioId: string;
  
  // Notificaciones
  canalesNotificacion: ('email' | 'whatsapp' | 'slack')[];
  
  // Activo
  esActivo: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FLUJOS PREDEFINIDOS
// ═══════════════════════════════════════════════════════════════

export const FLUJOS_DEFAULT: FlujoAprobacion[] = [
  {
    id: 'flujo-standard',
    nombre: 'Aprobación Estándar',
    descripcion: 'Flujo normal con validación interna y cliente',
    aprobadores: [
      { id: 'internal', nombre: 'Validación Interna', email: '', rol: 'interno', esObligatorio: true, orden: 1, tiempoLimiteHoras: 4 },
      { id: 'client', nombre: 'Aprobación Cliente', email: '', rol: 'cliente', esObligatorio: true, orden: 2, tiempoLimiteHoras: 24 }
    ],
    requiereTodosObligatorios: true,
    permitirAprobacionParcial: false,
    tiempoLimiteTotal: 48,
    intervaloRecordatorio: 8,
    maxRecordatorios: 3,
    habilitarEscalamiento: true,
    escalamientoHoras: 24,
    escalamientoDestinatarioId: 'supervisor',
    canalesNotificacion: ['email', 'whatsapp'],
    esActivo: true
  },
  {
    id: 'flujo-urgente',
    nombre: 'Aprobación Urgente',
    descripcion: 'Flujo rápido para materiales urgentes',
    aprobadores: [
      { id: 'internal', nombre: 'Validación Rápida', email: '', rol: 'interno', esObligatorio: true, orden: 1, tiempoLimiteHoras: 1 }
    ],
    requiereTodosObligatorios: true,
    permitirAprobacionParcial: false,
    tiempoLimiteTotal: 4,
    intervaloRecordatorio: 1,
    maxRecordatorios: 4,
    habilitarEscalamiento: true,
    escalamientoHoras: 2,
    escalamientoDestinatarioId: 'gerencia',
    canalesNotificacion: ['email', 'whatsapp', 'slack'],
    esActivo: true
  },
  {
    id: 'flujo-legal',
    nombre: 'Aprobación con Legal',
    descripcion: 'Incluye revisión legal para claims sensibles',
    aprobadores: [
      { id: 'internal', nombre: 'Validación Interna', email: '', rol: 'interno', esObligatorio: true, orden: 1, tiempoLimiteHoras: 4 },
      { id: 'legal', nombre: 'Revisión Legal', email: '', rol: 'legal', esObligatorio: true, orden: 2, tiempoLimiteHoras: 48 },
      { id: 'client', nombre: 'Aprobación Cliente', email: '', rol: 'cliente', esObligatorio: true, orden: 3, tiempoLimiteHoras: 24 }
    ],
    requiereTodosObligatorios: true,
    permitirAprobacionParcial: false,
    tiempoLimiteTotal: 96,
    intervaloRecordatorio: 12,
    maxRecordatorios: 3,
    habilitarEscalamiento: true,
    escalamientoHoras: 48,
    escalamientoDestinatarioId: 'gerencia',
    canalesNotificacion: ['email'],
    esActivo: true
  }
];

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

export class ApprovalWorkflowService {
  private solicitudes: Map<string, SolicitudAprobacion> = new Map();
  
  // ─────────────────────────────────────────────────────────────
  // CREAR SOLICITUD
  // ─────────────────────────────────────────────────────────────

  async crearSolicitud(
    tipoRecurso: 'cuna' | 'activo_digital' | 'campana',
    recursoId: string,
    recursoNombre: string,
    flujoId: string,
    aprobadoresConfig: AprobadorConfig[],
    creadoPorId: string,
    tenantId: string
  ): Promise<SolicitudAprobacion> {
    const flujo = FLUJOS_DEFAULT.find(f => f.id === flujoId) || FLUJOS_DEFAULT[0];
    const token = this.generarToken();
    
    const solicitud: SolicitudAprobacion = {
      id: `apr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      tipoRecurso,
      recursoId,
      recursoNombre,
      estado: 'pendiente',
      flujoId,
      aprobacionesRequeridas: aprobadoresConfig.map(a => ({
        aprobadorId: a.id,
        aprobadorNombre: a.nombre,
        aprobadorEmail: a.email,
        aprobadorRol: a.rol,
        estado: 'pendiente',
        esObligatorio: a.esObligatorio,
        orden: a.orden
      })),
      notificacionesEnviadas: [],
      recordatoriosEnviados: 0,
      escalamientoActivo: false,
      comentarios: [],
      fechaCreacion: new Date(),
      fechaLimite: new Date(Date.now() + flujo.tiempoLimiteTotal * 60 * 60 * 1000),
      creadoPorId,
      urlPortalCliente: `https://app.silexar.com/aprobar/${token}`,
      tokenAcceso: token
    };
    
    this.solicitudes.set(solicitud.id, solicitud);
    
    // Enviar notificaciones iniciales
    await this.enviarNotificacionesPendientes(solicitud);
    
    return solicitud;
  }

  // ─────────────────────────────────────────────────────────────
  // PROCESAR RESPUESTA
  // ─────────────────────────────────────────────────────────────

  async procesarRespuesta(
    solicitudId: string,
    aprobadorId: string,
    aprobado: boolean,
    comentario?: string,
    firmaDigital?: string
  ): Promise<SolicitudAprobacion> {
    const solicitud = this.solicitudes.get(solicitudId);
    if (!solicitud) throw new Error('Solicitud no encontrada');
    
    // Encontrar la aprobación correspondiente
    const aprobacion = solicitud.aprobacionesRequeridas.find(a => a.aprobadorId === aprobadorId);
    if (!aprobacion) throw new Error('Aprobador no válido para esta solicitud');
    
    // Actualizar estado
    aprobacion.estado = aprobado ? 'aprobada' : 'rechazada';
    aprobacion.fechaRespuesta = new Date();
    aprobacion.comentario = comentario;
    aprobacion.firmaDigitalUrl = firmaDigital;
    
    // Agregar comentario si existe
    if (comentario) {
      solicitud.comentarios.push({
        id: `com_${Date.now()}`,
        autorId: aprobadorId,
        autorNombre: aprobacion.aprobadorNombre,
        texto: comentario,
        timestamp: new Date(),
        tipo: aprobado ? 'comentario' : 'revision'
      });
    }
    
    // Evaluar estado general
    this.evaluarEstadoGeneral(solicitud);
    
    // Notificar siguiente aprobador si aplica
    if (solicitud.estado === 'pendiente') {
      await this.enviarNotificacionesPendientes(solicitud);
    }
    
    return solicitud;
  }

  // ─────────────────────────────────────────────────────────────
  // PORTAL CLIENTE
  // ─────────────────────────────────────────────────────────────

  async obtenerSolicitudPorToken(token: string): Promise<SolicitudAprobacion | null> {
    for (const solicitud of this.solicitudes.values()) {
      if (solicitud.tokenAcceso === token) {
        return solicitud;
      }
    }
    return null;
  }

  generarUrlAprobacion(solicitudId: string, aprobadorId: string): string {
    const solicitud = this.solicitudes.get(solicitudId);
    if (!solicitud) return '';
    
    const tokenAccion = Buffer.from(`${solicitudId}:${aprobadorId}:${Date.now()}`).toString('base64');
    return `https://app.silexar.com/aprobar/accion/${tokenAccion}`;
  }

  // ─────────────────────────────────────────────────────────────
  // NOTIFICACIONES
  // ─────────────────────────────────────────────────────────────

  private async enviarNotificacionesPendientes(solicitud: SolicitudAprobacion): Promise<void> {
    // Encontrar aprobadores pendientes en orden
    const pendientes = solicitud.aprobacionesRequeridas
      .filter(a => a.estado === 'pendiente')
      .sort((a, b) => a.orden - b.orden);
    
    if (pendientes.length === 0) return;
    
    // Solo notificar al siguiente en la cola
    const siguiente = pendientes[0];
    
    // Email
    await this.enviarNotificacionEmail(solicitud, siguiente);
    
    // WhatsApp si está configurado
    // await this.enviarNotificacionWhatsApp(solicitud, siguiente);
    
    solicitud.notificacionesEnviadas.push({
      id: `not_${Date.now()}`,
      canal: 'email',
      destinatario: siguiente.aprobadorEmail,
      enviada: true,
      fechaEnvio: new Date(),
      tipo: 'solicitud'
    });
    
    siguiente.fechaNotificacion = new Date();
  }

  private async enviarNotificacionEmail(
    solicitud: SolicitudAprobacion, 
    aprobador: AprobacionIndividual
  ): Promise<void> {
    const urlAprobacion = this.generarUrlAprobacion(solicitud.id, aprobador.aprobadorId);
    
    // En producción: enviar con SendGrid, Resend, etc.
    logger.info(`📧 Enviando email de aprobación a ${aprobador.aprobadorEmail}`);
    logger.info(`   Recurso: ${solicitud.recursoNombre}`);
    logger.info(`   URL: ${urlAprobacion}`);
  }

  // ─────────────────────────────────────────────────────────────
  // RECORDATORIOS Y ESCALAMIENTO
  // ─────────────────────────────────────────────────────────────

  async procesarRecordatoriosYEscalamientos(): Promise<void> {
    const ahora = new Date();
    
    for (const solicitud of this.solicitudes.values()) {
      if (solicitud.estado !== 'pendiente' && solicitud.estado !== 'en_revision') continue;
      
      const flujo = FLUJOS_DEFAULT.find(f => f.id === solicitud.flujoId);
      if (!flujo) continue;
      
      // Verificar expiración
      if (ahora > solicitud.fechaLimite) {
        solicitud.estado = 'expirada';
        continue;
      }
      
      // Verificar necesidad de recordatorio
      const horasDesdeCreacion = (ahora.getTime() - solicitud.fechaCreacion.getTime()) / (1000 * 60 * 60);
      const recordatoriosEsperados = Math.floor(horasDesdeCreacion / flujo.intervaloRecordatorio);
      
      if (recordatoriosEsperados > solicitud.recordatoriosEnviados && 
          solicitud.recordatoriosEnviados < flujo.maxRecordatorios) {
        await this.enviarRecordatorio(solicitud);
        solicitud.recordatoriosEnviados++;
      }
      
      // Verificar escalamiento
      if (flujo.habilitarEscalamiento && 
          !solicitud.escalamientoActivo && 
          horasDesdeCreacion >= flujo.escalamientoHoras) {
        await this.escalarSolicitud(solicitud, flujo.escalamientoDestinatarioId);
      }
    }
  }

  private async enviarRecordatorio(solicitud: SolicitudAprobacion): Promise<void> {
    logger.info(`🔔 Enviando recordatorio para solicitud ${solicitud.id}`);
    solicitud.notificacionesEnviadas.push({
      id: `not_${Date.now()}`,
      canal: 'email',
      destinatario: 'pending',
      enviada: true,
      fechaEnvio: new Date(),
      tipo: 'recordatorio'
    });
  }

  private async escalarSolicitud(solicitud: SolicitudAprobacion, destinatarioId: string): Promise<void> {
    logger.info(`⚠️ Escalando solicitud ${solicitud.id} a ${destinatarioId}`);
    solicitud.escalamientoActivo = true;
    solicitud.escaladoAId = destinatarioId;
    solicitud.escaladoFecha = new Date();
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private evaluarEstadoGeneral(solicitud: SolicitudAprobacion): void {
    const { aprobacionesRequeridas } = solicitud;
    
    const obligatorias = aprobacionesRequeridas.filter(a => a.esObligatorio);
    const rechazadas = obligatorias.filter(a => a.estado === 'rechazada');
    const aprobadas = obligatorias.filter(a => a.estado === 'aprobada');
    
    if (rechazadas.length > 0) {
      solicitud.estado = 'rechazada';
      solicitud.fechaResolucion = new Date();
    } else if (aprobadas.length === obligatorias.length) {
      solicitud.estado = 'aprobada';
      solicitud.fechaResolucion = new Date();
    } else {
      solicitud.estado = 'en_revision';
    }
  }

  private generarToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // ─────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────

  obtenerSolicitud(id: string): SolicitudAprobacion | undefined {
    return this.solicitudes.get(id);
  }

  obtenerSolicitudesPendientes(userId?: string): SolicitudAprobacion[] {
    const resultado: SolicitudAprobacion[] = [];
    for (const solicitud of this.solicitudes.values()) {
      if (solicitud.estado === 'pendiente' || solicitud.estado === 'en_revision') {
        if (userId) {
          const esAprobador = solicitud.aprobacionesRequeridas.some(
            a => a.aprobadorId === userId && a.estado === 'pendiente'
          );
          if (esAprobador) resultado.push(solicitud);
        } else {
          resultado.push(solicitud);
        }
      }
    }
    return resultado;
  }

  obtenerFlujos(): FlujoAprobacion[] {
    return FLUJOS_DEFAULT;
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
export default approvalWorkflowService;
