/**
 * 📊 SILEXAR PULSE - API Cierre Mensual
 * 
 * @version 2025.1.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Mock data
const mockPeriodos = [
  { id: 'per-001', codigo: '2025-12', anio: 2025, mes: 12, estado: 'abierto', ventasNetas: 23500000, totalFacturado: 18000000, pendienteFacturar: 5500000, campanasVendidas: 12, campanasBonificadas: 3, campanasSinValor: 1, errores: [{ codigo: 'CAMP_SIN_VALOR', mensaje: 'CAM-2025-004 sin valor' }] },
  { id: 'per-002', codigo: '2025-11', anio: 2025, mes: 11, estado: 'cerrado', ventasNetas: 31200000, totalFacturado: 31200000, pendienteFacturar: 0, campanasVendidas: 18, campanasBonificadas: 2, campanasSinValor: 0, errores: [] }
];

const mockCampanas = [
  { id: 'cam-001', codigo: 'CAM-2025-001', nombre: 'Campaña Navidad', cliente: 'Empresa ABC', valor: 15000000, esBonificada: false, esBeneficencia: false, tieneError: false },
  { id: 'cam-002', codigo: 'CAM-2025-002', nombre: 'Campaña Verano', cliente: 'Servicios XYZ', valor: 8500000, esBonificada: false, esBeneficencia: false, tieneError: false },
  { id: 'cam-003', codigo: 'CAM-2025-003', nombre: 'Apoyo Social', cliente: 'Fundación Ayuda', valor: 0, esBonificada: false, esBeneficencia: true, tieneError: false },
  { id: 'cam-004', codigo: 'CAM-2025-004', nombre: 'Promoción Q1', cliente: 'Comercial DEF', valor: 0, esBonificada: false, esBeneficencia: false, tieneError: true, error: 'Sin valor asignado' }
];

export const GET = withApiRoute(
  { resource: 'facturacion', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const anio = parseInt(searchParams.get('anio') || '2025');
      const mes = parseInt(searchParams.get('mes') || '12');
      const codigo = `${anio}-${mes.toString().padStart(2, '0')}`;

      const periodo = mockPeriodos.find(p => p.codigo === codigo) || mockPeriodos[0];
      const campanas = mockCampanas;

      return NextResponse.json({
        success: true,
        data: {
          periodo,
          campanas,
          resumen: {
            puedePreCerrar: periodo.campanasSinValor === 0,
            puedeCerrar: periodo.estado === 'pre_cierre'
          }
        }
      });

    } catch (error) {
      logger.error('[API/CierreMensual] Error GET:', error instanceof Error ? error : undefined, { module: 'cierre-mensual', action: 'GET' });
      return apiServerError()
    }
  }
);

export const POST = withApiRoute(
  { resource: 'facturacion', action: 'admin' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { accion, anio: _anio, mes: _mes, motivo } = body;

      if (accion === 'pre_cierre') {
        const periodo = mockPeriodos[0];
        if (periodo.campanasSinValor > 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'No se puede pre-cerrar: hay campañas sin valor',
            errores: periodo.errores 
          }, { status: 400 });
        }
        periodo.estado = 'pre_cierre';
        return NextResponse.json({ success: true, mensaje: 'Pre-cierre ejecutado', data: periodo });
      }

      if (accion === 'cierre') {
        const periodo = mockPeriodos[0];
        if (periodo.estado !== 'pre_cierre') {
          return NextResponse.json({ success: false, error: 'Debe ejecutar pre-cierre primero' }, { status: 400 });
        }
        periodo.estado = 'cerrado';
        return NextResponse.json({ success: true, mensaje: 'Período cerrado', data: periodo });
      }

      if (accion === 'reapertura') {
        if (!motivo || motivo.length < 10) {
          return NextResponse.json({ success: false, error: 'Motivo requerido (mín 10 caracteres)' }, { status: 400 });
        }
        const periodo = mockPeriodos[0];
        periodo.estado = 'abierto';
        return NextResponse.json({ success: true, mensaje: 'Período reabierto', data: periodo });
      }

      return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
      logger.error('[API/CierreMensual] Error POST:', error instanceof Error ? error : undefined, { module: 'cierre-mensual', action: 'POST' });
      return apiServerError()
    }
  }
);
