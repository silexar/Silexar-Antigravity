import { describe, it, expect } from 'vitest'
import { ScoreCreativo } from '../../../modules/agencias-creativas/domain/value-objects/ScoreCreativo.js'

// ScoreCreativo uses `new ScoreCreativo(score)` or `ScoreCreativo.fromNumber(score)`
// Properties: .value, .level, .displayName, etc.
// Negative values are CLAMPED to 0 (not thrown)
// Values > 1000 are CLAMPED to 1000 (not thrown)
// calculateFromMetrics(calidad: 0-10, puntualidad: 0-100%, satisfaccion: 0-10, innovacion: 0-10, experiencia: years 0-20)

describe('ScoreCreativo', () => {
  // ── constructor / fromNumber ────────────────────────────────────────────────

  describe('constructor (via fromNumber)', () => {
    it('creates with value 0', () => {
      const s = ScoreCreativo.fromNumber(0)
      expect(s.value).toBe(0)
    })

    it('creates with value 1000', () => {
      const s = ScoreCreativo.fromNumber(1000)
      expect(s.value).toBe(1000)
    })

    it('creates with value 500', () => {
      const s = ScoreCreativo.fromNumber(500)
      expect(s.value).toBe(500)
    })

    it('clamps negative value to 0', () => {
      const s = new ScoreCreativo(-1)
      expect(s.value).toBe(0)
    })

    it('clamps value exceeding 1000 to 1000', () => {
      const s = new ScoreCreativo(1001)
      expect(s.value).toBe(1000)
    })

    it('throws for NaN', () => {
      expect(() => new ScoreCreativo(NaN)).toThrow()
    })
  })

  // ── calculateFromMetrics ───────────────────────────────────────────────────
  // calidad: 0-10, puntualidad: 0-100%, satisfaccion: 0-10, innovacion: 0-10, experiencia: years 0-20

  describe('calculateFromMetrics', () => {
    it('calculates score from perfect metrics', () => {
      // calidad=10, puntualidad=100%, satisfaccion=10, innovacion=10, experiencia=20y
      const s = ScoreCreativo.calculateFromMetrics(10, 100, 10, 10, 20)
      expect(s.value).toBe(1000)
    })

    it('calculates score from zero metrics', () => {
      const s = ScoreCreativo.calculateFromMetrics(0, 0, 0, 0, 0)
      expect(s.value).toBe(0)
    })

    it('calidad weight is 30%: calidad=10 alone → 300', () => {
      const s = ScoreCreativo.calculateFromMetrics(10, 0, 0, 0, 0)
      expect(s.value).toBeCloseTo(300, 0)
    })

    it('puntualidad weight is 25%: puntualidad=100% alone → 250', () => {
      const s = ScoreCreativo.calculateFromMetrics(0, 100, 0, 0, 0)
      expect(s.value).toBeCloseTo(250, 0)
    })

    it('satisfaccion weight is 20%: satisfaccion=10 alone → 200', () => {
      const s = ScoreCreativo.calculateFromMetrics(0, 0, 10, 0, 0)
      expect(s.value).toBeCloseTo(200, 0)
    })

    it('innovacion weight is 15%: innovacion=10 alone → 150', () => {
      const s = ScoreCreativo.calculateFromMetrics(0, 0, 0, 10, 0)
      expect(s.value).toBeCloseTo(150, 0)
    })

    it('experiencia weight is 10%: experiencia=20 years alone → 100', () => {
      const s = ScoreCreativo.calculateFromMetrics(0, 0, 0, 0, 20)
      expect(s.value).toBeCloseTo(100, 0)
    })

    it('mid-range metrics produce mid-range score (all at 50%)', () => {
      // calidad=5/10, puntualidad=50%, satisfaccion=5/10, innovacion=5/10, experiencia=10/20y
      const s = ScoreCreativo.calculateFromMetrics(5, 50, 5, 5, 10)
      expect(s.value).toBe(500)
    })
  })

  // ── level (8 levels) ──────────────────────────────────────────────────────

  describe('level (8 levels)', () => {
    it('NOVATO for score 0-199', () => {
      expect(ScoreCreativo.fromNumber(0).level).toBe('NOVATO')
      expect(ScoreCreativo.fromNumber(199).level).toBe('NOVATO')
    })

    it('BASICO for score 200-399', () => {
      expect(ScoreCreativo.fromNumber(200).level).toBe('BASICO')
      expect(ScoreCreativo.fromNumber(399).level).toBe('BASICO')
    })

    it('COMPETENTE for score 400-599', () => {
      expect(ScoreCreativo.fromNumber(400).level).toBe('COMPETENTE')
      expect(ScoreCreativo.fromNumber(599).level).toBe('COMPETENTE')
    })

    it('AVANZADO for score 600-799', () => {
      expect(ScoreCreativo.fromNumber(600).level).toBe('AVANZADO')
      expect(ScoreCreativo.fromNumber(799).level).toBe('AVANZADO')
    })

    it('EXPERTO for score 800-899', () => {
      expect(ScoreCreativo.fromNumber(800).level).toBe('EXPERTO')
      expect(ScoreCreativo.fromNumber(899).level).toBe('EXPERTO')
    })

    it('MAESTRO for score 900-949', () => {
      expect(ScoreCreativo.fromNumber(900).level).toBe('MAESTRO')
      expect(ScoreCreativo.fromNumber(949).level).toBe('MAESTRO')
    })

    it('LEYENDA for score 950-999', () => {
      expect(ScoreCreativo.fromNumber(950).level).toBe('LEYENDA')
      expect(ScoreCreativo.fromNumber(999).level).toBe('LEYENDA')
    })

    it('SUPREMO for score 1000', () => {
      expect(ScoreCreativo.fromNumber(1000).level).toBe('SUPREMO')
    })
  })

  // ── capability flags ──────────────────────────────────────────────────────

  describe('canHandleComplexProjects', () => {
    it('returns true when score >= 600', () => {
      expect(ScoreCreativo.fromNumber(600).canHandleComplexProjects()).toBe(true)
      expect(ScoreCreativo.fromNumber(800).canHandleComplexProjects()).toBe(true)
    })

    it('returns false when score < 600', () => {
      expect(ScoreCreativo.fromNumber(599).canHandleComplexProjects()).toBe(false)
      expect(ScoreCreativo.fromNumber(0).canHandleComplexProjects()).toBe(false)
    })
  })

  describe('canHandlePremiumProjects', () => {
    it('returns true when score >= 800', () => {
      expect(ScoreCreativo.fromNumber(800).canHandlePremiumProjects()).toBe(true)
      expect(ScoreCreativo.fromNumber(1000).canHandlePremiumProjects()).toBe(true)
    })

    it('returns false when score < 800', () => {
      expect(ScoreCreativo.fromNumber(799).canHandlePremiumProjects()).toBe(false)
    })
  })

  describe('isTier0Eligible', () => {
    it('returns true when score >= 900', () => {
      expect(ScoreCreativo.fromNumber(900).isTier0Eligible()).toBe(true)
      expect(ScoreCreativo.fromNumber(1000).isTier0Eligible()).toBe(true)
    })

    it('returns false when score < 900', () => {
      expect(ScoreCreativo.fromNumber(899).isTier0Eligible()).toBe(false)
    })
  })

  // ── equals ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('returns true for same score', () => {
      expect(ScoreCreativo.fromNumber(500).equals(ScoreCreativo.fromNumber(500))).toBe(true)
    })

    it('returns false for different scores', () => {
      expect(ScoreCreativo.fromNumber(500).equals(ScoreCreativo.fromNumber(501))).toBe(false)
    })
  })

  // ── arithmetic helpers ────────────────────────────────────────────────────

  describe('arithmetic helpers', () => {
    it('add returns new instance with sum', () => {
      const s = ScoreCreativo.fromNumber(300)
      expect(s.add(200).value).toBe(500)
    })

    it('subtract returns new instance with difference', () => {
      const s = ScoreCreativo.fromNumber(700)
      expect(s.subtract(200).value).toBe(500)
    })

    it('isBetterThan returns true when higher', () => {
      expect(ScoreCreativo.fromNumber(800).isBetterThan(ScoreCreativo.fromNumber(700))).toBe(true)
    })

    it('isBetterThan returns false when lower', () => {
      expect(ScoreCreativo.fromNumber(600).isBetterThan(ScoreCreativo.fromNumber(700))).toBe(false)
    })
  })
})
