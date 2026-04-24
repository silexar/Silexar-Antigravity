/**
 * API ROUTE: /api/paquetes/cortex/pricing
 * 
 * @description Endpoint para análisis de pricing con Cortex AI.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { cortexPricingService } from '../../../../../modules/paquetes/infrastructure/external/CortexPricingService'

// POST /api/paquetes/cortex/pricing - Analizar precio con IA
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { paqueteId, tipo, precioBase, ocupacionActual, historialOcupacion } = body

        if (!paqueteId) {
            return NextResponse.json(
                { error: 'paqueteId es requerido' },
                { status: 400 }
            )
        }

        // Si no se proveen datos, obtener del paquete en DB
        let paqueteData = { tipo, precioBase, ocupacionActual, historialOcupacion }

        if (!precioBase) {
            const [paquete] = await db
                .select()
                .from(paquetes)
                .where(and(eq(paquetes.id, paqueteId), isNull(paquetes.deletedAt)))
                .limit(1)

            if (!paquete) {
                return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })
            }

            // Obtener ocupación promedio de disponibilidad
            const disp = await db
                .select()
                .from(paquetesDisponibilidad)
                .where(eq(paquetesDisponibilidad.paqueteId, paqueteId))
                .orderBy(desc(paquetesDisponibilidad.fecha))
                .limit(30)

            const ocupacionPromedio = disp.length > 0
                ? disp.reduce((s, d) => s + (Number(d.cuposTotales) > 0 ? (Number(d.cuposOcupados) / Number(d.cuposTotales)) * 100 : 0), 0) / disp.length
                : 50

            paqueteData = {
                tipo: paquete.tipo,
                precioBase: Number(paquete.precioBase),
                ocupacionActual: Math.round(ocupacionPromedio),
                historialOcupacion: disp.map(d => Number(d.cuposTotales) > 0 ? (Number(d.cuposOcupados) / Number(d.cuposTotales)) * 100 : 0)
            }
        }

        // Ejecutar análisis Cortex
        const analysis = await cortexPricingService.analizarPrecio({
            paqueteId,
            tipo: paqueteData.tipo || 'PRIME',
            precioBase: paqueteData.precioBase,
            ocupacionActual: paqueteData.ocupacionActual || 50,
            ocupacionHistorico: paqueteData.historialOcupacion || []
        })

        // Obtener factores estacionales activos
        const factoresEstacionales = cortexPricingService.getFactoresEstacionales()

        return NextResponse.json({
            success: true,
            analysis,
            factoresEstacionales,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[Cortex Pricing API] POST error:', error)
        return NextResponse.json(
            { error: 'Error en análisis de pricing' },
            { status: 500 }
        )
    }
}

// GET /api/paquetes/cortex/pricing/factores - Listar factores estacionales
export async function GET(request: NextRequest) {
    try {
        const factores = cortexPricingService.getFactoresEstacionales()

        return NextResponse.json({
            factores,
            total: factores.length
        })
    } catch (error) {
        console.error('[Cortex Pricing API] GET factores error:', error)
        return NextResponse.json(
            { error: 'Error al obtener factores' },
            { status: 500 }
        )
    }
}
