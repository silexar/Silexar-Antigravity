/**
 * 🌐 SILEXAR PULSE - API Activos Digitales TIER 0
 * 
 * Endpoints REST para gestión de activos publicitarios digitales
 * con segmentación avanzada
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

interface ActivoDigitalData {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  tipoCategoria: string;
  estado: string;
  anuncianteId: string;
  anuncianteNombre: string;
  campanaId?: string;
  campanaNombre?: string;
  
  // Creatividad
  formatoPrincipal: string;
  urlPreview?: string;
  
  // Segmentación resumen
  segmentacionResumen: {
    demografica: string[];
    geografica: string[];
    dispositivos: string[];
    intereses: string[];
  };
  alcanceEstimado: string;
  
  // Métricas
  impresiones: number;
  clics: number;
  ctr: number;
  conversiones: number;
  costoTotal: number;
  roas: number;
  
  // Presupuesto
  presupuestoTipo: string;
  presupuestoMonto: number;
  presupuestoGastado: number;
  
  // Programación
  fechaInicio: string;
  fechaFin: string;
  plataformas: string[];
  
  // Auditoría
  fechaCreacion: string;
  creadoPor: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line prefer-const
let mockActivos: ActivoDigitalData[] = [
  {
    id: 'adx-001',
    codigo: 'ADX000001',
    nombre: 'Banner Verano Banco Chile 300x250',
    tipo: 'banner_display',
    tipoCategoria: 'banner',
    estado: 'activo',
    anuncianteId: 'anc-001',
    anuncianteNombre: 'Banco de Chile',
    campanaId: 'camp-001',
    campanaNombre: 'Verano 2025',
    formatoPrincipal: '300x250',
    urlPreview: '/assets/banners/banco-chile-300x250.png',
    segmentacionResumen: {
      demografica: ['25-44 años', 'ABC1-C2'],
      geografica: ['RM', 'Valparaíso'],
      dispositivos: ['Mobile', 'Desktop'],
      intereses: ['Finanzas', 'Inversiones']
    },
    alcanceEstimado: '1.2M',
    impresiones: 458720,
    clics: 8456,
    ctr: 1.84,
    conversiones: 234,
    costoTotal: 2450000,
    roas: 3.2,
    presupuestoTipo: 'diario',
    presupuestoMonto: 150000,
    presupuestoGastado: 2450000,
    fechaInicio: '2025-01-15',
    fechaFin: '2025-02-28',
    plataformas: ['google_ads', 'meta_ads'],
    fechaCreacion: '2025-01-10T14:30:00Z',
    creadoPor: 'María García'
  },
  {
    id: 'adx-002',
    codigo: 'ADX000002',
    nombre: 'Video Pre-roll Coca-Cola 15s',
    tipo: 'video_preroll',
    tipoCategoria: 'video',
    estado: 'activo',
    anuncianteId: 'anc-002',
    anuncianteNombre: 'Coca-Cola Chile',
    formatoPrincipal: '1920x1080',
    segmentacionResumen: {
      demografica: ['18-34 años', 'Todos'],
      geografica: ['Todo Chile'],
      dispositivos: ['Mobile', 'Smart TV'],
      intereses: ['Entretenimiento', 'Música', 'Deportes']
    },
    alcanceEstimado: '3.5M',
    impresiones: 1254800,
    clics: 45620,
    ctr: 3.64,
    conversiones: 890,
    costoTotal: 8500000,
    roas: 4.1,
    presupuestoTipo: 'total',
    presupuestoMonto: 15000000,
    presupuestoGastado: 8500000,
    fechaInicio: '2025-01-20',
    fechaFin: '2025-03-15',
    plataformas: ['google_dv360', 'tiktok_ads'],
    fechaCreacion: '2025-01-18T10:00:00Z',
    creadoPor: 'Carlos López'
  },
  {
    id: 'adx-003',
    codigo: 'ADX000003',
    nombre: 'Story IG LATAM Vuelos',
    tipo: 'story_ad',
    tipoCategoria: 'native',
    estado: 'programado',
    anuncianteId: 'anc-003',
    anuncianteNombre: 'LATAM Airlines',
    formatoPrincipal: '1080x1920',
    segmentacionResumen: {
      demografica: ['25-54 años', 'ABC1'],
      geografica: ['Santiago', 'Concepción'],
      dispositivos: ['Mobile'],
      intereses: ['Viajes', 'Negocios']
    },
    alcanceEstimado: '800K',
    impresiones: 0,
    clics: 0,
    ctr: 0,
    conversiones: 0,
    costoTotal: 0,
    roas: 0,
    presupuestoTipo: 'diario',
    presupuestoMonto: 200000,
    presupuestoGastado: 0,
    fechaInicio: '2025-02-15',
    fechaFin: '2025-03-30',
    plataformas: ['meta_ads'],
    fechaCreacion: '2025-02-05T16:00:00Z',
    creadoPor: 'Ana Martínez'
  },
  {
    id: 'adx-004',
    codigo: 'ADX000004',
    nombre: 'Audio Spotify Entel 30s',
    tipo: 'audio_spot',
    tipoCategoria: 'audio',
    estado: 'pausado',
    anuncianteId: 'anc-005',
    anuncianteNombre: 'Entel',
    formatoPrincipal: 'Audio 30s',
    segmentacionResumen: {
      demografica: ['18-44 años'],
      geografica: ['Todo Chile'],
      dispositivos: ['Mobile'],
      intereses: ['Música', 'Tecnología']
    },
    alcanceEstimado: '2.1M',
    impresiones: 567890,
    clics: 12340,
    ctr: 2.17,
    conversiones: 456,
    costoTotal: 3200000,
    roas: 2.8,
    presupuestoTipo: 'diario',
    presupuestoMonto: 100000,
    presupuestoGastado: 3200000,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-02-15',
    plataformas: ['spotify'],
    fechaCreacion: '2024-12-28T09:00:00Z',
    creadoPor: 'Pedro Soto'
  },
  {
    id: 'adx-005',
    codigo: 'ADX000005',
    nombre: 'Carousel Falabella Black Friday',
    tipo: 'carousel',
    tipoCategoria: 'native',
    estado: 'completado',
    anuncianteId: 'anc-004',
    anuncianteNombre: 'Falabella',
    formatoPrincipal: '1080x1080',
    segmentacionResumen: {
      demografica: ['25-54 años', 'Mujeres 60%'],
      geografica: ['RM', 'Regiones principales'],
      dispositivos: ['Mobile', 'Desktop'],
      intereses: ['Moda', 'Hogar', 'Tecnología']
    },
    alcanceEstimado: '2.8M',
    impresiones: 3456780,
    clics: 156890,
    ctr: 4.54,
    conversiones: 8945,
    costoTotal: 25000000,
    roas: 6.2,
    presupuestoTipo: 'total',
    presupuestoMonto: 25000000,
    presupuestoGastado: 25000000,
    fechaInicio: '2024-11-20',
    fechaFin: '2024-11-30',
    plataformas: ['meta_ads', 'google_ads'],
    fechaCreacion: '2024-11-15T11:00:00Z',
    creadoPor: 'María García'
  }
];

let secuencia = 5;

// ═══════════════════════════════════════════════════════════════
// GET - Listar activos con filtros
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const tipo = searchParams.get('tipo') || '';
    const estado = searchParams.get('estado') || '';
    const plataforma = searchParams.get('plataforma') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let filtered = [...mockActivos];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.nombre.toLowerCase().includes(s) ||
        a.codigo.toLowerCase().includes(s) ||
        a.anuncianteNombre.toLowerCase().includes(s)
      );
    }

    if (tipo) {
      filtered = filtered.filter(a => a.tipoCategoria === tipo);
    }

    if (estado) {
      filtered = filtered.filter(a => a.estado === estado);
    }

    if (plataforma) {
      filtered = filtered.filter(a => a.plataformas.includes(plataforma));
    }

    // Métricas agregadas
    const metricas = {
      total: mockActivos.length,
      activos: mockActivos.filter(a => a.estado === 'activo').length,
      programados: mockActivos.filter(a => a.estado === 'programado').length,
      pausados: mockActivos.filter(a => a.estado === 'pausado').length,
      impresionesTotales: mockActivos.reduce((sum, a) => sum + a.impresiones, 0),
      clicsTotales: mockActivos.reduce((sum, a) => sum + a.clics, 0),
      inversionTotal: mockActivos.reduce((sum, a) => sum + a.costoTotal, 0),
      roasPromedio: mockActivos.filter(a => a.roas > 0).reduce((sum, a) => sum + a.roas, 0) / 
                    mockActivos.filter(a => a.roas > 0).length || 0
    };

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data,
      metricas,
      pagination: { total, page, limit, totalPages }
    });
    
  } catch (error) {
    logger.error('[API/ActivosDigitales] Error GET:', error instanceof Error ? error : undefined, { module: 'activos-digitales' });
    return NextResponse.json({ success: false, error: 'Error al obtener activos' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Crear activo digital
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.nombre?.trim()) {
      return NextResponse.json({ success: false, error: 'Nombre requerido' }, { status: 400 });
    }

    secuencia += 1;
    const codigo = `ADX${secuencia.toString().padStart(6, '0')}`;

    const newActivo: ActivoDigitalData = {
      id: `adx-${Date.now()}`,
      codigo,
      nombre: body.nombre,
      tipo: body.tipoEspecifico || 'banner_display',
      tipoCategoria: body.tipoCategoria || 'banner',
      estado: 'borrador',
      anuncianteId: body.anuncianteId || '',
      anuncianteNombre: body.anuncianteNombre || 'Nuevo Anunciante',
      formatoPrincipal: body.formatoPrincipal || '300x250',
      segmentacionResumen: {
        demografica: body.segDemografica?.edadRangos || [],
        geografica: body.segGeografica?.regiones || [],
        dispositivos: body.segDispositivo?.tipos || [],
        intereses: body.segConductual?.intereses || []
      },
      alcanceEstimado: body.alcanceEstimado || '0',
      impresiones: 0,
      clics: 0,
      ctr: 0,
      conversiones: 0,
      costoTotal: 0,
      roas: 0,
      presupuestoTipo: body.presupuesto?.tipo || 'diario',
      presupuestoMonto: body.presupuesto?.monto || 0,
      presupuestoGastado: 0,
      fechaInicio: body.fechaInicio || new Date().toISOString().split('T')[0],
      fechaFin: body.fechaFin || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      plataformas: body.plataformas || [],
      fechaCreacion: new Date().toISOString(),
      creadoPor: 'Usuario Actual'
    };

    mockActivos.push(newActivo);

    return NextResponse.json({
      success: true,
      data: newActivo,
      message: 'Activo digital creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    logger.error('[API/ActivosDigitales] Error POST:', error instanceof Error ? error : undefined, { module: 'activos-digitales' });
    return NextResponse.json({ success: false, error: 'Error al crear activo' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT - Actualización masiva
// ═══════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.activoIds || !Array.isArray(body.activoIds)) {
      return NextResponse.json({ success: false, error: 'IDs requeridos' }, { status: 400 });
    }

    let actualizados = 0;
    for (const id of body.activoIds) {
      const idx = mockActivos.findIndex(a => a.id === id);
      if (idx !== -1) {
        switch (body.accion) {
          case 'activar':
            mockActivos[idx].estado = 'activo';
            break;
          case 'pausar':
            mockActivos[idx].estado = 'pausado';
            break;
          case 'archivar':
            mockActivos[idx].estado = 'archivado';
            break;
        }
        actualizados++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${actualizados} activos actualizados`,
      actualizados
    });
    
  } catch (error) {
    logger.error('[API/ActivosDigitales] Error PUT:', error instanceof Error ? error : undefined, { module: 'activos-digitales' });
    return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 });
  }
}
