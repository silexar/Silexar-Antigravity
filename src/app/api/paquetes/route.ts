/**
 * API ROUTE: /api/paquetes
 * 
 * @description CRUD completo para el módulo Paquetes.
 * 
 * @version 1.2.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, or, like, desc, count } from 'drizzle-orm'

// GET /api/paquetes - Listar paquetes
export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        const { searchParams } = new URL(request.url)
        const texto = searchParams.get('texto')
        const tipo = searchParams.get('tipo')
        const estado = searchParams.get('estado')
        const editoraId = searchParams.get('editoraId')
        const pagina = parseInt(searchParams.get('pagina') || '1')
        const limite = parseInt(searchParams.get('limite') || '20')

        // Build conditions
        const conditions = [isNull(paquetes.deletedAt)]

        if (texto) {
            conditions.push(
                or(
                    like(paquetes.nombre, `%${texto}%`),
                    like(paquetes.codigo, `%${texto}%`),
                    like(paquetes.descripcion, `%${texto}%`)
                )!
            )
        }

        if (tipo) conditions.push(eq(paquetes.tipo, tipo))
        if (estado) conditions.push(eq(paquetes.estado, estado))
        if (editoraId) conditions.push(eq(paquetes.editoraId, editoraId))

        // Get total count
        const countResult = await db
            .select({ count: count() })
            .from(paquetes)
            .where(and(...conditions))

        const total = countResult[0]?.count || 0

        // Get items with pagination
        const items = await db
            .select()
            .from(paquetes)
            .where(and(...conditions))
            .orderBy(desc(paquetes.createdAt))
            .limit(limite)
            .offset((pagina - 1) * limite)

        return NextResponse.json({
            total,
            pagina,
            limite,
            items: items.map(p => ({
                id: p.id,
                codigo: p.codigo,
                nombre: p.nombre,
                descripcion: p.descripcion,
                tipo: p.tipo,
                estado: p.estado,
                editora: { id: p.editoraId, nombre: p.editoraNombre },
                programa: { id: p.programaId, nombre: p.programaNombre },
                horario: { inicio: p.horarioInicio, fin: p.horarioFin },
                diasSemana: p.diasSemana,
                duraciones: p.duraciones,
                precioBase: p.precioBase,
                precioActual: p.precioActual,
                nivelExclusividad: p.nivelExclusividad,
                vigencia: { desde: p.vigenciaDesde, hasta: p.vigenciaHasta }
            }))
        })
    } catch (error) {
        console.error('[Paquetes API] GET error:', error)
        return NextResponse.json(
            { error: 'Error al obtener paquetes' },
            { status: 500 }
        )
    }
}

// POST /api/paquetes - Crear paquete
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()

        // Validaciones
        if (!body.nombre) {
            return NextResponse.json(
                { error: 'Nombre es requerido' },
                { status: 400 }
            )
        }
        if (!body.tipo) {
            return NextResponse.json(
                { error: 'Tipo es requerido' },
                { status: 400 }
            )
        }
        if (!body.editoraId || !body.programaId) {
            return NextResponse.json(
                { error: 'Editora y programa son requeridos' },
                { status: 400 }
            )
        }
        if (!body.precioBase || body.precioBase <= 0) {
            return NextResponse.json(
                { error: 'Precio base debe ser mayor a 0' },
                { status: 400 }
            )
        }

        // Generar código único
        const year = new Date().getFullYear()
        const secuencia = Math.floor(10000 + Math.random() * 90000)
        const codigo = `PAQ-${year}-${secuencia}`

        // Verificar que el código no existe
        const existente = await db
            .select()
            .from(paquetes)
            .where(eq(paquetes.codigo, codigo))
            .limit(1)

        if (existente.length > 0) {
            return NextResponse.json(
                { error: 'Código duplicado, intentar nuevamente' },
                { status: 409 }
            )
        }

        const ahora = new Date()
        const id = `paq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

        const [nuevoPaquete] = await db
            .insert(paquetes)
            .values({
                id,
                codigo,
                nombre: body.nombre,
                descripcion: body.descripcion || '',
                tipo: body.tipo,
                estado: body.estado || 'ACTIVO',
                editoraId: body.editoraId,
                editoraNombre: body.editoraNombre || 'Editora',
                programaId: body.programaId,
                programaNombre: body.programaNombre || 'Programa',
                horarioInicio: body.horario?.inicio || '07:00',
                horarioFin: body.horario?.fin || '09:00',
                diasSemana: body.diasSemana || ['L', 'M', 'M', 'J', 'V'],
                duraciones: body.duraciones || [15, 30],
                precioBase: body.precioBase,
                precioActual: body.precioActual || body.precioBase,
                nivelExclusividad: body.nivelExclusividad || 'COMPARTIDO',
                vigenciaDesde: body.vigenciaDesde || ahora.toISOString().split('T')[0],
                vigenciaHasta: body.vigenciaHasta || new Date(ahora.getFullYear() + 1, 0, 1).toISOString().split('T')[0],
                createdBy: body.createdBy || 'system',
                updatedBy: body.updatedBy || 'system'
            })
            .returning()

        return NextResponse.json(nuevoPaquete, { status: 201 })
    } catch (error) {
        console.error('[Paquetes API] POST error:', error)
        return NextResponse.json(
            { error: 'Error al crear paquete' },
            { status: 500 }
        )
    }
}
