/**
 * 🌐 SILEXAR PULSE - API Routes Inventario/Vencimientos
 * 
 * @description API REST endpoints para el "Torpedo Digital"
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Mock de datos
const mockCupos = [
  { id: 'cup-001', codigo: 'CUP-001', nombre: 'Tanda Matinal 08:00', emisoraNombre: 'Radio Cooperativa', horaInicio: '08:00', duracionSegundos: 30, tipoInventario: 'tanda_comercial', tarifaBase: 150000, disponibles: 5, vendidos: 3 },
  { id: 'cup-002', codigo: 'CUP-002', nombre: 'Auspicio El Conquistador', emisoraNombre: 'Radio ADN', horaInicio: '09:00', duracionSegundos: 20, tipoInventario: 'auspicio_programa', tarifaBase: 500000, disponibles: 1, vendidos: 1 },
  { id: 'cup-003', codigo: 'CUP-003', nombre: 'Tanda Mediodía 13:00', emisoraNombre: 'Radio Biobío', horaInicio: '13:00', duracionSegundos: 30, tipoInventario: 'tanda_comercial', tarifaBase: 200000, disponibles: 6, vendidos: 2 },
  { id: 'cup-004', codigo: 'CUP-004', nombre: 'Mención Deportes', emisoraNombre: 'Radio Cooperativa', horaInicio: '19:30', duracionSegundos: 15, tipoInventario: 'mencion_programa', tarifaBase: 80000, disponibles: 3, vendidos: 0 },
  { id: 'cup-005', codigo: 'CUP-005', nombre: 'Tanda Prime Time 21:00', emisoraNombre: 'Radio ADN', horaInicio: '21:00', duracionSegundos: 30, tipoInventario: 'tanda_comercial', tarifaBase: 350000, disponibles: 4, vendidos: 4 }
];

const mockVencimientos = [
  { id: 'ven-001', cupoId: 'cup-001', fecha: '2025-02-17', estado: 'disponible', anuncianteNombre: null, precio: 150000 },
  { id: 'ven-002', cupoId: 'cup-001', fecha: '2025-02-17', estado: 'vendido', anuncianteNombre: 'Banco de Chile', precio: 160000 },
  { id: 'ven-003', cupoId: 'cup-002', fecha: '2025-02-17', estado: 'vendido', anuncianteNombre: 'Falabella', precio: 500000 },
  { id: 'ven-004', cupoId: 'cup-003', fecha: '2025-02-17', estado: 'reservado', anuncianteNombre: 'Coca-Cola', precio: 200000 },
  { id: 'ven-005', cupoId: 'cup-005', fecha: '2025-02-17', estado: 'bloqueado', anuncianteNombre: null, precio: 350000 }
];

export const GET = withApiRoute(
  { resource: 'inventario', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];
      const emisora = searchParams.get('emisora') || '';

      let filtered = [...mockCupos];

      if (emisora) {
        filtered = filtered.filter(c => c.emisoraNombre.toLowerCase().includes(emisora.toLowerCase()));
      }

      // Stats
      const stats = {
        totalCupos: mockCupos.length,
        totalDisponibles: mockCupos.reduce((sum, c) => sum + c.disponibles, 0),
        totalVendidos: mockCupos.reduce((sum, c) => sum + c.vendidos, 0),
        ocupacion: Math.round((mockCupos.reduce((sum, c) => sum + c.vendidos, 0) / mockCupos.reduce((sum, c) => sum + c.disponibles + c.vendidos, 0)) * 100),
        ingresosPotenciales: mockCupos.reduce((sum, c) => sum + (c.tarifaBase * c.disponibles), 0)
      };

      return NextResponse.json({
        success: true,
        data: filtered,
        vencimientos: mockVencimientos.filter(v => v.fecha === fecha),
        stats,
        fecha
      });
    } catch (error) {
      logger.error('[API/Inventario] Error GET:', error instanceof Error ? error : undefined, { module: 'inventario', action: 'GET' });
      return apiServerError()
    }
  }
);

export const POST = withApiRoute(
  { resource: 'inventario', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      
      if (!body.cupoId || !body.fecha) {
        return NextResponse.json({ success: false, error: 'Cupo y fecha requeridos' }, { status: 400 });
      }

      const newVencimiento = {
        id: `ven-${Date.now()}`,
        cupoId: body.cupoId,
        fecha: body.fecha,
        estado: body.estado || 'reservado',
        anuncianteNombre: body.anuncianteNombre || null,
        precio: body.precio || 0
      };

      mockVencimientos.push(newVencimiento);

      return NextResponse.json({ success: true, data: newVencimiento, message: 'Cupo reservado' }, { status: 201 });
    } catch (error) {
      logger.error('[API/Inventario] Error POST:', error instanceof Error ? error : undefined, { module: 'inventario', action: 'POST' });
      return apiServerError()
    }
  }
);
