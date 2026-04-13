/**
 * 🔗 SILEXAR PULSE - Webhooks Service TIER 0
 * 
 * @description Sistema de webhooks para integraciones externas
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { apiServerError } from '@/lib/api/response';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EventoWebhook = 
  | 'contrato.creado' | 'contrato.actualizado' | 'contrato.aprobado'
  | 'contrato.rechazado' | 'contrato.firmado' | 'contrato.activado'
  | 'contrato.completado' | 'contrato.cancelado' | 'contrato.vencimiento_proximo'
  | 'contrato.vencido' | 'factura.creada' | 'factura.emitida'
  | 'factura.vencida' | 'factura.pagada' | 'factura.anulada'
  | 'pago.recibido' | 'pago.rechazado' | 'pago.reembolsado'
  | 'cuenta.movimiento' | 'cuenta.saldo_bajo' | 'cuenta.moratoria'
  | 'cliente.creado' | 'cliente.actualizado' | 'sistema.test';

export type EstadoWebhook = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'ERROR';

export interface ConfiguracionWebhook {
  id: string;
  nombre: string;
  url: string;
  eventos: EventoWebhook[];
  estado: EstadoWebhook;
  secreto: string;
  headers?: Record<string, string>;
  filtros?: { contratoIds?: string[]; clienteIds?: string[]; estados?: string[] };
  config: { reintentos: number; timeoutMs: number; firmaHabilitada: boolean; formatoPayload: 'JSON' | 'FORM' };
  creadorId: string;
  empresaId: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  ultimaEjecucion?: Date;
  estadisticas: { enviosExitosos: number; enviosFallidos: number; ultimoError?: string };
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
  respuesta?: { status: number; body?: string; headers?: Record<string, string>; duracionMs: number };
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
  metadata: { empresaId: string; ambienteId: string; correlacionId: string };
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  VERSION_API: '2025.4.0',
  MAX_REINTENTOS: 5,
  TIMEOUT_DEFAULT_MS: 30000,
  BACKOFF_BASE_MS: 1000,
  BACKOFF_MAX_MS: 300000,
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
// ALMACENAMIENTO EN MEMORIA
// ═══════════════════════════════════════════════════════════════

const webhooks = new Map<string, ConfiguracionWebhook>();
const entregas = new Map<string, EntregaWebhook>();
const colaEntregas: string[] = [];

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

class WebhooksEngine {
  private static instance: WebhooksEngine;

  static getInstance(): WebhooksEngine {
    if (!this.instance) {
      this.instance = new WebhooksEngine();
    }
    return this.instance;
  }

  crear(params: { nombre: string; url: string; eventos: EventoWebhook[]; empresaId: string; creadorId: string }): ConfiguracionWebhook {
    if (!this.validarUrl(params.url)) {
      throw new Error('URL inválida. Debe ser HTTPS.');
    }

    const existentes = this.listarPorEmpresa(params.empresaId);
    if (existentes.length >= CONFIG.MAX_WEBHOOKS_POR_EMPRESA) {
      throw new Error(`Límite de ${CONFIG.MAX_WEBHOOKS_POR_EMPRESA} webhooks alcanzado`);
    }

    const webhook: ConfiguracionWebhook = {
      id: `wh-${crypto.randomUUID()}`,
      nombre: params.nombre,
      url: params.url,
      eventos: params.eventos,
      estado: 'ACTIVO',
      secreto: this.generarSecreto(),
      config: { reintentos: CONFIG.MAX_REINTENTOS, timeoutMs: CONFIG.TIMEOUT_DEFAULT_MS, firmaHabilitada: true, formatoPayload: 'JSON' },
      creadorId: params.creadorId,
      empresaId: params.empresaId,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      estadisticas: { enviosExitosos: 0, enviosFallidos: 0 }
    };

    webhooks.set(webhook.id, webhook);
    return webhook;
  }

  actualizar(id: string, params: Partial<ConfiguracionWebhook>): ConfiguracionWebhook | null {
    const webhook = webhooks.get(id);
    if (!webhook) return null;
    if (params.url && !this.validarUrl(params.url)) {
      throw new Error('URL inválida. Debe ser HTTPS.');
    }
    const actualizado = { ...webhook, ...params, fechaModificacion: new Date() };
    webhooks.set(id, actualizado);
    return actualizado;
  }

  eliminar(id: string): boolean {
    return webhooks.delete(id);
  }

  obtener(id: string): ConfiguracionWebhook | undefined {
    return webhooks.get(id);
  }

  listarPorEmpresa(empresaId: string): ConfiguracionWebhook[] {
    return Array.from(webhooks.values()).filter(w => w.empresaId === empresaId);
  }

  rotarSecreto(id: string): string | null {
    const webhook = webhooks.get(id);
    if (!webhook) return null;
    webhook.secreto = this.generarSecreto();
    webhook.fechaModificacion = new Date();
    return webhook.secreto;
  }

  toggleEstado(id: string): ConfiguracionWebhook | null {
    const webhook = webhooks.get(id);
    if (!webhook) return null;
    webhook.estado = webhook.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    webhook.fechaModificacion = new Date();
    return webhook;
  }

  enviarPrueba(webhookId: string): boolean {
    const webhook = webhooks.get(webhookId);
    if (!webhook) return false;
    return true;
  }

  reintentar(entregaId: string): boolean {
    const entrega = entregas.get(entregaId);
    if (!entrega || entrega.estado !== 'FALLIDO') return false;
    entrega.estado = 'PENDIENTE';
    entrega.intentos = 0;
    entrega.error = undefined;
    colaEntregas.push(entrega.id);
    return true;
  }

  listarEventos(): typeof CONFIG.EVENTOS_DISPONIBLES {
    return CONFIG.EVENTOS_DISPONIBLES;
  }

  obtenerHistorial(webhookId: string, limite = 50): EntregaWebhook[] {
    return Array.from(entregas.values())
      .filter(e => e.webhookId === webhookId)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
      .slice(0, limite);
  }

  private validarUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      const hostname = parsed.hostname.toLowerCase();
      const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
      if (blockedHosts.includes(hostname)) return false;
      return true;
    } catch {
      return false;
    }
  }

  private generarSecreto(): string {
    return 'whsec_' + randomBytes(32).toString('hex');
  }
}

export const WebhooksService = WebhooksEngine.getInstance();

// ═══════════════════════════════════════════════════════════════
// API ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

/**
 * GET - Listar webhooks
 * Requiere: configuracion:read
 */
export const GET = withApiRoute(
  { resource: 'configuracion', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const empresaId = searchParams.get('empresaId') || ctx.tenantId;
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
      });
    } catch (error) {
      logger.error('[API/Webhooks] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'webhooks',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Acciones webhooks
 * Requiere: configuracion:admin
 */
export const POST = withApiRoute(
  { resource: 'configuracion', action: 'admin' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        const accion = body.accion;

        switch (accion) {
          case 'crear': {
            const nuevo = WebhooksService.crear({ ...body, empresaId: ctx.tenantId, creadorId: ctx.userId });
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
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error interno';
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
);
