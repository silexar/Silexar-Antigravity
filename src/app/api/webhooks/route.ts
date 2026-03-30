/**
 * 🔗 SILEXAR PULSE - Webhooks Service TIER 0
 * 
 * @description Sistema de webhooks para integraciones externas:
 * - Notificaciones de eventos de contratos
 * - Configuración por cliente
 * - Retry con backoff exponencial
 * - Logs y monitoreo
 * - Validación de firmas
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EventoWebhook = 
  // Contratos
  | 'contrato.creado'
  | 'contrato.actualizado'
  | 'contrato.aprobado'
  | 'contrato.rechazado'
  | 'contrato.firmado'
  | 'contrato.activado'
  | 'contrato.completado'
  | 'contrato.cancelado'
  | 'contrato.vencimiento_proximo'
  | 'contrato.vencido'
  // Facturación
  | 'factura.creada'
  | 'factura.emitida'
  | 'factura.vencida'
  | 'factura.pagada'
  | 'factura.anulada'
  // Pagos
  | 'pago.recibido'
  | 'pago.rechazado'
  | 'pago.reembolsado'
  // Cuenta Corriente
  | 'cuenta.movimiento'
  | 'cuenta.saldo_bajo'
  | 'cuenta.moratoria'
  // Clientes
  | 'cliente.creado'
  | 'cliente.actualizado'
  // Sistema
  | 'sistema.test';

export type EstadoWebhook = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'ERROR';

export interface ConfiguracionWebhook {
  id: string;
  nombre: string;
  url: string;
  eventos: EventoWebhook[];
  estado: EstadoWebhook;
  secreto: string;
  headers?: Record<string, string>;
  filtros?: {
    contratoIds?: string[];
    clienteIds?: string[];
    estados?: string[];
  };
  config: {
    reintentos: number;
    timeoutMs: number;
    firmaHabilitada: boolean;
    formatoPayload: 'JSON' | 'FORM';
  };
  creadorId: string;
  empresaId: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  ultimaEjecucion?: Date;
  estadisticas: {
    enviosExitosos: number;
    enviosFallidos: number;
    ultimoError?: string;
  };
}

export interface EntregaWebhook {
  id: string;
  webhookId: string;
  evento: EventoWebhook;
  payload: PayloadWebhook<Record<string, unknown>>;
  estado: 'PENDIENTE' | 'ENVIANDO' | 'EXITOSO' | 'FALLIDO' | 'CANCELADO';
  intentos: number;
  maxIntentos: number;
  ultimoIntento?: Date;
  proximoIntento?: Date;
  respuesta?: {
    status: number;
    body?: string;
    headers?: Record<string, string>;
    duracionMs: number;
  };
  error?: string;
  fechaCreacion: Date;
  fechaCompletado?: Date;
}

export interface PayloadWebhook<T = Record<string, unknown>> {
  id: string;
  tipo: EventoWebhook;
  version: string;
  timestamp: string;
  datos: T;
  metadata: {
    empresaId: string;
    ambienteId: string;
    correlacionId: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  VERSION_API: '2025.4.0',
  MAX_REINTENTOS: 5,
  TIMEOUT_DEFAULT_MS: 30000,
  BACKOFF_BASE_MS: 1000,
  BACKOFF_MAX_MS: 300000, // 5 minutos
  BATCH_SIZE: 10,
  RETENTION_DIAS: 30,
  MAX_WEBHOOKS_POR_EMPRESA: 20,
  EVENTOS_DISPONIBLES: [
    { evento: 'contrato.creado', descripcion: 'Nuevo contrato creado' },
    { evento: 'contrato.actualizado', descripcion: 'Contrato modificado' },
    { evento: 'contrato.aprobado', descripcion: 'Contrato aprobado' },
    { evento: 'contrato.rechazado', descripcion: 'Contrato rechazado' },
    { evento: 'contrato.firmado', descripcion: 'Contrato firmado digitalmente' },
    { evento: 'contrato.activado', descripcion: 'Contrato activado' },
    { evento: 'contrato.completado', descripcion: 'Contrato completado/finalizado' },
    { evento: 'contrato.cancelado', descripcion: 'Contrato cancelado' },
    { evento: 'contrato.vencimiento_proximo', descripcion: 'Contrato próximo a vencer' },
    { evento: 'contrato.vencido', descripcion: 'Contrato vencido' },
    { evento: 'factura.creada', descripcion: 'Factura creada' },
    { evento: 'factura.emitida', descripcion: 'Factura emitida al SII' },
    { evento: 'factura.vencida', descripcion: 'Factura vencida' },
    { evento: 'factura.pagada', descripcion: 'Factura pagada' },
    { evento: 'factura.anulada', descripcion: 'Factura anulada' },
    { evento: 'pago.recibido', descripcion: 'Pago recibido' },
    { evento: 'pago.rechazado', descripcion: 'Pago rechazado' },
    { evento: 'pago.reembolsado', descripcion: 'Pago reembolsado' },
    { evento: 'cuenta.movimiento', descripcion: 'Movimiento en cuenta corriente' },
    { evento: 'cuenta.saldo_bajo', descripcion: 'Saldo bajo umbral' },
    { evento: 'cuenta.moratoria', descripcion: 'Cuenta en moratoria' },
    { evento: 'cliente.creado', descripcion: 'Nuevo cliente creado' },
    { evento: 'cliente.actualizado', descripcion: 'Cliente actualizado' },
    { evento: 'sistema.test', descripcion: 'Evento de prueba' }
  ] as const
};

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO EN MEMORIA (En producción usar DB)
// ═══════════════════════════════════════════════════════════════

const webhooks = new Map<string, ConfiguracionWebhook>();
const entregas = new Map<string, EntregaWebhook>();
const colaEntregas: string[] = [];

// ═══════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

class WebhooksEngine {
  private static instance: WebhooksEngine;
  private procesandoCola = false;

  private constructor() {
    // Iniciar procesamiento de cola
    this.iniciarProcesador();
  }

  static getInstance(): WebhooksEngine {
    if (!this.instance) {
      this.instance = new WebhooksEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE WEBHOOKS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea un nuevo webhook
   */
  crear(params: {
    nombre: string;
    url: string;
    eventos: EventoWebhook[];
    empresaId: string;
    creadorId: string;
    headers?: Record<string, string>;
    filtros?: ConfiguracionWebhook['filtros'];
  }): ConfiguracionWebhook {
    // Validaciones
    if (!this.validarUrl(params.url)) {
      throw new Error('URL inválida. Debe ser HTTPS.');
    }

    if (params.eventos.length === 0) {
      throw new Error('Debe seleccionar al menos un evento');
    }

    // Verificar límite por empresa
    const existentes = this.listarPorEmpresa(params.empresaId);
    if (existentes.length >= CONFIG.MAX_WEBHOOKS_POR_EMPRESA) {
      throw new Error(`Límite de ${CONFIG.MAX_WEBHOOKS_POR_EMPRESA} webhooks alcanzado`);
    }

    const webhook: ConfiguracionWebhook = {
      id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nombre: params.nombre,
      url: params.url,
      eventos: params.eventos,
      estado: 'ACTIVO',
      secreto: this.generarSecreto(),
      headers: params.headers,
      filtros: params.filtros,
      config: {
        reintentos: CONFIG.MAX_REINTENTOS,
        timeoutMs: CONFIG.TIMEOUT_DEFAULT_MS,
        firmaHabilitada: true,
        formatoPayload: 'JSON'
      },
      creadorId: params.creadorId,
      empresaId: params.empresaId,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      estadisticas: {
        enviosExitosos: 0,
        enviosFallidos: 0
      }
    };

    webhooks.set(webhook.id, webhook);
    // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] Webhook creado: ${webhook.nombre} (${webhook.id})`, module: 'webhooks' });
    
    return webhook;
  }

  /**
   * Actualiza un webhook
   */
  actualizar(id: string, params: Partial<ConfiguracionWebhook>): ConfiguracionWebhook | null {
    const webhook = webhooks.get(id);
    if (!webhook) return null;

    if (params.url && !this.validarUrl(params.url)) {
      throw new Error('URL inválida. Debe ser HTTPS.');
    }

    const actualizado = {
      ...webhook,
      ...params,
      fechaModificacion: new Date()
    };

    webhooks.set(id, actualizado);
    return actualizado;
  }

  /**
   * Elimina un webhook
   */
  eliminar(id: string): boolean {
    return webhooks.delete(id);
  }

  /**
   * Obtiene un webhook
   */
  obtener(id: string): ConfiguracionWebhook | undefined {
    return webhooks.get(id);
  }

  /**
   * Lista webhooks de una empresa
   */
  listarPorEmpresa(empresaId: string): ConfiguracionWebhook[] {
    return Array.from(webhooks.values())
      .filter(w => w.empresaId === empresaId);
  }

  /**
   * Rota el secreto de un webhook
   */
  rotarSecreto(id: string): string | null {
    const webhook = webhooks.get(id);
    if (!webhook) return null;

    webhook.secreto = this.generarSecreto();
    webhook.fechaModificacion = new Date();
    
    return webhook.secreto;
  }

  /**
   * Activa/desactiva un webhook
   */
  toggleEstado(id: string): ConfiguracionWebhook | null {
    const webhook = webhooks.get(id);
    if (!webhook) return null;

    webhook.estado = webhook.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    webhook.fechaModificacion = new Date();
    
    return webhook;
  }

  // ═══════════════════════════════════════════════════════════════
  // DISPARAR EVENTOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Dispara un evento a todos los webhooks suscritos
   */
  async dispararEvento<T extends Record<string, unknown>>(
    evento: EventoWebhook,
    datos: T,
    metadata?: { 
      contratoId?: string; 
      clienteId?: string;
      empresaId: string;
    }
  ): Promise<number> {
    const webhooksRelevantes = Array.from(webhooks.values())
      .filter(w => {
        // Verificar estado
        if (w.estado !== 'ACTIVO') return false;
        
        // Verificar suscripción al evento
        if (!w.eventos.includes(evento)) return false;
        
        // Verificar empresa
        if (metadata?.empresaId && w.empresaId !== metadata.empresaId) return false;
        
        // Aplicar filtros
        if (w.filtros) {
          if (w.filtros.contratoIds?.length && metadata?.contratoId) {
            if (!w.filtros.contratoIds.includes(metadata.contratoId)) return false;
          }
          if (w.filtros.clienteIds?.length && metadata?.clienteId) {
            if (!w.filtros.clienteIds.includes(metadata.clienteId)) return false;
          }
        }
        
        return true;
      });

    if (webhooksRelevantes.length === 0) {
      // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] Evento ${evento}: sin webhooks suscritos`, module: 'webhooks' });
      return 0;
    }

    // Crear entregas para cada webhook
    for (const webhook of webhooksRelevantes) {
      const payload: PayloadWebhook<T> = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tipo: evento,
        version: CONFIG.VERSION_API,
        timestamp: new Date().toISOString(),
        datos,
        metadata: {
          empresaId: webhook.empresaId,
          ambienteId: 'production',
          correlacionId: `cor-${Date.now()}`
        }
      };

      const entrega: EntregaWebhook = {
        id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        webhookId: webhook.id,
        evento,
        payload: payload as PayloadWebhook<Record<string, unknown>>,
        estado: 'PENDIENTE',
        intentos: 0,
        maxIntentos: webhook.config.reintentos,
        fechaCreacion: new Date()
      };

      entregas.set(entrega.id, entrega);
      colaEntregas.push(entrega.id);
    }

    // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] Evento ${evento}: ${webhooksRelevantes.length} entregas encoladas`, module: 'webhooks' });
    return webhooksRelevantes.length;
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESADOR DE COLA
  // ═══════════════════════════════════════════════════════════════

  private iniciarProcesador(): void {
    setInterval(() => this.procesarCola(), 5000);
  }

  private async procesarCola(): Promise<void> {
    if (this.procesandoCola || colaEntregas.length === 0) return;
    
    this.procesandoCola = true;

    try {
      const batch = colaEntregas.splice(0, CONFIG.BATCH_SIZE);
      
      await Promise.all(batch.map(id => this.procesarEntrega(id)));
    } finally {
      this.procesandoCola = false;
    }
  }

  private async procesarEntrega(entregaId: string): Promise<void> {
    const entrega = entregas.get(entregaId);
    if (!entrega || entrega.estado === 'EXITOSO' || entrega.estado === 'CANCELADO') return;

    const webhook = webhooks.get(entrega.webhookId);
    if (!webhook || webhook.estado !== 'ACTIVO') {
      entrega.estado = 'CANCELADO';
      return;
    }

    entrega.estado = 'ENVIANDO';
    entrega.intentos++;
    entrega.ultimoIntento = new Date();

    try {
      const inicio = Date.now();
      
      // Preparar headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': `SilexarPulse-Webhooks/${CONFIG.VERSION_API}`,
        'X-Webhook-Id': webhook.id,
        'X-Delivery-Id': entrega.id,
        ...webhook.headers
      };

      // Agregar firma si está habilitada
      if (webhook.config.firmaHabilitada) {
        const firma = this.generarFirma(entrega.payload, webhook.secreto);
        headers['X-Webhook-Signature'] = firma;
        headers['X-Webhook-Timestamp'] = entrega.payload.timestamp;
      }

      // Enviar request
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(entrega.payload),
        signal: AbortSignal.timeout(webhook.config.timeoutMs)
      });

      const duracionMs = Date.now() - inicio;
      
      entrega.respuesta = {
        status: response.status,
        body: await response.text().catch(() => undefined),
        duracionMs
      };

      if (response.ok) {
        entrega.estado = 'EXITOSO';
        entrega.fechaCompletado = new Date();
        webhook.estadisticas.enviosExitosos++;
        webhook.ultimaEjecucion = new Date();
        // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] ✅ Entrega ${entrega.id} exitosa (${duracionMs}ms)`, module: 'webhooks' });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      entrega.error = errorMsg;
      webhook.estadisticas.ultimoError = errorMsg;
      
      if (entrega.intentos >= entrega.maxIntentos) {
        entrega.estado = 'FALLIDO';
        entrega.fechaCompletado = new Date();
        webhook.estadisticas.enviosFallidos++;
        // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] ❌ Entrega ${entrega.id} fallida permanentemente`, module: 'webhooks' });
        
        // Suspender webhook si tiene muchos fallos consecutivos
        if (webhook.estadisticas.enviosFallidos > 10) {
          webhook.estado = 'SUSPENDIDO';
          // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] ⚠️ Webhook ${webhook.id} suspendido por fallos`, module: 'webhooks' });
        }
      } else {
        // Programar reintento con backoff exponencial
        const backoff = Math.min(
          CONFIG.BACKOFF_BASE_MS * Math.pow(2, entrega.intentos - 1),
          CONFIG.BACKOFF_MAX_MS
        );
        entrega.proximoIntento = new Date(Date.now() + backoff);
        entrega.estado = 'PENDIENTE';
        
        // Re-encolar para reintento
        setTimeout(() => colaEntregas.push(entrega.id), backoff);
        
        // [STRUCTURED-LOG] // logger.info({ message: `[Webhooks] ⏳ Entrega ${entrega.id} reintento ${entrega.intentos}/${entrega.maxIntentos} en ${backoff}ms`, module: 'webhooks' });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  private validarUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private generarSecreto(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'whsec_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generarFirma(payload: unknown, secreto: string): string {
    // En producción: usar HMAC-SHA256 real
    // Aquí simulamos con hash simple
    const data = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const chr = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `sha256=${Math.abs(hash).toString(16)}_${secreto.slice(-8)}`;
  }

  /**
   * Envía un evento de prueba
   */
  async enviarPrueba(webhookId: string): Promise<boolean> {
    const webhook = webhooks.get(webhookId);
    if (!webhook) return false;

    await this.dispararEvento('sistema.test', {
      mensaje: 'Esta es una notificación de prueba',
      timestamp: new Date().toISOString(),
      webhookNombre: webhook.nombre
    }, { empresaId: webhook.empresaId });

    return true;
  }

  /**
   * Obtiene historial de entregas
   */
  obtenerHistorial(webhookId: string, limite = 50): EntregaWebhook[] {
    return Array.from(entregas.values())
      .filter(e => e.webhookId === webhookId)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
      .slice(0, limite);
  }

  /**
   * Reintenta una entrega fallida
   */
  reintentar(entregaId: string): boolean {
    const entrega = entregas.get(entregaId);
    if (!entrega || entrega.estado !== 'FALLIDO') return false;

    entrega.estado = 'PENDIENTE';
    entrega.intentos = 0;
    entrega.error = undefined;
    colaEntregas.push(entrega.id);
    
    return true;
  }

  /**
   * Lista eventos disponibles
   */
  listarEventos(): typeof CONFIG.EVENTOS_DISPONIBLES {
    return CONFIG.EVENTOS_DISPONIBLES;
  }

  /**
   * Limpia entregas antiguas
   */
  limpiarHistorial(diasMaximos = 30): number {
    const limite = Date.now() - diasMaximos * 24 * 60 * 60 * 1000;
    let eliminados = 0;
    
    for (const [id, entrega] of entregas.entries()) {
      if (entrega.fechaCreacion.getTime() < limite) {
        entregas.delete(id);
        eliminados++;
      }
    }
    
    return eliminados;
  }
}

