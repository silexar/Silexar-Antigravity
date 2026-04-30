/**
 * REPOSITORY: TARIFARIO DRIZZLE REPOSITORY
 *
 * @description Implementación de ITarifarioRepository usando Drizzle ORM.
 * @version 1.0.0
 */

import { getDB } from '@/lib/db'
import { configuracionTarifa, tandasComerciales, senalesEspeciales } from '@/lib/db/vencimientos-schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

import { TarifarioPrograma, type TarifarioProgramaProps, type PaqueteDescuento } from '../../domain/entities/TarifarioPrograma.js'
import { TandaComercial, type TandaComercialProps, type TarifaDuracion } from '../../domain/entities/TandaComercial.js'
import { ConfiguracionTarifa, type ConfiguracionTarifaProps, type PrecioConfiguracion } from '../../domain/entities/ConfiguracionTarifa.js'
import { SenalEspecial, type SenalEspecialProps } from '../../domain/entities/SenalEspecial.js'
import { ValorComercial } from '../../domain/value-objects/ValorComercial.js'
import { DuracionSegundos } from '../../domain/value-objects/DuracionSegundos.js'
import { FactorTarifa } from '../../domain/value-objects/FactorTarifa.js'
import type { ITarifarioRepository } from '../../domain/repositories/ITarifarioRepository.js'

// ── Mapeo ConfiguracionTarifa (schema) ↔ ConfiguracionTarifa (domain) ──

type ConfigRow = InferSelectModel<typeof configuracionTarifa>

function mapConfigRowToEntity(row: ConfigRow): ConfiguracionTarifa {
  const precios: PrecioConfiguracion[] = []
  if (row.precioBase) {
    const duraciones = [5, 10, 15, 20, 30, 45, 60]
    duraciones.forEach(d => {
      try {
        const dur = DuracionSegundos.create(d)
        precios.push({
          duracion: dur.valor,
          precioBase: dur.calcularPrecio(Number(row.precioBase)),
          precioConAjuste: Math.round(dur.calcularPrecio(Number(row.precioBase)) * Number(row.factorTemporada || 1)),
        })
      } catch { /* skip invalid */ }
    })
  }

  const props: ConfiguracionTarifaProps = {
    id: row.id,
    emisoraId: '', // No disponible en esta tabla; se infiere desde aplicación
    emisoraNombre: '',
    nombre: `${row.tipoAuspicio} — ${row.programaId}`,
    descripcion: '',
    precios,
    factorHorarioAM: Number(row.factorTemporada || 1),
    factorHorarioPM: Number(row.factorRating || 1),
    factorRepartida: Number(row.factorOcupacion || 1),
    factorNoche: 1.0,
    ajusteIPC: false,
    porcentajeIPC: 0,
    vigenciaDesde: row.vigenciaDesde ? new Date(row.vigenciaDesde) : new Date(),
    vigenciaHasta: row.vigenciaHasta ? new Date(row.vigenciaHasta) : new Date(),
    estado: row.activo ? 'vigente' : 'vencida',
    fechaCreacion: row.createdAt ? new Date(row.createdAt) : new Date(),
    fechaActualizacion: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    version: row.version ?? 1,
  }

  return ConfiguracionTarifa.fromPersistence(props)
}

// ── Mapeo TandasComerciales (schema) ↔ TandaComercial (domain) ──

type TandaRow = InferSelectModel<typeof tandasComerciales>

function mapTandaRowToEntity(row: TandaRow): TandaComercial {
  const tarifas: TarifaDuracion[] = []
  if (row.tarifasData) {
    try {
      const parsed = JSON.parse(row.tarifasData) as Array<{ duracionSegundos: number; precio: number }>
      parsed.forEach(t => {
        try {
          const dur = DuracionSegundos.create(t.duracionSegundos)
          tarifas.push({ duracionSegundos: dur.valor, precio: t.precio })
        } catch { /* skip */ }
      })
    } catch { /* empty */ }
  }

  const props: TandaComercialProps = {
    id: row.id,
    emisoraId: row.emisoraId ?? '',
    emisoraNombre: '',
    tipo: (row.nombre?.toLowerCase().includes('prime') ? 'prime_pm' : 'repartida') as TandaComercialProps['tipo'],
    nombre: row.nombre ?? '',
    horaInicio: row.horaInicio ?? '',
    horaFin: row.horaFin ?? '',
    factorMultiplicador: Number(row.factorMultiplicador) || 1,
    audienciaPromedio: row.audienciaPromedio ?? 0,
    ratingPromedio: Number(row.ratingPromedio) || 0,
    tarifasPorDuracion: tarifas,
    estado: row.activo ? 'activa' : 'inactiva',
    fechaCreacion: row.createdAt ? new Date(row.createdAt) : new Date(),
    fechaActualizacion: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    version: 1,
  }

  return TandaComercial.fromPersistence(props)
}

