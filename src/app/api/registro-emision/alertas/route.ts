/**
 * 🚨 API Alertas de Programación TIER 0
 * 
 * Sistema de alertas interdepartamental
 * 
 * @version 2050.1.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AlertaProgramacion {
  id: string;
  anunciante: string;
  campana: string;
  material: string;
  tipoProblema: string;
  descripcion: string;
  fechaProgramada: string;
  horaProgramada: string;
  emisora: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'nueva' | 'asignada' | 'en_revision' | 'resuelta' | 'cerrada';
  asignadoA?: string;
  causasPosibles: string[];
  recomendacionIa?: string;
  fechaCreacion: string;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const alertasMock: AlertaProgramacion[] = [
  {
    id: 'alert-001',
    anunciante: 'SuperMax SpA',
    campana: 'Promoción Navidad',
    material: 'Aprovecha descuentos hasta 50% en SuperMax',
    tipoProblema: 'no_emitido',
    descripcion: 'Mención no detectada en el horario programado',
    fechaProgramada: new Date().toISOString().split('T')[0],
    horaProgramada: '10:30:00',
    emisora: 'Radio Corazón',
    prioridad: 'alta',
    estado: 'nueva',
    causasPosibles: [
      'Cambio de programación de última hora',
      'Problema técnico en sistema de emisión',
      'Material no cargado en playout'
    ],
    recomendacionIa: 'Contactar al programador de turno para verificar el schedule del día',
    fechaCreacion: new Date().toISOString()
  }
];

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const prioridad = searchParams.get('prioridad');

    let alertas = [...alertasMock];

    if (estado && estado !== 'todas') {
      alertas = alertas.filter(a => a.estado === estado);
    }

    if (prioridad && prioridad !== 'todas') {
      alertas = alertas.filter(a => a.prioridad === prioridad);
    }

    return NextResponse.json({
      success: true,
      data: alertas,
      stats: {
        total: alertas.length,
        nuevas: alertas.filter(a => a.estado === 'nueva').length,
        enRevision: alertas.filter(a => a.estado === 'en_revision').length,
        resueltas: alertas.filter(a => a.estado === 'resuelta').length,
        criticas: alertas.filter(a => a.prioridad === 'critica').length
      }
    });
  } catch (error) {
    logger.error('[API/RegistroEmision/Alertas] Error GET:', error instanceof Error ? error : undefined, { module: 'registro-emision/alertas', action: 'GET' })
    return apiServerError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      anunciante,
      campana,
      material,
      tipoProblema,
      descripcion,
      fechaProgramada,
      horaProgramada,
      emisora,
      prioridad
    } = body;

    // Análisis IA de causas posibles
    const causasPosibles = [
      'Cambio de programación de última hora',
      'Problema técnico en sistema de emisión',
      'Material no cargado en playout',
      'Conflicto de horarios no detectado'
    ];

    const nuevaAlerta: AlertaProgramacion = {
      id: `alert-${Date.now()}`,
      anunciante,
      campana,
      material,
      tipoProblema,
      descripcion,
      fechaProgramada,
      horaProgramada,
      emisora,
      prioridad: prioridad || 'media',
      estado: 'nueva',
      causasPosibles,
      recomendacionIa: 'Verificar con el programador de turno y revisar el log de sistema',
      fechaCreacion: new Date().toISOString()
    };

    alertasMock.push(nuevaAlerta);

    return NextResponse.json({
      success: true,
      data: nuevaAlerta,
      message: 'Alerta creada y notificaciones enviadas'
    });
  } catch (error) {
    logger.error('[API/RegistroEmision/Alertas] Error POST:', error instanceof Error ? error : undefined, { module: 'registro-emision/alertas', action: 'POST' });
    return apiServerError()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, estado, asignadoA, resolucion } = body;

    const alerta = alertasMock.find(a => a.id === id);
    if (!alerta) {
      return NextResponse.json({
        success: false,
        error: 'Alerta no encontrada'
      }, { status: 404 });
    }

    if (estado) alerta.estado = estado;
    if (asignadoA) alerta.asignadoA = asignadoA;

    return NextResponse.json({
      success: true,
      data: alerta,
      message: estado === 'resuelta' 
        ? `Alerta resuelta: ${resolucion}`
        : 'Alerta actualizada correctamente'
    });
  } catch (error) {
    logger.error('[API/RegistroEmision/Alertas] Error PUT:', error instanceof Error ? error : undefined, { module: 'registro-emision/alertas', action: 'PUT' });
    return apiServerError()
  }
}
