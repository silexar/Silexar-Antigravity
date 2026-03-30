import { describe, it, expect } from 'vitest'
import { PeriodoVigencia } from '../../../modules/vencimientos/domain/value-objects/PeriodoVigencia.js'

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

function daysAgo(days: number): Date {
  return daysFromNow(-days)
}

function todayMidnight(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

describe('PeriodoVigencia', () => {
  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates valid period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysFromNow(1),
        fechaFin: daysFromNow(30),
      })
      expect(periodo.duracionDias).toBeGreaterThan(0)
    })

    it('throws when fechaFin <= fechaInicio', () => {
      expect(() =>
        PeriodoVigencia.create({
          fechaInicio: daysFromNow(10),
          fechaFin: daysFromNow(5),
        })
      ).toThrow('Fecha fin debe ser posterior')
    })

    it('throws when fechaFin equals fechaInicio', () => {
      const same = new Date()
      expect(() =>
        PeriodoVigencia.create({ fechaInicio: same, fechaFin: same })
      ).toThrow('Fecha fin debe ser posterior')
    })

    it('throws when fechaInicio is invalid', () => {
      expect(() =>
        PeriodoVigencia.create({
          fechaInicio: new Date('invalid'),
          fechaFin: daysFromNow(10),
        })
      ).toThrow('Fecha de inicio inválida')
    })

    it('throws when fechaFin is invalid', () => {
      expect(() =>
        PeriodoVigencia.create({
          fechaInicio: daysFromNow(1),
          fechaFin: new Date('bad'),
        })
      ).toThrow('Fecha de fin inválida')
    })
  })

  // ── desdeHoyPorMeses ──────────────────────────────────────────────────────

  describe('desdeHoyPorMeses', () => {
    it('creates period starting today for N months', () => {
      const periodo = PeriodoVigencia.desdeHoyPorMeses(6)
      expect(periodo.duracionMeses).toBeCloseTo(6, 0)
    })
  })

  // ── duracionDias / duracionMeses ──────────────────────────────────────────

  describe('duracionDias', () => {
    it('calculates total days of the period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-01-31'),
      })
      expect(periodo.duracionDias).toBe(30)
    })
  })

  describe('duracionMeses', () => {
    it('approximates 3 months for ~90-day period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-04-01'),
      })
      expect(periodo.duracionMeses).toBeCloseTo(3, 0)
    })
  })

  // ── diasRestantes ─────────────────────────────────────────────────────────

  describe('diasRestantes', () => {
    it('returns positive number for future fechaFin', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(5),
        fechaFin: daysFromNow(10),
      })
      // Math.ceil-based calc may yield 10 or 11 depending on exact millisecond timing
      expect(periodo.diasRestantes).toBeGreaterThanOrEqual(10)
      expect(periodo.diasRestantes).toBeLessThanOrEqual(11)
    })

    it('returns 0 when fechaFin is today midnight', () => {
      const today = todayMidnight()
      const yesterday = daysAgo(1)
      const periodo = PeriodoVigencia.create({
        fechaInicio: yesterday,
        fechaFin: today,
      })
      expect(periodo.diasRestantes).toBe(0)
    })

    it('returns negative for past fechaFin', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2020-01-01'),
        fechaFin: new Date('2020-12-31'),
      })
      expect(periodo.diasRestantes).toBeLessThan(0)
    })
  })

  // ── estado ────────────────────────────────────────────────────────────────

  describe('estado', () => {
    it('returns futuro when fechaInicio is in the future', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysFromNow(5),
        fechaFin: daysFromNow(30),
      })
      expect(periodo.estado).toBe('futuro')
    })

    it('returns vencido for past period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2020-01-01'),
        fechaFin: new Date('2020-12-31'),
      })
      expect(periodo.estado).toBe('vencido')
    })

    it('returns por_vencer when <= 30 days remain', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(60),
        fechaFin: daysFromNow(15),
      })
      expect(periodo.estado).toBe('por_vencer')
    })

    it('returns activo when > 30 days remain', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(10),
        fechaFin: daysFromNow(60),
      })
      expect(periodo.estado).toBe('activo')
    })
  })

  // ── porcentajeTranscurrido ────────────────────────────────────────────────

  describe('porcentajeTranscurrido', () => {
    it('returns 0 for future period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysFromNow(5),
        fechaFin: daysFromNow(30),
      })
      expect(periodo.porcentajeTranscurrido).toBe(0)
    })

    it('returns 100 for expired period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2020-01-01'),
        fechaFin: new Date('2020-12-31'),
      })
      expect(periodo.porcentajeTranscurrido).toBe(100)
    })
  })

  // ── venceEnDias ───────────────────────────────────────────────────────────

  describe('venceEnDias', () => {
    it('returns true when diasRestantes <= threshold', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(20),
        fechaFin: daysFromNow(5),
      })
      expect(periodo.venceEnDias(7)).toBe(true)
    })

    it('returns false when diasRestantes > threshold', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(5),
        fechaFin: daysFromNow(30),
      })
      expect(periodo.venceEnDias(7)).toBe(false)
    })

    it('returns false for already-expired period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2020-01-01'),
        fechaFin: new Date('2020-12-31'),
      })
      expect(periodo.venceEnDias(7)).toBe(false)
    })
  })

  // ── terminaManana / terminaHoy ────────────────────────────────────────────

  describe('terminaManana', () => {
    it('returns true when exactly 1 day remains', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(10),
        fechaFin: daysFromNow(1),
      })
      expect(periodo.terminaManana()).toBe(true)
    })

    it('returns false when 2+ days remain', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(10),
        fechaFin: daysFromNow(5),
      })
      expect(periodo.terminaManana()).toBe(false)
    })
  })

  describe('terminaHoy', () => {
    it('returns true when 0 days remain (fechaFin = today midnight)', () => {
      const today = todayMidnight()
      const yesterday = daysAgo(1)
      const periodo = PeriodoVigencia.create({
        fechaInicio: yesterday,
        fechaFin: today,
      })
      expect(periodo.terminaHoy()).toBe(true)
    })
  })

  // ── superoFechaInicio / supero48hSinIniciar ───────────────────────────────

  describe('superoFechaInicio', () => {
    it('returns true when fechaInicio is in the past', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(3),
        fechaFin: daysFromNow(10),
      })
      expect(periodo.superoFechaInicio()).toBe(true)
    })

    it('returns false when fechaInicio is in the future', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysFromNow(3),
        fechaFin: daysFromNow(10),
      })
      expect(periodo.superoFechaInicio()).toBe(false)
    })
  })

  describe('supero48hSinIniciar', () => {
    it('returns true when diasSinIniciar >= 2', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(3),
        fechaFin: daysFromNow(10),
      })
      expect(periodo.supero48hSinIniciar()).toBe(true)
    })

    it('returns false when diasSinIniciar < 2', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: daysAgo(1),
        fechaFin: daysFromNow(10),
      })
      expect(periodo.supero48hSinIniciar()).toBe(false)
    })
  })

  // ── seSolapaCon ───────────────────────────────────────────────────────────

  describe('seSolapaCon', () => {
    it('returns true for overlapping periods', () => {
      const a = PeriodoVigencia.create({ fechaInicio: daysFromNow(1), fechaFin: daysFromNow(20) })
      const b = PeriodoVigencia.create({ fechaInicio: daysFromNow(10), fechaFin: daysFromNow(30) })
      expect(a.seSolapaCon(b)).toBe(true)
    })

    it('returns false for non-overlapping periods', () => {
      const a = PeriodoVigencia.create({ fechaInicio: daysFromNow(1), fechaFin: daysFromNow(10) })
      const b = PeriodoVigencia.create({ fechaInicio: daysFromNow(15), fechaFin: daysFromNow(30) })
      expect(a.seSolapaCon(b)).toBe(false)
    })

    it('calculates dias de solapamiento correctly', () => {
      const a = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-01-20'),
      })
      const b = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-10'),
        fechaFin: new Date('2025-01-30'),
      })
      expect(a.diasDeSolapamiento(b)).toBe(10)
    })

    it('returns 0 dias de solapamiento for non-overlapping periods', () => {
      const a = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-01-10'),
      })
      const b = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-15'),
        fechaFin: new Date('2025-01-31'),
      })
      expect(a.diasDeSolapamiento(b)).toBe(0)
    })
  })

  // ── contieneFecha ────────────────────────────────────────────────────────

  describe('contieneFecha', () => {
    it('returns true for date within the period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
      })
      expect(periodo.contieneFecha(new Date('2025-06-15'))).toBe(true)
    })

    it('returns false for date outside the period', () => {
      const periodo = PeriodoVigencia.create({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-06-30'),
      })
      expect(periodo.contieneFecha(new Date('2025-09-15'))).toBe(false)
    })
  })

  // ── equals ────────────────────────────────────────────────────────────────

  describe('equals', () => {
    it('returns true for same dates', () => {
      const inicio = new Date('2025-01-01')
      const fin = new Date('2025-12-31')
      const a = PeriodoVigencia.create({ fechaInicio: inicio, fechaFin: fin })
      const b = PeriodoVigencia.create({ fechaInicio: new Date('2025-01-01'), fechaFin: new Date('2025-12-31') })
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different dates', () => {
      const a = PeriodoVigencia.create({ fechaInicio: daysFromNow(1), fechaFin: daysFromNow(10) })
      const b = PeriodoVigencia.create({ fechaInicio: daysFromNow(2), fechaFin: daysFromNow(10) })
      expect(a.equals(b)).toBe(false)
    })
  })
})
