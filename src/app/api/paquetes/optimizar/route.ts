/**
 * API ROUTE: /api/paquetes/optimizar
 * 
 * @description Endpoint para aplicar optimización de precio sugerida por IA.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesHistorialPrecio } from '@/lib/db/paquetes-schema'
import { eq, and, isNull } from 'drizzle-orm'

// POST /api/paquetes/optimizar - Aplicar optimización de precio
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { paqueteId, nuevoPrecio, estrategia, confirmado } = body

        if (!paqueteId || !nuevoPrecio) {
            return NextResponse.json(
                { error: 'paqueteId y nuevoPrecio son requeridos' },
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

        // Calcular cambio porcentual
        const cambioPorcentaje = Math.round(
            ((nuevoPrecio - Number(paquete.precioActual)) / Number(paquete.precioActual)) * 100
        )

        // Si el cambio es mayor a 20%, requerir confirmación
        if (Math.abs(cambioPorcentaje) > 20 && !confirmado) {
            return NextResponse.json({
                warning: true,
                message: `Cambio de ${cambioPorcentaje}% requiere confirmación`,
                paqueteId,
                precioActual: Number(paquete.precioActual),
                nuevoPrecio,
                cambioPorcentaje,
                requiereConfirmacion: true
            })
        }

        // Registrar en historial de precios
        const historialId = `hp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        await db.insert(paquetesHistorialPrecio).values({
            id: historialId,
            paqueteId: paqueteId,
            precioBase: Number(paquete.precioBase),
            precioFinal: nuevoPrecio,
            fechaVigencia: new Date().toISOString().split('T')[0],
            creadoPor: 'cortex-ai'
        })

        // Actualizar precio actual del paquete
        await db
            .update(paquetes)
            .set({
                precioActual: nuevoPrecio,
                updatedBy: 'cortex-ai',
                updatedAt: new Date(),
                version: paquete.version + 1
            })
            .where(eq(paquetes.id, paqueteId))

        return NextResponse.json({
            success: true,
            message: `Precio actualizado a $${nuevoPrecio.toLocaleString('es-CL')}`,
            paquete: {
                id: paquete.id,
                codigo: paquete.codigo,
                nombre: paquete.nombre
            },
            precioAnterior: Number(paquete.precioActual),
            precioNuevo: nuevoPrecio,
            cambioPorcentaje,
            estrategia: estrategia || 'MANUAL',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[Paquetes Optimizar API] POST error:', error)
        return NextResponse.json(
            { error: 'Error al optimizar precio' },
            { status: 500 }
        )
    }
}
