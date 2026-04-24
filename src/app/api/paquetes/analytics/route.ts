/**
 * API ROUTE: /api/paquetes/analytics
 * 
 * @description Endpoints para métricas y analytics de paquetes.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad, paquetesHistorialPrecio } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, gte, lt, desc } from 'drizzle-orm'

// GET /api/paquetes/analytics?paqueteId=xxx
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const paqueteId = searchParams.get('paqueteId')

        if (!paqueteId) {
            return NextResponse.json(
                { error: 'paqueteId es requerido' },
                { status: 400 }
            )
        }

        // Obtener paquete
        const [paquete] = await db
            .select()
            .from(paquetes)
            .where(and(eq(paquetes.id, paqueteId), isNull(paquetes.deletedAt)))
            .limit(1)

        if (!paquete) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            )
        }

        // Obtener disponibilidad última semana
        const hace7dias = new Date()
        hace7dias.setDate(hace7dias.getDate() - 7)

        const disponibilidad = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(and(
                eq(paquetesDisponibilidad.paqueteId, paqueteId),
                gte(paquetesDisponibilidad.fecha, hace7dias.toISOString().split('T')[0])
            ))
            .orderBy(desc(paquetesDisponibilidad.fecha))

        // Calcular métricas
        const totalCupos = disponibilidad.reduce((sum, d) => sum + Number(d.cuposTotales), 0)
        const totalOcupados = disponibilidad.reduce((sum, d) => sum + Number(d.cuposOcupados), 0)
        const ocupacionPromedio = totalCupos > 0 ? Math.round((totalOcupados / totalCupos) * 10000) / 100 : 0

        // Historial de precios
        const historialPrecios = await db
            .select()
            .from(paquetesHistorialPrecio)
            .where(eq(paquetesHistorialPrecio.paqueteId, paqueteId))
            .orderBy(desc(paquetesHistorialPrecio.fechaVigencia))
            .limit(30)

        // Calcular revenue estimado basado en ocupación
        const revenueEstimado = totalOcupados * Number(paquete.precioActual)

        // Tendencia (comparar con semana anterior)
        const hace14dias = new Date()
        hace14dias.setDate(hace14dias.getDate() - 14)

        const disponibilidadAnterior = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(and(
                eq(paquetesDisponibilidad.paqueteId, paqueteId),
                gte(paquetesDisponibilidad.fecha, hace14dias.toISOString().split('T')[0]),
                lt(paquetesDisponibilidad.fecha, hace7dias.toISOString().split('T')[0])
            ))

        const totalAnterior = disponibilidadAnterior.reduce((sum, d) => sum + Number(d.cuposOcupados), 0)
        const tendenciaOcupacion = totalAnterior > 0
            ? Math.round(((totalOcupados - totalAnterior) / totalAnterior) * 10000) / 100
            : 0

        return NextResponse.json({
            paquete: {
                id: paquete.id,
                codigo: paquete.codigo,
                nombre: paquete.nombre,
                tipo: paquete.tipo,
                estado: paquete.estado
            },
            metrics: {
                ocupacionPromedio,
                ocupacionTotal: {
                    cuposTotales: totalCupos,
                    cuposOcupados: totalOcupados,
                    cuposDisponibles: totalCupos - totalOcupados
                },
                tendenciaOcupacion,
                revenueEstimado,
                ultimoPrecio: Number(paquete.precioActual),
                precioBase: Number(paquete.precioBase),
                variacionPrecio: Number(paquete.precioBase) !== Number(paquete.precioActual)
                    ? Math.round(((Number(paquete.precioActual) - Number(paquete.precioBase)) / Number(paquete.precioBase)) * 10000) / 100
                    : 0
            },
            disponibilidad: disponibilidad.map(d => ({
                fecha: d.fecha,
                cuposTotales: d.cuposTotales,
                cuposOcupados: d.cuposOcupados,
                disponiblePct: d.disponiblePct,
                spotsProgramados: d.spotsProgramados
            })),
            historialPrecios: historialPrecios.map(h => ({
                fecha: h.fechaVigencia,
                precioBase: Number(h.precioBase),
                precioFinal: Number(h.precioFinal),
                factorDemanda: h.factorDemanda,
                factorEstacional: h.factorEstacional
            })),
            insights: generarInsights(ocupacionPromedio, tendenciaOcupacion, paquete.tipo)
        })
    } catch (error) {
        console.error('[Paquetes Analytics API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener analytics' },
            { status: 500 }
        )
    }
}

function generarInsights(ocupacion: number, tendencia: number, tipo: string) {
    const insights = []

    // Análisis de ocupación
    if (ocupacion >= 90) {
        insights.push({
            tipo: 'WARNING',
            icono: '🚨',
            titulo: 'Saturación Crítica',
            descripcion: 'Paquete con ocupación muy alta. Considerar incremento de precio.'
        })
    } else if (ocupacion >= 75) {
        insights.push({
            tipo: 'INFO',
            icono: '📈',
            titulo: 'Alta Demanda',
            descripcion: 'Paquete con buena ocupación. Monitorear tendencias.'
        })
    } else if (ocupacion < 50) {
        insights.push({
            tipo: 'OPPORTUNITY',
            icono: '💡',
            titulo: 'Sub-utilizado',
            descripcion: 'Paquete con baja ocupación. Ideal para promociones o descuentos.'
        })
    }

    // Análisis de tendencia
    if (tendencia > 15) {
        insights.push({
            tipo: 'SUCCESS',
            icono: '📈',
            titulo: 'Crecimiento Sostenido',
            descripcion: `Tendencia positiva de ${tendencia}% vs semana anterior.`
        })
    } else if (tendencia < -15) {
        insights.push({
            tipo: 'WARNING',
            icono: '📉',
            titulo: 'Declive Detectado',
            descripcion: `Tendencia negativa de ${tendencia}% vs semana anterior.`
        })
    }

    // Recomendaciones por tipo
    if (tipo === 'PRIME' && ocupacion < 80) {
        insights.push({
            tipo: 'OPPORTUNITY',
            icono: '💰',
            titulo: 'Precio sub-óptimo',
            descripcion: 'Paquetes Prime típicamente soportan +10% pricing.'
        })
    }

    return insights
}
