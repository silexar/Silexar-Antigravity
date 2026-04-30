/**
 * Tests: Vencimientos — TandaComercial, DuracionSegundos, CupoComercial
 *
 * Complementa los tests existentes de VencimientosAuspicio.entity.test.ts y
 * PeriodoVigencia.test.ts cubriendo las demás entidades y value objects del módulo.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TandaComercial } from '../../../modules/vencimientos/domain/entities/TandaComercial.js'
import { DuracionSegundos } from '../../../modules/vencimientos/domain/value-objects/DuracionSegundos.js'
import { CupoComercial } from '../../../modules/vencimientos/domain/entities/CupoComercial.js'
import { PeriodoVigencia } from '../../../modules/vencimientos/domain/value-objects/PeriodoVigencia.js'
import { EstadoAuspicio } from '../../../modules/vencimientos/domain/value-objects/EstadoAuspicio.js'
import { TipoAuspicio } from '../../../modules/vencimientos/domain/value-objects/TipoAuspicio.js'
import { ValorComercial } from '../../../modules/vencimientos/domain/value-objects/ValorComercial.js'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

function daysAgo(days: number): Date {
  return daysFromNow(-days)
}

function futurePeriodo(startDays: number, endDays: number): PeriodoVigencia {
  return PeriodoVigencia.create({
    fechaInicio: daysFromNow(startDays),
    fechaFin: daysFromNow(endDays),
  })
}

function makeCupoProps(
  overrides: Partial<Parameters<typeof CupoComercial.create>[0]> = {}
): Parameters<typeof CupoComercial.create>[0] {
  return {
    programaId: 'prog-mañanero-001',
    programaNombre: 'El Mañanero de 102.5',
    emisoraId: 'emi-galaxia-fm',
    emisoraNombre: 'Galaxia FM 102.5',
    slotId: 'slot-lunes-viernes-8am',
    tipoAuspicio: TipoAuspicio.tipoA(),
    estado: EstadoAuspicio.pendiente(),
    clienteId: 'cli-automotriz-norte',
    clienteNombre: 'Automotriz Norte SpA',
    clienteRubro: 'Automotriz',
    clienteRut: '76.543.210-K',
    inversion: ValorComercial.sinDescuento(1_200_000, 'CLP'),
    valorAuspicioCompleto: 1_200_000,
    valorMencionesIndividual: 45_000,
    periodoVigencia: futurePeriodo(1, 90),
    fechaIngresoCliente: new Date('2026-01-15'),
    ejecutivoId: 'exec-carmen-silva',
    ejecutivoNombre: 'Carmen Silva',
    creadoPor: 'exec-carmen-silva',
    actualizadoPor: 'exec-carmen-silva',
    ...overrides,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// DuracionSegundos
// ──────────────────────────────────────────────────────────────────────────────

describe('DuracionSegundos', () => {
  describe('create', () => {
    it('creates valid 30-second duration', () => {
      const d = DuracionSegundos.create(30)
      expect(d.valor).toBe(30)
    })

    it('creates minimum valid duration (1 second)', () => {
      const d = DuracionSegundos.create(1)
      expect(d.segundos).toBe(1)
    })

    it('creates maximum valid duration (90 seconds)', () => {
      const d = DuracionSegundos.create(90)
      expect(d.segundos).toBe(90)
    })

    it('throws for duration below 1 second', () => {
      expect(() => DuracionSegundos.create(0)).toThrow('entre 1 y 90')
    })

    it('throws for duration above 90 seconds', () => {
      expect(() => DuracionSegundos.create(91)).toThrow('entre 1 y 90')
    })

    it('throws for negative duration', () => {
      expect(() => DuracionSegundos.create(-5)).toThrow('entre 1 y 90')
    })

    it('fromString parses numeric string correctly', () => {
      const d = DuracionSegundos.fromString('15')
      expect(d.valor).toBe(15)
    })

    it('fromString throws for non-numeric string', () => {
      expect(() => DuracionSegundos.fromString('treinta')).toThrow('no numérico')
    })
  })

  describe('factory helpers', () => {
    it('de15() returns 15-second duration', () => {
      expect(DuracionSegundos.de15().valor).toBe(15)
    })

    it('de30() returns 30-second duration', () => {
      expect(DuracionSegundos.de30().valor).toBe(30)
    })

    it('de60() returns 60-second duration', () => {
      expect(DuracionSegundos.de60().valor).toBe(60)
    })

    it('todasLasDuraciones() returns 7 common durations', () => {
      const todas = DuracionSegundos.todasLasDuraciones()
      expect(todas).toHaveLength(7)
      expect(todas.map(d => d.valor)).toEqual([5, 10, 15, 20, 30, 45, 60])
    })
  })

  describe('factorProporcional y calcularPrecio', () => {
    it('30s has factorProporcional = 1.0 (base reference)', () => {
      expect(DuracionSegundos.de30().factorProporcional).toBe(1.0)
    })

    it('15s has factorProporcional = 0.5 (half of base)', () => {
      expect(DuracionSegundos.de15().factorProporcional).toBe(0.5)
    })

    it('60s has factorProporcional = 2.0 (double of base)', () => {
      expect(DuracionSegundos.de60().factorProporcional).toBe(2.0)
    })

    it('calcularPrecio(100_000) for 30s returns 100_000', () => {
      const d = DuracionSegundos.de30()
      expect(d.calcularPrecio(100_000)).toBe(100_000)
    })

    it('calcularPrecio(100_000) for 15s returns 50_000', () => {
      const d = DuracionSegundos.de15()
      expect(d.calcularPrecio(100_000)).toBe(50_000)
    })

    it('calcularPrecio(90_000) for 60s returns 180_000', () => {
      const d = DuracionSegundos.de60()
      expect(d.calcularPrecio(90_000)).toBe(180_000)
    })

    it('90s (3 minutos de cuna) costs 3x the 30s base price', () => {
      const d = DuracionSegundos.create(90)
      expect(d.calcularPrecio(50_000)).toBe(150_000)
    })
  })

  describe('equals y esMayorQue', () => {
    it('equals returns true for same duration', () => {
      const a = DuracionSegundos.de30()
      const b = DuracionSegundos.create(30)
      expect(a.equals(b)).toBe(true)
    })

    it('equals returns false for different durations', () => {
      expect(DuracionSegundos.de15().equals(DuracionSegundos.de30())).toBe(false)
    })

    it('esMayorQue returns true when value is higher', () => {
      expect(DuracionSegundos.de60().esMayorQue(DuracionSegundos.de30())).toBe(true)
    })

    it('esMayorQue returns false when value is lower', () => {
      expect(DuracionSegundos.de15().esMayorQue(DuracionSegundos.de30())).toBe(false)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// TandaComercial
// ──────────────────────────────────────────────────────────────────────────────

describe('TandaComercial', () => {
  const baseTandaProps: Omit<
    Parameters<typeof TandaComercial.create>[0],
    'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'
  > = {
    emisoraId: 'emi-galaxia-fm',
    emisoraNombre: 'Galaxia FM 102.5',
    tipo: 'prime_am',
    nombre: 'Prime AM Mañanero 07:00-10:00',
    horaInicio: '07:00',
    horaFin: '10:00',
    factorMultiplicador: 1.5,
    audienciaPromedio: 85_000,
    ratingPromedio: 12.4,
    tarifasPorDuracion: [],
    estado: 'activa',
  }

  describe('create', () => {
    it('creates tanda with auto-generated id starting with tanda_', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      expect(tanda.id).toMatch(/^tanda_/)
    })

    it('initializes with version=1', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      expect(tanda.version).toBe(1)
    })

    it('exposes tipo prime_am correctly', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      expect(tanda.tipo).toBe('prime_am')
    })

    it('exposes rangoHorario as combined string', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      expect(tanda.rangoHorario).toBe('07:00-10:00')
    })

    it('fromPersistence reconstitutes exact id', () => {
      const now = new Date()
      const tanda = TandaComercial.fromPersistence({
        ...baseTandaProps,
        id: 'tanda_test_id',
        fechaCreacion: now,
        fechaActualizacion: now,
        version: 5,
      })
      expect(tanda.id).toBe('tanda_test_id')
      expect(tanda.version).toBe(5)
    })
  })

  describe('esPrime', () => {
    it('returns true for prime_am type', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, tipo: 'prime_am' })
      expect(tanda.esPrime()).toBe(true)
    })

    it('returns true for prime_pm type', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, tipo: 'prime_pm', nombre: 'Prime PM', horaInicio: '18:00', horaFin: '21:00' })
      expect(tanda.esPrime()).toBe(true)
    })

    it('returns false for repartida type', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, tipo: 'repartida', nombre: 'Repartida Diurna', factorMultiplicador: 1.0 })
      expect(tanda.esPrime()).toBe(false)
    })

    it('returns false for noche type', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, tipo: 'noche', nombre: 'Tanda Noche', horaInicio: '22:00', horaFin: '24:00' })
      expect(tanda.esPrime()).toBe(false)
    })
  })

  describe('getPrecio', () => {
    it('returns 0 for duration not found in tarifas', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, tarifasPorDuracion: [] })
      expect(tanda.getPrecio(DuracionSegundos.de30())).toBe(0)
    })

    it('returns correct price for matching duration', () => {
      const tanda = TandaComercial.create({
        ...baseTandaProps,
        tarifasPorDuracion: [
          { duracionSegundos: 30, precio: 120_000 },
          { duracionSegundos: 60, precio: 240_000 },
        ],
      })
      expect(tanda.getPrecio(DuracionSegundos.de30())).toBe(120_000)
      expect(tanda.getPrecio(DuracionSegundos.de60())).toBe(240_000)
    })
  })

  describe('actualizarTarifas', () => {
    it('replaces tarifas and increments version', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      const versionInicial = tanda.version
      tanda.actualizarTarifas([
        { duracionSegundos: 30, precio: 95_000 },
      ])
      expect(tanda.tarifasPorDuracion).toHaveLength(1)
      expect(tanda.version).toBe(versionInicial + 1)
    })
  })

  describe('generarTarifasDesdeBase', () => {
    it('generates 7 tarifas for the common duration set', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      tanda.generarTarifasDesdeBase(100_000)
      expect(tanda.tarifasPorDuracion).toHaveLength(7)
    })

    it('applies factorMultiplicador to generated prices', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, factorMultiplicador: 2.0 })
      tanda.generarTarifasDesdeBase(100_000)
      const tarifa30 = tanda.tarifasPorDuracion.find(t => t.duracionSegundos === 30)
      // 100_000 * (30/30) * 2.0 = 200_000
      expect(tarifa30?.precio).toBe(200_000)
    })

    it('increments version when generating tarifas', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      const versionAntes = tanda.version
      tanda.generarTarifasDesdeBase(80_000)
      expect(tanda.version).toBe(versionAntes + 1)
    })

    it('5-second cuna is cheaper than 30-second cuna', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, factorMultiplicador: 1.0 })
      tanda.generarTarifasDesdeBase(120_000)
      const tarifa5 = tanda.tarifasPorDuracion.find(t => t.duracionSegundos === 5)
      const tarifa30 = tanda.tarifasPorDuracion.find(t => t.duracionSegundos === 30)
      expect(tarifa5!.precio).toBeLessThan(tarifa30!.precio)
    })
  })

  describe('tipoLabel', () => {
    it('returns label for prime_am', () => {
      const tanda = TandaComercial.create(baseTandaProps)
      expect(tanda.tipoLabel).toContain('PRIME AM')
    })

    it('returns label for noche', () => {
      const tanda = TandaComercial.create({ ...baseTandaProps, tipo: 'noche', nombre: 'Noche', horaInicio: '22:00', horaFin: '24:00' })
      expect(tanda.tipoLabel).toContain('Noche')
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// CupoComercial
// ──────────────────────────────────────────────────────────────────────────────

describe('CupoComercial', () => {
  describe('create', () => {
    it('creates cupo with auto-generated id starting with cupo_', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      expect(cupo.id).toMatch(/^cupo_/)
    })

    it('initializes with version=1', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      expect(cupo.version).toBe(1)
    })

    it('initializes with 0 extensiones', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      expect(cupo.numeroExtensiones).toBe(0)
    })

    it('initializes with historial containing creation record', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      expect(cupo.historialModificaciones).toHaveLength(1)
      expect(cupo.historialModificaciones[0].tipo).toBe('creacion')
    })

    it('throws when clienteId is empty', () => {
      expect(() =>
        CupoComercial.create(makeCupoProps({ clienteId: '' }))
      ).toThrow('Cliente es requerido')
    })

    it('throws when ejecutivoId is empty', () => {
      expect(() =>
        CupoComercial.create(makeCupoProps({ ejecutivoId: '' }))
      ).toThrow('Ejecutivo es requerido')
    })

    it('throws when programaId is empty', () => {
      expect(() =>
        CupoComercial.create(makeCupoProps({ programaId: '' }))
      ).toThrow('Programa es requerido')
    })

    it('exposes clienteNombre correctly', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      expect(cupo.clienteNombre).toBe('Automotriz Norte SpA')
    })
  })

  describe('cambiarEstado', () => {
    it('transitions pendiente → confirmado successfully', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-carmen-silva')
      expect(cupo.estado.esConfirmado()).toBe(true)
    })

    it('increments version on state change', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      const versionAntes = cupo.version
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-carmen-silva')
      expect(cupo.version).toBe(versionAntes + 1)
    })

    it('throws on invalid transition (pendiente → activo is not allowed)', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      expect(() =>
        cupo.cambiarEstado(EstadoAuspicio.activo(), 'exec-carmen-silva')
      ).toThrow('no permitida')
    })

    it('adds cambio_estado record to historial', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-carmen-silva')
      const historial = cupo.historialModificaciones
      const cambio = historial.find(h => h.tipo === 'cambio_estado')
      expect(cambio).toBeDefined()
      expect(cambio!.descripcion).toContain('pendiente')
      expect(cambio!.descripcion).toContain('confirmado')
    })

    it('emits CupoEstadoCambiado domain event', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-carmen-silva')
      const evento = cupo.domainEvents.find(e => e.includes('CupoEstadoCambiado'))
      expect(evento).toBeDefined()
    })
  })

  describe('marcarNoIniciado (R1)', () => {
    it('marks cupo as no_iniciado', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      // Must confirm first: pendiente → confirmado → no_iniciado
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-sistema')
      cupo.marcarNoIniciado('SISTEMA_AUTOMATICO')
      expect(cupo.estado.esNoIniciado()).toBe(true)
    })

    it('emits CupoNoIniciado domain event', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-sistema')
      cupo.marcarNoIniciado('SISTEMA_AUTOMATICO')
      const evento = cupo.domainEvents.find(e => e.includes('CupoNoIniciado'))
      expect(evento).toBeDefined()
    })
  })

  describe('registrarExtension (R1)', () => {
    it('increments extension count', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.registrarExtension('ext-001', 'exec-carmen-silva')
      expect(cupo.numeroExtensiones).toBe(1)
    })

    it('adds extension to historial with "extension" type', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.registrarExtension('ext-001', 'exec-carmen-silva')
      const ext = cupo.historialModificaciones.find(h => h.tipo === 'extension')
      expect(ext).toBeDefined()
      expect(ext!.descripcion).toContain('1')
    })

    it('emits CupoExtendido domain event', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.registrarExtension('ext-002', 'exec-carlos-rojas')
      expect(cupo.domainEvents.some(e => e.includes('CupoExtendido'))).toBe(true)
    })

    it('tracks multiple extensions cumulatively', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.registrarExtension('ext-001', 'exec-carmen-silva')
      cupo.registrarExtension('ext-002', 'exec-carmen-silva')
      expect(cupo.numeroExtensiones).toBe(2)
    })
  })

  describe('eliminarPorNoInicio (R1)', () => {
    it('sets estado to cancelado', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      // pendiente → confirmado → no_iniciado → cancelado
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-sistema')
      cupo.marcarNoIniciado('SISTEMA')
      cupo.eliminarPorNoInicio('SISTEMA_AUTOMATICO')
      expect(cupo.estado.esCancelado()).toBe(true)
    })

    it('adds cancelacion record to historial', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-sistema')
      cupo.marcarNoIniciado('SISTEMA')
      cupo.eliminarPorNoInicio('SISTEMA_AUTOMATICO')
      const cancelacion = cupo.historialModificaciones.find(h => h.tipo === 'cancelacion')
      expect(cancelacion?.descripcion).toContain('48h')
    })

    it('emits CupoEliminado48h domain event', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec-sistema')
      cupo.marcarNoIniciado('SISTEMA')
      cupo.eliminarPorNoInicio('SISTEMA_AUTOMATICO')
      expect(cupo.domainEvents.some(e => e.includes('CupoEliminado48h'))).toBe(true)
    })
  })

  describe('actualizarInversion', () => {
    it('updates inversion value and adds historial record', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      const nuevaInversion = ValorComercial.sinDescuento(1_500_000, 'CLP')
      cupo.actualizarInversion(nuevaInversion, 'exec-carmen-silva')
      expect(cupo.inversion.valorBase).toBe(1_500_000)
      const cambioValor = cupo.historialModificaciones.find(h => h.tipo === 'cambio_valor')
      expect(cambioValor).toBeDefined()
    })

    it('increments version on inversion update', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      const versionAntes = cupo.version
      cupo.actualizarInversion(ValorComercial.sinDescuento(2_000_000, 'CLP'), 'gerente')
      expect(cupo.version).toBe(versionAntes + 1)
    })
  })

  describe('supero48hSinIniciar (R1 detection)', () => {
    it('returns true when pendiente period started more than 48h ago', () => {
      const cupo = CupoComercial.create(makeCupoProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(3),
          fechaFin: daysFromNow(30),
        }),
        estado: EstadoAuspicio.pendiente(),
      }))
      expect(cupo.supero48hSinIniciar).toBe(true)
    })

    it('returns false when period starts in the future', () => {
      const cupo = CupoComercial.create(makeCupoProps({
        periodoVigencia: futurePeriodo(5, 95),
        estado: EstadoAuspicio.pendiente(),
      }))
      expect(cupo.supero48hSinIniciar).toBe(false)
    })
  })

  describe('terminaManana / terminaHoy (R2 detection)', () => {
    it('terminaManana returns true when 1 day remains', () => {
      const cupo = CupoComercial.create(makeCupoProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(29),
          fechaFin: daysFromNow(1),
        }),
      }))
      expect(cupo.terminaManana).toBe(true)
    })

    it('terminaHoy returns true when fechaFin is today midnight', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const cupo = CupoComercial.create(makeCupoProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(1),
          fechaFin: today,
        }),
      }))
      expect(cupo.terminaHoy).toBe(true)
    })
  })

  describe('clearDomainEvents / toSnapshot', () => {
    it('clearDomainEvents empties event list', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      cupo.cambiarEstado(EstadoAuspicio.confirmado(), 'exec')
      expect(cupo.domainEvents.length).toBeGreaterThan(0)
      cupo.clearDomainEvents()
      expect(cupo.domainEvents).toHaveLength(0)
    })

    it('toSnapshot returns object with same id', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      const snap = cupo.toSnapshot()
      expect(snap.id).toBe(cupo.id)
    })

    it('fromPersistence reconstitutes entity with stored version', () => {
      const cupo = CupoComercial.create(makeCupoProps())
      const snap = cupo.toSnapshot()
      const reconst = CupoComercial.fromPersistence({ ...snap, version: 7 })
      expect(reconst.id).toBe(cupo.id)
      expect(reconst.version).toBe(7)
    })
  })
})
