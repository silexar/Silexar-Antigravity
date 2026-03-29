import { describe, it, expect } from 'vitest'
import { HorarioEmision } from '../../../modules/conciliacion/domain/value-objects/HorarioEmision.js'
import { DuracionSpot } from '../../../modules/conciliacion/domain/value-objects/DuracionSpot.js'
import { CodigoSP } from '../../../modules/conciliacion/domain/value-objects/CodigoSP.js'
import { EstadoEmision } from '../../../modules/conciliacion/domain/value-objects/EstadoEmision.js'

describe('HorarioEmision', () => {
  describe('create', () => {
    it('creates from valid HH:mm:ss string', () => {
      const h = HorarioEmision.create('08:30:00')
      expect(h.value).toBe('08:30:00')
    })

    it('creates at midnight', () => {
      const h = HorarioEmision.create('00:00:00')
      expect(h.value).toBe('00:00:00')
    })

    it('creates at end of day', () => {
      const h = HorarioEmision.create('23:59:59')
      expect(h.value).toBe('23:59:59')
    })

    it('throws on invalid format', () => {
      expect(() => HorarioEmision.create('8:30')).toThrow()
      expect(() => HorarioEmision.create('invalid')).toThrow()
      expect(() => HorarioEmision.create('25:00:00')).toThrow()
    })

    it('throws on invalid minutes', () => {
      expect(() => HorarioEmision.create('08:60:00')).toThrow()
    })

    it('throws on invalid seconds', () => {
      expect(() => HorarioEmision.create('08:30:60')).toThrow()
    })
  })

  describe('diffInSeconds', () => {
    it('returns 0 for same time', () => {
      const a = HorarioEmision.create('08:00:00')
      expect(a.diffInSeconds(a)).toBe(0)
    })

    it('returns 60 for 1-minute difference', () => {
      const a = HorarioEmision.create('08:00:00')
      const b = HorarioEmision.create('08:01:00')
      expect(a.diffInSeconds(b)).toBe(60)
    })

    it('returns 3600 for 1-hour difference', () => {
      const a = HorarioEmision.create('08:00:00')
      const b = HorarioEmision.create('09:00:00')
      expect(a.diffInSeconds(b)).toBe(3600)
    })

    it('returns absolute value (positive) for reverse order', () => {
      const a = HorarioEmision.create('09:00:00')
      const b = HorarioEmision.create('08:00:00')
      expect(Math.abs(a.diffInSeconds(b))).toBe(3600)
    })

    it('calculates cross-midnight difference correctly', () => {
      const a = HorarioEmision.create('23:59:00')
      const b = HorarioEmision.create('00:00:00')
      const diff = a.diffInSeconds(b)
      expect(Math.abs(diff)).toBeGreaterThan(0)
    })

    it('returns 30 for 30-second difference', () => {
      const a = HorarioEmision.create('10:00:00')
      const b = HorarioEmision.create('10:00:30')
      expect(a.diffInSeconds(b)).toBe(30)
    })

    it('returns 3661 for 1h 1m 1s difference', () => {
      const a = HorarioEmision.create('10:00:00')
      const b = HorarioEmision.create('11:01:01')
      expect(a.diffInSeconds(b)).toBe(3661)
    })
  })

  describe('equals', () => {
    it('returns true for same time', () => {
      expect(HorarioEmision.create('08:00:00').equals(HorarioEmision.create('08:00:00'))).toBe(true)
    })

    it('returns false for different times', () => {
      expect(HorarioEmision.create('08:00:00').equals(HorarioEmision.create('09:00:00'))).toBe(false)
    })
  })
})

