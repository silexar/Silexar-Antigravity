import { describe, it, expect } from 'vitest'
import { DealScoring } from '../../../modules/equipos-ventas/domain/entities/DealScoring.js'
import { DealScoreCategory, getCategoryFromScore } from '../../../modules/equipos-ventas/domain/value-objects/DealScoreCategory.js'

function makeProps(overrides: Partial<Omit<import('../../../modules/equipos-ventas/domain/entities/DealScoring.js').DealScoringProps, 'id' | 'categoriaActual' | 'scoreAnterior'>> = {}) {
  return {
    dealId: 'deal-1',
    vendedorId: 'vendedor-1',
    anuncianteId: 'anunciante-1',
    scoreActual: 50,
    factoresPositivos: ['precio_competitivo'],
    factoresNegativos: [],
    probabilidadCierre: 0.5,
    fechaCalculo: new Date(),
    proximoCalculo: new Date(),
    modeloVersion: 'v1.0.0',
    metadata: {},
    ...overrides,
  }
}

describe('DealScoring entity', () => {
  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates entity with correct initial score', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 75 }))
      expect(deal.score).toBe(75)
    })

    it('assigns HOT category for score 80', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 80 }))
      expect(deal.categoria).toBe('HOT')
    })

    it('assigns NEUTRAL category for score 50', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 50 }))
      expect(deal.categoria).toBe('NEUTRAL')
    })

    it('initial tendencia is 0 (scoreActual = scoreAnterior)', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 50 }))
      expect(deal.tendencia).toBe(0)
    })
  })

  // ── actualizarScore ────────────────────────────────────────────────────────

  describe('actualizarScore', () => {
    it('updates score', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 50 }))
      deal.actualizarScore(75, ['nuevo_factor'], [], 0.8)
      expect(deal.score).toBe(75)
    })

    it('stores previous score in scoreAnterior (accessible via toSnapshot)', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 50 }))
      deal.actualizarScore(75, [], [], 0.7)
      expect(deal.toSnapshot().scoreAnterior).toBe(50)
    })

    it('updates probabilidadCierre (via toSnapshot)', () => {
      const deal = DealScoring.create(makeProps())
      deal.actualizarScore(60, [], [], 0.9)
      expect(deal.toSnapshot().probabilidadCierre).toBe(0.9)
    })

    it('updates factoresPositivos (via toSnapshot)', () => {
      const deal = DealScoring.create(makeProps({ factoresPositivos: [] }))
      deal.actualizarScore(70, ['demo_exitosa', 'referencias'], [], 0.7)
      expect(deal.toSnapshot().factoresPositivos).toContain('demo_exitosa')
    })

    it('throws when score is out of range', () => {
      const deal = DealScoring.create(makeProps())
      expect(() => deal.actualizarScore(101, [], [], 0.5)).toThrow()
      expect(() => deal.actualizarScore(-1, [], [], 0.5)).toThrow()
    })
  })

  // ── tendencia ─────────────────────────────────────────────────────────────

  describe('tendencia', () => {
    it('returns positive value when score improved', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 50 }))
      deal.actualizarScore(80, [], [], 0.8)
      expect(deal.tendencia).toBe(30)
    })

    it('returns negative value when score declined', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 80 }))
      deal.actualizarScore(50, [], [], 0.5)
      expect(deal.tendencia).toBe(-30)
    })

    it('returns zero when score unchanged', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 60 }))
      deal.actualizarScore(60, [], [], 0.6)
      expect(deal.tendencia).toBe(0)
    })
  })

  // ── esRiesgo ──────────────────────────────────────────────────────────────

  describe('esRiesgo', () => {
    it('returns true when score drops more than 15 points', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 80 }))
      deal.actualizarScore(60, [], ['cliente_insatisfecho'], 0.4)
      expect(deal.esRiesgo).toBe(true)
    })

    it('returns false when score drops exactly 10 points', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 70 }))
      deal.actualizarScore(60, [], [], 0.5)
      expect(deal.esRiesgo).toBe(false)
    })

    it('returns false when score is improving', () => {
      const deal = DealScoring.create(makeProps({ scoreActual: 50 }))
      deal.actualizarScore(80, [], [], 0.8)
      expect(deal.esRiesgo).toBe(false)
    })
  })
})

describe('DealScoreCategory', () => {
  describe('enum values', () => {
    it('has HOT value', () => {
      expect(DealScoreCategory.HOT).toBe('HOT')
    })

    it('has WARM value', () => {
      expect(DealScoreCategory.WARM).toBe('WARM')
    })

    it('has NEUTRAL value', () => {
      expect(DealScoreCategory.NEUTRAL).toBe('NEUTRAL')
    })

    it('has COLD value', () => {
      expect(DealScoreCategory.COLD).toBe('COLD')
    })

    it('has LOST_CAUSE value', () => {
      expect(DealScoreCategory.LOST_CAUSE).toBe('LOST_CAUSE')
    })
  })

  describe('getCategoryFromScore', () => {
    it('HOT for score 80-100', () => {
      expect(getCategoryFromScore(80)).toBe('HOT')
      expect(getCategoryFromScore(100)).toBe('HOT')
    })

    it('WARM for score 60-79', () => {
      expect(getCategoryFromScore(60)).toBe('WARM')
      expect(getCategoryFromScore(79)).toBe('WARM')
    })

    it('NEUTRAL for score 40-59', () => {
      expect(getCategoryFromScore(40)).toBe('NEUTRAL')
      expect(getCategoryFromScore(59)).toBe('NEUTRAL')
    })

    it('COLD for score 10-39', () => {
      expect(getCategoryFromScore(10)).toBe('COLD')
      expect(getCategoryFromScore(39)).toBe('COLD')
    })

    it('LOST_CAUSE for score 0-9', () => {
      expect(getCategoryFromScore(0)).toBe('LOST_CAUSE')
      expect(getCategoryFromScore(9)).toBe('LOST_CAUSE')
    })
  })
})
