/**
 * MIDDLEWARE: TARIFARIO SECURITY - TIER 0 ENTERPRISE FASE 3
 *
 * @description Validación de seguridad para operaciones de tarifario.
 * Solo gerentes y administradores pueden modificar precios.
 */

import { NextRequest, NextResponse } from 'next/server'

export class TarifarioSecurityMiddleware {
  /** Validar permisos para modificar tarifas */
  static async validarPermisosTarifa(req: NextRequest): Promise<NextResponse | null> {
    const rolesPermitidos = ['gerente_comercial', 'admin', 'super_admin']
    const userRole = req.headers.get('x-user-role')

    if (!userRole || !rolesPermitidos.includes(userRole)) {
      return NextResponse.json(
        { error: 'Solo gerentes comerciales o superiores pueden modificar tarifas', codigo: 'TARIFA_UNAUTHORIZED' },
        { status: 403 }
      )
    }
    return null
  }

  /** Validar límites de descuento */
  static async validarLimitesDescuento(req: NextRequest): Promise<NextResponse | null> {
    try {
      const body = await req.json()
      const descuento = body.descuentoPorcentaje || 0

      // Límites por rol
      const userRole = req.headers.get('x-user-role') || ''
      const limites: Record<string, number> = {
        'gerente_comercial': 25,
        'admin': 40,
        'super_admin': 50
      }

      const limiteMax = limites[userRole] || 0
      if (descuento > limiteMax) {
        return NextResponse.json(
          {
            error: `Descuento ${descuento}% excede el límite permitido (${limiteMax}%) para rol ${userRole}`,
            codigo: 'DESCUENTO_EXCEDIDO',
            limiteMaximo: limiteMax
          },
          { status: 400 }
        )
      }
      return null
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
    }
  }

  /** Validar precio mínimo */
  static async validarPrecioMinimo(req: NextRequest): Promise<NextResponse | null> {
    try {
      const body = await req.json()
      const PRECIO_MINIMO = 50_000 // $50,000 CLP mínimo

      if (body.precioBase && body.precioBase < PRECIO_MINIMO) {
        return NextResponse.json(
          { error: `Precio base $${body.precioBase} inferior al mínimo permitido ($${PRECIO_MINIMO})`, codigo: 'PRECIO_MINIMO_VIOLADO' },
          { status: 400 }
        )
      }
      return null
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
    }
  }

  /** Rate limiting para consultas de tarifario */
  private static requestCounts = new Map<string, { count: number; resetAt: number }>()

  static async rateLimiting(req: NextRequest): Promise<NextResponse | null> {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    const now = Date.now()
    const entry = this.requestCounts.get(userId)

    if (entry && now < entry.resetAt) {
      if (entry.count >= 100) { // 100 requests per minute
        return NextResponse.json(
          { error: 'Rate limit excedido. Máximo 100 requests/minuto.', codigo: 'RATE_LIMIT' },
          { status: 429 }
        )
      }
      entry.count++
    } else {
      this.requestCounts.set(userId, { count: 1, resetAt: now + 60_000 })
    }
    return null
  }
}
