import { describe, it, expect } from 'vitest'
import { TasaComision } from '../../../modules/contratos/domain/value-objects/TasaComision.js'

describe('TasaComision', () => {
  // ── porcentaje factory ────────────────────────────────────────────────────

  describe('porcentaje', () => {
    it('creates percentage commission', () => {
      const t = TasaComision.porcentaje(15)
      expect(t.tipo).toBe('porcentaje')
      expect(t.porcentaje).toBe(15)
    })

    it('defaults to neto basis', () => {
      const t = TasaComision.porcentaje(10)
      expect(t.toSnapshot().aplicaSobre).toBe('neto')
    })

    it('accepts bruto basis', () => {
      const t = TasaComision.porcentaje(10, 'bruto')
      expect(t.toSnapshot().aplicaSobre).toBe('bruto')
    })

    it('throws when percentage is negative', () => {
      expect(() => TasaComision.porcentaje(-1)).toThrow()
    })

    it('throws when percentage exceeds 100', () => {
      expect(() => TasaComision.porcentaje(101)).toThrow()
    })

    it('accepts 0% commission', () => {
      const t = TasaComision.porcentaje(0)
      expect(t.calcularComision(1_000_000)).toBe(0)
    })

    it('accepts 100% commission', () => {
      const t = TasaComision.porcentaje(100)
      expect(t.calcularComision(1_000_000)).toBe(1_000_000)
    })
  })

  // ── fijo factory ──────────────────────────────────────────────────────────

  describe('fijo', () => {
    it('creates fixed commission', () => {
      const t = TasaComision.fijo(50_000)
      expect(t.tipo).toBe('fijo')
      expect(t.montoFijo).toBe(50_000)
    })

    it('calculates fixed amount regardless of base value', () => {
      const t = TasaComision.fijo(100_000)
      expect(t.calcularComision(5_000_000)).toBe(100_000)
      expect(t.calcularComision(500_000)).toBe(100_000)
    })
  })

  // ── mixto factory ─────────────────────────────────────────────────────────

  describe('mixto', () => {
    it('creates mixed commission', () => {
      const t = TasaComision.mixto(10, 50_000)
      expect(t.tipo).toBe('mixto')
    })

    it('calculates percentage + fixed amount', () => {
      const t = TasaComision.mixto(10, 50_000)
      // 10% of 1,000,000 = 100,000 + 50,000 = 150,000
      expect(t.calcularComision(1_000_000)).toBe(150_000)
    })
  })

  // ── calcularComision ──────────────────────────────────────────────────────

  describe('calcularComision', () => {
    it('percentage: calculates 15% of 1M', () => {
      const t = TasaComision.porcentaje(15)
      expect(t.calcularComision(1_000_000)).toBe(150_000)
    })

    it('percentage: calculates 20% of 500k', () => {
      const t = TasaComision.porcentaje(20)
      expect(t.calcularComision(500_000)).toBe(100_000)
    })

    it('applies minimum when calculated commission is below minimum', () => {
      const t = TasaComision.fromProps({
        porcentaje: 5,
        tipo: 'porcentaje',
        aplicaSobre: 'neto',
        minimo: 100_000,
      })
      // 5% of 1M = 50k < 100k minimum → should be 100k
      expect(t.calcularComision(1_000_000)).toBe(100_000)
    })

    it('applies maximum when calculated commission exceeds maximum', () => {
      const t = TasaComision.fromProps({
        porcentaje: 30,
        tipo: 'porcentaje',
        aplicaSobre: 'neto',
        maximo: 200_000,
      })
      // 30% of 1M = 300k > 200k maximum → should be 200k
      expect(t.calcularComision(1_000_000)).toBe(200_000)
    })
  })

  // ── validation ────────────────────────────────────────────────────────────

  describe('validation', () => {
    it('throws when minimo > maximo', () => {
      expect(() => TasaComision.fromProps({
        porcentaje: 10,
        tipo: 'porcentaje',
        aplicaSobre: 'neto',
        minimo: 500_000,
        maximo: 100_000,
      })).toThrow('Mínimo no puede ser mayor')
    })

    it('throws fijo type without montoFijo', () => {
      expect(() => TasaComision.fromProps({
        porcentaje: 0,
        tipo: 'fijo',
        aplicaSobre: 'neto',
      })).toThrow('requiere monto fijo')
    })
  })

  // ── equals ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('returns true for identical commissions', () => {
      expect(TasaComision.porcentaje(15).equals(TasaComision.porcentaje(15))).toBe(true)
    })

    it('returns false for different percentages', () => {
      expect(TasaComision.porcentaje(15).equals(TasaComision.porcentaje(20))).toBe(false)
    })
  })

  // ── toString ──────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('formats percentage commission', () => {
      expect(TasaComision.porcentaje(15).toString()).toBe('15%')
    })

    it('formats mixed commission', () => {
      const str = TasaComision.mixto(10, 50_000).toString()
      expect(str).toContain('10%')
    })
  })
})
