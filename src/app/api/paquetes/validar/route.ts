/**
 * API ROUTE: /api/paquetes/validar
 * 
 * @description Endpoints para validación de paquetes en contratos y campañas.
 * Integración con módulos Contratos y Campañas.
 * 
 * @version 1.1.0 - Using Drizzle ORM
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesRestricciones, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull } from 'drizzle-orm'

// POST /api/paquetes/validar - Validar paquete para contrato/campaña
export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        const body = await request.json()
        const { paqueteId, tipo, cliente, rubro, fecha, cantidad } = body

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
            return NextResponse.json({
                valido: false,
                mensaje: 'Paquete no encontrado',
                codigo: 'PAQUETE_NO_ENCONTRADO'
            })
        }

        // Validar estado
        if (paquete.estado !== 'ACTIVO') {
            return NextResponse.json({
                valido: false,
                mensaje: `Paquete en estado ${paquete.estado}`,
                codigo: 'ESTADO_INVALIDO'
            })
        }

        // Validar vigencia
        const ahora = new Date()
        if (ahora < new Date(paquete.vigenciaDesde) || ahora > new Date(paquete.vigenciaHasta)) {
            return NextResponse.json({
                valido: false,
                mensaje: 'Paquete fuera de vigencia',
                codigo: 'FUERA_VIGENCIA'
            })
        }

        // Validar restricciones si hay cliente/rubro
        if (cliente || rubro) {
            const restricciones = await db
                .select()
                .from(paquetesRestricciones)
                .where(and(eq(paquetesRestricciones.paqueteId, paqueteId), eq(paquetesRestricciones.activos, true)))

            for (const r of restricciones) {
                // Validar restricción de industria
                if (r.tipoRestriccion === 'INDUSTRIA' && rubro) {
                    if (r.rubroAfectado?.toLowerCase() === rubro.toLowerCase()) {
                        return NextResponse.json({
                            valido: false,
                            mensaje: `Rubro "${rubro}" excluido por restricción: ${r.descripcion}`,
                            codigo: 'RUBRO_EXCLUIDO',
                            restriccion: r.id
                        })
                    }
                }

                // Validar restricción de competencia
                if (r.tipoRestriccion === 'COMPETENCIA' && cliente) {
                    if (r.descripcion.toLowerCase().includes(cliente.toLowerCase())) {
                        return NextResponse.json({
                            valido: false,
                            mensaje: `Cliente "${cliente}" excluido por restricción`,
                            codigo: 'CLIENTE_EXCLUIDO',
                            restriccion: r.id
                        })
                    }
                }

                // Validar restricción horaria
                if (r.tipoRestriccion === 'HORARIO' && fecha) {
                    const fechaDate = new Date(fecha)
                    const hora = fechaDate.toTimeString().slice(0, 5)
                    const diaSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'][fechaDate.getDay()]

                    if (r.horarioInicio && r.horarioFin) {
                        if (hora >= r.horarioInicio && hora <= r.horarioFin) {
                            return NextResponse.json({
                                valido: false,
                                mensaje: `Horario ${hora} restringido: ${r.descripcion}`,
                                codigo: 'HORARIO_RESTRINGIDO',
                                restriccion: r.id
                            })
                        }
                    }
                }
            }
        }

        // Validar disponibilidad si hay cantidad y fecha
        if (cantidad && fecha) {
            const [disponibilidad] = await db
                .select()
                .from(paquetesDisponibilidad)
                .where(and(
                    eq(paquetesDisponibilidad.paqueteId, paqueteId),
                    eq(paquetesDisponibilidad.fecha, new Date(fecha).toISOString().split('T')[0])
                ))
                .limit(1)

            if (disponibilidad) {
                const disponibles = Number(disponibilidad.cuposTotales) - Number(disponibilidad.cuposOcupados)
                if (cantidad > disponibles) {
                    return NextResponse.json({
                        valido: true,
                        mensaje: `Solo ${disponibles} cupos disponibles para la fecha`,
                        codigo: 'DISPONIBILIDAD_LIMITADA',
                        cuposDisponibles: disponibles
                    })
                }
            }
        }

        // Todo válido
        return NextResponse.json({
            valido: true,
            mensaje: 'Paquete disponible para venta',
            paquete: {
                id: paquete.id,
                codigo: paquete.codigo,
                nombre: paquete.nombre,
                tipo: paquete.tipo,
                precioActual: Number(paquete.precioActual),
                nivelExclusividad: paquete.nivelExclusividad
            }
        })
    } catch (error) {
        console.error('[Paquetes Validar API] POST error:', error)
        return NextResponse.json(
            { error: 'Error al validar paquete' },
            { status: 500 }
        )
    }
}