function mapTandaEntityToRow(tanda: TandaComercial): Omit<TandaRow, 'createdAt' | 'updatedAt'> {
  const snap = tanda.toSnapshot()
  return {
    id: snap.id,
    tenantId: 'default',
    emisoraId: snap.emisoraId,
    nombre: snap.nombre,
    horaInicio: snap.horaInicio,
    horaFin: snap.horaFin,
    factorMultiplicador: snap.factorMultiplicador.toString(),
    audienciaPromedio: snap.audienciaPromedio,
    ratingPromedio: snap.ratingPromedio.toString(),
    tarifasData: JSON.stringify(snap.tarifasPorDuracion.map(t => ({ duracionSegundos: t.duracionSegundos, precio: t.precio }))),
    activo: snap.estado === 'activa',
  }
}

// ── Mapeo SenalesEspeciales (schema) ↔ SenalEspecial (domain) ──

type SenalRow = InferSelectModel<typeof senalesEspeciales>

function mapSenalRowToEntity(row: SenalRow): SenalEspecial {
  const props: SenalEspecialProps = {
    id: row.id,
    emisoraId: row.emisoraId ?? '',
    tipo: (row.tipo as SenalEspecialProps['tipo']) || 'temperatura',
    nombre: row.nombre ?? '',
    descripcion: row.formato ?? '',
    formato: row.formato ?? '',
    horarios: row.horarios ? JSON.parse(row.horarios) : [],
    duracionSegundos: row.duracionSegundos ?? 15,
    frecuenciaDiaria: 1,
    precioMensual: Number(row.precioMensual) || 0,
    cuposMaximos: row.exclusividad ?? 1,
    cuposOcupados: row.anuncianteId ? 1 : 0,
    exclusividad: (row.exclusividad ?? 1) === 1,
    clienteActualId: row.anuncianteId ?? undefined,
    clienteActualNombre: undefined,
    estado: (row.estado as SenalEspecialProps['estado']) || 'disponible',
    fechaCreacion: row.createdAt ? new Date(row.createdAt) : new Date(),
    fechaActualizacion: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    version: 1,
  }
  return SenalEspecial.fromPersistence(props)
}

function mapSenalEntityToRow(senal: SenalEspecial): Omit<SenalRow, 'createdAt' | 'updatedAt'> {
  const snap = senal.toSnapshot()
  return {
    id: snap.id,
    tenantId: 'default',
    emisoraId: snap.emisoraId,
    tipo: snap.tipo,
    nombre: snap.nombre,
    horarios: JSON.stringify(snap.horarios),
    duracionSegundos: snap.duracionSegundos,
    formato: snap.formato,
    precioMensual: snap.precioMensual.toString(),
    exclusividad: snap.exclusividad ? 1 : snap.cuposMaximos,
    estado: snap.estado,
    anuncianteId: snap.clienteActualId ?? null,
  }
}

// ── TarifarioPrograma helpers ──

function buildTarifarioFromRows(rows: ConfigRow[], programaId: string): TarifarioPrograma | null {
  if (rows.length === 0) return null

  const tipoA = rows.find(r => r.tipoAuspicio === 'tipo_a')
  const tipoB = rows.find(r => r.tipoAuspicio === 'tipo_b')
  const mencion = rows.find(r => r.tipoAuspicio === 'solo_menciones')

  const precioA = ValorComercial.sinDescuento(Number(tipoA?.precioBase) || 0, 'CLP')
  const precioB = ValorComercial.sinDescuento(Number(tipoB?.precioBase) || 0, 'CLP')
  const precioM = ValorComercial.sinDescuento(Number(mencion?.precioBase) || 0, 'CLP')

  const factores: FactorTarifa[] = []
  rows.forEach(r => {
    if (r.factorTemporada && Number(r.factorTemporada) !== 1) {
      try { factores.push(FactorTarifa.create({ valor: Number(r.factorTemporada), descripcion: 'Factor temporada', motivo: 'temporada_alta', vigenciaDesde: new Date(), vigenciaHasta: new Date(), aplicaAutomaticamente: true })) } catch { /* */ }
    }
    if (r.factorRating && Number(r.factorRating) !== 1) {
      try { factores.push(FactorTarifa.create({ valor: Number(r.factorRating), descripcion: 'Factor rating', motivo: 'rating', vigenciaDesde: new Date(), vigenciaHasta: new Date(), aplicaAutomaticamente: true })) } catch { /* */ }
    }
  })

  const vigente = rows.find(r => r.activo) || rows[0]

  const props: TarifarioProgramaProps = {
    id: `tar_${programaId}`,
    programaId,
    programaNombre: '',
    emisoraId: '',
    precioBaseTipoA: precioA,
    precioBaseTipoB: precioB,
    precioBaseMencion: precioM,
    factoresActivos: factores,
    paquetesDescuento: [],
    vigenciaDesde: vigente?.vigenciaDesde ? new Date(vigente.vigenciaDesde) : new Date(),
    vigenciaHasta: vigente?.vigenciaHasta ? new Date(vigente.vigenciaHasta) : new Date(),
    revisionAutomatica: 'mensual',
    ajusteInflacion: false,
    porcentajeInflacion: 0,
    fechaCreacion: vigente?.createdAt ? new Date(vigente.createdAt) : new Date(),
    fechaActualizacion: vigente?.updatedAt ? new Date(vigente.updatedAt) : new Date(),
    creadoPor: '',
    actualizadoPor: '',
    version: 1,
  }

  return TarifarioPrograma.fromPersistence(props)
}

