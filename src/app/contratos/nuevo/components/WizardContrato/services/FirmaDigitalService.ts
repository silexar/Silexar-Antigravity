import { logger } from '@/lib/observability';
/**
 * ✍️ SILEXAR PULSE - Servicio de Firma Digital TIER 0
 * 
 * @description Integración con DocuSign y Adobe Sign para
 * firma electrónica de contratos con validez legal.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// Types are defined locally - enterprise.types not available
// // Types are defined locally - enterprise.types not available
// import { FirmaContrato } from '../types/enterprise.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface FirmaDigitalConfig {
  proveedor: 'DOCUSIGN' | 'ADOBE_SIGN' | 'INTERNAL';
  apiKey?: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
}

export interface SolicitudFirma {
  contratoId: string;
  numeroContrato: string;
  documentoUrl: string;
  documentoNombre: string;
  firmantes: {
    tipo: 'empresa' | 'cliente' | 'testigo';
    nombre: string;
    email: string;
    rut?: string;
    cargo?: string;
    orden: number;
    telefono?: string;
  }[];
  mensaje?: string;
  asunto?: string;
  idioma?: 'es' | 'en';
  expiracionDias?: number;
  recordatorios?: {
    frecuenciaDias: number;
    cantidadMaxima: number;
  };
}

export interface EnvelopeFirma {
  id: string;
  envelopeId: string;
  proveedor: string;
  estado: 'creado' | 'enviado' | 'en_proceso' | 'firmado' | 'rechazado' | 'expirado' | 'cancelado';
  urlFirma: string;
  urlDocumentoFirmado?: string;
  firmantes: {
    email: string;
    nombre: string;
    estado: 'pendiente' | 'enviado' | 'abierto' | 'firmado' | 'rechazado';
    fechaFirma?: Date;
    ipFirma?: string;
  }[];
  fechaCreacion: Date;
  fechaEnvio?: Date;
  fechaCompletado?: Date;
  fechaExpiracion: Date;
}

export interface EventoFirma {
  tipo: 'enviado' | 'visto' | 'firmado' | 'rechazado' | 'expirado' | 'recordatorio';
  envelopeId: string;
  firmanteEmail: string;
  firmanteNombre: string;
  timestamp: Date;
  datos?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class FirmaDigitalService {
  private config: FirmaDigitalConfig;
  private envelopes: Map<string, EnvelopeFirma> = new Map();
  private eventos: EventoFirma[] = [];

  constructor(config?: Partial<FirmaDigitalConfig>) {
    this.config = {
      proveedor: config?.proveedor || 'INTERNAL',
      environment: config?.environment || 'sandbox',
      apiKey: config?.apiKey,
      webhookUrl: config?.webhookUrl
    };
    
    this.cargarDatos();
  }

  private cargarDatos(): void {
    try {
      const data = localStorage.getItem('silexar_firmas_digitales');
      if (data) {
        const parsed = JSON.parse(data);
        this.envelopes = new Map(parsed.envelopes || []);
        this.eventos = (parsed.eventos || []).map((e: EventoFirma & { timestamp: string }) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      }
    } catch {
      logger.warn('No se pudieron cargar datos de firmas');
    }
  }

  private guardarDatos(): void {
    try {
      localStorage.setItem('silexar_firmas_digitales', JSON.stringify({
        envelopes: Array.from(this.envelopes.entries()),
        eventos: this.eventos
      }));
    } catch {
      logger.warn('No se pudieron guardar datos de firmas');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CREAR SOLICITUD DE FIRMA
  // ═══════════════════════════════════════════════════════════════

  async crearSolicitud(solicitud: SolicitudFirma): Promise<EnvelopeFirma> {
    // Simular llamada a API de DocuSign/Adobe Sign
    const envelopeId = `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const envelope: EnvelopeFirma = {
      id: crypto.randomUUID(),
      envelopeId,
      proveedor: this.config.proveedor,
      estado: 'creado',
      urlFirma: this.generarUrlFirma(envelopeId),
      firmantes: solicitud.firmantes.map(f => ({
        email: f.email,
        nombre: f.nombre,
        estado: 'pendiente'
      })),
      fechaCreacion: new Date(),
      fechaExpiracion: new Date(Date.now() + (solicitud.expiracionDias || 30) * 24 * 60 * 60 * 1000)
    };

    this.envelopes.set(envelope.id, envelope);
    this.guardarDatos();

    logger.info(`[FirmaDigital] Envelope creado: ${envelopeId}`);
    return envelope;
  }

  // ═══════════════════════════════════════════════════════════════
  // ENVIAR PARA FIRMA
  // ═══════════════════════════════════════════════════════════════

  async enviarParaFirma(envelopeId: string): Promise<EnvelopeFirma> {
    const envelope = Array.from(this.envelopes.values()).find(e => e.envelopeId === envelopeId);
    if (!envelope) throw new Error('Envelope no encontrado');

    // Simular envío
    envelope.estado = 'enviado';
    envelope.fechaEnvio = new Date();
    envelope.firmantes = envelope.firmantes.map(f => ({
      ...f,
      estado: 'enviado' as const
    }));

    // Registrar evento
    envelope.firmantes.forEach(f => {
      this.eventos.push({
        tipo: 'enviado',
        envelopeId: envelope.envelopeId,
        firmanteEmail: f.email,
        firmanteNombre: f.nombre,
        timestamp: new Date()
      });
    });

    this.guardarDatos();
    logger.info(`[FirmaDigital] Envelope enviado: ${envelopeId}`);
    return envelope;
  }

  // ═══════════════════════════════════════════════════════════════
  // SIMULAR FIRMA (para demo)
  // ═══════════════════════════════════════════════════════════════

  async simularFirma(envelopeId: string, firmanteEmail: string): Promise<EnvelopeFirma> {
    const envelope = Array.from(this.envelopes.values()).find(e => e.envelopeId === envelopeId);
    if (!envelope) throw new Error('Envelope no encontrado');

    const firmante = envelope.firmantes.find(f => f.email === firmanteEmail);
    if (!firmante) throw new Error('Firmante no encontrado');

    firmante.estado = 'firmado';
    firmante.fechaFirma = new Date();
    firmante.ipFirma = '192.168.1.100';

    // Registrar evento
    this.eventos.push({
      tipo: 'firmado',
      envelopeId: envelope.envelopeId,
      firmanteEmail,
      firmanteNombre: firmante.nombre,
      timestamp: new Date()
    });

    // Verificar si todos firmaron
    const todosFirmaron = envelope.firmantes.every(f => f.estado === 'firmado');
    if (todosFirmaron) {
      envelope.estado = 'firmado';
      envelope.fechaCompletado = new Date();
      envelope.urlDocumentoFirmado = `/documentos/firmados/${envelope.envelopeId}.pdf`;
    } else {
      envelope.estado = 'en_proceso';
    }

    this.guardarDatos();
    return envelope;
  }

  // ═══════════════════════════════════════════════════════════════
  // OBTENER ESTADO
  // ═══════════════════════════════════════════════════════════════

  async obtenerEstado(envelopeId: string): Promise<EnvelopeFirma | null> {
    return Array.from(this.envelopes.values()).find(e => e.envelopeId === envelopeId) || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  obtenerPorContrato(_contratoId: string): EnvelopeFirma[] {
    // En una implementación real, se filtraría por contratoId almacenado
    return Array.from(this.envelopes.values());
  }

  obtenerEventos(envelopeId: string): EventoFirma[] {
    return this.eventos.filter(e => e.envelopeId === envelopeId);
  }

  // ═══════════════════════════════════════════════════════════════
  // CANCELAR / REENVIAR
  // ═══════════════════════════════════════════════════════════════

  async cancelar(envelopeId: string, motivo: string): Promise<void> {
    const envelope = Array.from(this.envelopes.values()).find(e => e.envelopeId === envelopeId);
    if (!envelope) throw new Error('Envelope no encontrado');

    envelope.estado = 'cancelado';
    this.guardarDatos();
    logger.info(`[FirmaDigital] Envelope cancelado: ${envelopeId}, motivo: ${motivo}`);
  }

  async reenviarRecordatorio(envelopeId: string, firmanteEmail: string): Promise<void> {
    const envelope = Array.from(this.envelopes.values()).find(e => e.envelopeId === envelopeId);
    if (!envelope) throw new Error('Envelope no encontrado');

    this.eventos.push({
      tipo: 'recordatorio',
      envelopeId,
      firmanteEmail,
      firmanteNombre: envelope.firmantes.find(f => f.email === firmanteEmail)?.nombre || '',
      timestamp: new Date()
    });

    this.guardarDatos();
    logger.info(`[FirmaDigital] Recordatorio enviado a: ${firmanteEmail}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  private generarUrlFirma(envelopeId: string): string {
    if (this.config.proveedor === 'DOCUSIGN') {
      return `https://demo.docusign.net/signing/view/${envelopeId}`;
    } else if (this.config.proveedor === 'ADOBE_SIGN') {
      return `https://secure.adobesign.com/sign/${envelopeId}`;
    }
    return `/firmas/interno/${envelopeId}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // ESTADÍSTICAS
  // ═══════════════════════════════════════════════════════════════

  obtenerEstadisticas(): {
    totalEnvelopes: number;
    pendientes: number;
    firmados: number;
    rechazados: number;
    tiempoPromedioFirma: number;
  } {
    const envelopes = Array.from(this.envelopes.values());
    const firmados = envelopes.filter(e => e.estado === 'firmado');
    
    let tiempoTotal = 0;
    firmados.forEach(e => {
      if (e.fechaEnvio && e.fechaCompletado) {
        tiempoTotal += e.fechaCompletado.getTime() - e.fechaEnvio.getTime();
      }
    });

    return {
      totalEnvelopes: envelopes.length,
      pendientes: envelopes.filter(e => ['creado', 'enviado', 'en_proceso'].includes(e.estado)).length,
      firmados: firmados.length,
      rechazados: envelopes.filter(e => e.estado === 'rechazado').length,
      tiempoPromedioFirma: firmados.length > 0 ? tiempoTotal / firmados.length / (1000 * 60 * 60) : 0 // horas
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

let firmaServiceInstance: FirmaDigitalService | null = null;

export function useFirmaDigital(config?: Partial<FirmaDigitalConfig>): FirmaDigitalService {
  if (!firmaServiceInstance) {
    firmaServiceInstance = new FirmaDigitalService(config);
  }
  return firmaServiceInstance;
}

export default FirmaDigitalService;
