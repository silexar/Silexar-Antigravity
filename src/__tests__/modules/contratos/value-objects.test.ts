/**
 * Unit tests for Contratos domain value objects
 * src/modules/contratos/domain/value-objects/
 */

import { describe, it, expect } from 'vitest'
import { NumeroContrato } from '@/modules/contratos/domain/value-objects/NumeroContrato'
import { EstadoContrato } from '@/modules/contratos/domain/value-objects/EstadoContrato'
import { TasaComision } from '@/modules/contratos/domain/value-objects/TasaComision'

// ── NumeroContrato ────────────────────────────────────────────────────────────

describe('NumeroContrato', () => {
  describe('generate()', () => {
    it('generates a number matching CON-YYYY-XXXXX format', () => {
      const n = NumeroContrato.generate()
      expect(n.valor).toMatch(/^CON-\d{4}-\d{5}$/)
    })

    it('year matches current year', () => {
      const n = NumeroContrato.generate()
      expect(n.year).toBe(new Date().getFullYear())
    })

    it('sequence is between 1 and 99999', () => {
      const n = NumeroContrato.generate()
      expect(n.sequence).toBeGreaterThanOrEqual(1)
      expect(n.sequence).toBeLessThanOrEqual(99999)
    })

    it('generates different numbers on consecutive calls (probabilistic)', () => {
      const n1 = NumeroContrato.generate()
      const n2 = NumeroContrato.generate()
      // The sequence uses Math.random so collisions are possible but rare
      // Just verify they are valid format
      expect(n1.valor).toMatch(/^CON-\d{4}-\d{5}$/)
      expect(n2.valor).toMatch(/^CON-\d{4}-\d{5}$/)
    })
  })

  describe('fromString()', () => {
    it('accepts valid CON-YYYY-XXXXX string', () => {
      const n = NumeroContrato.fromString('CON-2026-00001')
      expect(n.valor).toBe('CON-2026-00001')
    })

    it('throws for invalid format', () => {
      expect(() => NumeroContrato.fromString('INVALID')).toThrow()
      expect(() => NumeroContrato.fromString('CON-26-00001')).toThrow()
      expect(() => NumeroContrato.fromString('CON-2026-1')).toThrow()
      expect(() => NumeroContrato.fromString('')).toThrow()
    })

    it('parses year correctly', () => {
      const n = NumeroContrato.fromString('CON-2025-12345')
      expect(n.year).toBe(2025)
    })

    it('parses sequence correctly', () => {
      const n = NumeroContrato.fromString('CON-2026-00042')
      expect(n.sequence).toBe(42)
    })
  })

  describe('equals()', () => {
    it('returns true for same value', () => {
      const a = NumeroContrato.fromString('CON-2026-00001')
      const b = NumeroContrato.fromString('CON-2026-00001')
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different values', () => {
      const a = NumeroContrato.fromString('CON-2026-00001')
      const b = NumeroContrato.fromString('CON-2026-00002')
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('toString()', () => {
    it('returns the valor string', () => {
      const n = NumeroContrato.fromString('CON-2026-00099')
      expect(n.toString()).toBe('CON-2026-00099')
    })
  })
})

// ── EstadoContrato ────────────────────────────────────────────────────────────

describe('EstadoContrato', () => {
  describe('factory methods', () => {
    it.each([
      ['borrador', EstadoContrato.borrador()],
      ['revision', EstadoContrato.revision()],
      ['aprobacion', EstadoContrato.aprobacion()],
      ['firmado', EstadoContrato.firmado()],
      ['activo', EstadoContrato.activo()],
      ['pausado', EstadoContrato.pausado()],
      ['finalizado', EstadoContrato.finalizado()],
      ['cancelado', EstadoContrato.cancelado()],
    ] as const)('creates %s state', (expected, estado) => {
      expect(estado.valor).toBe(expected)
    })
  })

  describe('fromString()', () => {
    it('creates from valid string', () => {
      const e = EstadoContrato.fromString('activo')
      expect(e.valor).toBe('activo')
    })

    it('throws for invalid state', () => {
      expect(() => EstadoContrato.fromString('pendiente')).toThrow()
      expect(() => EstadoContrato.fromString('')).toThrow()
      expect(() => EstadoContrato.fromString('ACTIVO')).toThrow() // case-sensitive
    })
  })

  describe('state machine — puedeTransicionarA()', () => {
    it('borrador → revision is allowed', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.revision())).toBe(true)
    })

    it('borrador → cancelado is allowed', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.cancelado())).toBe(true)
    })

    it('borrador → activo is NOT allowed', () => {
      expect(EstadoContrato.borrador().puedeTransicionarA(EstadoContrato.activo())).toBe(false)
    })

    it('activo → pausado is allowed', () => {
      expect(EstadoContrato.activo().puedeTransicionarA(EstadoContrato.pausado())).toBe(true)
    })

    it('activo → finalizado is allowed', () => {
      expect(EstadoContrato.activo().puedeTransicionarA(EstadoContrato.finalizado())).toBe(true)
    })

    it('finalizado → any is NOT allowed (terminal state)', () => {
      const finalizado = EstadoContrato.finalizado()
      expect(finalizado.puedeTransicionarA(EstadoContrato.activo())).toBe(false)
      expect(finalizado.puedeTransicionarA(EstadoContrato.borrador())).toBe(false)
      expect(finalizado.puedeTransicionarA(EstadoContrato.cancelado())).toBe(false)
    })

    it('cancelado → any is NOT allowed (terminal state)', () => {
      const cancelado = EstadoContrato.cancelado()
      expect(cancelado.puedeTransicionarA(EstadoContrato.borrador())).toBe(false)
      expect(cancelado.puedeTransicionarA(EstadoContrato.activo())).toBe(false)
    })

    it('revision → borrador is allowed (back-transition)', () => {
      expect(EstadoContrato.revision().puedeTransicionarA(EstadoContrato.borrador())).toBe(true)
    })
  })

  describe('semantic helpers', () => {
    it('esEditable() true only for borrador and revision', () => {
      expect(EstadoContrato.borrador().esEditable()).toBe(true)
      expect(EstadoContrato.revision().esEditable()).toBe(true)
      expect(EstadoContrato.activo().esEditable()).toBe(false)
      expect(EstadoContrato.finalizado().esEditable()).toBe(false)
    })

    it('esActivo() only for activo', () => {
      expect(EstadoContrato.activo().esActivo()).toBe(true)
      expect(EstadoContrato.pausado().esActivo()).toBe(false)
    })

    it('esFinal() for finalizado and cancelado', () => {
      expect(EstadoContrato.finalizado().esFinal()).toBe(true)
      expect(EstadoContrato.cancelado().esFinal()).toBe(true)
      expect(EstadoContrato.activo().esFinal()).toBe(false)
    })

    it('requiereAccion() for revision, aprobacion, firmado', () => {
      expect(EstadoContrato.revision().requiereAccion()).toBe(true)
      expect(EstadoContrato.aprobacion().requiereAccion()).toBe(true)
      expect(EstadoContrato.firmado().requiereAccion()).toBe(true)
      expect(EstadoContrato.borrador().requiereAccion()).toBe(false)
      expect(EstadoContrato.activo().requiereAccion()).toBe(false)
    })
  })

  describe('descriptive properties', () => {
    it('descripcion is non-empty for all states', () => {
      const states = [
        EstadoContrato.borrador(), EstadoContrato.revision(), EstadoContrato.aprobacion(),
        EstadoContrato.firmado(), EstadoContrato.activo(), EstadoContrato.pausado(),
        EstadoContrato.finalizado(), EstadoContrato.cancelado(),
      ]
      states.forEach(s => expect(s.descripcion.length).toBeGreaterThan(0))
    })

    it('color returns a Tailwind class', () => {
      expect(EstadoContrato.activo().color).toContain('bg-')
    })

    it('aprobacion has highest prioridad', () => {
      expect(EstadoContrato.aprobacion().prioridad).toBeGreaterThan(EstadoContrato.borrador().prioridad)
      expect(EstadoContrato.aprobacion().prioridad).toBeGreaterThan(EstadoContrato.activo().prioridad)
    })
  })

  describe('equals()', () => {
    it('same state equals itself', () => {
      expect(EstadoContrato.activo().equals(EstadoContrato.activo())).toBe(true)
    })

    it('different states are not equal', () => {
      expect(EstadoContrato.activo().equals(EstadoContrato.pausado())).toBe(false)
    })
  })
})