// ── Repository Implementation ──

export class TarifarioDrizzleRepository implements ITarifarioRepository {

  // ── Tarifario por programa ──

  async saveTarifario(tarifario: TarifarioPrograma): Promise<void> {
    try {
      const db = getDB()
      const snap = tarifario.toSnapshot()

      const tipos: Array<{ key: 'tipo_a' | 'tipo_b' | 'solo_menciones'; valor: ValorComercial }> = [
        { key: 'tipo_a', valor: snap.precioBaseTipoA },
        { key: 'tipo_b', valor: snap.precioBaseTipoB },
        { key: 'solo_menciones', valor: snap.precioBaseMencion },
      ]

      for (const t of tipos) {
        const factor = snap.factoresActivos.find(f => f.estaVigente())?.valor ?? 1
        await db.insert(configuracionTarifa).values({
          id: `${snap.id}_${t.key}`,
          tenantId: 'default',
          programaId: snap.programaId,
          tipoAuspicio: t.key,
          precioBase: t.valor.valorFinal.toString(),
          factorTemporada: factor.toString(),
          factorRating: '1.00',
          factorOcupacion: '1.00',
          descuentoClienteNuevo: '0.00',
          descuentoRenovacion: '0.00',
          vigenciaDesde: snap.vigenciaDesde.toISOString().split('T')[0] as unknown as Date,
          vigenciaHasta: snap.vigenciaHasta.toISOString().split('T')[0] as unknown as Date,
          activo: true,
        }).onConflictDoUpdate({
          target: configuracionTarifa.id,
          set: {
            precioBase: t.valor.valorFinal.toString(),
            factorTemporada: factor.toString(),
            updatedAt: new Date(),
          },
        })
      }
    } catch (error) {
      console.error('[TarifarioRepository] saveTarifario error:', error)
      throw error
    }
  }

  async findTarifarioByPrograma(programaId: string): Promise<TarifarioPrograma | null> {
    try {
      const db = getDB()
      const result = await db.select().from(configuracionTarifa)
        .where(eq(configuracionTarifa.programaId, programaId))
      return buildTarifarioFromRows(result, programaId)
    } catch (error) {
      console.error('[TarifarioRepository] findTarifarioByPrograma error:', error)
      return null
    }
  }

  async findTarifarioVigente(programaId: string): Promise<TarifarioPrograma | null> {
    try {
      const db = getDB()
      const hoy = new Date().toISOString().split('T')[0]
      const result = await db.select().from(configuracionTarifa)
        .where(
          and(
            eq(configuracionTarifa.programaId, programaId),
            eq(configuracionTarifa.activo, true),
            lte(configuracionTarifa.vigenciaDesde, hoy as unknown as Date),
            gte(configuracionTarifa.vigenciaHasta, hoy as unknown as Date)
          )
        )
      return buildTarifarioFromRows(result, programaId)
    } catch (error) {
      console.error('[TarifarioRepository] findTarifarioVigente error:', error)
      return null
    }
  }

  // ── Tandas comerciales ──

