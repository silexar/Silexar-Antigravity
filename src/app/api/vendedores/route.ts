/**
 * 🌐 SILEXAR PULSE - API Routes Vendedores
 * 
 * @description API REST endpoints para el módulo de Vendedores
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Mock de datos
const mockVendedores = [
  {
    id: 'ven-001',
    codigo: 'VEN-001',
    nombreCompleto: 'Juan Carlos Pérez Soto',
    email: 'jperez@silexar.com',
    telefono: '+56 9 8765 4321',
    tipoVendedor: 'senior',
    equipoNombre: 'Equipo Norte',
    equipoColor: '#3B82F6',
    estado: 'activo',
    activo: true,
    metaActual: 25000000,
    cumplimientoActual: 78,
    ventasRealizadas: 19500000,
    clientesAsignados: 12,
    fechaCreacion: '2024-06-15T10:00:00Z'
  },
  {
    id: 'ven-002',
    codigo: 'VEN-002',
    nombreCompleto: 'Ana María González',
    email: 'agonzalez@silexar.com',
    telefono: '+56 9 7654 3210',
    tipoVendedor: 'ejecutivo',
    equipoNombre: 'Equipo Centro',
    equipoColor: '#10B981',
    estado: 'activo',
    activo: true,
    metaActual: 20000000,
    cumplimientoActual: 92,
    ventasRealizadas: 18400000,
    clientesAsignados: 8,
    fechaCreacion: '2024-08-01T09:30:00Z'
  },
  {
    id: 'ven-003',
    codigo: 'VEN-003',
    nombreCompleto: 'Roberto Silva Muñoz',
    email: 'rsilva@silexar.com',
    telefono: '+56 9 6543 2109',
    tipoVendedor: 'gerente',
    equipoNombre: 'Equipo Sur',
    equipoColor: '#8B5CF6',
    estado: 'activo',
    activo: true,
    metaActual: 35000000,
    cumplimientoActual: 105,
    ventasRealizadas: 36750000,
    clientesAsignados: 15,
    fechaCreacion: '2024-03-10T08:00:00Z'
  },
  {
    id: 'ven-004',
    codigo: 'VEN-004',
    nombreCompleto: 'Carolina Fuentes',
    email: 'cfuentes@silexar.com',
    telefono: '+56 9 5432 1098',
    tipoVendedor: 'junior',
    equipoNombre: 'Equipo Centro',
    equipoColor: '#10B981',
    estado: 'activo',
    activo: true,
    metaActual: 15000000,
    cumplimientoActual: 45,
    ventasRealizadas: 6750000,
    clientesAsignados: 5,
    fechaCreacion: '2025-01-15T11:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const equipo = searchParams.get('equipo') || '';
    const estado = searchParams.get('estado') || '';

    let filtered = [...mockVendedores];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(v => 
        v.nombreCompleto.toLowerCase().includes(searchLower) ||
        v.codigo.toLowerCase().includes(searchLower) ||
        v.email.toLowerCase().includes(searchLower)
      );
    }

    if (equipo) {
      filtered = filtered.filter(v => v.equipoNombre?.toLowerCase().includes(equipo.toLowerCase()));
    }

    if (estado) {
      filtered = filtered.filter(v => v.estado === estado);
    }

    // Estadísticas
    const stats = {
      total: mockVendedores.length,
      activos: mockVendedores.filter(v => v.activo).length,
      ventasTotales: mockVendedores.reduce((sum, v) => sum + v.ventasRealizadas, 0),
      cumplimientoPromedio: Math.round(mockVendedores.reduce((sum, v) => sum + v.cumplimientoActual, 0) / mockVendedores.length)
    };

    return NextResponse.json({
      success: true,
      data: filtered,
      stats,
      pagination: { total: filtered.length, page: 1, limit: 20, totalPages: 1 }
    });
  } catch (error) {
    logger.error('[API/Vendedores] Error:', error instanceof Error ? error : undefined, { module: 'vendedores' });
    return NextResponse.json({ success: false, error: 'Error al obtener vendedores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.nombres?.trim() || !body.apellidos?.trim()) {
      return NextResponse.json({ success: false, error: 'Nombres y apellidos son requeridos' }, { status: 400 });
    }
    
    if (!body.email?.trim()) {
      return NextResponse.json({ success: false, error: 'El email es requerido' }, { status: 400 });
    }

    const newVendedor = {
      id: `ven-${Date.now()}`,
      codigo: `VEN-${(mockVendedores.length + 1).toString().padStart(3, '0')}`,
      nombreCompleto: `${body.nombres} ${body.apellidos}`,
      email: body.email,
      telefono: body.telefono || null,
      tipoVendedor: body.tipoVendedor || 'ejecutivo',
      equipoNombre: body.equipoNombre || null,
      equipoColor: '#6B7280',
      estado: 'activo',
      activo: true,
      metaActual: body.metaMensual || 15000000,
      cumplimientoActual: 0,
      ventasRealizadas: 0,
      clientesAsignados: 0,
      fechaCreacion: new Date().toISOString()
    };

    mockVendedores.push(newVendedor);

    return NextResponse.json({ success: true, data: newVendedor, message: 'Vendedor creado exitosamente' }, { status: 201 });
  } catch (error) {
    logger.error('[API/Vendedores] Error:', error instanceof Error ? error : undefined, { module: 'vendedores' });
    return NextResponse.json({ success: false, error: 'Error al crear vendedor' }, { status: 500 });
  }
}
