/**
 * TipoPropiedad entity unit tests
 * Coverage target: 95% (domain entities — CLAUDE.md requirement)
 *
 * CodigoPropiedad format: PROP-YYYY-XXXXX (enforced by CodigoPropiedadSchema)
 * TipoClasificacion values: CAMPANA, CONTRATO, CLIENTE, FACTURA, REPORTE
 */

import { describe, it, expect } from 'vitest'
import { TipoPropiedad } from '../../../modules/propiedades/domain/entities/TipoPropiedad'
import {
  EstadoPropiedad,
  TipoClasificacion,
  TipoValidacion,
} from '../../../modules/propiedades/domain/value-objects/TiposBase'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_CODIGO = 'PROP-2025-CAMPANA' as const // matches /^PROP-\d{4}-.+$/

const validProps = {
  nombre: 'Tipo de Campaña',
  descripcion: 'Clasifica el tipo de campaña publicitaria',
  aplicacion: [TipoClasificacion.CAMPANA] as TipoClasificacion[],
  tipoValidacion: TipoValidacion.LISTA_UNICA,
}

// ─── create() ────────────────────────────────────────────────────────────────

describe('TipoPropiedad.create()', () => {
  it('should create a valid TipoPropiedad with correct defaults', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)

    expect(tipo.id).toBeDefined()
    expect(tipo.codigo).toBe(VALID_CODIGO)
    expect(tipo.nombre).toBe('Tipo de Campaña')
    expect(tipo.estado).toBe(EstadoPropiedad.ACTIVO)
    expect(tipo.aplicacion).toContain(TipoClasificacion.CAMPANA)
    expect(tipo.tipoValidacion).toBe(TipoValidacion.LISTA_UNICA)
    expect(tipo.creadoEn).toBeInstanceOf(Date)
    expect(tipo.actualizadoEn).toBeInstanceOf(Date)
  })

  it('should set configuracionValidacion defaults when not provided', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    const config = tipo.configuracionValidacion

    expect(config.obligatorio).toBe(false)
    expect(config.valorUnico).toBe(false)
    expect(config.validarCoherencia).toBe(true)
    expect(config.detectarConflictos).toBe(false)
    expect(config.aprobacionSupervision).toBe(false)
  })

  it('should generate unique IDs for each instance', () => {
    const a = TipoPropiedad.create(VALID_CODIGO, validProps)
    const b = TipoPropiedad.create('PROP-2025-CONTRATO', { ...validProps, aplicacion: [TipoClasificacion.CONTRATO] })
    expect(a.id).not.toBe(b.id)
  })

  it('should throw when nombre is too short (< 3 chars)', () => {
    expect(() =>
      TipoPropiedad.create(VALID_CODIGO, { ...validProps, nombre: 'AB' })
    ).toThrow()
  })

  it('should throw when aplicacion array is empty', () => {
    expect(() =>
      TipoPropiedad.create(VALID_CODIGO, { ...validProps, aplicacion: [] })
    ).toThrow()
  })

  it('should throw when codigo format is invalid', () => {
    expect(() =>
      TipoPropiedad.create('INVALID_CODE' as never, validProps)
    ).toThrow()
  })
})

// ─── reconstitute() ──────────────────────────────────────────────────────────

describe('TipoPropiedad.reconstitute()', () => {
  const raw = {
    id: 'abc-123',
    codigo: VALID_CODIGO,
    nombre: 'Tipo de Campaña',
    descripcion: null,
    estado: EstadoPropiedad.ACTIVO,
    aplicacion: [TipoClasificacion.CAMPANA],
    tipoValidacion: TipoValidacion.LISTA_UNICA,
    configuracionValidacion: {
      obligatorio: false,
      valorUnico: false,
      validarCoherencia: true,
      detectarConflictos: false,
      aprobacionSupervision: false,
    },
    creadoEn: new Date('2025-01-01'),
    actualizadoEn: new Date('2025-06-01'),
  }

  it('should reconstitute without triggering domain validation', () => {
    const tipo = TipoPropiedad.reconstitute(raw)

    expect(tipo.id).toBe('abc-123')
    expect(tipo.codigo).toBe(VALID_CODIGO)
    expect(tipo.nombre).toBe('Tipo de Campaña')
    expect(tipo.descripcion).toBeNull()
    expect(tipo.estado).toBe(EstadoPropiedad.ACTIVO)
    expect(tipo.creadoEn.toISOString()).toBe('2025-01-01T00:00:00.000Z')
    expect(tipo.actualizadoEn.toISOString()).toBe('2025-06-01T00:00:00.000Z')
  })

  it('should preserve the aplicacion array exactly', () => {
    const tipo = TipoPropiedad.reconstitute(raw)
    expect(tipo.aplicacion).toEqual([TipoClasificacion.CAMPANA])
  })
})

