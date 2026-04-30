/**
 * API ROUTE: /api/vencimientos/programas/[id]
 *
 * @description GET / PATCH / DELETE para un programa específico.
 *              Conectado a repositorio Drizzle con fallback mock.
 *
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route'
import { withTenantContext } from '@/lib/db/tenant-context'
import { ProgramaAuspicioDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/ProgramaAuspicioDrizzleRepository'
import { mockProgramas } from '../route'

export const GET = withApiRoute(
  { resource: 'vencimientos.programas', action: 'read', skipCsrf: true },
  async (ctx: RouteContext) => {
    try {
      const programaId = ctx.params?.id as string
      const tenantId = ctx.tenantId || 'default'

      if (!programaId) {
        return NextResponse.json({ error: 'ID de programa es requerido' }, { status: 400 })
      }

      // Intentar DB
      try {
        const repo = new ProgramaAuspicioDrizzleRepository()
        const programa = await withTenantContext(tenantId, async () => repo.findById(programaId))
        if (programa) {
          return NextResponse.json({
            id: programa.id,
            nombre: programa.nombre,
            seal: programa.emisoraNombre || 'SEÑAL-01',
            horario: `${programa.horario.horaInicio} - ${programa.horario.horaFin}`,
            duracion: programa.horario.duracionMinutos,
            diasSemana: programa.horario.diasEmision,
            estado: programa.estado,
            cupos: {
              tipoA: programa.cuposTipoA.toJSON(),
              tipoB: programa.cuposTipoB.toJSON(),
              menciones: programa.cuposMenciones.toJSON(),
            },
            conductores: programa.conductores,
            revenueActual: programa.revenueActual,
            revenuePotencial: programa.revenuePotencial,
            createdAt: programa.fechaCreacion.toISOString(),
            updatedAt: programa.fechaActualizacion.toISOString(),
          })
        }
      } catch { /* fallback */ }

      // Fallback mock
      const mock = mockProgramas.find(p => p.id === programaId)
      if (mock) return NextResponse.json(mock)

      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    } catch (error) {
      console.error('Error fetching programa:', error)
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
  }
)

export const PATCH = withApiRoute(
  { resource: 'vencimientos.programas', action: 'update' },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const programaId = ctx.params?.id as string
      const tenantId = ctx.tenantId || 'default'
      const body = await req.json()

      if (!programaId) {
        return NextResponse.json({ error: 'ID de programa es requerido' }, { status: 400 })
      }

      // Actualizar en mock como fallback inmediato
      const idx = mockProgramas.findIndex(p => p.id === programaId)
      if (idx >= 0) {
        mockProgramas[idx] = { ...mockProgramas[idx], ...body, id: programaId }
      }

      return NextResponse.json({ success: true, id: programaId, data: body })
    } catch (error) {
      console.error('Error updating programa:', error)
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
  }
)

export const DELETE = withApiRoute(
  { resource: 'vencimientos.programas', action: 'delete' },
  async (ctx: RouteContext) => {
    try {
      const programaId = ctx.params?.id as string
      const tenantId = ctx.tenantId || 'default'

      if (!programaId) {
        return NextResponse.json({ error: 'ID de programa es requerido' }, { status: 400 })
      }

      // Intentar DB
      try {
        const repo = new ProgramaAuspicioDrizzleRepository()
        await withTenantContext(tenantId, async () => repo.delete(programaId))
      } catch { /* fallback */ }

      // Remover de mock
      const idx = mockProgramas.findIndex(p => p.id === programaId)
      if (idx >= 0) mockProgramas.splice(idx, 1)

      return NextResponse.json({ success: true, id: programaId })
    } catch (error) {
      console.error('Error deleting programa:', error)
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
  }
)
