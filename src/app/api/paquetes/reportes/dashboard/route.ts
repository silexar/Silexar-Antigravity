/**
 * API ROUTE: /api/paquetes/reportes/dashboard
 * 
 * @description Endpoint para dashboard gerencial con métricas KPIs.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad, paquetesHistorialPrecio } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, gte, lte } from 'drizzle-orm'

// GET /api/paquetes/reportes/dashboard
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const periodo = searchParams.get('periodo') || 'mes' // dia, semana, mes, trimestre, año

        // Obtener todos los paquetes activos
        const paquetesData = await db
            .select()
            .from(paquetes)
            .where(and(isNull(paquetes.deletedAt), eq(paquetes.estado, 'ACTIVO')))

        // Calcular métricas por período
        const fechaInicio = calcularFechaInicio(periodo)
        const fechaFin = new Date()

        // Métricas de disponibilidad
        const disponibilidad = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(and(
                gte(paquetesDisponibilidad.fecha, fechaInicio.toISOString().split('T')[0]),
                lte(paquetesDisponibilidad.fecha, fechaFin.toISOString().split('T')[0])
            ))

        // Métricas de revenue desde historial de precios
        const historialPrecios = await db
            .select()
            .from(paquetesHistorialPrecio)
            .where(and(
                gte(paquetesHistorialPrecio.fechaVigencia, fechaInicio.toISOString().split('T')[0]),
                lte(paquetesHistorialPrecio.fechaVigencia, fechaFin.toISOString().split('T')[0])
            ))

        // Calcular KPIs
        const totalPaquetes = paquetesData.length
        const paquetesActivos = paquetesData.filter(p => p.estado === 'ACTIVO').length

        // Ocupación promedio
        const ocupacionData = disponibilidad.reduce((acc, d) => {
            if (Number(d.cuposTotales) > 0) {
                acc.totalCupos += Number(d.cuposTotales)
                acc.totalOcupados += Number(d.cuposOcupados)
            }
            return acc
        }, { totalCupos: 0, totalOcupados: 0 })

        const ocupacionPromedio = ocupacionData.totalCupos > 0
            ? Math.round((ocupacionData.totalOcupados / ocupacionData.totalCupos) * 10000) / 100
            : 0

        // Revenue estimado (suma de precios actuales * ocupación)
        const revenuePaquetes = paquetesData.reduce((sum, p) => {
            const dispPaquete = disponibilidad.filter(d => d.paqueteId === p.id)
            const ocupacionPaquete = dispPaquete.length > 0
                ? dispPaquete.reduce((s, d) => s + (Number(d.cuposTotales) > 0 ? Number(d.cuposOcupados) / Number(d.cuposTotales) : 0), 0) / dispPaquete.length
                : 0

            return sum + (Number(p.precioActual) * ocupacionPaquete * 30) // Mensual estimado
        }, 0)

        // Distribución por tipo
        const porTipo = paquetesData.reduce((acc, p) => {
            acc[p.tipo] = (acc[p.tipo] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Paquetes TOP (los que más ocupacion tienen)
        const topPaquetes = paquetesData
            .map(p => {
                const dispPaquete = disponibilidad.filter(d => d.paqueteId === p.id)
                const ocupacion = dispPaquete.length > 0
                    ? dispPaquete.reduce((s, d) => s + (Number(d.cuposTotales) > 0 ? Number(d.cuposOcupados) / Number(d.cuposTotales) : 0), 0) / dispPaquete.length
                    : 0
                return { id: p.id, codigo: p.codigo, nombre: p.nombre, tipo: p.tipo, ocupacion: Math.round(ocupacion * 100) }
            })
            .sort((a, b) => b.ocupacion - a.ocupacion)
            .slice(0, 5)

        // Paquetes que necesitan atención (baja ocupación o alta saturación)
        const requierenAtencion = paquetesData
            .map(p => {
                const dispPaquete = disponibilidad.filter(d => d.paqueteId === p.id)
                const ocupacion = dispPaquete.length > 0
                    ? dispPaquete.reduce((s, d) => s + (Number(d.cuposTotales) > 0 ? Number(d.cuposOcupados) / Number(d.cuposTotales) : 0), 0) / dispPaquete.length
                    : 0.5
                return { id: p.id, codigo: p.codigo, nombre: p.nombre, tipo: p.tipo, ocupacion: Math.round(ocupacion * 100) }
            })
            .filter(p => p.ocupacion < 40 || p.ocupacion > 95)
            .slice(0, 5)

        // Distribución por tipo con métricas
        const distribucionTipo = Object.entries(porTipo).map(([tipo, cantidad]) => {
            const paquetesTipo = paquetesData.filter(p => p.tipo === tipo)
            const dispTipo = disponibilidad.filter(d => paquetesTipo.some(p => p.id === d.paqueteId))
            const ocupacionTipo = dispTipo.length > 0
                ? dispTipo.reduce((s, d) => s + (Number(d.cuposTotales) > 0 ? Number(d.cuposOcupados) / Number(d.cuposTotales) : 0), 0) / dispTipo.length
                : 0

            return {
                tipo,
                cantidad,
                ocupacionPromedio: Math.round(ocupacionTipo * 100),
                label: getTipoLabel(tipo)
            }
        })

        return NextResponse.json({
            periodo,
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            kpis: {
                totalPaquetes,
                paquetesActivos,
                ocupacionPromedio,
                revenueEstimado: Math.round(revenuePaquetes),
                nuevosEsteMes: 0, // TODO: calcular con createdAt
                tasaOcupacion: ocupacionPromedio > 75 ? 'ALTA' : ocupacionPromedio > 50 ? 'OPTIMA' : 'BAJA'
            },
            topPaquetes,
            requierenAtencion,
            distribucionTipo,
            alertas: generarAlertasKPIs(ocupacionPromedio, requierenAtencion.length, topPaquetes)
        })
    } catch (error) {
        console.error('[Dashboard API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al generar dashboard' },
            { status: 500 }
        )
    }
}

function calcularFechaInicio(periodo: string): Date {
    const hoy = new Date()
    switch (periodo) {
        case 'dia': return new Date(hoy.setHours(0, 0, 0, 0))
        case 'semana': return new Date(hoy.setDate(hoy.getDate() - 7))
        case 'trimestre': return new Date(hoy.setMonth(hoy.getMonth() - 3))
        case 'año': return new Date(hoy.setFullYear(hoy.getFullYear() - 1))
        default: return new Date(hoy.setMonth(hoy.getMonth() - 1))
    }
}

function getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
        'PRIME': '🌟 Prime',
        'REPARTIDO': '📊 Repartido',
        'NOCTURNO': '🌙 Nocturno',
        'SENALES': '🌡️ Señales',
        'ESPECIAL': '🎯 Especial',
        'EXCLUSIVO': '💎 Exclusivo'
    }
    return labels[tipo] || tipo
}

function generarAlertasKPIs(ocupacion: number, requierenAtencion: number, topPaquetes: any[]): any[] {
    const alertas = []

    if (ocupacion > 85) {
        alertas.push({
            tipo: 'WARNING',
            icono: '🚨',
            mensaje: 'Ocupación global elevada',
            descripcion: `${ocupacion}% de ocupación promedio. Considerar incremento de precios.`
        })
    } else if (ocupacion < 50) {
        alertas.push({
            tipo: 'OPPORTUNITY',
            icono: '💡',
            mensaje: 'Ocupación global baja',
            descripcion: 'Menos del 50% de ocupación. Ideal para promociones y descuentos.'
        })
    }

    if (requierenAtencion > 3) {
        alertas.push({
            tipo: 'INFO',
            icono: '📋',
            mensaje: `${requierenAtencion} paquetes requieren atención`,
            descripcion: 'Hay paquetes con utilización crítica o muy baja.'
        })
    }

    return alertas
}
