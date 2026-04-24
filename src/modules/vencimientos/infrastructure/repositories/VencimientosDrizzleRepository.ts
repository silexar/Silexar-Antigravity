/**
 * REPOSITORY: VENCIMIENTO DRIZZLE REPOSITORY
 * 
 * @description Implementación del repositorio usando Drizzle ORM.
 * Versión simplificada que trabaja directamente con tipos del schema.
 * 
 * @version 1.3.0
 */

import { getDB } from '@/lib/db'
import { vencimientosAuspicio, alertasVencimiento } from '@/lib/db/vencimientos-schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

// Tipos inferidos del schema de Drizzle
type VencimientoRow = InferSelectModel<typeof vencimientosAuspicio>
type AlertaRow = InferSelectModel<typeof alertasVencimiento>

/**
 * Tipo para acciones data según está definido en el schema
 */
type AccionItem = {
    tipo: string
    descripcion: string
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA'
}

/**
 * Destinatario en alertas
 */
type DestinatarioItem = {
    id: string
    nombre: string
    email: string
    tipo: string
}

/**
 * Tipo simple para vencimientos auspicio (sin dependencias de dominio)
 */
export interface VencimientoAuspicioDTO {
    id: string
    codigo: string
    programaId: string
    programaNombre: string
    clienteId: string
    clienteNombre: string
    contratoId: string | null
    contratoCodigo: string | null
    tipo: string
    fechaInicio: Date
    fechaVencimiento: Date
    nivel: string
    estado: string
    diasRestantes: number
    horasCountdown: number | null
    valorContrato: number
    montoPagado: number
    montoPendiente: number
    accionesData: AccionItem[]
    notificacion48hEnviada: boolean | null
    notificacion7diasEnviada: boolean | null
    alertaTraficoEnviada: boolean | null
    alertaTraficoFinalEnviada: boolean | null
    ejecutivoId: string | null
    ejecutivoNombre: string | null
    notas: string | null
    createdAt: Date
    updatedAt: Date
    version: number
    tenantId: string
}

/**
 * Tipo simple para alerta (sin dependencias de dominio)
 */
export interface AlertaVencimientoDTO {
    id: string
    codigo: string
    vencimientosId: string
    tipo: string
    prioridad: string
    titulo: string
    mensaje: string
    datosAdicionales: unknown
    estado: string
    leida: boolean | null
    leidaAt: Date | null
    leidaPor: string | null
    destinatariosData: DestinatarioItem[]
    createdAt: Date
    updatedAt: Date
    tenantId: string
}

function mapDrizzleToVencimiento(row: VencimientoRow): VencimientoAuspicioDTO {
    return {
        id: row.id,
        codigo: row.codigo,
        programaId: row.programaId,
        programaNombre: row.programaNombre,
        clienteId: row.clienteId,
        clienteNombre: row.clienteNombre,
        contratoId: row.contratoId ?? null,
        contratoCodigo: row.contratoCodigo ?? null,
        tipo: row.tipo,
        fechaInicio: new Date(row.fechaInicio),
        fechaVencimiento: new Date(row.fechaVencimiento),
        nivel: row.nivel,
        estado: row.estado,
        diasRestantes: row.diasRestantes || 0,
        horasCountdown: row.horasCountdown,
        valorContrato: Number(row.valorContrato) || 0,
        montoPagado: Number(row.montoPagado) || 0,
        montoPendiente: Number(row.montoPendiente) || 0,
        accionesData: (row.accionesData as AccionItem[]) || [],
        notificacion48hEnviada: row.notificacion48hEnviada ?? null,
        notificacion7diasEnviada: row.notificacion7diasEnviada ?? null,
        alertaTraficoEnviada: row.alertaTraficoEnviada ?? null,
        alertaTraficoFinalEnviada: row.alertaTraficoFinalEnviada ?? null,
        ejecutivoId: row.ejecutivoId,
        ejecutivoNombre: row.ejecutivoNombre,
        notas: row.notas,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        version: row.version,
        tenantId: row.tenantId,
    }
}

