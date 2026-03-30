import { describe, it, expect } from 'vitest'
import { TotalesContrato } from '../../../modules/contratos/domain/value-objects/TotalesContrato.js'

describe('TotalesContrato', () => {
  // ── create factory ────────────────────────────────────────────────────────

  describe('create', () => {
    it('should calculate valorNeto with discount', () => {
      const totales = TotalesContrato.create(1_000_000, 10)
      expect(totales.valorNeto).toBe(900_000)
    })

    it('should calculate IVA 19% on valorNeto', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(totales.impuestos).toBeCloseTo(190_000)
    })

    it('should calculate valorTotal = valorNeto + IVA', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(totales.valorTotal).toBeCloseTo(1_190_000)
    })

    it('should default to CLP currency', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(totales.moneda).toBe('CLP')
    })

    it('should accept USD currency', () => {
      const totales = TotalesContrato.create(1000, 0, 'USD')
      expect(totales.moneda).toBe('USD')
    })

    it('should accept UF currency', () => {
      const totales = TotalesContrato.create(500, 0, 'UF')
      expect(totales.moneda).toBe('UF')
    })

    it('should work with 0% discount', () => {
      const totales = TotalesContrato.create(500_000, 0)
      expect(totales.valorNeto).toBe(500_000)
      expect(totales.descuentoPorcentaje).toBe(0)
    })

    it('should work with 50% discount', () => {
      const totales = TotalesContrato.create(2_000_000, 50)
      expect(totales.valorNeto).toBe(1_000_000)
    })

    it('should throw when valorBruto is zero', () => {
      expect(() => TotalesContrato.create(0, 0)).toThrow('Valor bruto debe ser mayor a cero')
    })

    it('should throw when valorBruto is negative', () => {
      expect(() => TotalesContrato.create(-1000, 0)).toThrow()
    })

    it('should throw when discount exceeds 100%', () => {
      expect(() => TotalesContrato.create(1_000_000, 101)).toThrow('Descuento debe estar entre 0% y 100%')
    })

    it('should throw when discount is negative', () => {
      expect(() => TotalesContrato.create(1_000_000, -5)).toThrow('Descuento debe estar entre 0% y 100%')
    })
  })

  // ── Derived getters ────────────────────────────────────────────────────────

  describe('descuentoMonto', () => {
    it('calculates discount amount correctly', () => {
      const totales = TotalesContrato.create(1_000_000, 20)
      expect(totales.descuentoMonto).toBe(200_000)
    })

    it('returns zero for no discount', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(totales.descuentoMonto).toBe(0)
    })
  })

  describe('margenDescuento', () => {
    it('calculates discount margin as percentage', () => {
      const totales = TotalesContrato.create(1_000_000, 25)
      expect(totales.margenDescuento).toBeCloseTo(25)
    })
  })

  describe('porcentajeImpuestos', () => {
    it('returns approximately 19%', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(totales.porcentajeImpuestos).toBeCloseTo(19)
    })
  })

  // ── aplicarDescuentoAdicional ──────────────────────────────────────────────

  describe('aplicarDescuentoAdicional', () => {
    it('applies additional discount on top of existing', () => {
      const totales = TotalesContrato.create(1_000_000, 10)
      const nuevos = totales.aplicarDescuentoAdicional(5)
      expect(nuevos.descuentoPorcentaje).toBe(15)
    })

    it('throws when total discount would exceed 100%', () => {
      const totales = TotalesContrato.create(1_000_000, 90)
      expect(() => totales.aplicarDescuentoAdicional(15)).toThrow('Descuento total no puede exceder 100%')
    })
  })

  // ── cambiarMoneda ──────────────────────────────────────────────────────────

  describe('cambiarMoneda', () => {
    it('converts all values by exchange rate', () => {
      const totales = TotalesContrato.create(1_000_000, 0, 'CLP')
      const usd = totales.cambiarMoneda('USD', 0.001)
      expect(usd.valorNeto).toBeCloseTo(1000)
      expect(usd.moneda).toBe('USD')
    })

    it('throws with zero exchange rate', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(() => totales.cambiarMoneda('USD', 0)).toThrow('Tasa de cambio debe ser mayor a cero')
    })

    it('throws with negative exchange rate', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(() => totales.cambiarMoneda('USD', -1)).toThrow()
    })
  })

  // ── Validations ────────────────────────────────────────────────────────────

  describe('validarLimiteDescuento', () => {
    it('returns true when discount is within limit', () => {
      const totales = TotalesContrato.create(1_000_000, 10)
      expect(totales.validarLimiteDescuento(20)).toBe(true)
    })

    it('returns false when discount exceeds limit', () => {
      const totales = TotalesContrato.create(1_000_000, 25)
      expect(totales.validarLimiteDescuento(20)).toBe(false)
    })
  })

  describe('validarMontoMinimo', () => {
    it('returns true when valorNeto meets minimum', () => {
      const totales = TotalesContrato.create(1_000_000, 0)
      expect(totales.validarMontoMinimo(500_000)).toBe(true)
    })

    it('returns false when valorNeto is below minimum', () => {
      const totales = TotalesContrato.create(100_000, 0)
      expect(totales.validarMontoMinimo(500_000)).toBe(false)
    })
  })

  // ── esMayorQue ────────────────────────────────────────────────────────────

  describe('esMayorQue', () => {
    it('returns true when valorNeto is higher', () => {
      const a = TotalesContrato.create(2_000_000, 0)
      const b = TotalesContrato.create(1_000_000, 0)
      expect(a.esMayorQue(b)).toBe(true)
    })

    it('returns false when valorNeto is lower', () => {
      const a = TotalesContrato.create(500_000, 0)
      const b = TotalesContrato.create(1_000_000, 0)
      expect(a.esMayorQue(b)).toBe(false)
    })

    it('throws when comparing different currencies', () => {
      const clp = TotalesContrato.create(1_000_000, 0, 'CLP')
      const usd = TotalesContrato.create(1000, 0, 'USD')
      expect(() => clp.esMayorQue(usd)).toThrow('diferentes monedas')
    })
  })

  // ── equals ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('returns true for same values', () => {
      const a = TotalesContrato.create(1_000_000, 10)
      const b = TotalesContrato.create(1_000_000, 10)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different amounts', () => {
      const a = TotalesContrato.create(1_000_000, 10)
      const b = TotalesContrato.create(2_000_000, 10)
      expect(a.equals(b)).toBe(false)
    })
  })
})
