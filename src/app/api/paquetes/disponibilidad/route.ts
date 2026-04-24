/**
 * API ROUTE: /api/paquetes/disponibilidad
 * 
 * @description Endpoints para gestión de disponibilidad de paquetes.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, gte, lte, asc } from 'drizzle-orm'

// GET /api/paquetes/disponibilidad?paqueteId=xxx&desde=2025-01-01&hasta=2025-01-31
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const paqueteId = searchParams.get('paqueteId')
        const desde = searchParams.get('desde')
        const hasta = searchParams.get('hasta')

        if (!paqueteId) {
            return NextResponse.json(
                { error: 'paqueteId es requerido' },
                { status: 400 }
            )
        }

        // Verificar que el paquete existe
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

        // Build conditions
        const conditions = [eq(paquetesDisponibilidad.paqueteId, paqueteId)]

        if (desde) {
            conditions.push(gte(paquetesDisponibilidad.fecha, new Date(desde).toISOString().split('T')[0]))
        }
        if (hasta) {
            conditions.push(lte(paquetesDisponibilidad.fecha, new Date(hasta).toISOString().split('T')[0]))
        }

        const disponibilidad = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(and(...conditions))
            .orderBy(asc(paquetesDisponibilidad.fecha))

        // Calcular métricas
        const totalCupos = disponibilidad.reduce((sum, d) => sum + Number(d.cuposTotales), 0)
        const totalOcupados = disponibilidad.reduce((sum, d) => sum + Number(d.cuposOcupados), 0)
        const ocupacionPromedio = totalCupos > 0 ? (totalOcupados / totalCupos) * 100 : 0

        return NextResponse.json({
            paqueteId,
            paqueteNombre: paquete.nombre,
            codigo: paquete.codigo,
            metrics: {
                totalCupos,
                totalOcupados,
                ocupacionPromedio: Math.round(ocupacionPromedio * 100) / 100
            },
            data: disponibilidad.map(d => ({
                fecha: d.fecha,
                cuposTotales: d.cuposTotales,
                cuposOcupados: d.cuposOcupados,
                disponiblePct: d.disponiblePct,
                spotsProgramados: d.spotsProgramados
            }))
        })
    } catch (error) {
        console.error('[Paquetes Disponibilidad API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener disponibilidad' },
            { status: 500 }
        )
    }
}

// POST /api/paquetes/disponibilidad - Actualizar disponibilidad
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { paqueteId, fecha, cuposTotales, cuposOcupados, spotsProgramados } = body

        if (!paqueteId || !fecha) {
            return NextResponse.json(
                { error: 'paqueteId y fecha son requeridos' },
                { status: 400 }
            )
        }

        // Verificar que el paquete existe
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

        const disponiblePct = cuposTotales > 0
            ? ((cuposTotales - (cuposOcupados || 0)) / cuposTotales) * 100
            : 0

        const fechaStr = new Date(fecha).toISOString().split('T')[0]

        // Check if exists
        const [existing] = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(and(
                eq(paquetesDisponibilidad.paqueteId, paqueteId),
                eq(paquetesDisponibilidad.fecha, fechaStr)
            ))
            .limit(1)

        let result
        if (existing) {
            // Update
            [result] = await db
                .update(paquetesDisponibilidad)
                .set({
                    cuposTotales: cuposTotales || 0,
                    cuposOcupados: cuposOcupados || 0,
                    disponiblePct: String(disponiblePct.toFixed(2)),
                    spotsProgramados: spotsProgramados || 0,
                    updatedAt: new Date()
                })
                .where(eq(paquetesDisponibilidad.id, existing.id))
                .returning()
        } else {
            // Insert
            [result] = await db
                .insert(paquetesDisponibilidad)
                .values({
                    id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    paqueteId,
                    fecha: fechaStr,
                    cuposTotales: cuposTotales || 0,
                    cuposOcupados: cuposOcupados || 0,
                    disponiblePct: String(disponiblePct.toFixed(2)),
                    spotsProgramados: spotsProgramados || 0
                })
                .returning()
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('[Paquetes Disponibilidad API] POST error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar disponibilidad' },
            { status: 500 }
        )
    }
}
