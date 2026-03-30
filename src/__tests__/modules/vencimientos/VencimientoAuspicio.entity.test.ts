import { describe, it, expect } from 'vitest'
import { VencimientoAuspicio } from '../../../modules/vencimientos/domain/entities/VencimientoAuspicio.js'
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

/**
 * Build a period that does NOT trigger R1 (no-inicio) logic.
 * For this, fechaInicio must be >= midnight today so that superoFechaInicio() = false.
 */
function futurePeriodo(startDays: number, endDays: number) {
  return PeriodoVigencia.create({
    fechaInicio: daysFromNow(startDays),
    fechaFin: daysFromNow(endDays),
  })
}

function makeProps(overrides: Partial<Parameters<typeof VencimientoAuspicio.create>[0]> = {}) {
  return {
    cupoComercialId: 'cupo-1',
    programaId: 'prog-1',
    emisoraId: 'emisora-1',
    clienteId: 'cliente-1',
    clienteNombre: 'Radio Test SpA',
    ejecutivoId: 'exec-1',
    ejecutivoNombre: 'Juan Pérez',
    periodoVigencia: futurePeriodo(1, 60), // future period, no R1 trigger
    nivelAlerta: 'verde' as const,
    accionSugerida: 'ninguna' as const,
    notificacionEnviada: false,
    countdown48hIniciado: false,
    alertaTraficoEnviada: false,
    alertaTraficoFinalEnviada: false,
    historialAcciones: [],
    ...overrides,
  }
}

