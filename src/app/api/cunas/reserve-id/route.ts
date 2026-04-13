/**
 * 🆔 SILEXAR PULSE - API Reserva de ID Enterprise TIER 0
 * 
 * Endpoint para reservar IDs SPX con lock operativo
 * Previene colisiones en operación concurrente 24/7
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ReservedId {
  spxCodigo: string;
  secuencia: number;
  reservadoPor: string;
  contexto: string;
  timestamp: string;
  expiresAt: string;
  locked: boolean;
}

interface OperationalLog {
  id: string;
  action: 'id_generated' | 'id_confirmed' | 'id_released' | 'id_expired';
  spxCodigo: string;
  userId: string;
  context: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO EN MEMORIA (En producción: Redis/Database)
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line prefer-const
let secuenciaActual = 1846; // Simular secuencia existente

// eslint-disable-next-line prefer-const
let reservedIds: Map<string, ReservedId> = new Map();

// eslint-disable-next-line prefer-const
let operationalLogs: OperationalLog[] = [];

// Tiempo de expiración de reserva: 30 minutos
const RESERVATION_TTL_MS = 30 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function generateSpxCodigo(secuencia: number): string {
  return `SPX${secuencia.toString().padStart(6, '0')}`;
}

function cleanExpiredReservations(): void {
  const now = new Date();
  for (const [key, reservation] of reservedIds.entries()) {
    if (new Date(reservation.expiresAt) < now) {
      reservedIds.delete(key);
      // Log de expiración
      operationalLogs.push({
        id: `log-${crypto.randomUUID()}`,
        action: 'id_expired',
        spxCodigo: reservation.spxCodigo,
        userId: reservation.reservadoPor,
        context: reservation.contexto,
        timestamp: now.toISOString()
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Reservar nuevo ID
// Requiere: cunas:create
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'cunas', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Limpiar reservas expiradas primero
        cleanExpiredReservations();
        
        const body = await req.json();
        
        const context = body.context || 'manual'; // 'manual', 'contract', 'vencimientos', 'inbox'
        const tipoCuna = body.tipoCuna || 'audio';
        
        // Incrementar secuencia
        secuenciaActual += 1;
        const spxCodigo = generateSpxCodigo(secuenciaActual);
        
        // Verificar que no esté ya reservado (doble check)
        if (reservedIds.has(spxCodigo)) {
          // Generar otro
          secuenciaActual += 1;
          const newSpxCodigo = generateSpxCodigo(secuenciaActual);
          return createReservation(newSpxCodigo, secuenciaActual, ctx.userId, context, tipoCuna);
        }
        
        return createReservation(spxCodigo, secuenciaActual, ctx.userId, context, tipoCuna);
      });
    } catch (error) {
      logger.error('[API/Reserve-ID] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'reserve-id', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

function createReservation(
  spxCodigo: string, 
  secuencia: number, 
  userId: string, 
  context: string,
  _tipoCuna: string
): NextResponse {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MS);
  
  const reservation: ReservedId = {
    spxCodigo,
    secuencia,
    reservadoPor: userId,
    contexto: context,
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    locked: true
  };
  
  // Guardar reserva
  reservedIds.set(spxCodigo, reservation);
  
  // Log de auditoría
  const logEntry: OperationalLog = {
    id: `log-${crypto.randomUUID()}`,
    action: 'id_generated',
    spxCodigo,
    userId,
    context,
    timestamp: now.toISOString(),
    metadata: {
      secuencia,
      expiresAt: expiresAt.toISOString()
    }
  };
  operationalLogs.push(logEntry);
  
  return NextResponse.json({
    success: true,
    data: {
      spxCodigo,
      secuencia,
      secuenciaFormateada: secuencia.toLocaleString('es-CL'),
      reservadoHasta: expiresAt.toISOString(),
      tiempoRestanteMs: RESERVATION_TTL_MS,
      locked: true,
      timestamp: now.toISOString(),
      timestampFormateado: now.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    },
    message: 'ID reservado exitosamente'
  });
}

// ═══════════════════════════════════════════════════════════════
// PUT - Confirmar o liberar ID reservado
// Requiere: cunas:update
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
  { resource: 'cunas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        
        const { spxCodigo, action } = body;
        
        if (!spxCodigo) {
          return NextResponse.json(
            { success: false, error: 'spxCodigo es requerido' },
            { status: 400 }
          );
        }
        
        const reservation = reservedIds.get(spxCodigo);
        
        if (!reservation) {
          return NextResponse.json(
            { success: false, error: 'ID no encontrado o expirado' },
            { status: 404 }
          );
        }
        
        if (action === 'confirm') {
          // Marcar como confirmado (la cuña fue creada)
          reservation.locked = false;
          reservedIds.delete(spxCodigo); // Ya no necesitamos la reserva
          
          operationalLogs.push({
            id: `log-${crypto.randomUUID()}`,
            action: 'id_confirmed',
            spxCodigo,
            userId: ctx.userId,
            context: reservation.contexto,
            timestamp: new Date().toISOString()
          });
          
          return NextResponse.json({
            success: true,
            message: 'ID confirmado exitosamente'
          });
          
        } else if (action === 'release') {
          // Liberar el ID (usuario canceló)
          reservedIds.delete(spxCodigo);
          
          operationalLogs.push({
            id: `log-${crypto.randomUUID()}`,
            action: 'id_released',
            spxCodigo,
            userId: ctx.userId,
            context: reservation.contexto,
            timestamp: new Date().toISOString()
          });
          
          return NextResponse.json({
            success: true,
            message: 'ID liberado exitosamente'
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Acción no válida. Use "confirm" o "release"' },
          { status: 400 }
        );
      });
    } catch (error) {
      logger.error('[API/Reserve-ID] Error PUT:', error instanceof Error ? error : undefined, { 
        module: 'reserve-id', 
        action: 'PUT',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// GET - Obtener estado de reserva / Logs
// Requiere: cunas:read
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'cunas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const spxCodigo = searchParams.get('spxCodigo');
        const getLogs = searchParams.get('logs') === 'true';
        
        // Si pide logs
        if (getLogs) {
          const limit = parseInt(searchParams.get('limit') || '50', 10);
          const recentLogs = operationalLogs.slice(-limit).reverse();
          
          return NextResponse.json({
            success: true,
            data: {
              logs: recentLogs,
              total: operationalLogs.length
            }
          });
        }
        
        // Si pide estado de una reserva específica
        if (spxCodigo) {
          cleanExpiredReservations();
          const reservation = reservedIds.get(spxCodigo);
          
          if (!reservation) {
            return NextResponse.json({
              success: true,
              data: {
                exists: false,
                available: true
              }
            });
          }
          
          return NextResponse.json({
            success: true,
            data: {
              exists: true,
              available: false,
              reservation: {
                spxCodigo: reservation.spxCodigo,
                locked: reservation.locked,
                expiresAt: reservation.expiresAt,
                contexto: reservation.contexto
              }
            }
          });
        }
        
        // Estadísticas generales
        cleanExpiredReservations();
        
        return NextResponse.json({
          success: true,
          data: {
            secuenciaActual,
            proximoId: generateSpxCodigo(secuenciaActual + 1),
            reservasActivas: reservedIds.size,
            totalLogsHoy: operationalLogs.filter(
              log => new Date(log.timestamp).toDateString() === new Date().toDateString()
            ).length
          }
        });
      });
    } catch (error) {
      logger.error('[API/Reserve-ID] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'reserve-id', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
