/**
 * API ROUTE: /api/paquetes/compatibles
 * 
 * @description Endpoints para obtener paquetes compatibles con campañas.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, asc, desc } from 'drizzle-orm'

// GET /api/paquetes/compatibles?tipo=PRIME&editoraId=xxx
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const tipo = searchParams.get('tipo')
        const editoraId = searchParams.get('editoraId')
        const estado = searchParams.get('estado') || 'ACTIVO'

        const conditions = [isNull(paquetes.deletedAt), eq(paquetes.estado, estado)]

        if (tipo) conditions.push(eq(paquetes.tipo, tipo))
        if (editoraId) conditions.push(eq(paquetes.editoraId, editoraId))

        const paquetesData = await db
            .select()
            .from(paquetes)
            .where(and(...conditions))
            .orderBy(asc(paquetes.tipo), asc(paquetes.nombre))

        // Calcular disponibilidad promedio para cada paquete
        const resultados = await Promise.all(
            paquetesData.map(async (p) => {
                const disponibilidad = await db
                    .select()
                    .from(paquetesDisponibilidad)
                    .where(eq(paquetesDisponibilidad.paqueteId, p.id))
                    .orderBy(desc(paquetesDisponibilidad.fecha))
                    .limit(30)

                const ocupacionPromedio = disponibilidad.length > 0
                    ? disponibilidad.reduce((sum, d) => sum + (Number(d.cuposTotales) > 0
                        ? (Number(d.cuposOcupados) / Number(d.cuposTotales)) * 100
                        : 0), 0) / disponibilidad.length
                    : 0

                return {
                    id: p.id,
                    codigo: p.codigo,
                    nombre: p.nombre,
                    tipo: p.tipo,
                    horario: {
                        inicio: p.horarioInicio,
                        fin: p.horarioFin
                    },
                    diasSemana: p.diasSemana,
                    precioActual: Number(p.precioActual),
                    precioBase: Number(p.precioBase),
                    nivelExclusividad: p.nivelExclusividad,
                    ocupacionPromedio: Math.round(ocupacionPromedio * 100) / 100,
                    vigencia: {
                        desde: p.vigenciaDesde,
                        hasta: p.vigenciaHasta
                    }
                }
            })
        )

        return NextResponse.json({
            total: resultados.length,
            items: resultados
        })
    } catch (error) {
        console.error('[Paquetes Compatibles API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener paquetes compatibles' },
            { status: 500 }
        )
    }
}
