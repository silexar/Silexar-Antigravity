import { describe, it, expect } from 'vitest'
import { ConciliacionDiaria } from '../../../modules/conciliacion/domain/entities/ConciliacionDiaria.js'
import { DiscrepanciaEmision } from '../../../modules/conciliacion/domain/entities/DiscrepanciaEmision.js'
import { RegistroEmisionProgramada } from '../../../modules/conciliacion/domain/entities/RegistroEmisionProgramada.js'
import { SpotNoEmitido } from '../../../modules/conciliacion/domain/entities/SpotNoEmitido.js'
import { FechaConciliacion } from '../../../modules/conciliacion/domain/value-objects/FechaConciliacion.js'
import { EmisoraTarget } from '../../../modules/conciliacion/domain/value-objects/EmisoraTarget.js'
import { CodigoSP } from '../../../modules/conciliacion/domain/value-objects/CodigoSP.js'
import { HorarioEmision } from '../../../modules/conciliacion/domain/value-objects/HorarioEmision.js'
import { DuracionSpot } from '../../../modules/conciliacion/domain/value-objects/DuracionSpot.js'
import { EstadoEmision } from '../../../modules/conciliacion/domain/value-objects/EstadoEmision.js'
import { TipoDiscrepancia } from '../../../modules/conciliacion/domain/value-objects/TipoDiscrepancia.js'

// ── Factories ───────────────────────────────────────────────────────────────

function makeEmisoraTarget(id = 'emisora-1', nombre = 'Emisora Test'): EmisoraTarget {
  return EmisoraTarget.create(id, nombre)
}

function makeRegistroProgramado(num: number): RegistroEmisionProgramada {
  const code = String(num).padStart(6, '0')
  return RegistroEmisionProgramada.create({
    codigoSP: CodigoSP.create(`SP${code}`),
    horario: HorarioEmision.create('08:00:00'),
    duracion: DuracionSpot.create(30),
    cliente: 'Cliente Test',
    campana: 'Campaña Test',
    valorComercial: 100,
  })
}

function makeSpotNoEmitido(registroProgramado: RegistroEmisionProgramada): SpotNoEmitido {
  return SpotNoEmitido.create({
    registroProgramado,
    emisora: makeEmisoraTarget(),
    estado: EstadoEmision.create('NO_EMITIDO'),
    valorRecuperado: 0,
    ejecutivoVentaId: 'ev-1',
    ejecutivoVentaNombre: 'Ejecutivo Test',
    estadoDecision: 'PENDIENTE_TRAFICO',
    materialCargado: true,
  })
}

function makeDiscrepanciaEmision(tipo = 'FALLA_TECNICA'): DiscrepanciaEmision {
  return DiscrepanciaEmision.create({
    codigoSP: CodigoSP.create('SP000001'),
    tipo: TipoDiscrepancia.create(tipo),
    horarioProgramado: HorarioEmision.create('08:00:00'),
    duracionProgramada: DuracionSpot.create(30),
    detalles: `Falla: ${tipo}`,
    resuelta: false,
  })
}

function makeConciliacion(numProgramados = 3): ConciliacionDiaria {
  const registrosProgramados = Array.from({ length: numProgramados }, (_, i) =>
    makeRegistroProgramado(i + 1)
  )
  return ConciliacionDiaria.create({
    fecha: FechaConciliacion.create('2025-06-15'),
    emisora: makeEmisoraTarget(),
    registrosProgramados,
    registrosReales: [],
  })
}

// ── ConciliacionDiaria entity ───────────────────────────────────────────────

