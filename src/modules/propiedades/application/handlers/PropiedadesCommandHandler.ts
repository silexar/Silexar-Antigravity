/**
 * Propiedades Command Handler
 *
 * Orchestrates all state-changing operations for the Propiedades module.
 * Follows CLAUDE.md handler pattern:
 *   1. Validate command → 2. Check business rules → 3. Persist → 4. Audit
 *
 * Consumers (API routes) should instantiate this with real Drizzle repositories:
 *
 *   const handler = new PropiedadesCommandHandler(
 *     new TipoPropiedadDrizzleRepository(ctx.tenantId),
 *     new ValorPropiedadDrizzleRepository(ctx.tenantId),
 *   )
 */

import { TipoPropiedad, CrearTipoPropiedadProps } from '../../domain/entities/TipoPropiedad'
import { ValorPropiedad } from '../../domain/entities/ValorPropiedad'
import {
  ITipoPropiedadRepository,
  IValorPropiedadRepository,
} from '../../domain/repositories/IRepositories'
import { CodigoPropiedad } from '../../domain/value-objects/TiposBase'
import { logger } from '@/lib/observability'

// ─── Command Shapes ───────────────────────────────────────────────────────────

export interface CrearTipoPropiedadDTO {
  codigo: CodigoPropiedad
  props: CrearTipoPropiedadProps
}

export interface ActualizarTipoPropiedadDTO {
  id: string
  props: Partial<CrearTipoPropiedadProps>
}

export interface CrearValorPropiedadDTO {
  tipoPropiedadId: string
  codigoRef: string
  etiqueta: string
  valor: string
  orden?: number
}

export interface ActualizarValorPropiedadDTO {
  id: string
  etiqueta?: string
  valor?: string
  orden?: number
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export class PropiedadesCommandHandler {
  constructor(
    private readonly tipoRepo: ITipoPropiedadRepository,
    private readonly valorRepo: IValorPropiedadRepository,
  ) {}

  // ── Tipos de Propiedad ────────────────────────────────────────────────────

  async crearTipoPropiedad(dto: CrearTipoPropiedadDTO): Promise<TipoPropiedad> {
    const { codigo, props } = dto

    // Business rule: código must be unique in this tenant
    const existente = await this.tipoRepo.findByCodigo(codigo)
    if (existente) {
      throw new Error(`El código de propiedad "${codigo}" ya está en uso.`)
    }

    const entidad = TipoPropiedad.create(codigo, props)
    await this.tipoRepo.save(entidad)

    logger.info(`PropiedadesHandler: tipo propiedad created — id: ${entidad.id}, codigo: ${String(codigo)}`)
    return entidad
  }

  async actualizarTipoPropiedad(dto: ActualizarTipoPropiedadDTO): Promise<TipoPropiedad> {
    const { id, props } = dto

    const existente = await this.tipoRepo.findById(id)
    if (!existente) {
      throw new Error(`Tipo de propiedad con id "${id}" no encontrado.`)
    }

    existente.update(props)
    await this.tipoRepo.update(existente)

    logger.info(`PropiedadesHandler: tipo propiedad updated — id: ${id}`)
    return existente
  }

  async eliminarTipoPropiedad(id: string): Promise<void> {
    const existente = await this.tipoRepo.findById(id)
    if (!existente) {
      throw new Error(`Tipo de propiedad con id "${id}" no encontrado.`)
    }

    // Cascade: remove all values first to maintain referential integrity
    await this.valorRepo.deleteByTipoPropiedadId(id)
    await this.tipoRepo.delete(id)

    logger.info(`PropiedadesHandler: tipo propiedad deleted — id: ${id}`)
  }

  // ── Valores de Propiedad ──────────────────────────────────────────────────

  async crearValorPropiedad(dto: CrearValorPropiedadDTO): Promise<ValorPropiedad> {
    const { tipoPropiedadId, codigoRef, etiqueta, valor, orden = 0 } = dto

    // Verify parent type exists
    const tipo = await this.tipoRepo.findById(tipoPropiedadId)
    if (!tipo) {
      throw new Error(`Tipo de propiedad "${tipoPropiedadId}" no encontrado.`)
    }

    // Business rule: codigoRef must be unique per tipo
    const existente = await this.valorRepo.findByTipoAndCodigoRef(tipoPropiedadId, codigoRef)
    if (existente) {
      throw new Error(`El código de referencia "${codigoRef}" ya existe en este tipo de propiedad.`)
    }

    const entidad = ValorPropiedad.create(tipoPropiedadId, { codigoRef, descripcion: etiqueta, descripcionLarga: valor, orden, obligatorio: false })
    await this.valorRepo.save(entidad)

    logger.info(`PropiedadesHandler: valor propiedad created — id: ${entidad.id}, tipoPropiedadId: ${tipoPropiedadId}`)
    return entidad
  }

  async actualizarValorPropiedad(dto: ActualizarValorPropiedadDTO): Promise<ValorPropiedad> {
    const { id, ...changes } = dto

    const existente = await this.valorRepo.findById(id)
    if (!existente) {
      throw new Error(`Valor de propiedad con id "${id}" no encontrado.`)
    }

    if (changes.etiqueta !== undefined) existente.updateEtiqueta(changes.etiqueta)
    if (changes.valor !== undefined) existente.updateValor(changes.valor)
    if (changes.orden !== undefined) existente.updateOrden(changes.orden)

    await this.valorRepo.update(existente)

    logger.info(`PropiedadesHandler: valor propiedad updated — id: ${id}`)
    return existente
  }

  async eliminarValorPropiedad(id: string): Promise<void> {
    const existente = await this.valorRepo.findById(id)
    if (!existente) {
      throw new Error(`Valor de propiedad con id "${id}" no encontrado.`)
    }

    await this.valorRepo.delete(id)
    logger.info(`PropiedadesHandler: valor propiedad deleted — id: ${id}`)
  }
}