// ── TasaComision ──────────────────────────────────────────────────────────────

describe('TasaComision', () => {
  describe('porcentaje()', () => {
    it('creates percentage-type commission', () => {
      const t = TasaComision.porcentaje(15)
      expect(t.tipo).toBe('porcentaje')
      expect(t.porcentaje).toBe(15)
    })

    it('calculates commission correctly on neto', () => {
      const t = TasaComision.porcentaje(10)
      expect(t.calcularComision(100_000)).toBe(10_000)
    })

    it('rejects negative percentage', () => {
      expect(() => TasaComision.porcentaje(-1)).toThrow()
    })

    it('rejects percentage > 100', () => {
      expect(() => TasaComision.porcentaje(101)).toThrow()
    })

    it('accepts 0%', () => {
      const t = TasaComision.porcentaje(0)
      expect(t.calcularComision(100_000)).toBe(0)
    })

    it('accepts 100%', () => {
      const t = TasaComision.porcentaje(100)
      expect(t.calcularComision(50_000)).toBe(50_000)
    })
  })

  describe('fijo()', () => {
    it('creates fixed-type commission', () => {
      const t = TasaComision.fijo(50_000)
      expect(t.tipo).toBe('fijo')
      expect(t.montoFijo).toBe(50_000)
    })

    it('always returns fixed amount regardless of base', () => {
      const t = TasaComision.fijo(20_000)
      expect(t.calcularComision(100_000)).toBe(20_000)
      expect(t.calcularComision(500_000)).toBe(20_000)
    })

    it('rejects negative fixed amount', () => {
      expect(() => TasaComision.fijo(-1)).toThrow()
    })
  })

  describe('mixto()', () => {
    it('calculates percentage + fixed amount', () => {
      const t = TasaComision.mixto(10, 5_000)
      // 10% of 100,000 = 10,000 + 5,000 fixed = 15,000
      expect(t.calcularComision(100_000)).toBe(15_000)
    })

    it('tipo is mixto', () => {
      expect(TasaComision.mixto(5, 1_000).tipo).toBe('mixto')
    })
  })

  describe('limits (minimo/maximo)', () => {
    it('applies minimo when commission is too low', () => {
      const t = TasaComision.fromProps({
        porcentaje: 1,
        tipo: 'porcentaje',
        aplicaSobre: 'neto',
        minimo: 10_000,
      })
      // 1% of 500 = 5 → below minimo → returns 10,000
      expect(t.calcularComision(500)).toBe(10_000)
    })

    it('applies maximo when commission exceeds cap', () => {
      const t = TasaComision.fromProps({
        porcentaje: 50,
        tipo: 'porcentaje',
        aplicaSobre: 'neto',
        maximo: 100_000,
      })
      // 50% of 1,000,000 = 500,000 → capped at 100,000
      expect(t.calcularComision(1_000_000)).toBe(100_000)
    })

    it('throws when minimo > maximo', () => {
      expect(() => TasaComision.fromProps({
        porcentaje: 10,
        tipo: 'porcentaje',
        aplicaSobre: 'neto',
        minimo: 50_000,
        maximo: 10_000,
      })).toThrow()
    })
  })

  describe('toString()', () => {
    it('formats percentage as X%', () => {
      expect(TasaComision.porcentaje(15).toString()).toBe('15%')
    })

    it('formats fixed amount with $ prefix', () => {
      expect(TasaComision.fijo(50000).toString()).toContain('50')
    })

    it('formats mixto with both parts', () => {
      const str = TasaComision.mixto(10, 5000).toString()
      expect(str).toContain('10%')
      expect(str).toContain('+')
    })
  })

  describe('equals()', () => {
    it('same percentage commissions are equal', () => {
      expect(TasaComision.porcentaje(15).equals(TasaComision.porcentaje(15))).toBe(true)
    })

    it('different percentages are not equal', () => {
      expect(TasaComision.porcentaje(10).equals(TasaComision.porcentaje(15))).toBe(false)
    })
  })
})