function mapDrizzleToAlerta(row: AlertaRow): AlertaVencimientoDTO {
    return {
        id: row.id,
        codigo: row.codigo,
        vencimientosId: row.vencimientosId,
        tipo: row.tipo,
        prioridad: row.prioridad,
        titulo: row.titulo,
        mensaje: row.mensaje,
        datosAdicionales: row.datosAdicionales,
        estado: row.estado,
        leida: row.leida,
        leidaAt: row.leidaAt,
        leidaPor: row.leidaPor,
        destinatariosData: (row.destinatariosData as DestinatarioItem[]) || [],
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        tenantId: row.tenantId,
    }
}

export interface IVencimientoRepository {
    saveVencimiento(vencimientos: VencimientoAuspicioDTO): Promise<void>
    findVencimientoById(id: string): Promise<VencimientoAuspicioDTO | null>
    findVencimientoByCupo(cupoId: string): Promise<VencimientoAuspicioDTO | null>
    findVencimientosProximos(dias: number): Promise<VencimientoAuspicioDTO[]>
    findVencimientosNoIniciados(): Promise<VencimientoAuspicioDTO[]>
    findVencimientosCountdown(): Promise<VencimientoAuspicioDTO[]>
    findVencimientosTerminanManana(): Promise<VencimientoAuspicioDTO[]>
    findVencimientosTerminanHoy(): Promise<VencimientoAuspicioDTO[]>
    saveAlerta(alerta: AlertaVencimientoDTO): Promise<void>
    findAlertasByDestinatario(destinatarioId: string): Promise<AlertaVencimientoDTO[]>
    findAlertasByEmisora(emisoraId: string): Promise<AlertaVencimientoDTO[]>
    findAlertasPendientes(): Promise<AlertaVencimientoDTO[]>
}

export class VencimientoDrizzleRepository implements IVencimientoRepository {
    // ─── Vencimientos ─────────────────────────────────────────────────────────

    async saveVencimiento(vencimientos: VencimientoAuspicioDTO): Promise<void> {
        try {
            const db = getDB()

            await db.insert(vencimientosAuspicio).values({
                id: vencimientos.id,
                codigo: vencimientos.codigo,
                programaId: vencimientos.programaId,
                programaNombre: vencimientos.programaNombre,
                clienteId: vencimientos.clienteId,
                clienteNombre: vencimientos.clienteNombre,
                contratoId: vencimientos.contratoId,
                contratoCodigo: vencimientos.contratoCodigo,
                tipo: vencimientos.tipo,
                fechaInicio: vencimientos.fechaInicio.toISOString().split('T')[0],
                fechaVencimiento: vencimientos.fechaVencimiento.toISOString().split('T')[0],
                nivel: vencimientos.nivel,
                estado: vencimientos.estado,
                diasRestantes: vencimientos.diasRestantes,
                horasCountdown: vencimientos.horasCountdown,
                valorContrato: vencimientos.valorContrato.toString(),
                montoPagado: vencimientos.montoPagado.toString(),
                montoPendiente: vencimientos.montoPendiente.toString(),
                accionesData: vencimientos.accionesData,
                notificacion48hEnviada: vencimientos.notificacion48hEnviada ?? false,
                notificacion7diasEnviada: vencimientos.notificacion7diasEnviada ?? false,
                alertaTraficoEnviada: vencimientos.alertaTraficoEnviada ?? false,
                alertaTraficoFinalEnviada: vencimientos.alertaTraficoFinalEnviada ?? false,
                ejecutivoId: vencimientos.ejecutivoId,
                ejecutivoNombre: vencimientos.ejecutivoNombre,
                notas: vencimientos.notas,
                version: vencimientos.version,
                tenantId: vencimientos.tenantId || 'default',
            }).onConflictDoUpdate({
                target: vencimientosAuspicio.id,
                set: {
                    nivel: vencimientos.nivel,
                    estado: vencimientos.estado,
                    diasRestantes: vencimientos.diasRestantes,
                    accionesData: vencimientos.accionesData,
                    updatedAt: new Date(),
                    version: vencimientos.version + 1,
                },
            })
        } catch (error) {
            console.error('[VencimientoRepository] saveVencimiento error:', error)
            throw error
        }
    }

