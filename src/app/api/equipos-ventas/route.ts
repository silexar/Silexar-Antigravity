/**
 * 👥 SILEXAR PULSE - API Routes Equipos de Ventas
 * 
 * @description API REST completa para gestión de vendedores y equipos
 * con coaching IA integrado
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, apiValidationError, apiNotFound, apiServerError, getUserContext, apiForbidden} from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Zod schemas for input validation
const createVendedorSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100),
  apellido: z.string().min(1, 'Apellido es requerido').max(100),
  email: z.string().email('Email inválido').max(200),
  telefono: z.string().max(30).optional().nullable(),
  equipoId: z.string().max(50).optional().nullable(),
  tipoComision: z.enum(['porcentaje', 'escalonada', 'fijo']).optional(),
  porcentajeComision: z.number().min(0).max(100).optional(),
  zonasAsignadas: z.array(z.string().max(200)).max(20).optional(),
  metaAsignada: z.number().min(0).optional(),
});

const updateVendedorSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  nombre: z.string().min(1).max(100).optional(),
  apellido: z.string().min(1).max(100).optional(),
  email: z.string().email('Email inválido').max(200).optional(),
  telefono: z.string().max(30).optional().nullable(),
  equipoId: z.string().max(50).optional().nullable(),
  porcentajeComision: z.number().min(0).max(100).optional(),
  metaAsignada: z.number().min(0).optional(),
  estado: z.enum(['activo', 'inactivo', 'suspendido']).optional(),
  zonasAsignadas: z.array(z.string().max(200)).max(20).optional(),
  asignarCliente: z.string().max(50).optional(),
  removerCliente: z.string().max(50).optional(),
  registrarVenta: z.number().min(0).optional(),
});

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockEquipos = [
  { id: 'eq-001', codigo: 'EQV-001', nombre: 'Equipo Norte', liderId: 'ven-001', metaEquipo: 140000000, ventasEquipo: 157000000, activo: true },
  { id: 'eq-002', codigo: 'EQV-002', nombre: 'Equipo Sur', liderId: 'ven-003', metaEquipo: 140000000, ventasEquipo: 100000000, activo: true }
];

const mockVendedores = [
  { 
    id: 'ven-001', 
    codigo: 'VEN-001', 
    nombre: 'Carlos', 
    apellido: 'Mendoza', 
    email: 'cmendoza@empresa.cl', 
    telefono: '+56 9 1234 5678', 
    equipoId: 'eq-001',
    equipoNombre: 'Equipo Norte',
    tipoComision: 'porcentaje',
    porcentajeComision: 5,
    zonasAsignadas: ['Región Metropolitana Norte'],
    clientesAsignados: ['anc-001', 'anc-002', 'anc-003'],
    ventasAcumuladas: 85000000, 
    metaAsignada: 70000000, 
    porcentajeCumplimiento: 121, 
    comisionesAcumuladas: 4250000, 
    rankingActual: 1, 
    rankingAnterior: 2, 
    estado: 'activo',
    fechaIngreso: '2022-03-15',
    tenantId: 'tenant-001'
  },
  { 
    id: 'ven-002', 
    codigo: 'VEN-002', 
    nombre: 'María', 
    apellido: 'López', 
    email: 'mlopez@empresa.cl', 
    telefono: '+56 9 2345 6789', 
    equipoId: 'eq-001',
    equipoNombre: 'Equipo Norte',
    tipoComision: 'porcentaje',
    porcentajeComision: 5,
    zonasAsignadas: ['Región Metropolitana Sur'],
    clientesAsignados: ['anc-004', 'anc-005'],
    ventasAcumuladas: 72000000, 
    metaAsignada: 70000000, 
    porcentajeCumplimiento: 103, 
    comisionesAcumuladas: 3600000, 
    rankingActual: 2, 
    rankingAnterior: 1, 
    estado: 'activo',
    fechaIngreso: '2021-08-20',
    tenantId: 'tenant-001'
  },
  { 
    id: 'ven-003', 
    codigo: 'VEN-003', 
    nombre: 'Juan', 
    apellido: 'Pérez', 
    email: 'jperez@empresa.cl', 
    telefono: '+56 9 3456 7890', 
    equipoId: 'eq-002',
    equipoNombre: 'Equipo Sur',
    tipoComision: 'escalonada',
    porcentajeComision: 4,
    zonasAsignadas: ['Región del Biobío'],
    clientesAsignados: ['anc-006', 'anc-007'],
    ventasAcumuladas: 58000000, 
    metaAsignada: 70000000, 
    porcentajeCumplimiento: 83, 
    comisionesAcumuladas: 2900000, 
    rankingActual: 3, 
    rankingAnterior: 3, 
    estado: 'activo',
    fechaIngreso: '2023-01-10',
    tenantId: 'tenant-001'
  },
  { 
    id: 'ven-004', 
    codigo: 'VEN-004', 
    nombre: 'Ana', 
    apellido: 'Silva', 
    email: 'asilva@empresa.cl', 
    telefono: '+56 9 4567 8901', 
    equipoId: 'eq-002',
    equipoNombre: 'Equipo Sur',
    tipoComision: 'porcentaje',
    porcentajeComision: 5,
    zonasAsignadas: ['Región de Valparaíso'],
    clientesAsignados: ['anc-008'],
    ventasAcumuladas: 42000000, 
    metaAsignada: 70000000, 
    porcentajeCumplimiento: 60, 
    comisionesAcumuladas: 2100000, 
    rankingActual: 4, 
    rankingAnterior: 4, 
    estado: 'activo',
    fechaIngreso: '2023-06-01',
    tenantId: 'tenant-001'
  }
];

// ═══════════════════════════════════════════════════════════════
// FUNCIONES IA
// ═══════════════════════════════════════════════════════════════

function generarCoachingIA(vendedores: typeof mockVendedores) {
  const coaching = [];
  
  for (const v of vendedores) {
    const cumplimiento = v.porcentajeCumplimiento;
    
    if (cumplimiento >= 100) {
      coaching.push({
        tipo: 'felicitacion',
        prioridad: 'alta',
        vendedorId: v.id,
        vendedorNombre: `${v.nombre} ${v.apellido}`,
        mensaje: `¡Excelente! Ha superado su meta por ${cumplimiento - 100}%`,
        metrica: 'Cumplimiento',
        valorActual: cumplimiento,
        valorObjetivo: 100,
        accionSugerida: 'Considera ayudar a compañeros o tomar clientes adicionales',
        impactoEstimado: 0
      });
    } else if (cumplimiento >= 80) {
      coaching.push({
        tipo: 'oportunidad',
        prioridad: 'media',
        vendedorId: v.id,
        vendedorNombre: `${v.nombre} ${v.apellido}`,
        mensaje: `Estás al ${cumplimiento}% de tu meta, solo te falta un push`,
        metrica: 'Cumplimiento',
        valorActual: cumplimiento,
        valorObjetivo: 100,
        accionSugerida: 'Enfócate en 2-3 oportunidades de cierre rápido',
        impactoEstimado: v.metaAsignada - v.ventasAcumuladas
      });
    } else if (cumplimiento < 70) {
      coaching.push({
        tipo: 'alerta',
        prioridad: 'alta',
        vendedorId: v.id,
        vendedorNombre: `${v.nombre} ${v.apellido}`,
        mensaje: 'Meta en riesgo - necesitas acción inmediata',
        metrica: 'Cumplimiento',
        valorActual: cumplimiento,
        valorObjetivo: 100,
        accionSugerida: 'Agenda reunión con supervisor para revisar pipeline',
        impactoEstimado: v.metaAsignada * 0.4
      });
    }
  }
  
  return coaching;
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipoId = searchParams.get('equipoId') || '';
    const estado = searchParams.get('estado') || '';
    const search = searchParams.get('search') || '';
    const includeCoaching = searchParams.get('coaching') === 'true';
    const includeRanking = searchParams.get('ranking') === 'true';

    let filtered = [...mockVendedores];

    if (equipoId) {
      filtered = filtered.filter(v => v.equipoId === equipoId);
    }

    if (estado) {
      filtered = filtered.filter(v => v.estado === estado);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(v => 
        `${v.nombre} ${v.apellido}`.toLowerCase().includes(searchLower) ||
        v.codigo.toLowerCase().includes(searchLower) ||
        v.email.toLowerCase().includes(searchLower)
      );
    }

    if (includeRanking) {
      filtered.sort((a, b) => a.rankingActual - b.rankingActual);
    }

    // Calcular stats
    const totalMeta = mockVendedores.reduce((sum, v) => sum + v.metaAsignada, 0);
    const totalVentas = mockVendedores.reduce((sum, v) => sum + v.ventasAcumuladas, 0);
    const topVendedor = mockVendedores.reduce((best, v) => v.ventasAcumuladas > best.ventasAcumuladas ? v : best);

    const stats = {
      totalVendedores: mockVendedores.length,
      ventasTotales: totalVentas,
      metaTotal: totalMeta,
      cumplimientoPromedio: Math.round((totalVentas / totalMeta) * 100),
      comisionesTotales: mockVendedores.reduce((sum, v) => sum + v.comisionesAcumuladas, 0),
      topPerformer: {
        id: topVendedor.id,
        nombre: `${topVendedor.nombre} ${topVendedor.apellido}`,
        ventas: topVendedor.ventasAcumuladas
      },
      porEquipo: mockEquipos.map(eq => ({
        equipoId: eq.id,
        nombre: eq.nombre,
        meta: eq.metaEquipo,
        ventas: eq.ventasEquipo,
        cumplimiento: Math.round((eq.ventasEquipo / eq.metaEquipo) * 100)
      }))
    };

    const meta: Record<string, unknown> = {
      equipos: mockEquipos,
      stats,
      total: filtered.length
    };

    if (includeCoaching) {
      meta.coaching = generarCoachingIA(filtered);
    }

    return apiSuccess(filtered, 200, meta);

  } catch (error) {
    logger.error('[API/EquiposVentas] Error:', error instanceof Error ? error : undefined, { module: 'equipos-ventas' });
    return apiServerError(error instanceof Error ? error.message : 'Error al obtener vendedores');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = createVendedorSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten().fieldErrors);
    }

    const { nombre, apellido, email } = parsed.data;

    // Verificar email único
    if (mockVendedores.some(v => v.email === email)) {
      return apiError('DUPLICATE_ENTRY', 'Email ya registrado', 400);
    }

    const newVendedor = {
      id: `ven-${Date.now()}`,
      codigo: `VEN-${(mockVendedores.length + 1).toString().padStart(3, '0')}`,
      nombre,
      apellido,
      email,
      telefono: parsed.data.telefono || null,
      equipoId: parsed.data.equipoId || null,
      equipoNombre: parsed.data.equipoId ? mockEquipos.find(e => e.id === parsed.data.equipoId)?.nombre || null : null,
      tipoComision: parsed.data.tipoComision || 'porcentaje',
      porcentajeComision: parsed.data.porcentajeComision ?? 5,
      zonasAsignadas: parsed.data.zonasAsignadas || [],
      clientesAsignados: [],
      ventasAcumuladas: 0,
      metaAsignada: parsed.data.metaAsignada || 70000000,
      porcentajeCumplimiento: 0,
      comisionesAcumuladas: 0,
      rankingActual: mockVendedores.length + 1,
      rankingAnterior: mockVendedores.length + 1,
      estado: 'activo',
      fechaIngreso: new Date().toISOString().split('T')[0],
      tenantId: 'tenant-001'
    };

    mockVendedores.push(newVendedor as typeof mockVendedores[0]);

    return apiSuccess(newVendedor, 201, { message: 'Vendedor creado exitosamente' });

  } catch (error) {
    logger.error('[API/EquiposVentas] Error:', error instanceof Error ? error : undefined, { module: 'equipos-ventas' });
    return apiServerError(error instanceof Error ? error.message : 'Error al crear vendedor');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = updateVendedorSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten().fieldErrors);
    }

    const validatedBody = parsed.data;

    const vendedor = mockVendedores.find(v => v.id === validatedBody.id);
    if (!vendedor) {
      return apiNotFound('Vendedor');
    }

    // Actualizar campos
    if (validatedBody.nombre) vendedor.nombre = validatedBody.nombre;
    if (validatedBody.apellido) vendedor.apellido = validatedBody.apellido;
    if (validatedBody.telefono !== undefined) vendedor.telefono = validatedBody.telefono ?? '';
    if (validatedBody.equipoId !== undefined) {
      vendedor.equipoId = validatedBody.equipoId ?? '';
      vendedor.equipoNombre = validatedBody.equipoId ? mockEquipos.find(e => e.id === validatedBody.equipoId)?.nombre || '' : '';
    }
    if (validatedBody.porcentajeComision !== undefined) vendedor.porcentajeComision = validatedBody.porcentajeComision;
    if (validatedBody.metaAsignada !== undefined) vendedor.metaAsignada = validatedBody.metaAsignada;
    if (validatedBody.estado) vendedor.estado = validatedBody.estado;
    if (validatedBody.zonasAsignadas) vendedor.zonasAsignadas = validatedBody.zonasAsignadas;

    // Asignar/remover cliente
    if (validatedBody.asignarCliente) {
      if (!vendedor.clientesAsignados.includes(validatedBody.asignarCliente)) {
        vendedor.clientesAsignados.push(validatedBody.asignarCliente);
      }
    }
    if (validatedBody.removerCliente) {
      const idx = vendedor.clientesAsignados.indexOf(validatedBody.removerCliente);
      if (idx > -1) vendedor.clientesAsignados.splice(idx, 1);
    }

    // Registrar venta
    if (validatedBody.registrarVenta) {
      vendedor.ventasAcumuladas += validatedBody.registrarVenta;
      vendedor.comisionesAcumuladas += Math.round(validatedBody.registrarVenta * (vendedor.porcentajeComision / 100));
      vendedor.porcentajeCumplimiento = Math.round((vendedor.ventasAcumuladas / vendedor.metaAsignada) * 100);
    }

    return apiSuccess(vendedor, 200, { message: 'Vendedor actualizado' });

  } catch (error) {
    logger.error('[API/EquiposVentas] Error:', error instanceof Error ? error : undefined, { module: 'equipos-ventas' });
    return apiServerError(error instanceof Error ? error.message : 'Error al actualizar');
  }
}