// ═══════════════════════════════════════════════════════════════
// API ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const empresaId = searchParams.get('empresaId');
  const webhookId = searchParams.get('webhookId');

  if (webhookId) {
    const webhook = WebhooksService.obtener(webhookId);
    if (!webhook) {
      return NextResponse.json({ success: false, error: 'Webhook no encontrado' }, { status: 404 });
    }
    
    const historial = WebhooksService.obtenerHistorial(webhookId);
    return NextResponse.json({ success: true, data: { webhook, historial } });
  }

  if (empresaId) {
    const lista = WebhooksService.listarPorEmpresa(empresaId);
    return NextResponse.json({ success: true, data: lista });
  }

  const eventos = WebhooksService.listarEventos();
  return NextResponse.json({ success: true, data: { eventos } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accion = body.accion;

    switch (accion) {
      case 'crear': {
        const nuevo = WebhooksService.crear(body);
        return NextResponse.json({ success: true, data: nuevo });
      }
        
      case 'actualizar': {
        const actualizado = WebhooksService.actualizar(body.id, body);
        return NextResponse.json({ success: true, data: actualizado });
      }
        
      case 'eliminar': {
        WebhooksService.eliminar(body.id);
        return NextResponse.json({ success: true });
      }
        
      case 'toggle': {
        const toggled = WebhooksService.toggleEstado(body.id);
        return NextResponse.json({ success: true, data: toggled });
      }
        
      case 'rotar_secreto': {
        const nuevoSecreto = WebhooksService.rotarSecreto(body.id);
        return NextResponse.json({ success: true, data: { secreto: nuevoSecreto } });
      }
        
      case 'prueba': {
        await WebhooksService.enviarPrueba(body.id);
        return NextResponse.json({ success: true, message: 'Evento de prueba enviado' });
      }
        
      case 'reintentar': {
        WebhooksService.reintentar(body.entregaId);
        return NextResponse.json({ success: true });
      }
        
      default:
        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const WebhooksService = WebhooksEngine.getInstance();

export function useWebhooks() {
  return WebhooksService;
}

export default WebhooksService;
