/**
 * API ROUTE: /api/paquetes/alertas
 * 
 * @description Endpoint para sistema de alertas predictivas.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, gte, desc } from 'drizzle-orm'

// GET /api/paquetes/alertas?tipo=ALL
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const tipo = searchParams.get('tipo') || 'ALL'
        const prioridad = searchParams.get('prioridad')

        // Obtener paquetes con disponibilidad reciente
        const hace7dias = new Date()
        hace7dias.setDate(hace7dias.getDate() - 7)

        const disponibilidad = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(gte(paquetesDisponibilidad.fecha, hace7dias.toISOString().split('T')[0]))
            .orderBy(desc(paquetesDisponibilidad.fecha))

        const paquetesData = await db
            .select()
            .from(paquetes)
            .where(and(isNull(paquetes.deletedAt), eq(paquetes.estado, 'ACTIVO')))

        const alertas: any[] = []

        for (const paquete of paquetesData) {
            const dispPaquete = disponibilidad.filter(d => d.paqueteId === paquete.id)

            if (dispPaquete.length === 0) continue

            // Calcular ocupación promedio
            const ocupacion = dispPaquete.reduce((s, d) =>
                s + (Number(d.cuposTotales) > 0 ? (Number(d.cuposOcupados) / Number(d.cuposTotales)) * 100 : 0), 0) / dispPaquete.length

            // Alerta de saturación
            if (ocupacion >= 90) {
                alertas.push({
                    id: `alert_sat_${paquete.id}`,
                    tipo: 'SATURACION',
                    prioridad: 'ALTA',
                    paqueteId: paquete.id,
                    paqueteNombre: paquete.nombre,
                    paqueteCodigo: paquete.codigo,
                    metric: {
                        ocupacion: Math.round(ocupacion),
                        cuposDisponibles: Math.round(Number(dispPaquete[0].cuposTotales) * (1 - ocupacion / 100))
                    },
                    mensaje: `Saturación crítica: ${Math.round(ocupacion)}% de ocupación`,
                    accionSugerida: 'Bloquear nuevas ventas o incrementar precio',
                    fecha: new Date().toISOString()
                })
            }

            // Alerta de sub-utilización
            if (ocupacion < 40) {
                alertas.push({
                    id: `alert_sub_${paquete.id}`,
                    tipo: 'SUBUTILIZADO',
                    prioridad: 'MEDIA',
                    paqueteId: paquete.id,
                    paqueteNombre: paquete.nombre,
                    paqueteCodigo: paquete.codigo,
                    metric: {
                        ocupacion: Math.round(ocupacion)
                    },
                    mensaje: `Paquete sub-utilizado: ${Math.round(ocupacion)}% de ocupación`,
                    accionSugerida: 'Crear promoción o descuento por volumen',
                    fecha: new Date().toISOString()
                })
            }

            // Alerta de vigencia próxima
            const diasHastaVencimientos = Math.ceil(
                (new Date(paquete.vigenciaHasta).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            if (diasHastaVencimientos > 0 && diasHastaVencimientos <= 30) {
                alertas.push({
                    id: `alert_vig_${paquete.id}`,
                    tipo: 'VIGENCIA',
                    prioridad: diasHastaVencimientos <= 7 ? 'ALTA' : 'MEDIA',
                    paqueteId: paquete.id,
                    paqueteNombre: paquete.nombre,
                    paqueteCodigo: paquete.codigo,
                    metric: {
                        diasRestantes: diasHastaVencimientos
                    },
                    mensaje: `Vencimientos en ${diasHastaVencimientos} días`,
                    accionSugerida: 'Revisar renovación o crear nuevo paquete',
                    fecha: new Date().toISOString()
                })
            }
        }

        // Filtrar por tipo y prioridad si se especifica
        let alertasFiltradas = alertas
        if (tipo !== 'ALL') {
            alertasFiltradas = alertas.filter(a => a.tipo === tipo)
        }
        if (prioridad) {
            alertasFiltradas = alertasFiltradas.filter(a => a.prioridad === prioridad)
        }

        // Ordenar por prioridad
        const ordenPrioridad = { 'ALTA': 0, 'MEDIA': 1, 'BAJA': 2 }
        alertasFiltradas.sort((a, b) => ordenPrioridad[a.prioridad as keyof typeof ordenPrioridad] - ordenPrioridad[b.prioridad as keyof typeof ordenPrioridad])

        return NextResponse.json({
            total: alertasFiltradas.length,
            criticas: alertasFiltradas.filter(a => a.prioridad === 'ALTA').length,
            alertas: alertasFiltradas
        })
    } catch (error) {
        console.error('[Alertas API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener alertas' },
            { status: 500 }
        )
    }
}

// POST /api/paquetes/alertas - Marcar alerta como leída
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { alertaId, accion } = body

        if (!alertaId) {
            return NextResponse.json({ error: 'alertaId es requerido' }, { status: 400 })
        }

        // En una implementación real, guardaríamos en una tabla de alertas vistas
        // Por ahora solo retornamos éxito
        return NextResponse.json({
            success: true,
            message: `Alerta ${alertaId} marcada como ${accion}`
        })
    } catch (error) {
        console.error('[Alertas API] POST error:', error)
        return NextResponse.json(
            { error: 'Error al procesar acción' },
            { status: 500 }
        )
    }
}
