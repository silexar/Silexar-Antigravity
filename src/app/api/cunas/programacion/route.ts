/**
 * 📅 SILEXAR PULSE - API Programación de Bloques TIER 0
 * 
 * Endpoints para gestión de bloques horarios,
 * programación de cuñas y parrilla de emisión
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';


// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface BloqueProgramacion {
  id: string;
  codigo: string;
  nombre: string;
  tipoBloqueHorario: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  diasActivos: string[];
  duracionTotalSegundos: number;
  duracionUsadaSegundos: number;
  maxCunas: number;
  cunasActuales: number;
  estado: string;
  ocupacion: number; // porcentaje
}

interface ProgramacionCuna {
  id: string;
  bloqueId: string;
  bloqueCodigo: string;
  bloqueNombre: string;
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  anuncianteNombre: string;
  duracionSegundos: number;
  posicionEnBloque: number;
  fechaInicio: string;
  fechaFin: string;
  diasEspecificos: string[] | null;
  esActiva: boolean;
  vencimientoId: string | null;
}

interface ConflictoCompetencia {
  tipo: 'competencia' | 'categoria' | 'saturacion';
  mensaje: string;
  cunaConflictiva: string;
  severidad: 'error' | 'warning';
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const bloquesMock: BloqueProgramacion[] = [
  {
    id: 'blq-001',
    codigo: 'BLQ-001',
    nombre: 'Matinal Buenos Días',
    tipoBloqueHorario: 'matinal',
    horaInicio: '06:00',
    horaFin: '09:00',
    duracionMinutos: 180,
    diasActivos: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    duracionTotalSegundos: 360,
    duracionUsadaSegundos: 240,
    maxCunas: 12,
    cunasActuales: 8,
    estado: 'parcial',
    ocupacion: 66.7
  },
  {
    id: 'blq-002',
    codigo: 'BLQ-002',
    nombre: 'Mediodía Informativo',
    tipoBloqueHorario: 'mediodia',
    horaInicio: '12:00',
    horaFin: '14:00',
    duracionMinutos: 120,
    diasActivos: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    duracionTotalSegundos: 240,
    duracionUsadaSegundos: 180,
    maxCunas: 8,
    cunasActuales: 6,
    estado: 'parcial',
    ocupacion: 75
  },
  {
    id: 'blq-003',
    codigo: 'BLQ-003',
    nombre: 'Prime Time Noche',
    tipoBloqueHorario: 'prime',
    horaInicio: '20:00',
    horaFin: '22:00',
    duracionMinutos: 120,
    diasActivos: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
    duracionTotalSegundos: 300,
    duracionUsadaSegundos: 300,
    maxCunas: 10,
    cunasActuales: 10,
    estado: 'completo',
    ocupacion: 100
  },
  {
    id: 'blq-004',
    codigo: 'BLQ-004',
    nombre: 'Tarde Musical',
    tipoBloqueHorario: 'tarde',
    horaInicio: '15:00',
    horaFin: '18:00',
    duracionMinutos: 180,
    diasActivos: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    duracionTotalSegundos: 360,
    duracionUsadaSegundos: 120,
    maxCunas: 12,
    cunasActuales: 4,
    estado: 'disponible',
    ocupacion: 33.3
  },
  {
    id: 'blq-005',
    codigo: 'BLQ-005',
    nombre: 'Nocturno Relax',
    tipoBloqueHorario: 'nocturno',
    horaInicio: '22:00',
    horaFin: '00:00',
    duracionMinutos: 120,
    diasActivos: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    duracionTotalSegundos: 180,
    duracionUsadaSegundos: 60,
    maxCunas: 6,
    cunasActuales: 2,
    estado: 'disponible',
    ocupacion: 33.3
  },
  {
    id: 'blq-006',
    codigo: 'BLQ-006',
    nombre: 'Fin de Semana Familiar',
    tipoBloqueHorario: 'especial',
    horaInicio: '10:00',
    horaFin: '14:00',
    duracionMinutos: 240,
    diasActivos: ['sabado', 'domingo'],
    duracionTotalSegundos: 480,
    duracionUsadaSegundos: 180,
    maxCunas: 16,
    cunasActuales: 6,
    estado: 'parcial',
    ocupacion: 37.5
  }
];

const programacionesMock: ProgramacionCuna[] = [
  {
    id: 'prog-001',
    bloqueId: 'blq-001',
    bloqueCodigo: 'BLQ-001',
    bloqueNombre: 'Matinal Buenos Días',
    cunaId: 'cuna-001',
    cunaCodigo: 'SPX000124',
    cunaNombre: 'Spot Banco de Chile - Ofertas Enero',
    anuncianteNombre: 'Banco de Chile',
    duracionSegundos: 30,
    posicionEnBloque: 1,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-01-31',
    diasEspecificos: null,
    esActiva: true,
    vencimientoId: 'venc-001'
  },
  {
    id: 'prog-002',
    bloqueId: 'blq-001',
    bloqueCodigo: 'BLQ-001',
    bloqueNombre: 'Matinal Buenos Días',
    cunaId: 'cuna-002',
    cunaCodigo: 'SPX000125',
    cunaNombre: 'Mención Farmacias Ahumada',
    anuncianteNombre: 'Farmacias Ahumada',
    duracionSegundos: 20,
    posicionEnBloque: 2,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-01-15',
    diasEspecificos: ['lunes', 'miercoles', 'viernes'],
    esActiva: true,
    vencimientoId: null
  },
  {
    id: 'prog-003',
    bloqueId: 'blq-003',
    bloqueCodigo: 'BLQ-003',
    bloqueNombre: 'Prime Time Noche',
    cunaId: 'cuna-003',
    cunaCodigo: 'SPX000130',
    cunaNombre: 'Spot Coca-Cola Verano',
    anuncianteNombre: 'Coca-Cola',
    duracionSegundos: 30,
    posicionEnBloque: 1,
    fechaInicio: '2025-12-15',
    fechaFin: '2026-02-28',
    diasEspecificos: null,
    esActiva: true,
    vencimientoId: 'venc-002'
  }
];

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'bloques';
    const dia = searchParams.get('dia');
    const bloqueId = searchParams.get('bloqueId');
    const fecha = searchParams.get('fecha');

    // Listar bloques
    if (tipo === 'bloques') {
      let bloques = [...bloquesMock];

      // Filtrar por día
      if (dia) {
        bloques = bloques.filter(b => b.diasActivos.includes(dia));
      }

      return NextResponse.json({
        success: true,
        data: bloques,
        meta: {
          total: bloques.length,
          disponibles: bloques.filter(b => b.estado === 'disponible').length,
          parciales: bloques.filter(b => b.estado === 'parcial').length,
          completos: bloques.filter(b => b.estado === 'completo').length
        }
      });
    }

    // Listar programaciones
    if (tipo === 'programaciones') {
      let programaciones = [...programacionesMock];

      if (bloqueId) {
        programaciones = programaciones.filter(p => p.bloqueId === bloqueId);
      }

      if (fecha) {
        programaciones = programaciones.filter(p => {
          const inicio = new Date(p.fechaInicio);
          const fin = new Date(p.fechaFin);
          const fechaCheck = new Date(fecha);
          return fechaCheck >= inicio && fechaCheck <= fin;
        });
      }

      return NextResponse.json({
        success: true,
        data: programaciones,
        meta: {
          total: programaciones.length,
          activas: programaciones.filter(p => p.esActiva).length
        }
      });
    }

    // Parrilla completa del día
    if (tipo === 'parrilla') {
      const diaFiltro = dia || 'lunes';
      const bloquesDia = bloquesMock
        .filter(b => b.diasActivos.includes(diaFiltro))
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

      const parrilla = bloquesDia.map(bloque => ({
        ...bloque,
        cunas: programacionesMock
          .filter(p => p.bloqueId === bloque.id && p.esActiva)
          .sort((a, b) => a.posicionEnBloque - b.posicionEnBloque)
      }));

      return NextResponse.json({
        success: true,
        data: parrilla,
        meta: {
          dia: diaFiltro,
          totalBloques: parrilla.length,
          totalCunas: parrilla.reduce((sum, b) => sum + b.cunas.length, 0)
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Tipo no válido' }, { status: 400 });
  } catch (error) {
    logger.error('[API/Programacion] Error GET:', error instanceof Error ? error : undefined, { module: 'cunas/programacion', action: 'GET' });
    return apiServerError();
  }
}

// Crear programación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bloqueId, cunaId, fechaInicio, fechaFin, diasEspecificos, posicion } = body;

    // Validar bloque existe y tiene espacio
    const bloque = bloquesMock.find(b => b.id === bloqueId);
    if (!bloque) {
      return NextResponse.json({ 
        success: false, 
        error: 'Bloque no encontrado' 
      }, { status: 404 });
    }

    if (bloque.estado === 'completo') {
      return NextResponse.json({ 
        success: false, 
        error: 'Bloque está completo, no hay espacio disponible' 
      }, { status: 400 });
    }

    // Validar conflictos de competencia
    const cunasEnBloque = programacionesMock.filter(p => p.bloqueId === bloqueId);
    const conflictos: ConflictoCompetencia[] = [];
    
    // Simular detección de competencia
    const anuncianteNuevo = 'Banco de Chile'; // En producción vendría de la cuña
    const competidores: Record<string, string[]> = {
      'Banco de Chile': ['Banco Santander', 'BCI', 'Banco Estado'],
      'Coca-Cola': ['Pepsi']
    };
    
    for (const programacion of cunasEnBloque) {
      if (competidores[anuncianteNuevo]?.includes(programacion.anuncianteNombre)) {
        conflictos.push({
          tipo: 'competencia',
          mensaje: `${anuncianteNuevo} es competidor de ${programacion.anuncianteNombre}`,
          cunaConflictiva: programacion.cunaCodigo,
          severidad: 'error'
        });
      }
    }

    if (conflictos.some(c => c.severidad === 'error')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conflicto de competencia detectado',
        conflictos 
      }, { status: 400 });
    }

    // Crear programación
    const nuevaProgramacion: ProgramacionCuna = {
      id: `prog-${Date.now()}`,
      bloqueId,
      bloqueCodigo: bloque.codigo,
      bloqueNombre: bloque.nombre,
      cunaId,
      cunaCodigo: `SPX${Date.now().toString().slice(-6)}`,
      cunaNombre: 'Nueva Cuña',
      anuncianteNombre: anuncianteNuevo,
      duracionSegundos: 30,
      posicionEnBloque: posicion || (cunasEnBloque.length + 1),
      fechaInicio,
      fechaFin,
      diasEspecificos: diasEspecificos || null,
      esActiva: true,
      vencimientoId: null
    };

    return NextResponse.json({
      success: true,
      data: nuevaProgramacion,
      mensaje: 'Cuña programada exitosamente',
      conflictos: conflictos.length > 0 ? conflictos : undefined
    });

  } catch (error) {
    logger.error('[API/Programacion] Error POST:', error instanceof Error ? error : undefined, { module: 'cunas/programacion', action: 'POST' });
    return apiServerError();
  }
}

// Actualizar programación (mover, pausar, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accion, programacionId, datos } = body;

    switch (accion) {
      case 'mover':
        // Mover a otro bloque o posición
        return NextResponse.json({
          success: true,
          mensaje: `Cuña movida a bloque ${datos.nuevoBloqueId}, posición ${datos.nuevaPosicion}`
        });
        
      case 'pausar':
        return NextResponse.json({
          success: true,
          mensaje: 'Programación pausada temporalmente'
        });
        
      case 'reactivar':
        return NextResponse.json({
          success: true,
          mensaje: 'Programación reactivada'
        });
        
      case 'extender':
        return NextResponse.json({
          success: true,
          mensaje: `Programación extendida hasta ${datos.nuevaFechaFin}`
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Acción no válida' 
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('[API/Programacion] Error PUT:', error instanceof Error ? error : undefined, { module: 'cunas/programacion', action: 'PUT' });
    return apiServerError();
  }
}

// Eliminar programación
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programacionId = searchParams.get('id');

    if (!programacionId) {
      return NextResponse.json({
        success: false,
        error: 'ID de programación requerido'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Programación eliminada exitosamente'
    });
  } catch (error) {
    logger.error('[API/Programacion] Error DELETE:', error instanceof Error ? error : undefined, { module: 'cunas/programacion', action: 'DELETE' });
    return apiServerError();
  }
}
