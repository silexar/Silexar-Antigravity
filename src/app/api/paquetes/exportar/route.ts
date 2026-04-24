/**
 * API ROUTE: /api/paquetes/exportar
 * 
 * @description Endpoint para exportar datos de paquetes en various formatos.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

// GET /api/paquetes/exportar?formato=csv&filtros=...
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const formato = searchParams.get('formato') || 'json'
        const tipo = searchParams.get('tipo')
        const estado = searchParams.get('estado')

        // Construir query
        const conditions = [isNull(paquetes.deletedAt)]
        if (tipo) conditions.push(eq(paquetes.tipo, tipo))
        if (estado) conditions.push(eq(paquetes.estado, estado))

        const paquetesData = await db
            .select()
            .from(paquetes)
            .where(and(...conditions))
            .orderBy(desc(paquetes.createdAt))

        // Obtener disponibilidad para cada paquete
        const paquetesConDisp = await Promise.all(
            paquetesData.map(async (p) => {
                const disp = await db
                    .select()
                    .from(paquetesDisponibilidad)
                    .where(eq(paquetesDisponibilidad.paqueteId, p.id))
                    .orderBy(desc(paquetesDisponibilidad.fecha))
                    .limit(30)

                const ocupacionPromedio = disp.length > 0
                    ? disp.reduce((s, d) => s + (Number(d.cuposTotales) > 0 ? (Number(d.cuposOcupados) / Number(d.cuposTotales)) * 100 : 0), 0) / disp.length
                    : 0

                return {
                    codigo: p.codigo,
                    nombre: p.nombre,
                    tipo: p.tipo,
                    estado: p.estado,
                    editora: p.editoraNombre,
                    programa: p.programaNombre,
                    horario: `${p.horarioInicio} - ${p.horarioFin}`,
                    dias: p.diasSemana.join(', '),
                    precioBase: Number(p.precioBase),
                    precioActual: Number(p.precioActual),
                    nivelExclusividad: p.nivelExclusividad,
                    vigenciaDesde: p.vigenciaDesde,
                    vigenciaHasta: p.vigenciaHasta,
                    ocupacionPromedio: Math.round(ocupacionPromedio),
                    duraciones: p.duraciones.join(', ')
                }
            })
        )

        // Formatear según el formato solicitado
        switch (formato) {
            case 'csv':
                return exportarCSV(paquetesConDisp)
            case 'xlsx':
                return NextResponse.json({
                    message: 'Excel export not yet implemented',
                    data: paquetesConDisp
                })
            default:
                return NextResponse.json({
                    success: true,
                    total: paquetesConDisp.length,
                    data: paquetesConDisp
                })
        }
    } catch (error) {
        console.error('[Exportar API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al exportar datos' },
            { status: 500 }
        )
    }
}

function exportarCSV(paquetes: any[]): NextResponse {
    if (paquetes.length === 0) {
        return new NextResponse('No data', { status: 204 })
    }

    // Headers
    const headers = Object.keys(paquetes[0])
    const csvHeaders = headers.join(',')

    // Rows
    const csvRows = paquetes.map(p =>
        headers.map(h => {
            const val = p[h]
            // Escapar comas y comillas
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`
            }
            return val
        }).join(',')
    )

    const csv = [csvHeaders, ...csvRows].join('\n')

    return new NextResponse(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="paquetes_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
    })
}
