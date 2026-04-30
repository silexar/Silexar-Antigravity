/**
 * REPOSITORY: VENCIMIENTOS DRIZZLE REPOSITORY
 *
 * @description Implementación del repositorio usando Drizzle ORM.
 * @version 2.0.0 — Actualizado a nuevo schema con alertas_programador
 */

import { getDB } from '@/lib/db'
import { vencimientosAuspicio, alertasProgramador } from '@/lib/db/vencimientos-schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

// Tipos inferidos del schema de Drizzle
type VencimientosRow = InferSelectModel<typeof vencimientosAuspicio>
type AlertaRow = InferSelectModel<typeof alertasProgramador>

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
 * Tipo simple para vencimientos auspicio (sin dependencias de dominio)
 */
export interface VencimientosAuspicioDTO {
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
  fechaVencimientos: Date
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
 * Tipo simple para alerta de programador (sin dependencias de dominio)
 */
export interface AlertaProgramadorDTO {
  id: string
  emisoraId: string
  programaId: string
  programaNombre: string
  cupoComercialId: string
  clienteNombre: string
  tipo: string
  titulo: string
  mensaje: string
  prioridad: string
  destinatarioId: string
  destinatarioNombre: string
  canalesNotificacion: string[]
  estadoConfirmacion: string
  comentarioConfirmacion: string | null
  leida: boolean
  fechaLectura: Date | null
  fechaExpiracion: Date | null
  createdAt: Date
  updatedAt: Date
  version: number
  tenantId: string
}

function mapDrizzleToVencimientos(row: VencimientosRow): VencimientosAuspicioDTO {
  return {
    id: row.id,
    codigo: row.codigo,
    programaId: row.programaId,
    programaNombre: row.programaNombre ?? '',
    clienteId: row.clienteId,
    clienteNombre: row.clienteNombre,
    contratoId: row.contratoId ?? null,
    contratoCodigo: row.contratoCodigo ?? null,
    tipo: row.tipo,
    fechaInicio: new Date(row.fechaInicio),
    fechaVencimientos: new Date(row.fechaVencimientos),
    nivel: row.nivel,
    estado: row.estado,
    diasRestantes: row.diasRestantes ?? 0,
    horasCountdown: row.horasCountdown,
    valorContrato: Number(row.valorContrato) || 0,
    montoPagado: Number(row.montoPagado) || 0,
    montoPendiente: Number(row.montoPendiente) || 0,
    accionesData: row.accionesData ? JSON.parse(row.accionesData) as AccionItem[] : [],
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

function mapDrizzleToAlerta(row: AlertaRow): AlertaProgramadorDTO {
  return {
    id: row.id,
    emisoraId: row.emisoraId,
    programaId: row.programaId,
    programaNombre: row.programaNombre ?? '',
    cupoComercialId: row.cupoComercialId,
    clienteNombre: row.clienteNombre,
    tipo: row.tipo,
    titulo: row.titulo,
    mensaje: row.mensaje,
    prioridad: row.prioridad,
    destinatarioId: row.destinatarioId,
    destinatarioNombre: row.destinatarioNombre ?? '',
    canalesNotificacion: row.canalesNotificacion ? JSON.parse(row.canalesNotificacion) as string[] : [],
    estadoConfirmacion: row.estadoConfirmacion ?? 'pendiente',
    comentarioConfirmacion: row.comentarioConfirmacion ?? null,
    leida: row.leida ?? false,
    fechaLectura: row.fechaLectura ? new Date(row.fechaLectura) : null,
    fechaExpiracion: row.fechaExpiracion ? new Date(row.fechaExpiracion) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    version: row.version,
    tenantId: row.tenantId,
  }
}

export interface IVencimientosRepository {
  saveVencimientos(vencimientos: VencimientosAuspicioDTO): Promise<void>
  findVencimientosById(id: string): Promise<VencimientosAuspicioDTO | null>
  findVencimientosByCupo(cupoId: string): Promise<VencimientosAuspicioDTO | null>
  findVencimientosProximos(dias: number): Promise<VencimientosAuspicioDTO[]>
  findVencimientosNoIniciados(): Promise<VencimientosAuspicioDTO[]>
  findVencimientosCountdown(): Promise<VencimientosAuspicioDTO[]>
  findVencimientosTerminanManana(): Promise<VencimientosAuspicioDTO[]>
  findVencimientosTerminanHoy(): Promise<VencimientosAuspicioDTO[]>
  saveAlerta(alerta: AlertaProgramadorDTO): Promise<void>
  findAlertasByDestinatario(destinatarioId: string): Promise<AlertaProgramadorDTO[]>
  findAlertasByEmisora(emisoraId: string): Promise<AlertaProgramadorDTO[]>
  findAlertasPendientes(): Promise<AlertaProgramadorDTO[]>
}

export class VencimientosDrizzleRepository implements IVencimientosRepository {
  // ─── Vencimientos ─────────────────────────────────────────────────────────

  async saveVencimientos(vencimientos: VencimientosAuspicioDTO): Promise<void> {
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
        fechaInicio: vencimientos.fechaInicio.toISOString().split('T')[0] as unknown as Date,
        fechaVencimientos: vencimientos.fechaVencimientos.toISOString().split('T')[0] as unknown as Date,
        nivel: vencimientos.nivel,
        estado: vencimientos.estado,
        diasRestantes: vencimientos.diasRestantes,
        horasCountdown: vencimientos.horasCountdown,
        valorContrato: vencimientos.valorContrato.toString(),
        montoPagado: vencimientos.montoPagado.toString(),
        montoPendiente: vencimientos.montoPendiente.toString(),
        accionesData: JSON.stringify(vencimientos.accionesData),
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
          accionesData: JSON.stringify(vencimientos.accionesData),
          updatedAt: new Date(),
          version: vencimientos.version + 1,
        },
      })
    } catch (error) {
      console.error('[VencimientosRepository] saveVencimientos error:', error)
      throw error
    }
  }

  async findVencimientosById(id: string): Promise<VencimientosAuspicioDTO | null> {
    try {
      const db = getDB()
      const result = await db.select()
        .from(vencimientosAuspicio)
        .where(eq(vencimientosAuspicio.id, id))
        .limit(1)

      if (result.length === 0) return null
      return mapDrizzleToVencimientos(result[0])
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosById error:', error)
      return null
    }
  }

  async findVencimientosByCupo(cupoId: string): Promise<VencimientosAuspicioDTO | null> {
    try {
      const db = getDB()
      const result = await db.select()
        .from(vencimientosAuspicio)
        .where(eq(vencimientosAuspicio.programaId, cupoId))
        .limit(1)

      if (result.length === 0) return null
      return mapDrizzleToVencimientos(result[0])
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosByCupo error:', error)
      return null
    }
  }

  async findVencimientosProximos(dias: number): Promise<VencimientosAuspicioDTO[]> {
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
            gte(vencimientosAuspicio.fechaVencimientos, hoy as unknown as Date),
            lte(vencimientosAuspicio.fechaVencimientos, fechaLimiteStr as unknown as Date),
            eq(vencimientosAuspicio.estado, 'ACTIVO')
          )
        )
        .orderBy(vencimientosAuspicio.fechaVencimientos)

      return result.map(mapDrizzleToVencimientos)
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosProximos error:', error)
      return []
    }
  }

  async findVencimientosNoIniciados(): Promise<VencimientosAuspicioDTO[]> {
    try {
      const db = getDB()
      const hoy = new Date().toISOString().split('T')[0]

      const result = await db.select()
        .from(vencimientosAuspicio)
        .where(
          and(
            lte(vencimientosAuspicio.fechaInicio, hoy as unknown as Date),
            eq(vencimientosAuspicio.estado, 'ACTIVO')
          )
        )
        .orderBy(vencimientosAuspicio.fechaInicio)

      return result.map(mapDrizzleToVencimientos).filter(v => v.fechaVencimientos > new Date())
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosNoIniciados error:', error)
      return []
    }
  }

  async findVencimientosCountdown(): Promise<VencimientosAuspicioDTO[]> {
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
            gte(vencimientosAuspicio.fechaVencimientos, hoy as unknown as Date),
            lte(vencimientosAuspicio.fechaVencimientos, mananaStr as unknown as Date),
            eq(vencimientosAuspicio.estado, 'ACTIVO')
          )
        )
        .orderBy(vencimientosAuspicio.fechaVencimientos)

      return result.map(mapDrizzleToVencimientos)
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosCountdown error:', error)
      return []
    }
  }

  async findVencimientosTerminanManana(): Promise<VencimientosAuspicioDTO[]> {
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
            gte(vencimientosAuspicio.fechaVencimientos, mananaStr as unknown as Date),
            lte(vencimientosAuspicio.fechaVencimientos, pasadoMananaStr as unknown as Date),
            eq(vencimientosAuspicio.estado, 'ACTIVO')
          )
        )
        .orderBy(vencimientosAuspicio.fechaVencimientos)

      return result.map(mapDrizzleToVencimientos)
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosTerminanManana error:', error)
      return []
    }
  }

  async findVencimientosTerminanHoy(): Promise<VencimientosAuspicioDTO[]> {
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
            gte(vencimientosAuspicio.fechaVencimientos, hoyStr as unknown as Date),
            lte(vencimientosAuspicio.fechaVencimientos, mananaStr as unknown as Date),
            eq(vencimientosAuspicio.estado, 'ACTIVO')
          )
        )
        .orderBy(vencimientosAuspicio.fechaVencimientos)

      return result.map(mapDrizzleToVencimientos)
    } catch (error) {
      console.error('[VencimientosRepository] findVencimientosTerminanHoy error:', error)
      return []
    }
  }

  // ─── Alertas Programador ──────────────────────────────────────────────────

  async saveAlerta(alerta: AlertaProgramadorDTO): Promise<void> {
    try {
      const db = getDB()

      await db.insert(alertasProgramador).values({
        id: alerta.id,
        tenantId: alerta.tenantId || 'default',
        emisoraId: alerta.emisoraId,
        programaId: alerta.programaId,
        programaNombre: alerta.programaNombre,
        cupoComercialId: alerta.cupoComercialId,
        clienteNombre: alerta.clienteNombre,
        tipo: alerta.tipo,
        titulo: alerta.titulo,
        mensaje: alerta.mensaje,
        prioridad: alerta.prioridad,
        destinatarioId: alerta.destinatarioId,
        destinatarioNombre: alerta.destinatarioNombre,
        canalesNotificacion: JSON.stringify(alerta.canalesNotificacion),
        estadoConfirmacion: alerta.estadoConfirmacion,
        comentarioConfirmacion: alerta.comentarioConfirmacion,
        leida: alerta.leida,
        fechaLectura: alerta.fechaLectura,
        fechaExpiracion: alerta.fechaExpiracion,
        version: alerta.version,
      }).onConflictDoUpdate({
        target: alertasProgramador.id,
        set: {
          estadoConfirmacion: alerta.estadoConfirmacion,
          comentarioConfirmacion: alerta.comentarioConfirmacion,
          leida: alerta.leida,
          fechaLectura: alerta.fechaLectura,
          updatedAt: new Date(),
          version: (alerta.version ?? 1) + 1,
        },
      })
    } catch (error) {
      console.error('[VencimientosRepository] saveAlerta error:', error)
      throw error
    }
  }

  async findAlertasByDestinatario(destinatarioId: string): Promise<AlertaProgramadorDTO[]> {
    try {
      const db = getDB()
      const result = await db.select()
        .from(alertasProgramador)
        .where(eq(alertasProgramador.destinatarioId, destinatarioId))
        .orderBy(desc(alertasProgramador.createdAt))

      return result.map(mapDrizzleToAlerta)
    } catch (error) {
      console.error('[VencimientosRepository] findAlertasByDestinatario error:', error)
      return []
    }
  }

  async findAlertasByEmisora(emisoraId: string): Promise<AlertaProgramadorDTO[]> {
    try {
      const db = getDB()
      const result = await db.select()
        .from(alertasProgramador)
        .where(eq(alertasProgramador.emisoraId, emisoraId))
        .orderBy(desc(alertasProgramador.createdAt))

      return result.map(mapDrizzleToAlerta)
    } catch (error) {
      console.error('[VencimientosRepository] findAlertasByEmisora error:', error)
      return []
    }
  }

  async findAlertasPendientes(): Promise<AlertaProgramadorDTO[]> {
    try {
      const db = getDB()
      const result = await db.select()
        .from(alertasProgramador)
        .where(eq(alertasProgramador.estadoConfirmacion, 'pendiente'))
        .orderBy(desc(alertasProgramador.createdAt))

      return result.map(mapDrizzleToAlerta)
    } catch (error) {
      console.error('[VencimientosRepository] findAlertasPendientes error:', error)
      return []
    }
  }
}

export default VencimientosDrizzleRepository