// ─── update() ────────────────────────────────────────────────────────────────

describe('TipoPropiedad.update()', () => {
  it('should update nombre and bump actualizadoEn', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    const before = tipo.actualizadoEn.getTime()

    tipo.update({ nombre: 'Nombre Actualizado' })

    expect(tipo.nombre).toBe('Nombre Actualizado')
    expect(tipo.actualizadoEn.getTime()).toBeGreaterThanOrEqual(before)
  })

  it('should update aplicacion', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.update({ aplicacion: [TipoClasificacion.CONTRATO, TipoClasificacion.FACTURA] })
    expect(tipo.aplicacion).toContain(TipoClasificacion.CONTRATO)
    expect(tipo.aplicacion).toContain(TipoClasificacion.FACTURA)
  })

  it('should update tipoValidacion', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.update({ tipoValidacion: TipoValidacion.LISTA_MULTIPLE })
    expect(tipo.tipoValidacion).toBe(TipoValidacion.LISTA_MULTIPLE)
  })

  it('should update configuracionValidacion partially (merge)', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.update({ configuracionValidacion: { obligatorio: true } })
    expect(tipo.configuracionValidacion.obligatorio).toBe(true)
    // Other fields should be preserved
    expect(tipo.configuracionValidacion.validarCoherencia).toBe(true)
  })

  it('should not change unchanged fields when partial update applied', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.update({ nombre: 'Solo nombre' })
    expect(tipo.tipoValidacion).toBe(TipoValidacion.LISTA_UNICA)
    expect(tipo.aplicacion).toContain(TipoClasificacion.CAMPANA)
  })
})

// ─── cambiarEstado() ──────────────────────────────────────────────────────────

describe('TipoPropiedad.cambiarEstado()', () => {
  it('should change to INACTIVO', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.cambiarEstado(EstadoPropiedad.INACTIVO)
    expect(tipo.estado).toBe(EstadoPropiedad.INACTIVO)
    expect(tipo.estaActivo).toBe(false)
  })

  it('should change to DEPRECADO', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.cambiarEstado(EstadoPropiedad.DEPRECADO)
    expect(tipo.estado).toBe(EstadoPropiedad.DEPRECADO)
  })

  it('estaActivo returns true for ACTIVO estado', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    expect(tipo.estaActivo).toBe(true)
  })
})

// ─── agregarAplicacion / removerAplicacion ───────────────────────────────────

describe('TipoPropiedad aplicacion management', () => {
  it('agregarAplicacion adds a new classification', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.agregarAplicacion(TipoClasificacion.CONTRATO)
    expect(tipo.aplicacion).toContain(TipoClasificacion.CONTRATO)
    expect(tipo.aplicacion).toContain(TipoClasificacion.CAMPANA)
  })

  it('agregarAplicacion is idempotent (no duplicates on re-add)', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    tipo.agregarAplicacion(TipoClasificacion.CAMPANA) // already there
    const count = tipo.aplicacion.filter(a => a === TipoClasificacion.CAMPANA).length
    expect(count).toBe(1)
  })

  it('removerAplicacion removes an existing classification', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, {
      ...validProps,
      aplicacion: [TipoClasificacion.CAMPANA, TipoClasificacion.CONTRATO],
    })
    tipo.removerAplicacion(TipoClasificacion.CONTRATO)
    expect(tipo.aplicacion).not.toContain(TipoClasificacion.CONTRATO)
    expect(tipo.aplicacion).toContain(TipoClasificacion.CAMPANA)
  })

  it('removerAplicacion throws when it would leave zero classifications', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, {
      ...validProps,
      aplicacion: [TipoClasificacion.CAMPANA],
    })
    expect(() => tipo.removerAplicacion(TipoClasificacion.CAMPANA)).toThrow(
      'El tipo de propiedad debe aplicar al menos a una clasificación'
    )
  })
})

// ─── aplicacion getter returns copy (immutability) ────────────────────────────

describe('TipoPropiedad.aplicacion immutability', () => {
  it('should return a copy — mutating it does not affect the entity', () => {
    const tipo = TipoPropiedad.create(VALID_CODIGO, validProps)
    const copy = tipo.aplicacion
    copy.push(TipoClasificacion.REPORTE) // mutate the returned array
    expect(tipo.aplicacion).toHaveLength(1) // entity not affected
  })
})