    async findVencimientoById(id: string): Promise<VencimientoAuspicioDTO | null> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(eq(vencimientosAuspicio.id, id))
                .limit(1)

            if (result.length === 0) return null
            return mapDrizzleToVencimiento(result[0])
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientoById error:', error)
            return null
        }
    }

    async findVencimientoByCupo(cupoId: string): Promise<VencimientoAuspicioDTO | null> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(eq(vencimientosAuspicio.programaId, cupoId))
                .limit(1)

            if (result.length === 0) return null
            return mapDrizzleToVencimiento(result[0])
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientoByCupo error:', error)
            return null
        }
    }

    async findVencimientosProximos(dias: number): Promise<VencimientoAuspicioDTO[]> {
        try {
            const db = getDB()
            const fechaLimite = new Date()
            fechaLimite.setDate(fechaLimite.getDate() + dias)
            const hoy = new Date().toISOString().split('T')[0]
            const fechaLimiteStr = fechaLimite.toISOString().split('T')[0]

            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(
                    and(
                        gte(vencimientosAuspicio.fechaVencimiento, hoy),
                        lte(vencimientosAuspicio.fechaVencimiento, fechaLimiteStr),
                        eq(vencimientosAuspicio.estado, 'ACTIVO')
                    )
                )
                .orderBy(vencimientosAuspicio.fechaVencimiento)

            return result.map(mapDrizzleToVencimiento)
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientosProximos error:', error)
            return []
        }
    }

    async findVencimientosNoIniciados(): Promise<VencimientoAuspicioDTO[]> {
        try {
            const db = getDB()
            const hoy = new Date().toISOString().split('T')[0]

            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(
                    and(
                        lte(vencimientosAuspicio.fechaInicio, hoy),
                        eq(vencimientosAuspicio.estado, 'ACTIVO')
                    )
                )
                .orderBy(vencimientosAuspicio.fechaInicio)

            return result.map(mapDrizzleToVencimiento).filter(v => v.fechaVencimiento > new Date())
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientosNoIniciados error:', error)
            return []
        }
    }

    async findVencimientosCountdown(): Promise<VencimientoAuspicioDTO[]> {
        try {
            const db = getDB()
            const manana = new Date()
            manana.setDate(manana.getDate() + 1)
            const hoy = new Date().toISOString().split('T')[0]
            const mananaStr = manana.toISOString().split('T')[0]

            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(
                    and(
                        gte(vencimientosAuspicio.fechaVencimiento, hoy),
                        lte(vencimientosAuspicio.fechaVencimiento, mananaStr),
                        eq(vencimientosAuspicio.estado, 'ACTIVO')
                    )
                )
                .orderBy(vencimientosAuspicio.fechaVencimiento)

            return result.map(mapDrizzleToVencimiento)
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientosCountdown error:', error)
            return []
        }
    }

    async findVencimientosTerminanManana(): Promise<VencimientoAuspicioDTO[]> {
        try {
            const db = getDB()
            const manana = new Date()
            manana.setDate(manana.getDate() + 1)
            manana.setHours(23, 59, 59, 999)

            const pasadoManana = new Date()
            pasadoManana.setDate(pasadoManana.getDate() + 2)
            pasadoManana.setHours(0, 0, 0, 0)

            const mananaStr = manana.toISOString().split('T')[0]
            const pasadoMananaStr = pasadoManana.toISOString().split('T')[0]

            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(
                    and(
                        gte(vencimientosAuspicio.fechaVencimiento, mananaStr),
                        lte(vencimientosAuspicio.fechaVencimiento, pasadoMananaStr),
                        eq(vencimientosAuspicio.estado, 'ACTIVO')
                    )
                )
                .orderBy(vencimientosAuspicio.fechaVencimiento)

            return result.map(mapDrizzleToVencimiento)
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientosTerminanManana error:', error)
            return []
        }
    }

    async findVencimientosTerminanHoy(): Promise<VencimientoAuspicioDTO[]> {
        try {
            const db = getDB()
            const manana = new Date()
            manana.setDate(manana.getDate() + 1)
            manana.setHours(0, 0, 0, 0)

            const hoyStr = new Date().toISOString().split('T')[0]
            const mananaStr = manana.toISOString().split('T')[0]

            const result = await db.select()
                .from(vencimientosAuspicio)
                .where(
                    and(
                        gte(vencimientosAuspicio.fechaVencimiento, hoyStr),
                        lte(vencimientosAuspicio.fechaVencimiento, mananaStr),
                        eq(vencimientosAuspicio.estado, 'ACTIVO')
                    )
                )
                .orderBy(vencimientosAuspicio.fechaVencimiento)

            return result.map(mapDrizzleToVencimiento)
        } catch (error) {
            console.error('[VencimientoRepository] findVencimientosTerminanHoy error:', error)
            return []
        }
    }

    // ─── Alertas ─────────────────────────────────────────────────────────────

    async saveAlerta(alerta: AlertaVencimientoDTO): Promise<void> {
        try {
            const db = getDB()

            await db.insert(alertasVencimiento).values({
                id: alerta.id,
                codigo: alerta.codigo,
                vencimientosId: alerta.vencimientosId,
                tipo: alerta.tipo,
                prioridad: alerta.prioridad,
                titulo: alerta.titulo,
                mensaje: alerta.mensaje,
                datosAdicionales: alerta.datosAdicionales as object,
                estado: alerta.estado,
                leida: alerta.leida,
                destinatariosData: alerta.destinatariosData,
                tenantId: alerta.tenantId || 'default',
            }).onConflictDoUpdate({
                target: alertasVencimiento.id,
                set: {
                    estado: alerta.estado,
                    leida: alerta.leida,
                    updatedAt: new Date(),
                },
            })
        } catch (error) {
            console.error('[VencimientoRepository] saveAlerta error:', error)
            throw error
        }
    }

    async findAlertasByDestinatario(destinatarioId: string): Promise<AlertaVencimientoDTO[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(alertasVencimiento)
                .where(eq(alertasVencimiento.estado, 'PENDIENTE'))
                .orderBy(desc(alertasVencimiento.createdAt))

            return result
                .map(mapDrizzleToAlerta)
                .filter(alerta => {
                    return alerta.destinatariosData.some(d => d.id === destinatarioId)
                })
        } catch (error) {
            console.error('[VencimientoRepository] findAlertasByDestinatario error:', error)
            return []
        }
    }

    async findAlertasByEmisora(emisoraId: string): Promise<AlertaVencimientoDTO[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(alertasVencimiento)
                .innerJoin(
                    vencimientosAuspicio,
                    eq(alertasVencimiento.vencimientosId, vencimientosAuspicio.id)
                )
                .where(eq(alertasVencimiento.estado, 'PENDIENTE'))
                .orderBy(desc(alertasVencimiento.createdAt))

            return result.map(row => mapDrizzleToAlerta(row.alertas_vencimientos))
        } catch (error) {
            console.error('[VencimientoRepository] findAlertasByEmisora error:', error)
            return []
        }
    }

    async findAlertasPendientes(): Promise<AlertaVencimientoDTO[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(alertasVencimiento)
                .where(eq(alertasVencimiento.estado, 'PENDIENTE'))
                .orderBy(desc(alertasVencimiento.createdAt))

            return result.map(mapDrizzleToAlerta)
        } catch (error) {
            console.error('[VencimientoRepository] findAlertasPendientes error:', error)
            return []
        }
    }
}

export default VencimientoDrizzleRepository
