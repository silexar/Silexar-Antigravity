/**
 * 🏢 SILEXAR PULSE - API Búsqueda de Anunciantes Enterprise TIER 0
 * 
 * Endpoint para búsqueda inteligente de anunciantes con datos enriquecidos
 * Prioriza clientes activos y muestra información operativa
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

interface AnuncianteEnriquecido {
  id: string;
  nombre: string;
  razonSocial: string;
  rut: string;
  logo?: string;
  industria: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  
  // Datos operativos
  contratosActivos: number;
  cunasActivas: number;
  ultimaActividad: string;
  ultimaActividadRelativa: string;
  
  // Scoring
  riskLevel: 'bajo' | 'medio' | 'alto';
  riskScore: number;
  creditScore: number;
  
  // Productos frecuentes
  productosRecientes: string[];
  
  // Contacto principal
  contactoPrincipal?: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA (En producción: Base de datos)
// ═══════════════════════════════════════════════════════════════

const mockAnunciantes: AnuncianteEnriquecido[] = [
  {
    id: 'anc-001',
    nombre: 'Banco de Chile',
    razonSocial: 'Banco de Chile S.A.',
    rut: '97.004.000-5',
    logo: '/logos/banco-chile.svg',
    industria: 'Banca y Finanzas',
    estado: 'activo',
    contratosActivos: 3,
    cunasActivas: 12,
    ultimaActividad: new Date().toISOString(),
    ultimaActividadRelativa: 'Hace 2 horas',
    riskLevel: 'bajo',
    riskScore: 850,
    creditScore: 95,
    productosRecientes: ['Cuenta Corriente', 'Crédito Hipotecario', 'Tarjeta Débito'],
    contactoPrincipal: {
      nombre: 'María González',
      email: 'maria.gonzalez@bancochile.cl',
      telefono: '+56 9 8765 4321'
    }
  },
  {
    id: 'anc-002',
    nombre: 'Coca-Cola Chile',
    razonSocial: 'Embotelladora Andina S.A.',
    rut: '91.144.000-8',
    logo: '/logos/coca-cola.svg',
    industria: 'Bebidas',
    estado: 'activo',
    contratosActivos: 2,
    cunasActivas: 8,
    ultimaActividad: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ultimaActividadRelativa: 'Ayer',
    riskLevel: 'bajo',
    riskScore: 920,
    creditScore: 98,
    productosRecientes: ['Coca-Cola Original', 'Sprite', 'Fanta'],
    contactoPrincipal: {
      nombre: 'Carlos Mendoza',
      email: 'cmendoza@coca-cola.cl',
      telefono: '+56 9 1234 5678'
    }
  },
  {
    id: 'anc-003',
    nombre: 'LATAM Airlines',
    razonSocial: 'LATAM Airlines Group S.A.',
    rut: '89.862.200-2',
    logo: '/logos/latam.svg',
    industria: 'Aerolíneas',
    estado: 'activo',
    contratosActivos: 4,
    cunasActivas: 15,
    ultimaActividad: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    ultimaActividadRelativa: 'Hace 3 horas',
    riskLevel: 'bajo',
    riskScore: 780,
    creditScore: 88,
    productosRecientes: ['Vuelos Nacionales', 'Vuelos Internacionales', 'LATAM Pass'],
    contactoPrincipal: {
      nombre: 'Andrea Silva',
      email: 'asilva@latam.com',
      telefono: '+56 9 9876 5432'
    }
  },
  {
    id: 'anc-004',
    nombre: 'Falabella',
    razonSocial: 'S.A.C.I. Falabella',
    rut: '90.749.000-9',
    logo: '/logos/falabella.svg',
    industria: 'Retail',
    estado: 'activo',
    contratosActivos: 5,
    cunasActivas: 22,
    ultimaActividad: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ultimaActividadRelativa: 'Hace 1 hora',
    riskLevel: 'bajo',
    riskScore: 890,
    creditScore: 92,
    productosRecientes: ['CMR', 'Cyber Day', 'Black Friday'],
    contactoPrincipal: {
      nombre: 'Roberto Pizarro',
      email: 'rpizarro@falabella.cl',
      telefono: '+56 9 5555 4444'
    }
  },
  {
    id: 'anc-005',
    nombre: 'Entel',
    razonSocial: 'Entel Chile S.A.',
    rut: '92.580.000-7',
    logo: '/logos/entel.svg',
    industria: 'Telecomunicaciones',
    estado: 'activo',
    contratosActivos: 2,
    cunasActivas: 6,
    ultimaActividad: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaActividadRelativa: 'Hace 5 días',
    riskLevel: 'bajo',
    riskScore: 810,
    creditScore: 90,
    productosRecientes: ['Plan Familia', '5G', 'Prepago'],
    contactoPrincipal: {
      nombre: 'Patricia López',
      email: 'plopez@entel.cl',
      telefono: '+56 9 3333 2222'
    }
  },
  {
    id: 'anc-006',
    nombre: 'Lollapalooza Chile',
    razonSocial: 'Lotus Producciones SpA',
    rut: '76.543.210-K',
    logo: '/logos/lollapalooza.svg',
    industria: 'Entretenimiento',
    estado: 'activo',
    contratosActivos: 1,
    cunasActivas: 3,
    ultimaActividad: new Date().toISOString(),
    ultimaActividadRelativa: 'Hoy',
    riskLevel: 'medio',
    riskScore: 650,
    creditScore: 75,
    productosRecientes: ['Festival 2025', 'Early Bird', 'VIP Pass'],
    contactoPrincipal: {
      nombre: 'Diego Fernández',
      email: 'dfernandez@lotus.cl',
      telefono: '+56 9 1111 2222'
    }
  },
  {
    id: 'anc-007',
    nombre: 'Ripley',
    razonSocial: 'Ripley Corp S.A.',
    rut: '96.509.660-4',
    logo: '/logos/ripley.svg',
    industria: 'Retail',
    estado: 'activo',
    contratosActivos: 2,
    cunasActivas: 5,
    ultimaActividad: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaActividadRelativa: 'Hace 2 días',
    riskLevel: 'bajo',
    riskScore: 820,
    creditScore: 85,
    productosRecientes: ['Tarjeta Ripley', 'Moda', 'Electro'],
    contactoPrincipal: {
      nombre: 'Carla Muñoz',
      email: 'cmunoz@ripley.cl',
      telefono: '+56 9 7777 8888'
    }
  },
  {
    id: 'anc-008',
    nombre: 'Paris',
    razonSocial: 'Cencosud Retail S.A.',
    rut: '81.201.000-K',
    logo: '/logos/paris.svg',
    industria: 'Retail',
    estado: 'activo',
    contratosActivos: 3,
    cunasActivas: 9,
    ultimaActividad: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    ultimaActividadRelativa: 'Hace 12 horas',
    riskLevel: 'bajo',
    riskScore: 800,
    creditScore: 87,
    productosRecientes: ['Cencosud Scotiabank', 'Hogar', 'Tecnología'],
    contactoPrincipal: {
      nombre: 'Felipe Torres',
      email: 'ftorres@cencosud.cl',
      telefono: '+56 9 4444 5555'
    }
  }
];

// ═══════════════════════════════════════════════════════════════
// GET - Buscar anunciantes con datos enriquecidos
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const orderBy = searchParams.get('orderBy') || 'recent_activity';
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const industria = searchParams.get('industria') || '';
    
    let results = [...mockAnunciantes];
    
    // Filtrar por estado
    if (!includeInactive) {
      results = results.filter(a => a.estado === 'activo');
    }
    
    // Filtrar por industria
    if (industria) {
      results = results.filter(a => 
        a.industria.toLowerCase().includes(industria.toLowerCase())
      );
    }
    
    // Búsqueda por texto
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(a =>
        a.nombre.toLowerCase().includes(queryLower) ||
        a.razonSocial.toLowerCase().includes(queryLower) ||
        a.rut.includes(query) ||
        a.industria.toLowerCase().includes(queryLower) ||
        a.productosRecientes.some(p => p.toLowerCase().includes(queryLower))
      );
    }
    
    // Ordenar
    results.sort((a, b) => {
      switch (orderBy) {
        case 'recent_activity':
          return new Date(b.ultimaActividad).getTime() - new Date(a.ultimaActividad).getTime();
        case 'name':
          return a.nombre.localeCompare(b.nombre);
        case 'cunas_count':
          return b.cunasActivas - a.cunasActivas;
        case 'contracts':
          return b.contratosActivos - a.contratosActivos;
        case 'risk':
          return b.riskScore - a.riskScore;
        default:
          return 0;
      }
    });
    
    // Limitar resultados
    results = results.slice(0, limit);
    
    // Enriquecer con scoring visual
    const enrichedResults = results.map(a => ({
      ...a,
      badges: generateBadges(a),
      searchRelevance: query ? calculateRelevance(a, query) : 1
    }));
    
    return NextResponse.json({
      success: true,
      data: enrichedResults,
      meta: {
        total: enrichedResults.length,
        query,
        orderBy
      }
    });
    
  } catch (error) {
    logger.error('[API/Anunciantes/Search] Error GET:', error instanceof Error ? error : undefined, { module: 'search' });
    return NextResponse.json(
      { success: false, error: 'Error al buscar anunciantes' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function generateBadges(anunciante: AnuncianteEnriquecido): string[] {
  const badges: string[] = [];
  
  if (anunciante.contratosActivos > 0) {
    badges.push(`✅ ${anunciante.contratosActivos} contratos activos`);
  }
  
  if (anunciante.cunasActivas > 10) {
    badges.push('🔥 Cliente frecuente');
  }
  
  if (anunciante.riskLevel === 'bajo') {
    badges.push('💚 Riesgo bajo');
  } else if (anunciante.riskLevel === 'alto') {
    badges.push('⚠️ Riesgo alto');
  }
  
  const actividadReciente = new Date(anunciante.ultimaActividad);
  const haceHoras = (Date.now() - actividadReciente.getTime()) / (1000 * 60 * 60);
  
  if (haceHoras < 24) {
    badges.push('🟢 Activo hoy');
  }
  
  return badges;
}

function calculateRelevance(anunciante: AnuncianteEnriquecido, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Match exacto en nombre: máximo puntaje
  if (anunciante.nombre.toLowerCase() === queryLower) {
    score += 100;
  } else if (anunciante.nombre.toLowerCase().startsWith(queryLower)) {
    score += 80;
  } else if (anunciante.nombre.toLowerCase().includes(queryLower)) {
    score += 60;
  }
  
  // Match en RUT
  if (anunciante.rut.includes(query)) {
    score += 50;
  }
  
  // Bonus por actividad reciente
  const haceHoras = (Date.now() - new Date(anunciante.ultimaActividad).getTime()) / (1000 * 60 * 60);
  if (haceHoras < 24) {
    score += 20;
  } else if (haceHoras < 72) {
    score += 10;
  }
  
  // Bonus por cuñas activas
  score += Math.min(anunciante.cunasActivas * 2, 20);
  
  return score;
}

// ═══════════════════════════════════════════════════════════════
// POST - Crear nuevo anunciante (Quick Create)
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      );
    }
    
    // Generar nuevo ID
    const newId = `anc-${Date.now()}`;
    
    const newAnunciante: AnuncianteEnriquecido = {
      id: newId,
      nombre: body.nombre,
      razonSocial: body.razonSocial || body.nombre,
      rut: body.rut || '',
      logo: body.logo,
      industria: body.industria || 'General',
      estado: 'activo',
      contratosActivos: 0,
      cunasActivas: 0,
      ultimaActividad: new Date().toISOString(),
      ultimaActividadRelativa: 'Ahora',
      riskLevel: 'medio',
      riskScore: 500,
      creditScore: 50,
      productosRecientes: [],
      contactoPrincipal: body.contacto
    };
    
    // En producción: guardar en base de datos
    mockAnunciantes.push(newAnunciante);
    
    return NextResponse.json({
      success: true,
      data: newAnunciante,
      message: 'Anunciante creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    logger.error('[API/Anunciantes/Search] Error POST:', error instanceof Error ? error : undefined, { module: 'search' });
    return NextResponse.json(
      { success: false, error: 'Error al crear anunciante' },
      { status: 500 }
    );
  }
}