describe('VencimientoAuspicio entity', () => {
  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates entity with generated id', () => {
      const v = VencimientoAuspicio.create(makeProps())
      expect(v.id).toMatch(/^venc_/)
    })

    it('initializes with version=1', () => {
      const v = VencimientoAuspicio.create(makeProps())
      expect(v.version).toBe(1)
    })

    it('exposes correct clienteNombre', () => {
      const v = VencimientoAuspicio.create(makeProps())
      expect(v.clienteNombre).toBe('Radio Test SpA')
    })

    it('countdown is not initiated by default', () => {
      const v = VencimientoAuspicio.create(makeProps())
      expect(v.countdown48hIniciado).toBe(false)
    })
  })

  // ── diasRestantes delegated to PeriodoVigencia ────────────────────────────

  describe('diasRestantes', () => {
    it('returns positive number for active period', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(1, 60),
      }))
      expect(v.diasRestantes).toBeGreaterThan(0)
    })
  })

  // ── evaluar: verde (future period with > 30 days) ──────────────────────────

  describe('evaluar - verde state', () => {
    it('sets nivelAlerta=verde for period with > 30 days remaining', () => {
      // fechaInicio in future → no R1 trigger, fechaFin in 60 days → verde
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(1, 60),
      }))
      v.evaluar()
      expect(v.nivelAlerta).toBe('verde')
    })

    it('sets accionSugerida=ninguna for verde state', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(1, 60),
      }))
      v.evaluar()
      expect(v.accionSugerida).toBe('ninguna')
    })
  })

  // ── evaluar: amarillo (15-30 days) ────────────────────────────────────────

  describe('evaluar - amarillo state', () => {
    it('sets nivelAlerta=amarillo when 16-30 days remain', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(1, 20), // fechaFin in 20 days
      }))
      v.evaluar()
      expect(v.nivelAlerta).toBe('amarillo')
    })

    it('sets accionSugerida for 20-day period', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(1, 20),
      }))
      v.evaluar()
      expect(['contactar_cliente_renovacion', 'generar_propuesta_automatica']).toContain(v.accionSugerida)
    })
  })

  // ── evaluar: rojo (2-7 days) ──────────────────────────────────────────────

  describe('evaluar - rojo state', () => {
    it('sets nivelAlerta=rojo when 2-7 days remain', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(1, 5),
      }))
      v.evaluar()
      expect(v.nivelAlerta).toBe('rojo')
    })

    it('sets rojo + alertar_trafico_fin_manana when terminaManana', () => {
      // fechaInicio = today midnight, fechaFin = tomorrow midnight → diasRestantes = 1
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(0, 1),
      }))
      v.evaluar()
      expect(v.nivelAlerta).toBe('rojo')
      expect(v.accionSugerida).toBe('alertar_trafico_fin_manana')
    })

    it('emits AlertaTraficoFinManana domain event when terminaManana', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: futurePeriodo(0, 1),
      }))
      v.evaluar()
      expect(v.domainEvents.some(e => e.includes('AlertaTraficoFinManana'))).toBe(true)
    })
  })

  // ── evaluar: critico (terminaHoy) ────────────────────────────────────────

  describe('evaluar - critico state (terminaHoy)', () => {
    it('sets nivelAlerta=critico when terminaHoy', () => {
      // For terminaHoy: fechaFin = today midnight, diasRestantes = 0
      // Need to bypass no_iniciado: set countdown48hIniciado = true
      const today = todayMidnight()
      const yesterday = daysAgo(1)
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: yesterday,
          fechaFin: today,
        }),
        countdown48hIniciado: true, // bypass the no_iniciado branch
      }))
      v.evaluar()
      expect(v.nivelAlerta).toBe('critico')
      expect(v.accionSugerida).toBe('alertar_trafico_fin_hoy')
    })
  })

  // ── evaluar: no_iniciado + countdown R1 ──────────────────────────────────

  describe('evaluar - no_iniciado R1 rule', () => {
    it('sets no_iniciado + alertar_ejecutivo_no_inicio when superoFechaInicio but not 48h', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(1),
          fechaFin: daysFromNow(30),
        }),
      }))
      v.evaluar()
      expect(v.nivelAlerta).toBe('no_iniciado')
      expect(v.accionSugerida).toBe('alertar_ejecutivo_no_inicio')
    })

    it('initiates countdown when supero48hSinIniciar', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(3),
          fechaFin: daysFromNow(30),
        }),
      }))
      v.evaluar()
      expect(v.countdown48hIniciado).toBe(true)
      expect(v.countdown48hExpira).toBeDefined()
    })

    it('emits Countdown48hIniciado domain event on first evaluar with 48h exceeded', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(3),
          fechaFin: daysFromNow(30),
        }),
      }))
      v.evaluar()
      expect(v.domainEvents.some(e => e.includes('Countdown48hIniciado'))).toBe(true)
    })

    it('sets accionSugerida=countdown_48h (overridden by iniciarCountdown48h) when supero48hSinIniciar', () => {
      // Note: evaluar sets 'eliminar_automatico' first, then iniciarCountdown48h overrides to 'countdown_48h'
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(3),
          fechaFin: daysFromNow(30),
        }),
      }))
      v.evaluar()
      expect(v.accionSugerida).toBe('countdown_48h')
    })

    it('does not reinitiate countdown if already initiated', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(3),
          fechaFin: daysFromNow(30),
        }),
        countdown48hIniciado: true,
        countdown48hExpira: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10h from now
      }))
      v.evaluar()
      // Should not add another Countdown48hIniciado event since countdown already started
      const events = v.domainEvents.filter(e => e.includes('Countdown48hIniciado'))
      expect(events).toHaveLength(0)
    })
  })

  // ── horasCountdownRestantes ───────────────────────────────────────────────

  describe('horasCountdownRestantes', () => {
    it('returns -1 when countdown not initiated', () => {
      const v = VencimientoAuspicio.create(makeProps())
      expect(v.horasCountdownRestantes).toBe(-1)
    })

    it('returns approximate hours remaining when countdown active', () => {
      const expira = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h from now
      const v = VencimientoAuspicio.create(makeProps({
        countdown48hIniciado: true,
        countdown48hExpira: expira,
      }))
      expect(v.horasCountdownRestantes).toBeGreaterThanOrEqual(23)
      expect(v.horasCountdownRestantes).toBeLessThanOrEqual(25)
    })

    it('returns 0 when countdown has already expired', () => {
      const expira = new Date(Date.now() - 1000) // past
      const v = VencimientoAuspicio.create(makeProps({
        countdown48hIniciado: true,
        countdown48hExpira: expira,
      }))
      expect(v.horasCountdownRestantes).toBe(0)
    })
  })

  // ── haExpiradoCountdown ───────────────────────────────────────────────────

  describe('haExpiradoCountdown', () => {
    it('returns false when no countdown', () => {
      const v = VencimientoAuspicio.create(makeProps())
      expect(v.haExpiradoCountdown()).toBe(false)
    })

    it('returns false when countdown is still active', () => {
      const v = VencimientoAuspicio.create(makeProps({
        countdown48hExpira: new Date(Date.now() + 10_000),
      }))
      expect(v.haExpiradoCountdown()).toBe(false)
    })

    it('returns true when countdown has passed', () => {
      const v = VencimientoAuspicio.create(makeProps({
        countdown48hExpira: new Date(Date.now() - 1000),
      }))
      expect(v.haExpiradoCountdown()).toBe(true)
    })
  })

  // ── notification markers ──────────────────────────────────────────────────

  describe('notification markers', () => {
    it('marcarNotificacionEnviada sets flag', () => {
      const v = VencimientoAuspicio.create(makeProps())
      v.marcarNotificacionEnviada()
      expect(v.toSnapshot().notificacionEnviada).toBe(true)
    })

    it('marcarAlertaTraficoEnviada sets flag', () => {
      const v = VencimientoAuspicio.create(makeProps())
      v.marcarAlertaTraficoEnviada()
      expect(v.toSnapshot().alertaTraficoEnviada).toBe(true)
    })

    it('marcarAlertaTraficoFinalEnviada sets flag', () => {
      const v = VencimientoAuspicio.create(makeProps())
      v.marcarAlertaTraficoFinalEnviada()
      expect(v.toSnapshot().alertaTraficoFinalEnviada).toBe(true)
    })
  })

  // ── domain events ──────────────────────────────────────────────────────────

  describe('domain events', () => {
    it('clearDomainEvents empties the list', () => {
      const v = VencimientoAuspicio.create(makeProps({
        periodoVigencia: PeriodoVigencia.create({
          fechaInicio: daysAgo(1),
          fechaFin: daysFromNow(30),
        }),
      }))
      v.evaluar()
      expect(v.domainEvents.length).toBeGreaterThan(0)
      v.clearDomainEvents()
      expect(v.domainEvents).toHaveLength(0)
    })
  })

  // ── fromPersistence ────────────────────────────────────────────────────────

  describe('fromPersistence', () => {
    it('reconstitutes entity from stored data', () => {
      const now = new Date()
      const v = VencimientoAuspicio.fromPersistence({
        id: 'venc_persisted',
        cupoComercialId: 'cupo-1',
        programaId: 'prog-1',
        emisoraId: 'emisora-1',
        clienteId: 'cliente-1',
        clienteNombre: 'Cliente A',
        ejecutivoId: 'exec-1',
        ejecutivoNombre: 'Exec A',
        periodoVigencia: futurePeriodo(1, 10),
        nivelAlerta: 'amarillo',
        accionSugerida: 'contactar_cliente_renovacion',
        notificacionEnviada: true,
        countdown48hIniciado: false,
        alertaTraficoEnviada: false,
        alertaTraficoFinalEnviada: false,
        historialAcciones: ['Accion 1'],
        fechaCreacion: now,
        fechaActualizacion: now,
        version: 3,
      })
      expect(v.id).toBe('venc_persisted')
      expect(v.version).toBe(3)
      expect(v.nivelAlerta).toBe('amarillo')
    })
  })
})
