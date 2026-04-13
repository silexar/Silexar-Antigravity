import { describe, it, expect } from 'vitest'
import { AccountHealthScore, type DimensionHealth } from '../../../modules/equipos-ventas/domain/entities/AccountHealthScore.js'
import { RiskLevel, RISK_CONFIG, RISK_THRESHOLDS } from '../../../modules/equipos-ventas/domain/value-objects/RiskLevel.js'

// ── Factories ───────────────────────────────────────────────────────────────

function makeDimensions(score: number): DimensionHealth[] {
  return [
    { nombre: 'ENGAGEMENT', score, peso: 0.25, tendencia: 'STABLE' },
    { nombre: 'SATISFACTION', score, peso: 0.25, tendencia: 'STABLE' },
    { nombre: 'GROWTH', score, peso: 0.25, tendencia: 'STABLE' },
    { nombre: 'ADVOCACY', score, peso: 0.25, tendencia: 'STABLE' },
  ]
}

function makeProps(dimensionScore = 75, overrides: Record<string, unknown> = {}) {
  return {
    cuentaId: 'cuenta-1',
    cuentaNombre: 'Cliente Test SA',
    kamId: 'kam-1',
    dimensiones: makeDimensions(dimensionScore),
    alertas: [],
    ultimaInteraccion: new Date(),
    metadata: {},
    ...overrides,
  }
}

describe('AccountHealthScore entity', () => {
  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates entity with correct cuentaNombre', () => {
      const ahs = AccountHealthScore.create(makeProps())
      expect(ahs.cuentaNombre).toBe('Cliente Test SA')
    })

    it('calculates scoreGeneral = 100 when all dimensions are 100', () => {
      const ahs = AccountHealthScore.create(makeProps(100))
      expect(ahs.scoreGeneral).toBe(100)
    })

    it('calculates scoreGeneral = 0 when all dimensions are 0', () => {
      const ahs = AccountHealthScore.create(makeProps(0))
      expect(ahs.scoreGeneral).toBe(0)
    })

    it('calculates scoreGeneral as weighted average', () => {
      const ahs = AccountHealthScore.create(makeProps(80))
      expect(ahs.scoreGeneral).toBe(80)
    })
  })

  // ── riskLevel derived from scoreGeneral ────────────────────────────────────

  describe('riskLevel (from scoreGeneral)', () => {
    it('LOW risk when scoreGeneral >= 75', () => {
      const ahs = AccountHealthScore.create(makeProps(80))
      expect(ahs.riskLevel).toBe('LOW')
    })

    it('MEDIUM risk when scoreGeneral is 50-74', () => {
      const ahs = AccountHealthScore.create(makeProps(60))
      expect(ahs.riskLevel).toBe('MEDIUM')
    })

    it('HIGH risk when scoreGeneral is 25-49', () => {
      const ahs = AccountHealthScore.create(makeProps(30))
      expect(ahs.riskLevel).toBe('HIGH')
    })

    it('CRITICAL risk when scoreGeneral < 25', () => {
      const ahs = AccountHealthScore.create(makeProps(10))
      expect(ahs.riskLevel).toBe('CRITICAL')
    })
  })

  // ── esEnRiesgo ────────────────────────────────────────────────────────────

  describe('esEnRiesgo', () => {
    it('returns true when riskLevel is HIGH', () => {
      const ahs = AccountHealthScore.create(makeProps(30))
      expect(ahs.esEnRiesgo).toBe(true)
    })

    it('returns true when riskLevel is CRITICAL', () => {
      const ahs = AccountHealthScore.create(makeProps(5))
      expect(ahs.esEnRiesgo).toBe(true)
    })

    it('returns false when riskLevel is LOW', () => {
      const ahs = AccountHealthScore.create(makeProps(80))
      expect(ahs.esEnRiesgo).toBe(false)
    })

    it('returns false when riskLevel is MEDIUM', () => {
      const ahs = AccountHealthScore.create(makeProps(60))
      expect(ahs.esEnRiesgo).toBe(false)
    })
  })

  // ── actualizarDimension ────────────────────────────────────────────────────

  describe('actualizarDimension', () => {
    it('updates specified dimension value', () => {
      const ahs = AccountHealthScore.create(makeProps(50))
      ahs.actualizarDimension('ENGAGEMENT', 95)
      const dim = ahs.toSnapshot().dimensiones.find(d => d.nombre === 'ENGAGEMENT')
      expect(dim?.score).toBe(95)
    })

    it('recalculates scoreGeneral after dimension update', () => {
      const ahs = AccountHealthScore.create(makeProps(0))
      ahs.actualizarDimension('ENGAGEMENT', 100)
      expect(ahs.scoreGeneral).toBeGreaterThan(0)
    })

    it('throws when dimension score is out of range', () => {
      const ahs = AccountHealthScore.create(makeProps())
      expect(() => ahs.actualizarDimension('ENGAGEMENT', 101)).toThrow()
      expect(() => ahs.actualizarDimension('ENGAGEMENT', -1)).toThrow()
    })

    it('throws when dimension not found', () => {
      const ahs = AccountHealthScore.create(makeProps())
      expect(() => ahs.actualizarDimension('INVALID' as unknown, 50)).toThrow()
    })
  })

  // ── registrarInteraccion ───────────────────────────────────────────────────

  describe('registrarInteraccion', () => {
    it('updates ultimaInteraccion to now when called without arg', () => {
      const before = new Date(Date.now() - 5000)
      const ahs = AccountHealthScore.create(makeProps(75, { ultimaInteraccion: before }))
      ahs.registrarInteraccion()
      expect(ahs.toSnapshot().ultimaInteraccion.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })

    it('sets provided date', () => {
      const ahs = AccountHealthScore.create(makeProps())
      const specificDate = new Date('2025-01-15')
      ahs.registrarInteraccion(specificDate)
      expect(ahs.toSnapshot().ultimaInteraccion).toEqual(specificDate)
    })
  })

  // ── alertas ────────────────────────────────────────────────────────────────

  describe('alertas', () => {
    it('agregarAlerta adds an active alert', () => {
      const ahs = AccountHealthScore.create(makeProps())
      ahs.agregarAlerta({ tipo: 'RISK', mensaje: 'Riesgo de churn detectado', prioridad: 'HIGH' })
      expect(ahs.alertasActivas.some(a => a.mensaje === 'Riesgo de churn detectado')).toBe(true)
    })

    it('resolverAlerta marks alert as resolved by id', () => {
      const ahs = AccountHealthScore.create(makeProps())
      ahs.agregarAlerta({ tipo: 'RISK', mensaje: 'Alerta test', prioridad: 'MEDIUM' })
      const alertaId = ahs.alertasActivas[0].id
      ahs.resolverAlerta(alertaId)
      expect(ahs.alertasActivas).toHaveLength(0)
    })

    it('empty alertas returns empty array', () => {
      const ahs = AccountHealthScore.create(makeProps())
      expect(ahs.alertasActivas).toHaveLength(0)
    })

    it('throws when resolving non-existent alert', () => {
      const ahs = AccountHealthScore.create(makeProps())
      expect(() => ahs.resolverAlerta('non-existent-id')).toThrow()
    })
  })
})

