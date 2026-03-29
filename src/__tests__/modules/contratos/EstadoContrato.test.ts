import { describe, it, expect } from 'vitest'
import { EstadoContrato } from '../../../modules/contratos/domain/value-objects/EstadoContrato.js'

describe('EstadoContrato', () => {
  // ── Factories ──────────────────────────────────────────────────────────────

  describe('static factories', () => {
    it('should create borrador state', () => {
      const estado = EstadoContrato.borrador()
      expect(estado.valor).toBe('borrador')
    })

    it('should create revision state', () => {
      expect(EstadoContrato.revision().valor).toBe('revision')
    })

    it('should create aprobacion state', () => {
      expect(EstadoContrato.aprobacion().valor).toBe('aprobacion')
    })

    it('should create firmado state', () => {
      expect(EstadoContrato.firmado().valor).toBe('firmado')
    })

    it('should create activo state', () => {
      expect(EstadoContrato.activo().valor).toBe('activo')
    })

    it('should create pausado state', () => {
      expect(EstadoContrato.pausado().valor).toBe('pausado')
    })

    it('should create finalizado state', () => {
      expect(EstadoContrato.finalizado().valor).toBe('finalizado')
    })

    it('should create cancelado state', () => {
      expect(EstadoContrato.cancelado().valor).toBe('cancelado')
    })

    it('should create from valid string', () => {
      expect(EstadoContrato.fromString('activo').valor).toBe('activo')
    })

    it('should throw on invalid string', () => {
      expect(() => EstadoContrato.fromString('invalido')).toThrow('Estado de contrato inválido')
    })
  })

  // ── State machine transitions ──────────────────────────────────────────────

  describe('puedeTransicionarA', () => {
    it('borrador can transition to revision', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.revision())).toBe(true)
    })

    it('borrador can transition to cancelado', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.cancelado())).toBe(true)
    })

    it('borrador cannot transition to activo', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.activo())).toBe(false)
    })

    it('borrador cannot transition to firmado', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.firmado())).toBe(false)
    })

    it('revision can go back to borrador', () => {
      expect(EstadoContrato.revision().puedeTransicionarA(EstadoContrato.borrador())).toBe(true)
    })

    it('revision can advance to aprobacion', () => {
      expect(EstadoContrato.revision().puedeTransicionarA(EstadoContrato.aprobacion())).toBe(true)
    })

    it('aprobacion can advance to firmado', () => {
      expect(EstadoContrato.aprobacion().puedeTransicionarA(EstadoContrato.firmado())).toBe(true)
    })

    it('aprobacion can go back to revision', () => {
      expect(EstadoContrato.aprobacion().puedeTransicionarA(EstadoContrato.revision())).toBe(true)
    })

    it('firmado can advance to activo', () => {
      expect(EstadoContrato.firmado().puedeTransicionarA(EstadoContrato.activo())).toBe(true)
    })

    it('firmado cannot go back to borrador', () => {
      expect(EstadoContrato.firmado().puedeTransicionarA(EstadoContrato.borrador())).toBe(false)
    })

    it('activo can transition to pausado', () => {
      expect(EstadoContrato.activo().puedeTransicionarA(EstadoContrato.pausado())).toBe(true)
    })

    it('activo can transition to finalizado', () => {
      expect(EstadoContrato.activo().puedeTransicionarA(EstadoContrato.finalizado())).toBe(true)
    })

    it('pausado can resume to activo', () => {
      expect(EstadoContrato.pausado().puedeTransicionarA(EstadoContrato.activo())).toBe(true)
    })

    it('finalizado cannot transition to any state', () => {
      expect(EstadoContrato.finalizado().puedeTransicionarA(EstadoContrato.activo())).toBe(false)
      expect(EstadoContrato.finalizado().puedeTransicionarA(EstadoContrato.borrador())).toBe(false)
      expect(EstadoContrato.finalizado().puedeTransicionarA(EstadoContrato.cancelado())).toBe(false)
    })

    it('cancelado cannot transition to any state', () => {
      expect(EstadoContrato.cancelado().puedeTransicionarA(EstadoContrato.activo())).toBe(false)
      expect(EstadoContrato.cancelado().puedeTransicionarA(EstadoContrato.borrador())).toBe(false)
    })
  })

  // ── Semantic predicates ──────────────────────────────────────────────────

  describe('esEditable', () => {
    it('borrador is editable', () => {
      expect(EstadoContrato.borrador().esEditable()).toBe(true)
    })

    it('revision is editable', () => {
      expect(EstadoContrato.revision().esEditable()).toBe(true)
    })

    it('activo is not editable', () => {
      expect(EstadoContrato.activo().esEditable()).toBe(false)
    })

    it('finalizado is not editable', () => {
      expect(EstadoContrato.finalizado().esEditable()).toBe(false)
    })
  })

  describe('requiereAccion', () => {
    it('revision requires action', () => {
      expect(EstadoContrato.revision().requiereAccion()).toBe(true)
    })

    it('aprobacion requires action', () => {
      expect(EstadoContrato.aprobacion().requiereAccion()).toBe(true)
    })

    it('firmado requires action', () => {
      expect(EstadoContrato.firmado().requiereAccion()).toBe(true)
    })

    it('borrador does not require action', () => {
      expect(EstadoContrato.borrador().requiereAccion()).toBe(false)
    })

    it('activo does not require action', () => {
      expect(EstadoContrato.activo().requiereAccion()).toBe(false)
    })
  })

  describe('esActivo', () => {
    it('activo returns true', () => {
      expect(EstadoContrato.activo().esActivo()).toBe(true)
    })

    it('non-activo states return false', () => {
      expect(EstadoContrato.borrador().esActivo()).toBe(false)
      expect(EstadoContrato.pausado().esActivo()).toBe(false)
    })
  })

  describe('esFinal', () => {
    it('finalizado is final', () => {
      expect(EstadoContrato.finalizado().esFinal()).toBe(true)
    })

    it('cancelado is final', () => {
      expect(EstadoContrato.cancelado().esFinal()).toBe(true)
    })

    it('activo is not final', () => {
      expect(EstadoContrato.activo().esFinal()).toBe(false)
    })
  })

  // ── Priority ─────────────────────────────────────────────────────────────

  describe('prioridad', () => {
    it('aprobacion has highest priority 5', () => {
      expect(EstadoContrato.aprobacion().prioridad).toBe(5)
    })

    it('revision has priority 4', () => {
      expect(EstadoContrato.revision().prioridad).toBe(4)
    })

    it('finalizado and cancelado have priority 0', () => {
      expect(EstadoContrato.finalizado().prioridad).toBe(0)
      expect(EstadoContrato.cancelado().prioridad).toBe(0)
    })
  })

  // ── Equality & serialization ──────────────────────────────────────────────

  describe('equals', () => {
    it('same state is equal', () => {
      expect(EstadoContrato.activo().equals(EstadoContrato.activo())).toBe(true)
    })

    it('different states are not equal', () => {
      expect(EstadoContrato.activo().equals(EstadoContrato.pausado())).toBe(false)
    })
  })

  describe('toString', () => {
    it('returns valor', () => {
      expect(EstadoContrato.borrador().toString()).toBe('borrador')
    })
  })
})
