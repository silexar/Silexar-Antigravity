/**
 * MIDDLEWARE: CUPO VALIDATION - TIER 0 ENTERPRISE FASE 3
 *
 * @description Valida permisos y datos antes de procesar operaciones de cupo.
 */

import { NextRequest, NextResponse } from 'next/server'

export class CupoValidationMiddleware {
  /** Validar que el usuario tiene permisos para operar cupos */
  static async validarPermisos(req: NextRequest): Promise<NextResponse | null> {
    // Roles autorizados para gestionar cupos
    const rolesPermitidos = ['ejecutivo_trafico', 'gerente_comercial', 'jefe_comercial', 'admin', 'super_admin']

    const userRole = req.headers.get('x-user-role')
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      return NextResponse.json(
        { error: 'No autorizado para gestionar cupos', codigo: 'CUPO_UNAUTHORIZED', rolesRequeridos: rolesPermitidos },
        { status: 403 }
      )
    }
    return null // Continuar
  }

  /** Validar datos de cupo en body */
  static async validarDatosCupo(req: NextRequest): Promise<NextResponse | null> {
    try {
      const body = await req.json()

      if (!body.programaId) return NextResponse.json({ error: 'programaId requerido' }, { status: 400 })
      if (!body.emisoraId) return NextResponse.json({ error: 'emisoraId requerido' }, { status: 400 })
      if (!body.clienteId) return NextResponse.json({ error: 'clienteId requerido' }, { status: 400 })

      // Validar fechas
      if (body.fechaInicio && body.fechaFin) {
        const inicio = new Date(body.fechaInicio)
        const fin = new Date(body.fechaFin)
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
          return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 })
        }
        if (fin <= inicio) {
          return NextResponse.json({ error: 'fechaFin debe ser posterior a fechaInicio' }, { status: 400 })
        }
      }

      return null
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
    }
  }

  /** Validar que el usuario puede aprobar extensiones (R1) */
  static async validarAprobadorExtension(req: NextRequest, nivelRequerido: 'jefe_comercial' | 'gerente_comercial'): Promise<NextResponse | null> {
    const userRole = req.headers.get('x-user-role')
    const rolesAprobacion: Record<string, string[]> = {
      'jefe_comercial': ['jefe_comercial', 'gerente_comercial', 'admin', 'super_admin'],
      'gerente_comercial': ['gerente_comercial', 'admin', 'super_admin']
    }

    if (!userRole || !rolesAprobacion[nivelRequerido]?.includes(userRole)) {
      return NextResponse.json(
        { error: `Requiere rol ${nivelRequerido} o superior para aprobar esta extensión`, codigo: 'EXTENSION_UNAUTHORIZED' },
        { status: 403 }
      )
    }
    return null
  }
}
