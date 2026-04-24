/**
 * API ROUTE: /api/paquetes/restricciones
 * 
 * @description Endpoints para gestión de restricciones de paquetes.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesRestricciones } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

// GET /api/paquetes/restricciones?paqueteId=xxx
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const paqueteId = searchParams.get('paqueteId')
        const activos = searchParams.get('activos')

        const conditions: any[] = []
        if (paqueteId) conditions.push(eq(paquetesRestricciones.paqueteId, paqueteId))
        if (activos === 'true') conditions.push(eq(paquetesRestricciones.activos, true))

        const restricciones = conditions.length > 0
            ? await db.select().from(paquetesRestricciones).where(and(...conditions)).orderBy(desc(paquetesRestricciones.createdAt))
            : await db.select().from(paquetesRestricciones).orderBy(desc(paquetesRestricciones.createdAt))

        return NextResponse.json({
            items: restricciones.map(r => ({
                id: r.id,
                paqueteId: r.paqueteId,
                tipo: r.tipoRestriccion,
                descripcion: r.descripcion,
                rubroAfectado: r.rubroAfectado,
                horarioInicio: r.horarioInicio,
                horarioFin: r.horarioFin,
                activos: r.activos,
                createdAt: r.createdAt
            }))
        })
    } catch (error) {
        console.error('[Paquetes Restricciones API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener restricciones' },
            { status: 500 }
        )
    }
}

// POST /api/paquetes/restricciones - Crear restricción
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { paqueteId, tipo, descripcion, rubroAfectado, horarioInicio, horarioFin, activos } = body

        if (!paqueteId || !tipo || !descripcion) {
            return NextResponse.json(
                { error: 'paqueteId, tipo y descripcion son requeridos' },
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

        const [restriccion] = await db
            .insert(paquetesRestricciones)
            .values({
                id: `rst_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                paqueteId,
                tipoRestriccion: tipo,
                descripcion,
                rubroAfectado: rubroAfectado || null,
                horarioInicio: horarioInicio || null,
                horarioFin: horarioFin || null,
                activos: activos !== false
            })
            .returning()

        return NextResponse.json(restriccion, { status: 201 })
    } catch (error) {
        console.error('[Paquetes Restricciones API] POST error:', error)
        return NextResponse.json(
            { error: 'Error al crear restricción' },
            { status: 500 }
        )
    }
}

// PUT /api/paquetes/restricciones - Actualizar restricción
export async function PUT(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { id, activos, descripcion, rubroAfectado } = body

        if (!id) {
            return NextResponse.json(
                { error: 'id es requerido' },
                { status: 400 }
            )
        }

        const [existente] = await db
            .select()
            .from(paquetesRestricciones)
            .where(eq(paquetesRestricciones.id, id))
            .limit(1)

        if (!existente) {
            return NextResponse.json(
                { error: 'Restricción no encontrada' },
                { status: 404 }
            )
        }

        const updateData: Record<string, any> = {}
        if (activos !== undefined) updateData.activos = activos
        if (descripcion) updateData.descripcion = descripcion
        if (rubroAfectado !== undefined) updateData.rubroAfectado = rubroAfectado

        const [restriccion] = await db
            .update(paquetesRestricciones)
            .set(updateData)
            .where(eq(paquetesRestricciones.id, id))
            .returning()

        return NextResponse.json(restriccion)
    } catch (error) {
        console.error('[Paquetes Restricciones API] PUT error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar restricción' },
            { status: 500 }
        )
    }
}

// DELETE /api/paquetes/restricciones - Eliminar restricción
export async function DELETE(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'id es requerido' },
                { status: 400 }
            )
        }

        await db
            .delete(paquetesRestricciones)
            .where(eq(paquetesRestricciones.id, id))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Paquetes Restricciones API] DELETE error:', error)
        return NextResponse.json(
            { error: 'Error al eliminar restricción' },
            { status: 500 }
        )
    }
}