describe('ConciliacionDiaria entity', () => {
  describe('create', () => {
    it('creates entity with PENDIENTE state', () => {
      const c = makeConciliacion()
      expect(c.estado).toBe('PENDIENTE')
    })

    it('creates with generated id', () => {
      const c = makeConciliacion()
      expect(c.id).toBeDefined()
    })

    it('exposes emisora.id', () => {
      const c = makeConciliacion()
      expect(c.emisora.id).toBe('emisora-1')
    })

    it('starts with no discrepancias', () => {
      const c = makeConciliacion()
      expect(c.discrepancias).toHaveLength(0)
    })

    it('starts with no spotsNoEmitidos', () => {
      const c = makeConciliacion()
      expect(c.spotsNoEmitidos).toHaveLength(0)
    })
  })

  describe('iniciarProcesamiento', () => {
    it('transitions PENDIENTE → PROCESANDO', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      expect(c.estado).toBe('PROCESANDO')
    })

    it('can be called from PROCESANDO (idempotent - stays PROCESANDO)', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      c.iniciarProcesamiento()
      expect(c.estado).toBe('PROCESANDO')
    })

    it('throws when called on COMPLETADA state', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [])
      expect(() => c.iniciarProcesamiento()).toThrow()
    })
  })

  describe('finalizarProcesamiento', () => {
    it('transitions PROCESANDO → COMPLETADA', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [])
      expect(c.estado).toBe('COMPLETADA')
    })

    it('throws when called on non-PROCESANDO state', () => {
      const c = makeConciliacion()
      expect(() => c.finalizarProcesamiento([], [])).toThrow()
    })

    it('stores discrepancias', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      const d = makeDiscrepanciaEmision()
      c.finalizarProcesamiento([d], [makeSpotNoEmitido(makeRegistroProgramado(2))])
      expect(c.discrepancias).toHaveLength(1)
    })

    it('stores spotsNoEmitidos', () => {
      const c = makeConciliacion(3)
      const reg1 = makeRegistroProgramado(1)
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [makeSpotNoEmitido(reg1)])
      expect(c.spotsNoEmitidos).toHaveLength(1)
    })

    it('emits ConciliacionCompletadaEvent domain event', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [])
      expect(c.domainEvents.length).toBeGreaterThan(0)
      const event = c.domainEvents[0]
      expect(event.constructor.name).toContain('Completada')
    })
  })

  describe('porcentajeCumplimiento', () => {
    it('returns 0% when no programados exist', () => {
      const c = makeConciliacion(0)
      expect(c.porcentajeCumplimiento).toBe(0)
    })

    it('returns 100% when all spots emitted (no spotsNoEmitidos)', () => {
      const c = makeConciliacion(3)
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [])
      expect(c.porcentajeCumplimiento).toBe(100)
    })

    it('returns 0% when all spots are no-emitidos', () => {
      const c = makeConciliacion(3)
      const spots = [
        makeSpotNoEmitido(makeRegistroProgramado(1)),
        makeSpotNoEmitido(makeRegistroProgramado(2)),
        makeSpotNoEmitido(makeRegistroProgramado(3)),
      ]
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], spots)
      expect(c.porcentajeCumplimiento).toBe(0)
    })

    it('returns ~66.7% when 1 of 3 spots not emitted', () => {
      const c = makeConciliacion(3)
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [makeSpotNoEmitido(makeRegistroProgramado(3))])
      expect(c.porcentajeCumplimiento).toBeCloseTo(66.7, 0)
    })

    it('returns 100% when spots emitidos = programados (before finalizarProcesamiento, 0 spotsNoEmitidos)', () => {
      const c = makeConciliacion(3)
      // Before finalization: spotsNoEmitidos = [] → (3-0)/3*100 = 100
      expect(c.porcentajeCumplimiento).toBe(100)
    })
  })

  describe('terminal state COMPLETADA', () => {
    it('cannot iniciarProcesamiento after COMPLETADA', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [])
      expect(() => c.iniciarProcesamiento()).toThrow()
    })

    it('cannot finalizarProcesamiento from COMPLETADA', () => {
      const c = makeConciliacion()
      c.iniciarProcesamiento()
      c.finalizarProcesamiento([], [])
      expect(() => c.finalizarProcesamiento([], [])).toThrow()
    })
  })
})

// ── DiscrepanciaEmision entity ──────────────────────────────────────────────

describe('DiscrepanciaEmision entity', () => {
  describe('create', () => {
    it('creates with correct tipo', () => {
      const d = makeDiscrepanciaEmision('ERROR_TIMING')
      expect(d.tipo.value).toBe('ERROR_TIMING')
    })

    it('is not resolved by default', () => {
      const d = makeDiscrepanciaEmision()
      expect(d.resuelta).toBe(false)
    })

    it('exposes codigoSP', () => {
      const d = makeDiscrepanciaEmision()
      expect(d.codigoSP.value).toBe('SP000001')
    })
  })

  describe('marcarComoResuelta', () => {
    it('marks the discrepancia as resolved', () => {
      const d = makeDiscrepanciaEmision()
      d.marcarComoResuelta()
      expect(d.resuelta).toBe(true)
    })
  })

  describe('tipos de discrepancia', () => {
    const tipos = ['FALLA_TECNICA', 'ERROR_TIMING', 'CAMBIO_PROGRAMACION', 'EXCLUSIVIDAD', 'OTRO'] as const
    for (const tipo of tipos) {
      it(`accepts tipo ${tipo}`, () => {
        const d = makeDiscrepanciaEmision(tipo)
        expect(d.tipo.value).toBe(tipo)
      })
    }
  })
})