  async saveTanda(tanda: TandaComercial): Promise<void> {
    try {
      const db = getDB()
      const row = mapTandaEntityToRow(tanda)
      await db.insert(tandasComerciales).values(row as TandaRow).onConflictDoUpdate({
        target: tandasComerciales.id,
        set: {
          nombre: row.nombre,
          horaInicio: row.horaInicio,
          horaFin: row.horaFin,
          factorMultiplicador: row.factorMultiplicador,
          tarifasData: row.tarifasData,
          activo: row.activo,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('[TarifarioRepository] saveTanda error:', error)
      throw error
    }
  }

  async findTandasByEmisora(emisoraId: string): Promise<TandaComercial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(tandasComerciales)
        .where(eq(tandasComerciales.emisoraId, emisoraId))
        .orderBy(tandasComerciales.horaInicio)
      return result.map(mapTandaRowToEntity)
    } catch (error) {
      console.error('[TarifarioRepository] findTandasByEmisora error:', error)
      return []
    }
  }

  // ── Configuración global de tarifas ──

  async saveConfiguracion(config: ConfiguracionTarifa): Promise<void> {
    try {
      const db = getDB()
      const snap = config.toSnapshot()
      await db.insert(configuracionTarifa).values({
        id: snap.id,
        tenantId: 'default',
        programaId: snap.id, // Usamos id como programaId para configs globales
        tipoAuspicio: 'global',
        precioBase: snap.precios[0]?.precioBase.toString() ?? '0',
        factorTemporada: snap.factorHorarioAM.toString(),
        factorRating: snap.factorHorarioPM.toString(),
        factorOcupacion: snap.factorRepartida.toString(),
        descuentoClienteNuevo: '0.00',
        descuentoRenovacion: '0.00',
        vigenciaDesde: snap.vigenciaDesde.toISOString().split('T')[0] as unknown as Date,
        vigenciaHasta: snap.vigenciaHasta.toISOString().split('T')[0] as unknown as Date,
        activo: snap.estado === 'vigente',
      }).onConflictDoUpdate({
        target: configuracionTarifa.id,
        set: {
          precioBase: snap.precios[0]?.precioBase.toString() ?? '0',
          factorTemporada: snap.factorHorarioAM.toString(),
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('[TarifarioRepository] saveConfiguracion error:', error)
      throw error
    }
  }

  async findConfiguracionVigente(emisoraId: string): Promise<ConfiguracionTarifa | null> {
    try {
      const db = getDB()
      const hoy = new Date().toISOString().split('T')[0]
      const result = await db.select().from(configuracionTarifa)
        .where(
          and(
            eq(configuracionTarifa.activo, true),
            lte(configuracionTarifa.vigenciaDesde, hoy as unknown as Date),
            gte(configuracionTarifa.vigenciaHasta, hoy as unknown as Date)
          )
        )
        .limit(1)
      return result.length ? mapConfigRowToEntity(result[0]) : null
    } catch (error) {
      console.error('[TarifarioRepository] findConfiguracionVigente error:', error)
      return null
    }
  }

  async findAllConfiguraciones(emisoraId: string): Promise<ConfiguracionTarifa[]> {
    try {
      const db = getDB()
      const result = await db.select().from(configuracionTarifa)
        .orderBy(desc(configuracionTarifa.createdAt))
      return result.map(mapConfigRowToEntity)
    } catch (error) {
      console.error('[TarifarioRepository] findAllConfiguraciones error:', error)
      return []
    }
  }

  // ── Señales especiales ──

  async saveSenal(senal: SenalEspecial): Promise<void> {
    try {
      const db = getDB()
      const row = mapSenalEntityToRow(senal)
      await db.insert(senalesEspeciales).values(row as SenalRow).onConflictDoUpdate({
        target: senalesEspeciales.id,
        set: {
          nombre: row.nombre,
          horarios: row.horarios,
          precioMensual: row.precioMensual,
          exclusividad: row.exclusividad,
          estado: row.estado,
          anuncianteId: row.anuncianteId,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('[TarifarioRepository] saveSenal error:', error)
      throw error
    }
  }

  async findSenalesByEmisora(emisoraId: string): Promise<SenalEspecial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(senalesEspeciales)
        .where(eq(senalesEspeciales.emisoraId, emisoraId))
        .orderBy(senalesEspeciales.nombre)
      return result.map(mapSenalRowToEntity)
    } catch (error) {
      console.error('[TarifarioRepository] findSenalesByEmisora error:', error)
      return []
    }
  }

  async findSenalesDisponibles(emisoraId: string): Promise<SenalEspecial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(senalesEspeciales)
        .where(
          and(
            eq(senalesEspeciales.emisoraId, emisoraId),
            eq(senalesEspeciales.estado, 'disponible')
          )
        )
        .orderBy(senalesEspeciales.nombre)
      return result.map(mapSenalRowToEntity)
    } catch (error) {
      console.error('[TarifarioRepository] findSenalesDisponibles error:', error)
      return []
    }
  }
}

export default TarifarioDrizzleRepository