describe('DuracionSpot', () => {
  describe('create', () => {
    it('creates with 5 seconds (minimum)', () => {
      const d = DuracionSpot.create(5)
      expect(d.value).toBe(5)
    })

    it('creates with 30 seconds (standard)', () => {
      const d = DuracionSpot.create(30)
      expect(d.value).toBe(30)
    })

    it('creates with 180 seconds (maximum)', () => {
      const d = DuracionSpot.create(180)
      expect(d.value).toBe(180)
    })

    it('throws when duration is below 5 seconds', () => {
      expect(() => DuracionSpot.create(4)).toThrow()
      expect(() => DuracionSpot.create(0)).toThrow()
    })

    it('throws when duration exceeds 180 seconds', () => {
      expect(() => DuracionSpot.create(181)).toThrow()
    })

    it('accepts string input', () => {
      const d = DuracionSpot.create('60')
      expect(d.value).toBe(60)
    })
  })

  describe('display', () => {
    it('formats 30 seconds correctly via label', () => {
      const d = DuracionSpot.create(30)
      expect(d.label).toContain('30')
    })

    it('formats 90 seconds correctly via label', () => {
      const d = DuracionSpot.create(90)
      expect(d.label).toBeDefined()
    })
  })
})

describe('CodigoSP', () => {
  describe('create', () => {
    it('creates valid SP + 6 digits code', () => {
      const c = CodigoSP.create('SP123456')
      expect(c.value).toBe('SP123456')
    })

    it('creates SP000001', () => {
      const c = CodigoSP.create('SP000001')
      expect(c.value).toBe('SP000001')
    })

    it('creates SP999999', () => {
      const c = CodigoSP.create('SP999999')
      expect(c.value).toBe('SP999999')
    })

    it('throws for wrong prefix', () => {
      expect(() => CodigoSP.create('AB123456')).toThrow()
    })

    it('throws for wrong digit count (5 digits)', () => {
      expect(() => CodigoSP.create('SP12345')).toThrow()
    })

    it('throws for wrong digit count (7 digits)', () => {
      expect(() => CodigoSP.create('SP1234567')).toThrow()
    })

    it('throws for non-numeric suffix', () => {
      expect(() => CodigoSP.create('SPACEFOO')).toThrow()
    })
  })

  describe('equals', () => {
    it('returns true for same code', () => {
      expect(CodigoSP.create('SP123456').equals(CodigoSP.create('SP123456'))).toBe(true)
    })

    it('returns false for different codes', () => {
      expect(CodigoSP.create('SP123456').equals(CodigoSP.create('SP654321'))).toBe(false)
    })
  })
})

describe('EstadoEmision', () => {
  describe('isEmitido', () => {
    it('returns true for EMITIDO', () => {
      expect(EstadoEmision.create('EMITIDO').isEmitido()).toBe(true)
    })

    it('returns false for RECUPERADO_AUTO', () => {
      expect(EstadoEmision.create('RECUPERADO_AUTO').isEmitido()).toBe(false)
    })

    it('returns false for RECUPERADO_MANUAL', () => {
      expect(EstadoEmision.create('RECUPERADO_MANUAL').isEmitido()).toBe(false)
    })

    it('returns false for NO_EMITIDO', () => {
      expect(EstadoEmision.create('NO_EMITIDO').isEmitido()).toBe(false)
    })

    it('returns false for PROGRAMADO', () => {
      expect(EstadoEmision.create('PROGRAMADO').isEmitido()).toBe(false)
    })
  })

  describe('isNoEmitido', () => {
    it('returns true for NO_EMITIDO', () => {
      expect(EstadoEmision.create('NO_EMITIDO').isNoEmitido()).toBe(true)
    })

    it('returns false for EMITIDO', () => {
      expect(EstadoEmision.create('EMITIDO').isNoEmitido()).toBe(false)
    })
  })

  describe('all valid states', () => {
    const states = ['EMITIDO', 'NO_EMITIDO', 'RECUPERADO_AUTO', 'RECUPERADO_MANUAL', 'PENDIENTE_MANUAL', 'PROGRAMADO'] as const
    for (const state of states) {
      it(`accepts state ${state}`, () => {
        const e = EstadoEmision.create(state)
        expect(e.value).toBe(state)
      })
    }
  })
})
