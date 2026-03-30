/**
 * Tests: Campanas — Campana (Aggregate Root), EstadoCampana, PresupuestoCampana, NumeroCampana
 *
 * Cubre la lógica de negocio del módulo campañas radiales: ciclo de vida, transiciones
 * de estado, validaciones de invariantes y cálculos de presupuesto.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Campana, type TipoCampana } from '../../../modules/campanas/domain/entities/Campana.js'
import { EstadoCampana, type EstadoCampanaValue } from '../../../modules/campanas/domain/value-objects/EstadoCampana.js'
import { NumeroCampana } from '../../../modules/campanas/domain/value-objects/NumeroCampana.js'
import { PresupuestoCampana, type PresupuestoData } from '../../../modules/campanas/domain/value-objects/PresupuestoCampana.js'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function makeCampanaProps(
  overrides: Partial<Parameters<typeof Campana.crear>[0]> = {}
): Parameters<typeof Campana.crear>[0] {
  const now = new Date()
  return {
    id: 'camp-test-001',
    tenantId: 'tenant-galaxia-fm',
    numeroCampana: 'CAMP-2026-00042',
    nombre: 'Campaña Automotriz Primavera 2026',
    tipo: 'PRIME' as TipoCampana,
    estado: 'BORRADOR' as EstadoCampanaValue,
    anuncianteId: 'anunciante-automotriz-norte',
    presupuesto: { monto: 1_800_000, moneda: 'CLP' },
    fechaInicio: daysFromNow(1),
    fechaFin: daysFromNow(91),
    creadoPor: 'exec-carmen-silva',
    creadoEn: now,
    actualizadoEn: now,
    ...overrides,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// NumeroCampana
// ──────────────────────────────────────────────────────────────────────────────

describe('NumeroCampana', () => {
  describe('crear', () => {
    it('creates valid number with correct format CAMP-YYYY-NNNNN', () => {
      const num = NumeroCampana.crear('CAMP-2026-00001')
      expect(num.valor).toBe('CAMP-2026-00001')
    })

    it('throws for format without CAMP prefix', () => {
      expect(() => NumeroCampana.crear('2026-00001')).toThrow('inválido')
    })

    it('throws for incomplete sequence number (less than 5 digits)', () => {
      expect(() => NumeroCampana.crear('CAMP-2026-0001')).toThrow('inválido')
    })

    it('throws for extra characters at the end', () => {
      expect(() => NumeroCampana.crear('CAMP-2026-00001-EXTRA')).toThrow('inválido')
    })

    it('throws for empty string', () => {
      expect(() => NumeroCampana.crear('')).toThrow('inválido')
    })
  })

  describe('generar', () => {
    it('generates formatted number with zero-padded sequence', () => {
      const num = NumeroCampana.generar(2026, 42)
      expect(num.valor).toBe('CAMP-2026-00042')
    })

    it('generates number with sequence padded to 5 digits', () => {
      const num = NumeroCampana.generar(2026, 1)
      expect(num.valor).toBe('CAMP-2026-00001')
    })

    it('handles large sequence numbers', () => {
      const num = NumeroCampana.generar(2026, 99999)
      expect(num.valor).toBe('CAMP-2026-99999')
    })
  })

  describe('equals', () => {
    it('returns true for same number', () => {
      const a = NumeroCampana.crear('CAMP-2026-00010')
      const b = NumeroCampana.crear('CAMP-2026-00010')
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different numbers', () => {
      const a = NumeroCampana.crear('CAMP-2026-00010')
      const b = NumeroCampana.crear('CAMP-2026-00011')
      expect(a.equals(b)).toBe(false)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// PresupuestoCampana
// ──────────────────────────────────────────────────────────────────────────────

describe('PresupuestoCampana', () => {
  describe('crear', () => {
    it('creates valid CLP budget', () => {
      const p = PresupuestoCampana.crear({ monto: 1_500_000, moneda: 'CLP' })
      expect(p.monto).toBe(1_500_000)
      expect(p.moneda).toBe('CLP')
    })

    it('creates valid USD budget', () => {
      const p = PresupuestoCampana.crear({ monto: 5_000, moneda: 'USD' })
      expect(p.moneda).toBe('USD')
    })

    it('creates valid EUR budget', () => {
      const p = PresupuestoCampana.crear({ monto: 4_000, moneda: 'EUR' })
      expect(p.moneda).toBe('EUR')
    })

    it('creates zero budget (free/promo campaign)', () => {
      const p = PresupuestoCampana.crear({ monto: 0, moneda: 'CLP' })
      expect(p.esCero).toBe(true)
    })

    it('throws for negative budget', () => {
      expect(() =>
        PresupuestoCampana.crear({ monto: -1, moneda: 'CLP' })
      ).toThrow('negativo')
    })

    it('throws for budget exceeding maximum', () => {
      expect(() =>
        PresupuestoCampana.crear({ monto: 1_000_000_001, moneda: 'CLP' })
      ).toThrow('máximo')
    })

    it('throws for invalid currency', () => {
      expect(() =>
        PresupuestoCampana.crear({ monto: 1000, moneda: 'ARS' as PresupuestoData['moneda'] })
      ).toThrow('inválida')
    })
  })

  describe('esMayorQue', () => {
    it('returns true when monto is greater', () => {
      const a = PresupuestoCampana.crear({ monto: 2_000_000, moneda: 'CLP' })
      const b = PresupuestoCampana.crear({ monto: 1_000_000, moneda: 'CLP' })
      expect(a.esMayorQue(b)).toBe(true)
    })

    it('returns false when monto is lower', () => {
      const a = PresupuestoCampana.crear({ monto: 500_000, moneda: 'CLP' })
      const b = PresupuestoCampana.crear({ monto: 1_500_000, moneda: 'CLP' })
      expect(a.esMayorQue(b)).toBe(false)
    })

    it('throws when comparing different currencies', () => {
      const clp = PresupuestoCampana.crear({ monto: 1_000_000, moneda: 'CLP' })
      const usd = PresupuestoCampana.crear({ monto: 1_000, moneda: 'USD' })
      expect(() => clp.esMayorQue(usd)).toThrow('distintas monedas')
    })
  })

  describe('equals', () => {
    it('returns true for equal monto and moneda', () => {
      const a = PresupuestoCampana.crear({ monto: 800_000, moneda: 'CLP' })
      const b = PresupuestoCampana.crear({ monto: 800_000, moneda: 'CLP' })
      expect(a.equals(b)).toBe(true)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// EstadoCampana
// ──────────────────────────────────────────────────────────────────────────────

describe('EstadoCampana', () => {
  describe('crear', () => {
    it('creates BORRADOR state', () => {
      const e = EstadoCampana.crear('BORRADOR')
      expect(e.esBorrador).toBe(true)
    })

    it('creates ACTIVA state', () => {
      const e = EstadoCampana.crear('ACTIVA')
      expect(e.estaActiva).toBe(true)
    })

    it('throws for invalid state string', () => {
      expect(() => EstadoCampana.crear('ELIMINADA')).toThrow('inválido')
    })
  })

  describe('puedeTransicionarA — transitions válidas', () => {
    it('BORRADOR can transition to ACTIVA', () => {
      expect(EstadoCampana.borrador().puedeTransicionarA('ACTIVA')).toBe(true)
    })

    it('BORRADOR can transition to CANCELADA', () => {
      expect(EstadoCampana.borrador().puedeTransicionarA('CANCELADA')).toBe(true)
    })

    it('ACTIVA can transition to PAUSADA', () => {
      expect(EstadoCampana.activa().puedeTransicionarA('PAUSADA')).toBe(true)
    })

    it('ACTIVA can transition to FINALIZADA', () => {
      expect(EstadoCampana.activa().puedeTransicionarA('FINALIZADA')).toBe(true)
    })

    it('PAUSADA can transition to ACTIVA (reactivation)', () => {
      expect(EstadoCampana.pausada().puedeTransicionarA('ACTIVA')).toBe(true)
    })
  })

  describe('puedeTransicionarA — transitions inválidas', () => {
    it('BORRADOR cannot transition to PAUSADA', () => {
      expect(EstadoCampana.borrador().puedeTransicionarA('PAUSADA')).toBe(false)
    })

    it('BORRADOR cannot transition to FINALIZADA directly', () => {
      expect(EstadoCampana.borrador().puedeTransicionarA('FINALIZADA')).toBe(false)
    })

    it('FINALIZADA cannot transition to any state (terminal)', () => {
      const finalizada = EstadoCampana.crear('FINALIZADA')
      expect(finalizada.puedeTransicionarA('BORRADOR')).toBe(false)
      expect(finalizada.puedeTransicionarA('ACTIVA')).toBe(false)
      expect(finalizada.puedeTransicionarA('CANCELADA')).toBe(false)
    })

    it('CANCELADA cannot transition to any state (terminal)', () => {
      const cancelada = EstadoCampana.crear('CANCELADA')
      expect(cancelada.puedeTransicionarA('BORRADOR')).toBe(false)
      expect(cancelada.puedeTransicionarA('ACTIVA')).toBe(false)
    })
  })

  describe('flags estaTerminada', () => {
    it('FINALIZADA is terminal', () => {
      expect(EstadoCampana.crear('FINALIZADA').estaTerminada).toBe(true)
    })

    it('CANCELADA is terminal', () => {
      expect(EstadoCampana.crear('CANCELADA').estaTerminada).toBe(true)
    })

    it('ACTIVA is not terminal', () => {
      expect(EstadoCampana.activa().estaTerminada).toBe(false)
    })

    it('BORRADOR is not terminal', () => {
      expect(EstadoCampana.borrador().estaTerminada).toBe(false)
    })
  })

  describe('equals y toString', () => {
    it('equals returns true for same state', () => {
      expect(EstadoCampana.activa().equals(EstadoCampana.crear('ACTIVA'))).toBe(true)
    })

    it('toString returns state value string', () => {
      expect(EstadoCampana.borrador().toString()).toBe('BORRADOR')
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Campana (Aggregate Root)
// ──────────────────────────────────────────────────────────────────────────────

describe('Campana', () => {
  describe('crear (factory)', () => {
    it('creates campana with given id', () => {
      const c = Campana.crear(makeCampanaProps())
      expect(c.id).toBe('camp-test-001')
    })

    it('emits CAMPANA_CREADA domain event on creation', () => {
      const c = Campana.crear(makeCampanaProps())
      const eventos = c.tomarEventos()
      expect(eventos.some(e => e.tipo === 'CAMPANA_CREADA')).toBe(true)
    })

    it('starts in BORRADOR state', () => {
      const c = Campana.crear(makeCampanaProps())
      expect(c.estado.esBorrador).toBe(true)
    })

    it('throws when nombre is shorter than 3 characters', () => {
      expect(() =>
        Campana.crear(makeCampanaProps({ nombre: 'AB' }))
      ).toThrow('al menos 3 caracteres')
    })

    it('throws when nombre is empty', () => {
      expect(() =>
        Campana.crear(makeCampanaProps({ nombre: '' }))
      ).toThrow('al menos 3 caracteres')
    })

    it('throws when fechaInicio is same as fechaFin', () => {
      const same = new Date()
      expect(() =>
        Campana.crear(makeCampanaProps({ fechaInicio: same, fechaFin: same }))
      ).toThrow('anterior a la fecha de fin')
    })

    it('throws when fechaInicio is after fechaFin', () => {
      expect(() =>
        Campana.crear(makeCampanaProps({
          fechaInicio: daysFromNow(30),
          fechaFin: daysFromNow(1),
        }))
      ).toThrow('anterior a la fecha de fin')
    })

    it('throws when id is empty', () => {
      expect(() =>
        Campana.crear(makeCampanaProps({ id: '' }))
      ).toThrow('ID de campaña es requerido')
    })

    it('throws when tenantId is empty', () => {
      expect(() =>
        Campana.crear(makeCampanaProps({ tenantId: '' }))
      ).toThrow('Tenant ID es requerido')
    })

    it('throws when anuncianteId is empty', () => {
      expect(() =>
        Campana.crear(makeCampanaProps({ anuncianteId: '' }))
      ).toThrow('Anunciante ID es requerido')
    })

    it('trims whitespace from nombre', () => {
      const c = Campana.crear(makeCampanaProps({ nombre: '  Campaña Retail  ' }))
      expect(c.nombre).toBe('Campaña Retail')
    })
  })

  describe('activar', () => {
    it('transitions BORRADOR → ACTIVA successfully', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec-carmen-silva')
      expect(c.estado.estaActiva).toBe(true)
    })

    it('emits CAMPANA_ACTIVADA event', () => {
      const c = Campana.crear(makeCampanaProps())
      c.tomarEventos() // clear creation event
      c.activar('exec-carmen-silva')
      const eventos = c.tomarEventos()
      expect(eventos.some(e => e.tipo === 'CAMPANA_ACTIVADA')).toBe(true)
    })

    it('throws when trying to activate an already ACTIVE campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec-carmen-silva')
      expect(() => c.activar('exec-carmen-silva')).toThrow('No se puede activar')
    })

    it('throws when trying to activate a FINALIZADA campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.finalizar('exec')
      expect(() => c.activar('exec')).toThrow('No se puede activar')
    })
  })

  describe('pausar', () => {
    it('transitions ACTIVA → PAUSADA', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.pausar('Revisión de materiales', 'exec')
      expect(c.estado.estaPausada).toBe(true)
    })

    it('throws when trying to pause a BORRADOR campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      expect(() => c.pausar('Motivo', 'exec')).toThrow('No se puede pausar')
    })

    it('emits CAMPANA_PAUSADA event with motivo', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.tomarEventos()
      c.pausar('Cliente solicitó pausa por temporada baja', 'exec')
      const eventos = c.tomarEventos()
      const evento = eventos.find(e => e.tipo === 'CAMPANA_PAUSADA')
      expect(evento?.datos.motivo).toBe('Cliente solicitó pausa por temporada baja')
    })
  })

  describe('finalizar', () => {
    it('transitions ACTIVA → FINALIZADA', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.finalizar('exec')
      expect(c.estado.estaFinalizada).toBe(true)
    })

    it('transitions PAUSADA → FINALIZADA', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.pausar('pausa', 'exec')
      c.finalizar('exec')
      expect(c.estado.estaFinalizada).toBe(true)
    })

    it('throws when trying to finalize a BORRADOR campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      expect(() => c.finalizar('exec')).toThrow('No se puede finalizar')
    })
  })

  describe('cancelar', () => {
    it('cancels a BORRADOR campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.cancelar('Cliente desistió', 'exec')
      expect(c.estado.estaCancelada).toBe(true)
    })

    it('cancels an ACTIVA campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.cancelar('Anunciante cancela contrato', 'exec')
      expect(c.estado.estaCancelada).toBe(true)
    })

    it('throws when trying to cancel a FINALIZADA campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.finalizar('exec')
      expect(() => c.cancelar('Motivo', 'exec')).toThrow('ya terminada')
    })

    it('throws when trying to cancel an already CANCELADA campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.cancelar('Primer motivo', 'exec')
      expect(() => c.cancelar('Segundo intento', 'exec')).toThrow('ya terminada')
    })

    it('emits CAMPANA_CANCELADA event with motivo', () => {
      const c = Campana.crear(makeCampanaProps())
      c.tomarEventos()
      c.cancelar('Presupuesto insuficiente', 'gerente')
      const eventos = c.tomarEventos()
      expect(eventos.some(e => e.tipo === 'CAMPANA_CANCELADA')).toBe(true)
    })
  })

  describe('actualizarNombre', () => {
    it('updates nombre in BORRADOR state', () => {
      const c = Campana.crear(makeCampanaProps())
      c.actualizarNombre('Campaña Retail Invierno 2026')
      expect(c.nombre).toBe('Campaña Retail Invierno 2026')
    })

    it('updates nombre in PAUSADA state', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.pausar('pausa', 'exec')
      c.actualizarNombre('Nombre Actualizado Pausada')
      expect(c.nombre).toBe('Nombre Actualizado Pausada')
    })

    it('throws when trying to update nombre in ACTIVA state', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      expect(() => c.actualizarNombre('Nuevo Nombre')).toThrow('BORRADOR o PAUSADA')
    })

    it('throws when new nombre is shorter than 3 characters', () => {
      const c = Campana.crear(makeCampanaProps())
      expect(() => c.actualizarNombre('AB')).toThrow('al menos 3 caracteres')
    })
  })

  describe('actualizarPresupuesto', () => {
    it('updates presupuesto in BORRADOR state', () => {
      const c = Campana.crear(makeCampanaProps())
      c.actualizarPresupuesto({ monto: 3_000_000, moneda: 'CLP' })
      expect(c.presupuesto.monto).toBe(3_000_000)
    })

    it('throws when trying to update presupuesto in FINALIZADA state', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.finalizar('exec')
      expect(() => c.actualizarPresupuesto({ monto: 5_000_000, moneda: 'CLP' })).toThrow('terminada')
    })
  })

  describe('diasRestantes', () => {
    it('returns 0 for a FINALIZADA campaign', () => {
      const c = Campana.crear(makeCampanaProps())
      c.activar('exec')
      c.finalizar('exec')
      expect(c.diasRestantes()).toBe(0)
    })

    it('returns positive number for an active future campaign', () => {
      const c = Campana.crear(makeCampanaProps({
        fechaInicio: daysFromNow(1),
        fechaFin: daysFromNow(30),
      }))
      c.activar('exec')
      expect(c.diasRestantes()).toBeGreaterThan(0)
    })
  })

  describe('estaProximaAVencer', () => {
    it('returns true when active campaign has <= 7 days remaining', () => {
      const c = Campana.crear(makeCampanaProps({
        fechaInicio: daysFromNow(0),
        fechaFin: daysFromNow(5),
      }))
      c.activar('exec')
      expect(c.estaProximaAVencer(7)).toBe(true)
    })

    it('returns false when campaign is not active', () => {
      const c = Campana.crear(makeCampanaProps({
        fechaInicio: daysFromNow(0),
        fechaFin: daysFromNow(5),
      }))
      // stays in BORRADOR
      expect(c.estaProximaAVencer(7)).toBe(false)
    })
  })

  describe('agregarObservacion', () => {
    it('stores observacion correctly', () => {
      const c = Campana.crear(makeCampanaProps())
      c.agregarObservacion('Cliente prefiere spots en horario mañanero únicamente')
      expect(c.observaciones).toBe('Cliente prefiere spots en horario mañanero únicamente')
    })
  })

  describe('tomarEventos (consume-and-clear)', () => {
    it('clears events after taking them', () => {
      const c = Campana.crear(makeCampanaProps())
      expect(c.tomarEventos().length).toBeGreaterThan(0)
      expect(c.tomarEventos()).toHaveLength(0)
    })
  })

  describe('reconstituir (from persistence)', () => {
    it('does NOT emit CAMPANA_CREADA when reconstituting from DB', () => {
      const c = Campana.reconstituir(makeCampanaProps())
      expect(c.tomarEventos()).toHaveLength(0)
    })

    it('preserves all props from persistence', () => {
      const props = makeCampanaProps({ estado: 'ACTIVA', nombre: 'Campaña Persistida' })
      const c = Campana.reconstituir(props)
      expect(c.nombre).toBe('Campaña Persistida')
      expect(c.estado.estaActiva).toBe(true)
    })
  })
})
