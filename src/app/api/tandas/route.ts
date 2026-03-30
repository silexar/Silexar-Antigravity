/**
 * 🌐 SILEXAR PULSE - API Routes Tandas
 * 
 * @description API REST endpoints para gestión de tandas comerciales
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
const mockTandas = [
  {
    id: 'tan-001',
    codigo: 'TAN-001',
    emisoraNombre: 'Radio Cooperativa',
    fecha: '2025-02-17',
    horaInicio: '08:00',
    horaFin: '08:03',
    duracionMaxima: 180,
    duracionProgramada: 150,
    spotsMaximos: 6,
    spotsProgramados: 5,
    estado: 'aprobada',
    spots: [
      { id: 's1', orden: 1, cunaNombre: 'Spot Banco Chile 30s', duracion: 30, estado: 'programado' },
      { id: 's2', orden: 2, cunaNombre: 'Jingle Falabella 20s', duracion: 20, estado: 'programado' },
      { id: 's3', orden: 3, cunaNombre: 'Spot Coca-Cola 30s', duracion: 30, estado: 'programado' },
      { id: 's4', orden: 4, cunaNombre: 'Mención LATAM 15s', duracion: 15, estado: 'programado' },
      { id: 's5', orden: 5, cunaNombre: 'Spot Entel 30s + tag', duracion: 55, estado: 'programado' }
    ]
  },
  {
    id: 'tan-002',
    codigo: 'TAN-002',
    emisoraNombre: 'Radio Cooperativa',
    fecha: '2025-02-17',
    horaInicio: '12:00',
    horaFin: '12:03',
    duracionMaxima: 180,
    duracionProgramada: 120,
    spotsMaximos: 6,
    spotsProgramados: 4,
    estado: 'en_revision',
    spots: [
      { id: 's6', orden: 1, cunaNombre: 'Spot Ripley 30s', duracion: 30, estado: 'programado' },
      { id: 's7', orden: 2, cunaNombre: 'Spot Paris 30s', duracion: 30, estado: 'programado' },
      { id: 's8', orden: 3, cunaNombre: 'Jingle Líder 30s', duracion: 30, estado: 'programado' },
      { id: 's9', orden: 4, cunaNombre: 'Mención Movistar 30s', duracion: 30, estado: 'programado' }
    ]
  },
  {
    id: 'tan-003',
    codigo: 'TAN-003',
    emisoraNombre: 'Radio ADN',
    fecha: '2025-02-17',
    horaInicio: '21:00',
    horaFin: '21:03',
    duracionMaxima: 180,
    duracionProgramada: 180,
    spotsMaximos: 6,
    spotsProgramados: 6,
    estado: 'exportada',
    spots: []
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];
    const emisora = searchParams.get('emisora') || '';
    const estado = searchParams.get('estado') || '';

    let filtered = [...mockTandas];

    if (fecha) {
      filtered = filtered.filter(t => t.fecha === fecha);
    }

    if (emisora) {
      filtered = filtered.filter(t => t.emisoraNombre.toLowerCase().includes(emisora.toLowerCase()));
    }

    if (estado) {
      filtered = filtered.filter(t => t.estado === estado);
    }

    // Stats
    const stats = {
      totalTandas: filtered.length,
      aprobadas: filtered.filter(t => t.estado === 'aprobada').length,
      enRevision: filtered.filter(t => t.estado === 'en_revision').length,
      exportadas: filtered.filter(t => t.estado === 'exportada').length,
      spotsTotales: filtered.reduce((sum, t) => sum + t.spotsProgramados, 0)
    };

    return NextResponse.json({
      success: true,
      data: filtered,
      stats,
      fecha
    });
  } catch (error) {
    logger.error('[API/Tandas] Error:', error instanceof Error ? error : undefined, { module: 'tandas' });
    return NextResponse.json({ success: false, error: 'Error al obtener tandas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.emisoraId || !body.fecha || !body.horaInicio) {
      return NextResponse.json({ success: false, error: 'Emisora, fecha y hora requeridos' }, { status: 400 });
    }

    const newTanda = {
      id: `tan-${Date.now()}`,
      codigo: `TAN-${(mockTandas.length + 1).toString().padStart(3, '0')}`,
      emisoraNombre: 'Nueva Emisora',
      fecha: body.fecha,
      horaInicio: body.horaInicio,
      horaFin: body.horaFin || null,
      duracionMaxima: body.duracionMaxima || 180,
      duracionProgramada: 0,
      spotsMaximos: body.spotsMaximos || 6,
      spotsProgramados: 0,
      estado: 'planificada',
      spots: []
    };

    mockTandas.push(newTanda);

    return NextResponse.json({ success: true, data: newTanda, message: 'Tanda creada' }, { status: 201 });
  } catch (error) {
    logger.error('[API/Tandas] Error:', error instanceof Error ? error : undefined, { module: 'tandas' });
    return NextResponse.json({ success: false, error: 'Error al crear tanda' }, { status: 500 });
  }
}
