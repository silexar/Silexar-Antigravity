/**
 * 📥 SILEXAR PULSE - API Inbox de Cuñas TIER 0
 * 
 * Endpoints para gestión del inbox de cuñas
 * recibidas por email/WhatsApp/FTP
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';


// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ItemInbox {
  id: string;
  origen: 'email' | 'whatsapp' | 'upload_manual' | 'api' | 'ftp';
  origenDetalle: string;
  asunto: string | null;
  cuerpoMensaje: string | null;
  remitente: string;
  fechaRecepcion: string;
  adjuntos: {
    nombre: string;
    tipo: string;
    tamano: number;
    url: string;
    esAudio: boolean;
  }[];
  anuncianteDetectadoId: string | null;
  anuncianteDetectadoNombre: string | null;
  confianzaDeteccion: number;
  procesado: boolean;
  cunaCreada: boolean;
  cunaResultanteId: string | null;
  asignadoAId: string | null;
  asignadoANombre: string | null;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const inboxMock: ItemInbox[] = [
  {
    id: 'inbox-001',
    origen: 'email',
    origenDetalle: 'marketing@bancochile.cl',
    asunto: 'Spot Enero 2026 - Campaña Ofertas',
    cuerpoMensaje: 'Hola equipo, les envío el spot para la campaña de enero. Duración 30 segundos. Por favor confirmar recepción.',
    remitente: 'María González <marketing@bancochile.cl>',
    fechaRecepcion: '2026-01-01T09:15:00',
    adjuntos: [
      { nombre: 'spot_ofertas_enero.mp3', tipo: 'audio/mpeg', tamano: 1456789, url: '/uploads/temp/spot_ofertas_enero.mp3', esAudio: true }
    ],
    anuncianteDetectadoId: 'anunc-001',
    anuncianteDetectadoNombre: 'Banco de Chile',
    confianzaDeteccion: 95,
    procesado: false,
    cunaCreada: false,
    cunaResultanteId: null,
    asignadoAId: null,
    asignadoANombre: null
  },
  {
    id: 'inbox-002',
    origen: 'whatsapp',
    origenDetalle: '+56912345678',
    asunto: null,
    cuerpoMensaje: 'Hola! Acá les mando el audio de la mención para mañana. Gracias!',
    remitente: 'Carlos Pérez (+56912345678)',
    fechaRecepcion: '2026-01-01T10:30:00',
    adjuntos: [
      { nombre: 'audio_mencion.m4a', tipo: 'audio/mp4', tamano: 892345, url: '/uploads/temp/audio_mencion.m4a', esAudio: true }
    ],
    anuncianteDetectadoId: null,
    anuncianteDetectadoNombre: null,
    confianzaDeteccion: 0,
    procesado: false,
    cunaCreada: false,
    cunaResultanteId: null,
    asignadoAId: 'user-001',
    asignadoANombre: 'Juan Martínez'
  },
  {
    id: 'inbox-003',
    origen: 'email',
    origenDetalle: 'spots@coca-cola.com',
    asunto: 'RE: Spot Verano 2026 - Versión Final Aprobada',
    cuerpoMensaje: 'Estimados, adjunto versión final aprobada del spot de verano. Por favor confirmar recepción y fecha de inicio.',
    remitente: 'Coca-Cola Marketing <spots@coca-cola.com>',
    fechaRecepcion: '2026-01-01T08:00:00',
    adjuntos: [
      { nombre: 'cocacola_verano_30s_v3_final.wav', tipo: 'audio/wav', tamano: 5234567, url: '/uploads/temp/cocacola_verano.wav', esAudio: true },
      { nombre: 'brief_verano_2026.pdf', tipo: 'application/pdf', tamano: 234567, url: '/uploads/temp/brief.pdf', esAudio: false }
    ],
    anuncianteDetectadoId: 'anunc-002',
    anuncianteDetectadoNombre: 'Coca-Cola',
    confianzaDeteccion: 98,
    procesado: true,
    cunaCreada: true,
    cunaResultanteId: 'cuna-nueva-001',
    asignadoAId: null,
    asignadoANombre: null
  },
  {
    id: 'inbox-004',
    origen: 'ftp',
    origenDetalle: '/incoming/falabella/',
    asunto: 'Auto-upload: spot_cyber_2026.mp3',
    cuerpoMensaje: null,
    remitente: 'FTP Falabella',
    fechaRecepcion: '2025-12-31T23:45:00',
    adjuntos: [
      { nombre: 'spot_cyber_2026.mp3', tipo: 'audio/mpeg', tamano: 1890234, url: '/uploads/temp/spot_cyber.mp3', esAudio: true }
    ],
    anuncianteDetectadoId: 'anunc-003',
    anuncianteDetectadoNombre: 'Falabella',
    confianzaDeteccion: 90,
    procesado: false,
    cunaCreada: false,
    cunaResultanteId: null,
    asignadoAId: null,
    asignadoANombre: null
  }
];

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'cunas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const procesado = searchParams.get('procesado');
      const origen = searchParams.get('origen');
      const search = searchParams.get('search');

      let items = [...inboxMock];

      // Filtrar por procesado
      if (procesado !== null) {
        const esProcesado = procesado === 'true';
        items = items.filter(i => i.procesado === esProcesado);
      }

      // Filtrar por origen
      if (origen) {
        items = items.filter(i => i.origen === origen);
      }

      // Búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        items = items.filter(i =>
          i.asunto?.toLowerCase().includes(searchLower) ||
          i.remitente.toLowerCase().includes(searchLower) ||
          i.anuncianteDetectadoNombre?.toLowerCase().includes(searchLower)
        );
      }

      // Ordenar por fecha más reciente
      items.sort((a, b) => new Date(b.fechaRecepcion).getTime() - new Date(a.fechaRecepcion).getTime());

      return NextResponse.json({
        success: true,
        data: items,
        meta: {
          total: items.length,
          pendientes: inboxMock.filter(i => !i.procesado).length,
          procesados: inboxMock.filter(i => i.procesado).length,
          porOrigen: {
            email: inboxMock.filter(i => i.origen === 'email').length,
            whatsapp: inboxMock.filter(i => i.origen === 'whatsapp').length,
            ftp: inboxMock.filter(i => i.origen === 'ftp').length
          }
        }
      });
    } catch (error) {
      logger.error('[API/Inbox] Error GET:', error instanceof Error ? error : undefined, { module: 'cunas/inbox', action: 'GET' });
      return apiServerError();
    }
  }
);

// Crear cuña desde inbox
export const POST = withApiRoute(
  { resource: 'cunas', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { inboxId, anuncianteId, nombre, tipo, urgencia, gruposDistribucion } = body;

      const itemInbox = inboxMock.find(i => i.id === inboxId);
      if (!itemInbox) {
        return NextResponse.json({ 
          success: false, 
          error: 'Item de inbox no encontrado' 
        }, { status: 404 });
      }

      if (itemInbox.procesado) {
        return NextResponse.json({ 
          success: false, 
          error: 'Este item ya fue procesado' 
        }, { status: 400 });
      }

      // Simular creación de cuña
      const nuevaCunaId = `cuna-${Date.now()}`;
      const nuevaCodigo = `SPX${Date.now().toString().slice(-6)}`;

      return NextResponse.json({
        success: true,
        data: {
          cunaId: nuevaCunaId,
          codigo: nuevaCodigo,
          nombre: nombre || itemInbox.asunto || 'Cuña desde inbox',
          anuncianteId: anuncianteId || itemInbox.anuncianteDetectadoId,
          tipo: tipo || 'audio',
          estado: 'pendiente_validacion'
        },
        mensaje: `Cuña ${nuevaCodigo} creada exitosamente desde inbox`,
        inboxActualizado: {
          procesado: true,
          cunaCreada: true,
          cunaResultanteId: nuevaCunaId
        }
      });

    } catch (error) {
      logger.error('[API/Inbox] Error POST:', error instanceof Error ? error : undefined, { module: 'cunas/inbox', action: 'POST' });
      return apiServerError();
    }
  }
);

// Asignar item a usuario o descartar
export const PUT = withApiRoute(
  { resource: 'cunas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { inboxId, accion, usuarioId, notas } = body;

      switch (accion) {
        case 'asignar':
          return NextResponse.json({
            success: true,
            mensaje: `Item asignado a usuario ${usuarioId}`
          });
          
        case 'descartar':
          return NextResponse.json({
            success: true,
            mensaje: 'Item marcado como descartado'
          });
          
        case 'marcar_spam':
          return NextResponse.json({
            success: true,
            mensaje: 'Item marcado como spam'
          });
          
        case 'vincular_anunciante':
          return NextResponse.json({
            success: true,
            mensaje: 'Anunciante vinculado manualmente'
          });
          
        default:
          return NextResponse.json({ 
            success: false, 
            error: 'Acción no válida' 
          }, { status: 400 });
      }

    } catch (error) {
      logger.error('[API/Inbox] Error PUT:', error instanceof Error ? error : undefined, { module: 'cunas/inbox', action: 'PUT' });
      return apiServerError();
    }
  }
);
