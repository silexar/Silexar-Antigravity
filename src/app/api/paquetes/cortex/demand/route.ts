/**
 * API ROUTE: /api/paquetes/cortex/demand
 * 
 * @description Endpoint para predicción de demanda con Cortex AI.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, gte, asc } from 'drizzle-orm'
import { cortexDemandService } from '../../../../../modules/paquetes/infrastructure/external/CortexDemandService'

// POST /api/paquetes/cortex/demand - Predecir demanda con IA
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { paqueteId, tipo, horario, diasProyeccion } = body

        if (!paqueteId) {
            return NextResponse.json(
                { error: 'paqueteId es requerido' },
                { status: 400 }
            )
        }

        // Obtener historial del paquete
        const [paquete] = await db
            .select()
            .from(paquetes)
            .where(and(eq(paquetes.id, paqueteId), isNull(paquetes.deletedAt)))
            .limit(1)

        if (!paquete) {
            return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })
        }

        // Obtener datos de disponibilidad históricos
        const hace90dias = new Date()
        hace90dias.setDate(hace90dias.getDate() - 90)

        const disponibilidad = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(and(
                eq(paquetesDisponibilidad.paqueteId, paqueteId),
                gte(paquetesDisponibilidad.fecha, hace90dias.toISOString().split('T')[0])
            ))
            .orderBy(asc(paquetesDisponibilidad.fecha))

        // Convertir a formato de historial
        const historial = disponibilidad.map(d => ({
            fecha: new Date(d.fecha),
            ocupacion: Number(d.cuposTotales) > 0 ? (Number(d.cuposOcupados) / Number(d.cuposTotales)) * 100 : 0,
            revenue: Number(d.spotsProgramados) * Number(paquete.precioActual)
        }))

        // Detectar eventos próximos
        const eventosProximos = detectarEventosProximos()

        // Ejecutar predicción
        const prediction = await cortexDemandService.predecirDemanda({
            paqueteId,
            tipo: tipo || paquete.tipo,
            horario: horario || { inicio: paquete.horarioInicio, fin: paquete.horarioFin },
            historial,
            eventosProximos
        })

        return NextResponse.json({
            success: true,
            prediction,
            paquete: {
                id: paquete.id,
                codigo: paquete.codigo,
                nombre: paquete.nombre,
                tipo: paquete.tipo
            },
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[Cortex Demand API] POST error:', error)
        return NextResponse.json(
            { error: 'Error en predicción de demanda' },
            { status: 500 }
        )
    }
}

// GET /api/paquetes/cortex/demand/sugerir-fechas?tipo=PRIME
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const tipo = searchParams.get('tipo') || 'PRIME'
        const duracion = parseInt(searchParams.get('duracion') || '30')

        const sugerencias = await cortexDemandService.sugerirFechasOptimas({
            tipo,
            duracionDeseada: duracion
        })

        return NextResponse.json({
            success: true,
            sugerencias,
            tipo,
            duracionDeseada: duracion
        })
    } catch (error) {
        console.error('[Cortex Demand API] GET sugerir error:', error)
        return NextResponse.json(
            { error: 'Error al sugerir fechas' },
            { status: 500 }
        )
    }
}

// Helper para detectar eventos próximos
function detectarEventosProximos(): { fecha: Date; nombre: string }[] {
    const eventos: { fecha: Date; nombre: string }[] = []
    const hoy = new Date()
    const ano = hoy.getFullYear()

    // Navidad
    const navidad = new Date(ano, 11, 15)
    if (navidad > hoy) eventos.push({ fecha: navidad, nombre: 'Temporada Navideña' })

    // Fiestas Patrias
    const fp = new Date(ano, 8, 18)
    if (fp > hoy) eventos.push({ fecha: fp, nombre: 'Fiestas Patrias' })

    // Vuelta a clases (marzo)
    const clases = new Date(ano, 2, 1)
    if (clases > hoy) eventos.push({ fecha: clases, nombre: 'Vuelta a Clases' })

    // black friday
    const bf = new Date(ano, 10, 29)
    if (bf > hoy) eventos.push({ fecha: bf, nombre: 'Black Friday' })

    return eventos
}
