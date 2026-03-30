/**
 * ValorPropiedad entity unit tests
 * Coverage target: 95% (domain entities — CLAUDE.md requirement)
 */

import { describe, it, expect } from 'vitest'
import { ValorPropiedad } from '../../../modules/propiedades/domain/entities/ValorPropiedad'
import { EstadoPropiedad } from '../../../modules/propiedades/domain/value-objects/TiposBase'

const TIPO_ID = 'tipo-001'

// ─── create() ────────────────────────────────────────────────────────────────

describe('ValorPropiedad.create()', () => {
  it('should create a valid valor with defaults', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Radio comercial',
      descripcionLarga: 'Radio orientada a publicidad comercial',
    })

    expect(valor.id).toBeDefined()
    expect(valor.tipoPropiedadId).toBe(TIPO_ID)
    expect(valor.codigoRef).toBe('VAL-001')
    expect(valor.descripcion).toBe('Radio comercial')
    expect(valor.descripcionLarga).toBe('Radio orientada a publicidad comercial')
    expect(valor.estado).toBe(EstadoPropiedad.ACTIVO)
    expect(valor.obligatorio).toBe(false)
    expect(valor.orden).toBe(0)
    expect(valor.creadoEn).toBeInstanceOf(Date)
    expect(valor.actualizadoEn).toBeInstanceOf(Date)
  })

  it('should apply provided obligatorio and orden', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-002',
      descripcion: 'Formato obligatorio',
      obligatorio: true,
      orden: 5,
    })

    expect(valor.obligatorio).toBe(true)
    expect(valor.orden).toBe(5)
  })

  it('should allow null descripcionLarga', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-003',
      descripcion: 'Sin descripcion larga',
    })
    expect(valor.descripcionLarga).toBeNull()
  })

  it('should generate unique IDs', () => {
    const a = ValorPropiedad.create(TIPO_ID, { codigoRef: 'A', descripcion: 'Valor A' })
    const b = ValorPropiedad.create(TIPO_ID, { codigoRef: 'B', descripcion: 'Valor B' })
    expect(a.id).not.toBe(b.id)
  })

  it('should throw when codigoRef is empty', () => {
    expect(() =>
      ValorPropiedad.create(TIPO_ID, { codigoRef: '', descripcion: 'Test' })
    ).toThrow()
  })

  it('should throw when descripcion is too short', () => {
    expect(() =>
      ValorPropiedad.create(TIPO_ID, { codigoRef: 'X', descripcion: 'X' })
    ).toThrow()
  })
})

// ─── reconstitute() ──────────────────────────────────────────────────────────

describe('ValorPropiedad.reconstitute()', () => {
  const raw = {
    id: 'val-001',
    tipoPropiedadId: TIPO_ID,
    codigoRef: 'VAL-001',
    etiqueta: 'Radio comercial',       // maps to descripcion in entity
    valor: 'Descripción extendida',    // maps to descripcionLarga
    estado: EstadoPropiedad.ACTIVO,
    orden: 3,
    obligatorio: true,
    creadoEn: new Date('2025-01-01'),
    actualizadoEn: new Date('2025-06-01'),
  }

  it('should reconstitute from DB row correctly', () => {
    const valor = ValorPropiedad.reconstitute(raw)

    expect(valor.id).toBe('val-001')
    expect(valor.tipoPropiedadId).toBe(TIPO_ID)
    expect(valor.codigoRef).toBe('VAL-001')
    expect(valor.descripcion).toBe('Radio comercial')
    expect(valor.descripcionLarga).toBe('Descripción extendida')
    expect(valor.estado).toBe(EstadoPropiedad.ACTIVO)
    expect(valor.orden).toBe(3)
    expect(valor.obligatorio).toBe(true)
  })

  it('should default obligatorio to false when not provided', () => {
    const valor = ValorPropiedad.reconstitute({ ...raw, obligatorio: undefined })
    expect(valor.obligatorio).toBe(false)
  })

  it('should default descripcionLarga to null when valor is null/undefined', () => {
    const valor = ValorPropiedad.reconstitute({ ...raw, valor: null })
    expect(valor.descripcionLarga).toBeNull()
  })
})

// ─── actualizarDescripcion() ──────────────────────────────────────────────────

describe('ValorPropiedad.actualizarDescripcion()', () => {
  it('should update descripcion', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Descripcion original',
    })
    const before = valor.actualizadoEn.getTime()

    valor.actualizarDescripcion('Descripcion actualizada')

    expect(valor.descripcion).toBe('Descripcion actualizada')
    expect(valor.actualizadoEn.getTime()).toBeGreaterThanOrEqual(before)
  })

  it('should update descripcionLarga when provided', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Descripcion',
    })

    valor.actualizarDescripcion('Nueva descripcion', 'Detalle extendido')

    expect(valor.descripcionLarga).toBe('Detalle extendido')
  })

  it('should set descripcionLarga to null when empty string passed', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Descripcion',
      descripcionLarga: 'Original',
    })

    valor.actualizarDescripcion('Nueva descripcion', '')

    expect(valor.descripcionLarga).toBeNull()
  })

  it('should throw when descripcion is empty', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Descripcion',
    })
    expect(() => valor.actualizarDescripcion('')).toThrow('Descripción inválida')
  })
})

// ─── updateEtiqueta / updateValor / updateOrden ────────────────────────────────

describe('ValorPropiedad update methods (used by PropiedadesCommandHandler)', () => {
  it('updateEtiqueta delegates to actualizarDescripcion', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Original',
    })
    valor.updateEtiqueta('Nueva etiqueta')
    expect(valor.descripcion).toBe('Nueva etiqueta')
  })

  it('updateValor sets descripcionLarga directly', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Test valor',
    })
    valor.updateValor('Valor extendido')
    expect(valor.descripcionLarga).toBe('Valor extendido')
  })

  it('updateOrden sets the orden field', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Test orden',
      orden: 0,
    })
    valor.updateOrden(10)
    expect(valor.orden).toBe(10)
  })

  it('each update method bumps actualizadoEn', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Test timestamps',
    })
    const t0 = valor.actualizadoEn.getTime()

    valor.updateOrden(5)
    expect(valor.actualizadoEn.getTime()).toBeGreaterThanOrEqual(t0)

    const t1 = valor.actualizadoEn.getTime()
    valor.updateValor('nuevo valor')
    expect(valor.actualizadoEn.getTime()).toBeGreaterThanOrEqual(t1)
  })
})

// ─── cambiarEstado() ──────────────────────────────────────────────────────────

describe('ValorPropiedad.cambiarEstado()', () => {
  it('should change estado and reflect in estaActivo', () => {
    const valor = ValorPropiedad.create(TIPO_ID, {
      codigoRef: 'VAL-001',
      descripcion: 'Test estado',
    })

    expect(valor.estaActivo).toBe(true)

    valor.cambiarEstado(EstadoPropiedad.INACTIVO)
    expect(valor.estado).toBe(EstadoPropiedad.INACTIVO)
    expect(valor.estaActivo).toBe(false)
  })
})
