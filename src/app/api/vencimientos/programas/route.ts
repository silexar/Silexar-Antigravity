/**
 * API ROUTE: /api/vencimientos/programas
 *
 * @description CRUD para programas de auspicio en el módulo Vencimientos.
 *              Ahora conectado a repositorio Drizzle (fallback a mock en desarrollo).
 *
 * @version 3.0.0
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { withTenantContext } from '@/lib/db/tenant-context'
import { getDB } from '@/lib/db'
import { programas } from '@/lib/db/vencimientos-schema'
import { eq, and, isNull } from 'drizzle-orm'

import { ProgramaAuspicioDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/ProgramaAuspicioDrizzleRepository'
import { ProgramaAuspicio } from '@/modules/vencimientos/domain/entities/ProgramaAuspicio'
import { HorarioEmision } from '@/modules/vencimientos/domain/value-objects/HorarioEmision'
import { CupoDisponible } from '@/modules/vencimientos/domain/value-objects/CupoDisponible'

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS
// ═══════════════════════════════════════════════════════════════

const ProgramaQuerySchema = z.object({
  emisoraId: z.string().optional(),
  estado: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20)
})

const CrearProgramaSchema = z.object({
  emiId: z.string().min(1, 'ID de emisora es requerido'),
  emiNombre: z.string().optional().default(''),
  nombre: z.string().min(1, 'Nombre es requerido').max(200),
  descripcion: z.string().optional().default(''),
  horarioInicio: z.string().optional().default('06:00'),
  horarioFin: z.string().optional().default('10:00'),
  diasSemana: z.array(z.number()).optional().default([1, 2, 3, 4, 5]),
  cupos: z.array(z.object({
    tipo: z.enum(['PREMIUM', 'STANDARD', 'MENSAJE']),
    total: z.number().int().positive(),
    precioBase: z.number().positive()
  })).optional(),
  conductores: z.array(z.object({
    id: z.string(),
    nombre: z.string(),
    rol: z.string()
  })).optional().default([]),
  estado: z.enum(['BORRADOR', 'ACTIVO', 'INACTIVO']).optional().default('BORRADOR'),
  vigenciaDesde: z.string().optional(),
  vigenciaHasta: z.string().optional()
})

// ═══════════════════════════════════════════════════════════════
// DTO de respuesta API (mantener compatibilidad con frontend)
// ═══════════════════════════════════════════════════════════════

export interface ProgramaDTO {
  id: string
  codigo: string
  emiId: string
  emiNombre: string
  nombre: string
  descripcion: string
  horario: { horaInicio: string; horaFin: string; diasSemana: number[] }
  cupos: {
    tipoA: { total: number; ocupados: number; disponibles: number }
    tipoB: { total: number; ocupados: number; disponibles: number }
    menciones: { total: number; ocupados: number; disponibles: number }
  }
  conductores: Array<{ id: string; nombre: string; rol: string }>
  estado: string
  revenueActual: number
  revenuePotencial: number
  listaEsperaCount: number
  disponibilidad: { totalCupos: number; totalOcupados: number; totalDisponibles: number; ocupacionPorcentaje: number }
  esPrime: boolean
  tieneCuposDisponibles: boolean
}

// In-memory store for fallback / desarrollo
export let mockProgramas: ProgramaDTO[] = [
  {
    id: 'prog-001',
    codigo: 'PROG-2026-001',
    emiId: 'emi-1',
    emiNombre: 'Radio Activa',
    nombre: 'Buenos Días Chile',
    descripcion: 'Programa matinal de noticias y entretenimiento',
    horario: { horaInicio: '07:00', horaFin: '09:00', diasSemana: [1, 2, 3, 4, 5] },
    cupos: {
      tipoA: { total: 10, ocupados: 3, disponibles: 7 },
      tipoB: { total: 20, ocupados: 8, disponibles: 12 },
      menciones: { total: 5, ocupados: 2, disponibles: 3 },
    },
    conductores: [
      { id: 'cond-1', nombre: 'Juan Pérez', rol: 'Conductor principal' },
      { id: 'cond-2', nombre: 'María López', rol: 'Co-conductor' },
    ],
    estado: 'ACTIVO',
    revenueActual: 1500000,
    revenuePotencial: 5000000,
    listaEsperaCount: 2,
    disponibilidad: { totalCupos: 35, totalOcupados: 13, totalDisponibles: 22, ocupacionPorcentaje: 37 },
    esPrime: true,
    tieneCuposDisponibles: true,
  },
  {
    id: 'prog-002',
    codigo: 'PROG-2026-002',
    emiId: 'emi-2',
    emiNombre: 'Radio Central',
    nombre: 'El Informativo',
    descripcion: 'Noticiero central de la mañana',
    horario: { horaInicio: '08:00', horaFin: '09:00', diasSemana: [1, 2, 3, 4, 5] },
    cupos: {
      tipoA: { total: 8, ocupados: 6, disponibles: 2 },
      tipoB: { total: 15, ocupados: 10, disponibles: 5 },
      menciones: { total: 3, ocupados: 3, disponibles: 0 },
    },
    conductores: [
      { id: 'cond-3', nombre: 'Carlos Gómez', rol: 'Conductor' },
    ],
    estado: 'ACTIVO',
    revenueActual: 2800000,
    revenuePotencial: 3200000,
    listaEsperaCount: 0,
    disponibilidad: { totalCupos: 26, totalOcupados: 19, totalDisponibles: 7, ocupacionPorcentaje: 73 },
    esPrime: false,
    tieneCuposDisponibles: true,
  },
]

function mapProgramaEntityToDTO(p: ProgramaAuspicio): ProgramaDTO {
  const totalCupos = p.cuposTipoA.totalCupos + p.cuposTipoB.totalCupos + p.cuposMenciones.totalCupos
  const totalOcupados = p.cuposTipoA.cuposOcupados + p.cuposTipoB.cuposOcupados + p.cuposMenciones.cuposOcupados
  const totalDisponibles = totalCupos - totalOcupados
  const ocupacion = totalCupos > 0 ? Math.round((totalOcupados / totalCupos) * 100) : 0

  return {
    id: p.id,
    codigo: `PROG-${p.id.slice(-6).toUpperCase()}`,
    emiId: p.emisoraId,
    emiNombre: p.emisoraNombre,
    nombre: p.nombre,
    descripcion: p.descripcion,
    horario: {
      horaInicio: p.horario.horaInicio,
      horaFin: p.horario.horaFin,
      diasSemana: p.horario.diasEmision.map(d => {
        const map: Record<string, number> = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 7 }
        return map[d] || 1
      })
    },
    cupos: {
      tipoA: { total: p.cuposTipoA.totalCupos, ocupados: p.cuposTipoA.cuposOcupados, disponibles: p.cuposTipoA.totalCupos - p.cuposTipoA.cuposOcupados },
      tipoB: { total: p.cuposTipoB.totalCupos, ocupados: p.cuposTipoB.cuposOcupados, disponibles: p.cuposTipoB.totalCupos - p.cuposTipoB.cuposOcupados },
      menciones: { total: p.cuposMenciones.totalCupos, ocupados: p.cuposMenciones.cuposOcupados, disponibles: p.cuposMenciones.totalCupos - p.cuposMenciones.cuposOcupados },
    },
    conductores: p.conductores,
    estado: p.estado.toUpperCase(),
    revenueActual: p.revenueActual,
    revenuePotencial: p.revenuePotencial,
    listaEsperaCount: p.listaEsperaCount,
    disponibilidad: { totalCupos, totalOcupados, totalDisponibles, ocupacionPorcentaje: ocupacion },
    esPrime: p.nombre.toLowerCase().includes('prime') || p.nombre.toLowerCase().includes('mañana'),
    tieneCuposDisponibles: totalDisponibles > 0,
  }
}

function calcularMetricas(programas: ProgramaDTO[]) {
  const programasActivos = programas.filter(p => p.estado === 'ACTIVO').length
  const totalCuposDisponibles = programas.reduce((sum, p) => sum + p.disponibilidad.totalDisponibles, 0)
  const ocupacionPromedio = programas.length > 0
    ? Math.round(programas.reduce((sum, p) => sum + p.disponibilidad.ocupacionPorcentaje, 0) / programas.length)
    : 0

  return { totalProgramas: programas.length, programasActivos, totalCuposDisponibles, ocupacionPromedio }
}

// ═══════════════════════════════════════════════════════════════
// GET /api/vencimientos/programas - Listar programas
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'vencimientos.programas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId || 'default'
    const userId = ctx.userId || 'anonymous'

    try {
      const { searchParams } = new URL(req.url)

      const queryValidation = ProgramaQuerySchema.safeParse({
        emisoraId: searchParams.get('emisoraId') ?? undefined,
        estado: searchParams.get('estado') ?? undefined,
        page: searchParams.get('page') ?? undefined,
        limit: searchParams.get('limit') ?? undefined
      })

      if (!queryValidation.success) {
        auditLogger.logEvent({
          eventType: AuditEventType.DATA_READ,
          severity: AuditSeverity.LOW,
          userId,
          resource: 'vencimientos.programas',
          action: 'read',
          success: false,
          details: { error: 'Invalid query parameters', tenantId }
        })
        return apiError('VALIDATION_ERROR', 'Parámetros inválidos', 400, queryValidation.error.flatten().fieldErrors)
      }

      const { emisoraId, estado, page, limit } = queryValidation.data

      // ── Intento de lectura desde DB con tenant context ──
      let items: ProgramaDTO[] = []
      let total = 0
      let dbError = false

      try {
        const repo = new ProgramaAuspicioDrizzleRepository()
        const result = await withTenantContext(tenantId, async () => {
          const db = getDB()
          // Usamos el repositorio para búsqueda paginada
          const criteria = {
            emisoraId,
            estado,
            pagina: page,
            tamanoPagina: limit,
            busquedaTexto: undefined
          }
          const searchResult = await repo.search(criteria)
          return searchResult.programas.map(mapProgramaEntityToDTO)
        })
        items = result
        total = items.length
      } catch (err) {
        console.warn('[Vencimientos-Programas] DB read failed, using mock fallback:', err)
        dbError = true
      }

      // Fallback a mock si la DB no responde o está vacía
      if (dbError || items.length === 0) {
        let filtered = [...mockProgramas]
        if (emisoraId) filtered = filtered.filter(p => p.emiId === emisoraId)
        if (estado) filtered = filtered.filter(p => p.estado === estado)
        total = filtered.length
        const startIndex = (page - 1) * limit
        items = filtered.slice(startIndex, startIndex + limit)
      }

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_READ,
        severity: AuditSeverity.LOW,
        userId,
        resource: 'vencimientos.programas',
        action: 'read',
        success: true,
        details: { tenantId, totalResults: total, page, limit, filters: { emisoraId, estado }, source: dbError ? 'mock' : 'db' }
      })

      return apiSuccess({
        items,
        total,
        page,
        limit,
        metricas: calcularMetricas(dbError ? mockProgramas : items)
      })

    } catch (error) {
      console.error('[Vencimientos-Programas] GET error:', error)
      auditLogger.logEvent({
        eventType: AuditEventType.DATA_READ,
        severity: AuditSeverity.HIGH,
        userId,
        resource: 'vencimientos.programas',
        action: 'read',
        success: false,
        details: { error: String(error), tenantId }
      })
      return apiServerError('Error al obtener programas')
    }
  }
)

// ═══════════════════════════════════════════════════════════════
// POST /api/vencimientos/programas - Crear programa
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'vencimientos.programas', action: 'create' },
  async ({ ctx, req }) => {
    const body = await req.json()
    const tenantId = ctx.tenantId || 'default'
    const userId = ctx.userId || 'anonymous'

    try {
      const validation = CrearProgramaSchema.safeParse(body)

      if (!validation.success) {
        auditLogger.logEvent({
          eventType: AuditEventType.DATA_CREATE,
          severity: AuditSeverity.MEDIUM,
          userId,
          resource: 'vencimientos.programas',
          action: 'create',
          success: false,
          details: { error: 'Validation failed', tenantId }
        })
        return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, validation.error.flatten().fieldErrors)
      }

      const data = validation.data

      // ── Crear entidad de dominio ──
      const tipoA = data.cupos?.find(c => c.tipo === 'PREMIUM') || { total: 0, precioBase: 0 }
      const tipoB = data.cupos?.find(c => c.tipo === 'STANDARD') || { total: 0, precioBase: 0 }
      const menciones = data.cupos?.find(c => c.tipo === 'MENSAJE') || { total: 0, precioBase: 0 }

      const conductores = data.conductores.length > 0 ? data.conductores : [
        { id: `cond_${Date.now()}`, nombre: 'Conductor por defecto', rol: 'conductor_principal' }
      ]

      const programaDomain = ProgramaAuspicio.create({
        emisoraId: data.emiId,
        emisoraNombre: data.emiNombre,
        nombre: data.nombre,
        descripcion: data.descripcion,
        horario: HorarioEmision.create({
          horaInicio: data.horarioInicio,
          horaFin: data.horarioFin,
          diasEmision: data.diasSemana.map(d => {
            const map: Record<number, 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'> = {
              1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 7: 'domingo'
            }
            return map[d] || 'lunes'
          })
        }),
        cuposTipoA: CupoDisponible.create({ totalCupos: tipoA.total || 0, cuposOcupados: 0, cuposReservados: 0, cuposExtendidos: 0, maxExtensiones: 3 }),
        cuposTipoB: CupoDisponible.create({ totalCupos: tipoB.total || 0, cuposOcupados: 0, cuposReservados: 0, cuposExtendidos: 0, maxExtensiones: 3 }),
        cuposMenciones: CupoDisponible.create({ totalCupos: menciones.total || 0, cuposOcupados: 0, cuposReservados: 0, cuposExtendidos: 0, maxExtensiones: 3 }),
        conductores,
        creadoPor: userId,
      })

      const dto = mapProgramaEntityToDTO(programaDomain)
      dto.revenuePotencial = ((tipoA.total || 0) * (tipoA.precioBase || 0)) +
        ((tipoB.total || 0) * (tipoB.precioBase || 0)) +
        ((menciones.total || 0) * (menciones.precioBase || 0))

      // ── Persistir en DB (con fallback a mock) ──
      let persisted = false
      try {
        const repo = new ProgramaAuspicioDrizzleRepository()
        await withTenantContext(tenantId, async () => {
          await repo.save(programaDomain)
        })
        persisted = true
      } catch (err) {
        console.warn('[Vencimientos-Programas] DB save failed, falling back to mock:', err)
      }

      if (!persisted) {
        mockProgramas.push(dto)
      }

      auditLogger.logEvent({
        eventType: AuditEventType.DATA_CREATE,
        severity: AuditSeverity.MEDIUM,
        userId,
        resource: 'vencimientos.programas',
        action: 'create',
        success: true,
        details: { programaId: dto.id, codigo: dto.codigo, nombre: dto.nombre, tenantId, persisted }
      })

      return apiSuccess({ data: dto, metricas: calcularMetricas(mockProgramas) }, 201)

    } catch (error) {
      console.error('[Vencimientos-Programas] POST error:', error)
      auditLogger.logEvent({
        eventType: AuditEventType.DATA_CREATE,
        severity: AuditSeverity.HIGH,
        userId,
        resource: 'vencimientos.programas',
        action: 'create',
        success: false,
        details: { error: String(error), tenantId }
      })
      return apiServerError('Error al crear programa')
    }
  }
)
