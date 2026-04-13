/**
 * 🌐 SILEXAR PULSE - API Portal Cliente TIER 0
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// Mock cliente autenticado
const clienteActual = {
  id: 'cliente-001',
  nombre: 'Empresa ABC Ltda',
  rut: '76.123.456-7',
  ejecutivo: { nombre: 'Carlos Mendoza', telefono: '+56 9 1234 5678', email: 'cmendoza@silexar.cl' }
};

const campanasCliente = [
  { id: 'cam-001', nombre: 'Campaña Navidad 2025', fechaInicio: '2025-12-01', fechaFin: '2025-12-31', spotsContratados: 150, spotsEmitidos: 98, cumplimiento: 65, estado: 'activa' },
  { id: 'cam-002', nombre: 'Verano 2026', fechaInicio: '2026-01-01', fechaFin: '2026-02-28', spotsContratados: 200, spotsEmitidos: 0, cumplimiento: 0, estado: 'activa' },
  { id: 'cam-003', nombre: 'Black Friday 2025', fechaInicio: '2025-11-20', fechaFin: '2025-11-30', spotsContratados: 80, spotsEmitidos: 80, cumplimiento: 100, estado: 'finalizada' }
];

const facturasCliente = [
  { id: 'fac-001', numero: 45678, fecha: '2025-12-01', monto: 15000000, estado: 'pagada' },
  { id: 'fac-002', numero: 45679, fecha: '2025-12-15', monto: 8500000, estado: 'pendiente' }
];

/**
 * GET - Portal cliente
 * Requiere: anunciantes:read
 */
export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const seccion = searchParams.get('seccion') || 'resumen'; // resumen | campanas | facturas | reportes
        
        if (seccion === 'resumen') {
          const inversionTotal = facturasCliente.reduce((sum, f) => sum + f.monto, 0);
          const campanasActivas = campanasCliente.filter(c => c.estado === 'activa').length;
          const spotsEmitidos = campanasCliente.reduce((sum, c) => sum + c.spotsEmitidos, 0);
          
          return NextResponse.json({
            success: true,
            data: {
              cliente: clienteActual,
              metricas: {
                inversionTotal,
                campanasActivas,
                spotsEmitidos,
                alcanceEstimado: spotsEmitidos * 7000 // Aproximación
              },
              campanasRecientes: campanasCliente.filter(c => c.estado === 'activa'),
              facturasRecientes: facturasCliente.slice(0, 3)
            },
            consultadoPor: ctx.userId
          });
        }
        
        if (seccion === 'campanas') {
          return NextResponse.json({
            success: true,
            data: {
              campanas: campanasCliente,
              stats: {
                total: campanasCliente.length,
                activas: campanasCliente.filter(c => c.estado === 'activa').length,
                cumplimientoPromedio: Math.round(campanasCliente.reduce((sum, c) => sum + c.cumplimiento, 0) / campanasCliente.length)
              }
            },
            consultadoPor: ctx.userId
          });
        }
        
        if (seccion === 'facturas') {
          const totalFacturado = facturasCliente.reduce((sum, f) => sum + f.monto, 0);
          const totalPendiente = facturasCliente.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + f.monto, 0);
          
          return NextResponse.json({
            success: true,
            data: {
              facturas: facturasCliente,
              stats: {
                totalFacturado,
                totalPendiente,
                cantidadPendiente: facturasCliente.filter(f => f.estado === 'pendiente').length
              }
            },
            consultadoPor: ctx.userId
          });
        }
        
        if (seccion === 'reportes') {
          return NextResponse.json({
            success: true,
            data: {
              reportesDisponibles: [
                { id: 'rep-001', nombre: 'Cumplimiento de Pauta', tipo: 'cumplimiento', descripcion: 'Detalle de spots emitidos vs contratados' },
                { id: 'rep-002', nombre: 'Alcance y Frecuencia', tipo: 'alcance', descripcion: 'Métricas de audiencia estimada' },
                { id: 'rep-003', nombre: 'Resumen de Inversión', tipo: 'inversion', descripcion: 'Histórico de facturación' }
              ]
            },
            consultadoPor: ctx.userId
          });
        }
        
        return NextResponse.json({ success: false, error: 'Sección no válida' }, { status: 400 });
      });
    } catch (error) {
      logger.error('[API/PortalCliente] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'portal-cliente', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Acciones portal cliente
 * Requiere: anunciantes:update
 */
export const POST = withApiRoute(
  { resource: 'anunciantes', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        const { accion } = body;
        
        if (accion === 'solicitar_espacio') {
          return NextResponse.json({
            success: true,
            mensaje: 'Solicitud enviada a tu ejecutivo de cuenta',
            data: {
              ticketId: `TKT-${Date.now()}`,
              estado: 'pendiente',
              solicitadoPor: ctx.userId
            }
          });
        }
        
        if (accion === 'contactar_ejecutivo') {
          return NextResponse.json({
            success: true,
            mensaje: 'Tu ejecutivo ha sido notificado y te contactará pronto',
            ejecutivo: clienteActual.ejecutivo,
            solicitadoPor: ctx.userId
          });
        }
        
        if (accion === 'generar_reporte') {
          const { tipoReporte, fechaInicio, fechaFin } = body;
          return NextResponse.json({
            success: true,
            mensaje: 'Reporte generándose, lo recibirás por email',
            data: {
              reporteId: `REP-${Date.now()}`,
              tipo: tipoReporte,
              periodo: `${fechaInicio} - ${fechaFin}`,
              generadoPor: ctx.userId
            }
          });
        }
        
        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
      });
    } catch (error) {
      logger.error('[API/PortalCliente] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'portal-cliente', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