describe('RiskLevel', () => {
  describe('enum values', () => {
    it('has all 4 levels', () => {
      expect(RiskLevel.LOW).toBe('LOW')
      expect(RiskLevel.MEDIUM).toBe('MEDIUM')
      expect(RiskLevel.HIGH).toBe('HIGH')
      expect(RiskLevel.CRITICAL).toBe('CRITICAL')
    })
  })

  describe('RISK_THRESHOLDS', () => {
    it('LOW threshold is 75', () => {
      expect(RISK_THRESHOLDS.LOW).toBe(75)
    })

    it('MEDIUM threshold is 50', () => {
      expect(RISK_THRESHOLDS.MEDIUM).toBe(50)
    })

    it('HIGH threshold is 25', () => {
      expect(RISK_THRESHOLDS.HIGH).toBe(25)
    })

    it('CRITICAL threshold is 0', () => {
      expect(RISK_THRESHOLDS.CRITICAL).toBe(0)
    })
  })

  describe('RISK_CONFIG responseTimeHours', () => {
    it('LOW has 168 response hours (7 days)', () => {
      expect(RISK_CONFIG[RiskLevel.LOW].responseTimeHours).toBe(168)
    })

    it('MEDIUM has 72 response hours (3 days)', () => {
      expect(RISK_CONFIG[RiskLevel.MEDIUM].responseTimeHours).toBe(72)
    })

    it('HIGH has 24 response hours (1 day)', () => {
      expect(RISK_CONFIG[RiskLevel.HIGH].responseTimeHours).toBe(24)
    })

    it('CRITICAL has 4 response hours', () => {
      expect(RISK_CONFIG[RiskLevel.CRITICAL].responseTimeHours).toBe(4)
    })
  })
})
