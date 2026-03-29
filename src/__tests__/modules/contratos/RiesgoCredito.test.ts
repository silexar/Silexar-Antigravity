import { describe, it, expect } from 'vitest'
import { RiesgoCredito } from '../../../modules/contratos/domain/value-objects/RiesgoCredito.js'

describe('RiesgoCredito', () => {
  // ── create: nivel thresholds ──────────────────────────────────────────────

  describe('create - nivel thresholds', () => {
    it('score >= 750 → nivel bajo', () => {
      expect(RiesgoCredito.create(750).nivel).toBe('bajo')
      expect(RiesgoCredito.create(1000).nivel).toBe('bajo')
    })

    it('score 600-749 → nivel medio', () => {
      expect(RiesgoCredito.create(600).nivel).toBe('medio')
      expect(RiesgoCredito.create(749).nivel).toBe('medio')
    })

    it('score < 600 → nivel alto', () => {
      expect(RiesgoCredito.create(0).nivel).toBe('alto')
      expect(RiesgoCredito.create(599).nivel).toBe('alto')
    })

    it('throws when score < 0', () => {
      expect(() => RiesgoCredito.create(-1)).toThrow('entre 0 y 1000')
    })

    it('throws when score > 1000', () => {
      expect(() => RiesgoCredito.create(1001)).toThrow()
    })
  })

  // ── requiereGarantia ─────────────────────────────────────────────────────

  describe('requiereGarantia', () => {
    it('returns true for nivel alto', () => {
      expect(RiesgoCredito.create(500).requiereGarantia).toBe(true)
    })

    it('returns true for score < 600 (alto)', () => {
      expect(RiesgoCredito.create(500).requiereGarantia).toBe(true)
    })

    it('returns false for nivel bajo', () => {
      expect(RiesgoCredito.create(800).requiereGarantia).toBe(false)
    })
  })

  // ── recomendaciones ───────────────────────────────────────────────────────

  describe('recomendaciones', () => {
    it('bajo generates standard terms recommendation', () => {
      const r = RiesgoCredito.create(800)
      expect(r.recomendaciones.some(rec => rec.includes('bajo riesgo'))).toBe(true)
    })

    it('alto generates gerencial approval recommendation', () => {
      const r = RiesgoCredito.create(400)
      expect(r.recomendaciones.some(rec => rec.includes('aprobación gerencial'))).toBe(true)
    })

    it('alto generates guarantee required recommendation', () => {
      const r = RiesgoCredito.create(400)
      expect(r.recomendaciones.some(rec => rec.includes('Garantía obligatoria'))).toBe(true)
    })

    it('medio with score < 650 recommends guarantee for high amounts', () => {
      const r = RiesgoCredito.create(620)
      expect(r.recomendaciones.some(rec => rec.includes('garantía'))).toBe(true)
    })
  })

  // ── validarTerminosPago ───────────────────────────────────────────────────

  describe('validarTerminosPago', () => {
    it('bajo allows up to 90 days', () => {
      expect(RiesgoCredito.create(800).validarTerminosPago(90).valido).toBe(true)
    })

    it('bajo rejects > 90 days', () => {
      expect(RiesgoCredito.create(800).validarTerminosPago(91).valido).toBe(false)
    })

    it('medio allows up to 45 days', () => {
      expect(RiesgoCredito.create(700).validarTerminosPago(45).valido).toBe(true)
    })

    it('medio rejects > 45 days', () => {
      const result = RiesgoCredito.create(700).validarTerminosPago(46)
      expect(result.valido).toBe(false)
      expect(result.mensaje).toContain('45')
    })

    it('alto allows up to 15 days', () => {
      expect(RiesgoCredito.create(400).validarTerminosPago(15).valido).toBe(true)
    })

    it('alto rejects > 15 days', () => {
      const result = RiesgoCredito.create(400).validarTerminosPago(16)
      expect(result.valido).toBe(false)
    })
  })

  // ── validarMontoCredito ───────────────────────────────────────────────────

  describe('validarMontoCredito', () => {
    it('returns true when no limit set', () => {
      expect(RiesgoCredito.create(800).validarMontoCredito(10_000_000).valido).toBe(true)
    })

    it('returns true when monto within limit', () => {
      const r = RiesgoCredito.create(800).conLimiteCredito(5_000_000)
      expect(r.validarMontoCredito(4_000_000).valido).toBe(true)
    })

    it('returns false when monto exceeds limit', () => {
      const r = RiesgoCredito.create(800).conLimiteCredito(5_000_000)
      const result = r.validarMontoCredito(6_000_000)
      expect(result.valido).toBe(false)
      expect(result.mensaje).toContain('límite')
    })
  })

  // ── estaVigente / requiereActualizacion ───────────────────────────────────

  describe('estaVigente', () => {
    it('returns true for fresh evaluation', () => {
      expect(RiesgoCredito.create(800).estaVigente()).toBe(true)
    })

    it('diasParaVencimiento returns ~30 for fresh evaluation', () => {
      const r = RiesgoCredito.create(800)
      expect(r.diasParaVencimiento()).toBeCloseTo(30, 0)
    })
  })

  describe('requiereActualizacion', () => {
    it('returns false when >= 8 days remaining', () => {
      expect(RiesgoCredito.create(800).requiereActualizacion()).toBe(false)
    })
  })

  // ── esMayorRiesgoQue ──────────────────────────────────────────────────────

  describe('esMayorRiesgoQue', () => {
    it('alto > medio', () => {
      const alto = RiesgoCredito.create(400)
      const medio = RiesgoCredito.create(700)
      expect(alto.esMayorRiesgoQue(medio)).toBe(true)
    })

    it('bajo not > medio', () => {
      const bajo = RiesgoCredito.create(800)
      const medio = RiesgoCredito.create(700)
      expect(bajo.esMayorRiesgoQue(medio)).toBe(false)
    })
  })

  // ── porcentajeConfianza ───────────────────────────────────────────────────

  describe('porcentajeConfianza', () => {
    it('score 1000 → 100%', () => {
      expect(RiesgoCredito.create(1000).porcentajeConfianza).toBe(100)
    })

    it('score 500 → 50%', () => {
      expect(RiesgoCredito.create(500).porcentajeConfianza).toBe(50)
    })

    it('score 0 → 0%', () => {
      expect(RiesgoCredito.create(0).porcentajeConfianza).toBe(0)
    })
  })

  // ── actualizarScore ───────────────────────────────────────────────────────

  describe('actualizarScore', () => {
    it('creates new RiesgoCredito with updated score', () => {
      const r = RiesgoCredito.create(400)
      const updated = r.actualizarScore(800)
      expect(updated.nivel).toBe('bajo')
      expect(updated.score).toBe(800)
    })

    it('original remains unchanged', () => {
      const r = RiesgoCredito.create(400)
      r.actualizarScore(800)
      expect(r.score).toBe(400)
    })
  })

  // ── toString ──────────────────────────────────────────────────────────────

  describe('toString', () => {
    it('includes score and nivel', () => {
      const str = RiesgoCredito.create(800).toString()
      expect(str).toContain('800')
      expect(str.toLowerCase()).toContain('bajo')
    })
  })
})
