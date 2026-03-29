/**
 * 📋 SILEXAR PULSE - API Material Pendiente TIER 0
 * 
 * Endpoints para tracking de material pendiente
 * por anunciante y campaña
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';


// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface MaterialPendiente {
  id: string;
  anuncianteId: string;
  anuncianteNombre: string;
  contratoId: string | null;
  contratoNumero: string | null;
  vencimientoId: string | null;
  vencimientoNombre: string | null;
  tipoMaterial: string;
  descripcion: string;
  duracionEsperada: number | null;
  fechaSolicitud: string;
  fechaLimiteEntrega: string;
  fechaRecepcion: string | null;
  estado: 'pendiente' | 'recibido' | 'en_revision' | 'aprobado' | 'rechazado' | 'vencido';
  recordatoriosEnviados: number;
  ultimoRecordatorio: string | null;
  contactoNombre: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  diasRestantes: number;
  esUrgente: boolean;
  cunaAsignadaId: string | null;
  cunaAsignadaCodigo: string | null;
}

interface ReporteMaterialPorAnunciante {
  anuncianteId: string;
  anuncianteNombre: string;
  totalPendiente: number;
  totalRecibido: number;
  totalVencido: number;
  tasaCumplimiento: number;
  materialesDetalle: MaterialPendiente[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const materialesMock: MaterialPendiente[] = [
  {
    id: 'mat-001',
    anuncianteId: 'anunc-001',
    anuncianteNombre: 'Banco de Chile',
    contratoId: 'cont-001',
    contratoNumero: 'CNT-2026-0001',
    vencimientoId: 'venc-001',
    vencimientoNombre: 'Auspicio Matinal Enero',
    tipoMaterial: 'presentacion',
    descripcion: 'Presentación de programa Matinal Buenos Días',
    duracionEsperada: 10,
    fechaSolicitud: '2025-12-15T10:00:00',
    fechaLimiteEntrega: '2026-01-05T18:00:00',
    fechaRecepcion: null,
    estado: 'pendiente',
    recordatoriosEnviados: 2,
    ultimoRecordatorio: '2025-12-30T09:00:00',
    contactoNombre: 'María González',
    contactoEmail: 'mgonzalez@bancochile.cl',
    contactoTelefono: '+56912345678',
    diasRestantes: 4,
    esUrgente: true,
    cunaAsignadaId: null,
    cunaAsignadaCodigo: null
  },
  {
    id: 'mat-002',
    anuncianteId: 'anunc-001',
    anuncianteNombre: 'Banco de Chile',
    contratoId: 'cont-001',
    contratoNumero: 'CNT-2026-0001',
    vencimientoId: 'venc-001',
    vencimientoNombre: 'Auspicio Matinal Enero',
    tipoMaterial: 'cierre',
    descripcion: 'Cierre de programa Matinal Buenos Días',
    duracionEsperada: 10,
    fechaSolicitud: '2025-12-15T10:00:00',
    fechaLimiteEntrega: '2026-01-05T18:00:00',
    fechaRecepcion: null,
    estado: 'pendiente',
    recordatoriosEnviados: 2,
    ultimoRecordatorio: '2025-12-30T09:00:00',
    contactoNombre: 'María González',
    contactoEmail: 'mgonzalez@bancochile.cl',
    contactoTelefono: '+56912345678',
    diasRestantes: 4,
    esUrgente: true,
    cunaAsignadaId: null,
    cunaAsignadaCodigo: null
  },
  {
    id: 'mat-003',
    anuncianteId: 'anunc-002',
    anuncianteNombre: 'Coca-Cola',
    contratoId: 'cont-002',
    contratoNumero: 'CNT-2026-0002',
    vencimientoId: null,
    vencimientoNombre: null,
    tipoMaterial: 'spot',
    descripcion: 'Spot Campaña Verano 30 segundos',
    duracionEsperada: 30,
    fechaSolicitud: '2025-12-20T14:00:00',
    fechaLimiteEntrega: '2026-01-10T18:00:00',
    fechaRecepcion: '2026-01-01T08:00:00',
    estado: 'recibido',
    recordatoriosEnviados: 1,
    ultimoRecordatorio: '2025-12-28T09:00:00',
    contactoNombre: 'Pedro Sánchez',
    contactoEmail: 'psanchez@coca-cola.com',
    contactoTelefono: '+56987654321',
    diasRestantes: 9,
    esUrgente: false,
    cunaAsignadaId: 'cuna-nueva-001',
    cunaAsignadaCodigo: 'SPX000145'
  },
  {
    id: 'mat-004',
    anuncianteId: 'anunc-003',
    anuncianteNombre: 'Falabella',
    contratoId: 'cont-003',
    contratoNumero: 'CNT-2025-0045',
    vencimientoId: 'venc-002',
    vencimientoNombre: 'Auspicio Noticiero Central',
    tipoMaterial: 'spot',
    descripcion: 'Spot CyberDay 2026',
    duracionEsperada: 30,
    fechaSolicitud: '2025-12-01T09:00:00',
    fechaLimiteEntrega: '2025-12-28T18:00:00',
    fechaRecepcion: null,
    estado: 'vencido',
    recordatoriosEnviados: 5,
    ultimoRecordatorio: '2025-12-28T08:00:00',
    contactoNombre: 'Laura Torres',
    contactoEmail: 'ltorres@falabella.cl',
    contactoTelefono: '+56923456789',
    diasRestantes: -4,
    esUrgente: true,
    cunaAsignadaId: null,
    cunaAsignadaCodigo: null
  },
  {
    id: 'mat-005',
    anuncianteId: 'anunc-004',
    anuncianteNombre: 'Entel',
    contratoId: 'cont-004',
    contratoNumero: 'CNT-2026-0003',
    vencimientoId: null,
    vencimientoNombre: null,
    tipoMaterial: 'mencion',
    descripcion: 'Texto de mención para campaña 5G',
    duracionEsperada: 20,
    fechaSolicitud: '2025-12-28T11:00:00',
    fechaLimiteEntrega: '2026-01-15T18:00:00',
    fechaRecepcion: null,
    estado: 'pendiente',
    recordatoriosEnviados: 0,
    ultimoRecordatorio: null,
    contactoNombre: 'Roberto Muñoz',
    contactoEmail: 'rmunoz@entel.cl',
    contactoTelefono: '+56934567890',
    diasRestantes: 14,
    esUrgente: false,
    cunaAsignadaId: null,
    cunaAsignadaCodigo: null
  }
];

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url);
  const vista = searchParams.get('vista') || 'lista';
  const estado = searchParams.get('estado');
  const anuncianteId = searchParams.get('anuncianteId');
  const urgentes = searchParams.get('urgentes') === 'true';

  let materiales = [...materialesMock];

  // Filtrar por estado
  if (estado) {
    materiales = materiales.filter(m => m.estado === estado);
  }

  // Filtrar por anunciante
  if (anuncianteId) {
    materiales = materiales.filter(m => m.anuncianteId === anuncianteId);
  }

  // Solo urgentes
  if (urgentes) {
    materiales = materiales.filter(m => m.esUrgente);
  }

  // Vista agrupada por anunciante
  if (vista === 'por_anunciante') {
    const anunciantes = new Map<string, ReporteMaterialPorAnunciante>();
    
    for (const mat of materialesMock) {
      if (!anunciantes.has(mat.anuncianteId)) {
        anunciantes.set(mat.anuncianteId, {
          anuncianteId: mat.anuncianteId,
          anuncianteNombre: mat.anuncianteNombre,
          totalPendiente: 0,
          totalRecibido: 0,
          totalVencido: 0,
          tasaCumplimiento: 0,
          materialesDetalle: []
        });
      }
      
      const anunciante = anunciantes.get(mat.anuncianteId)!;
      anunciante.materialesDetalle.push(mat);
      
      if (mat.estado === 'pendiente') anunciante.totalPendiente++;
      if (mat.estado === 'recibido' || mat.estado === 'aprobado') anunciante.totalRecibido++;
      if (mat.estado === 'vencido') anunciante.totalVencido++;
    }
    
    // Calcular tasa de cumplimiento
    for (const anunciante of anunciantes.values()) {
      const total = anunciante.materialesDetalle.length;
      anunciante.tasaCumplimiento = total > 0 
        ? Math.round((anunciante.totalRecibido / total) * 100) 
        : 0;
    }
    
    return NextResponse.json({
      success: true,
      data: Array.from(anunciantes.values()),
      meta: {
        totalAnunciantes: anunciantes.size,
        totalMateriales: materialesMock.length,
        totalPendiente: materialesMock.filter(m => m.estado === 'pendiente').length,
        totalVencido: materialesMock.filter(m => m.estado === 'vencido').length
      }
    });
  }

  // Vista lista normal
  materiales.sort((a, b) => a.diasRestantes - b.diasRestantes);

  return NextResponse.json({
    success: true,
    data: materiales,
    meta: {
      total: materiales.length,
      pendientes: materiales.filter(m => m.estado === 'pendiente').length,
      recibidos: materiales.filter(m => m.estado === 'recibido').length,
      vencidos: materiales.filter(m => m.estado === 'vencido').length,
      urgentes: materiales.filter(m => m.esUrgente).length
    }
  });
  } catch (error) {
    logger.error('[API/Cunas/MaterialPendiente] Error GET:', error instanceof Error ? error : undefined, { module: 'cunas/material-pendiente', action: 'GET' })
    return apiServerError()
  }
}

// Crear solicitud de material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anuncianteId, tipoMaterial, descripcion, duracionEsperada, 
            fechaLimiteEntrega, contactoNombre, contactoEmail, contactoTelefono,
            vencimientoId, contratoId } = body;

    const nuevoMaterial: MaterialPendiente = {
      id: `mat-${Date.now()}`,
      anuncianteId,
      anuncianteNombre: 'Anunciante', // En producción se buscaría
      contratoId: contratoId || null,
      contratoNumero: contratoId ? `CNT-2026-${Date.now().toString().slice(-4)}` : null,
      vencimientoId: vencimientoId || null,
      vencimientoNombre: vencimientoId ? 'Auspicio vinculado' : null,
      tipoMaterial,
      descripcion,
      duracionEsperada: duracionEsperada || null,
      fechaSolicitud: new Date().toISOString(),
      fechaLimiteEntrega,
      fechaRecepcion: null,
      estado: 'pendiente',
      recordatoriosEnviados: 0,
      ultimoRecordatorio: null,
      contactoNombre: contactoNombre || null,
      contactoEmail: contactoEmail || null,
      contactoTelefono: contactoTelefono || null,
      diasRestantes: Math.ceil((new Date(fechaLimiteEntrega).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      esUrgente: false,
      cunaAsignadaId: null,
      cunaAsignadaCodigo: null
    };

    return NextResponse.json({
      success: true,
      data: nuevoMaterial,
      mensaje: 'Solicitud de material creada exitosamente'
    });

  } catch (error) {
    logger.error('[API/Cunas/MaterialPendiente] Error POST:', error instanceof Error ? error : undefined, { module: 'cunas/material-pendiente', action: 'POST' })
    return apiServerError()
  }
}

// Actualizar material (recibir, vincular cuña, enviar recordatorio)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { materialId, accion, datos } = body;

    switch (accion) {
      case 'marcar_recibido':
        return NextResponse.json({
          success: true,
          mensaje: 'Material marcado como recibido'
        });
        
      case 'vincular_cuna':
        return NextResponse.json({
          success: true,
          mensaje: `Material vinculado a cuña ${datos.cunaId}`
        });
        
      case 'enviar_recordatorio':
        return NextResponse.json({
          success: true,
          mensaje: 'Recordatorio enviado al cliente'
        });
        
      case 'rechazar':
        return NextResponse.json({
          success: true,
          mensaje: 'Material rechazado, se solicitó nuevo envío'
        });
        
      case 'aprobar':
        return NextResponse.json({
          success: true,
          mensaje: 'Material aprobado'
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Acción no válida' 
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('[API/Cunas/MaterialPendiente] Error PUT:', error instanceof Error ? error : undefined, { module: 'cunas/material-pendiente', action: 'PUT' })
    return apiServerError()
  }
}
