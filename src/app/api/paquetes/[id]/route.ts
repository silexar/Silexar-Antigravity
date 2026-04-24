/**
 * API ROUTE: /api/paquetes/[id]
 * 
 * @description Endpoints para operaciones CRUD de un paquete específico.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesHistorialPrecio, paquetesDisponibilidad, paquetesRestricciones } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

// GET /api/paquetes/[id] - Obtener detalle
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const db = getDB()
        const { id } = await params

        const [paquete] = await db
            .select()
            .from(paquetes)
            .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
            .limit(1)

        if (!paquete) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            )
        }

        // Obtener historial de precios
        const historialPrecios = await db
            .select()
            .from(paquetesHistorialPrecio)
            .where(eq(paquetesHistorialPrecio.paqueteId, id))
            .orderBy(desc(paquetesHistorialPrecio.fechaVigencia))
            .limit(10)

        // Obtener disponibilidad reciente
        const disponibilidad = await db
            .select()
            .from(paquetesDisponibilidad)
            .where(eq(paquetesDisponibilidad.paqueteId, id))
            .orderBy(desc(paquetesDisponibilidad.fecha))
            .limit(30)

        // Obtener restricciones
        const restricciones = await db
            .select()
            .from(paquetesRestricciones)
            .where(and(eq(paquetesRestricciones.paqueteId, id), eq(paquetesRestricciones.activos, true)))

        return NextResponse.json({
            ...paquete,
            historialPrecios,
            disponibilidad,
            restricciones
        })
    } catch (error) {
        console.error('[Paquetes API] GET [id] error:', error)
        return NextResponse.json(
            { error: 'Error al obtener paquete' },
            { status: 500 }
        )
    }
}

// PUT /api/paquetes/[id] - Actualizar paquete
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const db = getDB()
        const { id } = await params
        const body = await request.json()

        // Verificar que existe
        const [existente] = await db
            .select()
            .from(paquetes)
            .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
            .limit(1)

        if (!existente) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            )
        }

        // Validaciones
        if (body.nombre !== undefined && body.nombre.trim().length === 0) {
            return NextResponse.json(
                { error: 'Nombre no puede estar vacío' },
                { status: 400 }
            )
        }
        if (body.precioBase !== undefined && body.precioBase <= 0) {
            return NextResponse.json(
                { error: 'Precio base debe ser mayor a 0' },
                { status: 400 }
            )
        }

        // Si cambia precio, registrar en historial
        if (body.precioBase && body.precioBase !== existente.precioBase) {
            await db.insert(paquetesHistorialPrecio).values({
                id: `hp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                paqueteId: id,
                precioBase: existente.precioBase,
                precioFinal: body.precioBase,
                fechaVigencia: new Date().toISOString().split('T')[0],
                creadoPor: body.updatedBy || 'system'
            })
        }

        // Build update object
        const updateData: Record<string, any> = {
            updatedBy: body.updatedBy || 'system',
            updatedAt: new Date(),
            version: existente.version + 1
        }

        if (body.nombre) updateData.nombre = body.nombre
        if (body.descripcion !== undefined) updateData.descripcion = body.descripcion
        if (body.tipo) updateData.tipo = body.tipo
        if (body.estado) updateData.estado = body.estado
        if (body.editoraId) {
            updateData.editoraId = body.editoraId
            updateData.editoraNombre = body.editoraNombre
        }
        if (body.programaId) {
            updateData.programaId = body.programaId
            updateData.programaNombre = body.programaNombre
        }
        if (body.horario) {
            updateData.horarioInicio = body.horario.inicio
            updateData.horarioFin = body.horario.fin
        }
        if (body.diasSemana) updateData.diasSemana = body.diasSemana
        if (body.duraciones) updateData.duraciones = body.duraciones
        if (body.precioBase) {
            updateData.precioBase = body.precioBase
            updateData.precioActual = body.precioActual || body.precioBase
        }
        if (body.nivelExclusividad) updateData.nivelExclusividad = body.nivelExclusividad
        if (body.vigenciaDesde) updateData.vigenciaDesde = body.vigenciaDesde
        if (body.vigenciaHasta) updateData.vigenciaHasta = body.vigenciaHasta

        const [paquete] = await db
            .update(paquetes)
            .set(updateData)
            .where(eq(paquetes.id, id))
            .returning()

        return NextResponse.json(paquete)
    } catch (error) {
        console.error('[Paquetes API] PUT [id] error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar paquete' },
            { status: 500 }
        )
    }
}

// DELETE /api/paquetes/[id] - Soft delete
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const db = getDB()
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const usuario = searchParams.get('usuario') || 'system'

        const [existente] = await db
            .select()
            .from(paquetes)
            .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
            .limit(1)

        if (!existente) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            )
        }

        await db
            .update(paquetes)
            .set({
                estado: 'BORRADO',
                deletedAt: new Date(),
                updatedBy: usuario,
                updatedAt: new Date()
            })
            .where(eq(paquetes.id, id))

        return NextResponse.json({ success: true, message: 'Paquete eliminado' })
    } catch (error) {
        console.error('[Paquetes API] DELETE [id] error:', error)
        return NextResponse.json(
            { error: 'Error al eliminar paquete' },
            { status: 500 }
        )
    }
}
