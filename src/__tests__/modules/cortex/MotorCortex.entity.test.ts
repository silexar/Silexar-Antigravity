/**
 * MotorCortex entity unit tests
 * Coverage target: 95% (domain entities — CLAUDE.md requirement)
 */

import { describe, it, expect } from 'vitest'
import { MotorCortex } from '../../../modules/cortex/domain/entities/MotorCortex'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseProps = {
  id: 'motor-001',
  tenantId: 'tenant-001',
  tipo: 'ORCHESTRATOR' as const,
  nombre: 'Cortex Orchestrator',
  version: '2.0.0',
  estado: 'INICIALIZANDO' as const,
  metricas: {
    precision: 0,
    latenciaMs: 0,
    solicitudesTotal: 0,
    solicitudesExitosas: 0,
  },
  configuracion: { learningRate: 0.01 },
  creadoEn: new Date('2025-01-01'),
  actualizadoEn: new Date('2025-01-01'),
}

// ─── crear() ─────────────────────────────────────────────────────────────────

describe('MotorCortex.crear()', () => {
  it('creates a motor with initial INICIALIZANDO state', () => {
    const motor = MotorCortex.crear(baseProps)
    expect(motor.id).toBe('motor-001')
    expect(motor.tipo).toBe('ORCHESTRATOR')
    expect(motor.estado.valor).toBe('INICIALIZANDO')
    expect(motor.estado.estaOperacional).toBe(false)
  })

  it('emits MOTOR_CREADO event on creation', () => {
    const motor = MotorCortex.crear(baseProps)
    const eventos = motor.tomarEventos()
    expect(eventos.length).toBe(1)
    expect(eventos[0].tipo).toBe('MOTOR_CREADO')
    expect(eventos[0].motorId).toBe('motor-001')
    expect(eventos[0].tenantId).toBe('tenant-001')
  })

  it('throws when id is missing', () => {
    expect(() => MotorCortex.crear({ ...baseProps, id: '' })).toThrow('ID del motor es requerido')
  })

  it('throws when tenantId is missing', () => {
    expect(() => MotorCortex.crear({ ...baseProps, tenantId: '' })).toThrow('Tenant ID es requerido')
  })

  it('throws when nombre is missing', () => {
    expect(() => MotorCortex.crear({ ...baseProps, nombre: '' })).toThrow('Nombre del motor es requerido')
  })
})

// ─── reconstituir() ──────────────────────────────────────────────────────────

describe('MotorCortex.reconstituir()', () => {
  it('reconstructs from DB row without emitting events', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    const eventos = motor.tomarEventos()
    expect(eventos.length).toBe(0)
    expect(motor.estado.valor).toBe('ACTIVO')
    expect(motor.estado.estaActivo).toBe(true)
  })
})

// ─── activar() ───────────────────────────────────────────────────────────────

describe('MotorCortex.activar()', () => {
  it('transitions from INICIALIZANDO to ACTIVO', () => {
    const motor = MotorCortex.crear(baseProps)
    motor.tomarEventos() // clear creation event

    motor.activar()

    expect(motor.estado.valor).toBe('ACTIVO')
    expect(motor.estado.estaOperacional).toBe(true)

    const eventos = motor.tomarEventos()
    expect(eventos[0].tipo).toBe('MOTOR_ACTIVADO')
  })

  it('throws when trying to activate from DETENIDO', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'DETENIDO' })
    expect(() => motor.activar()).toThrow('No se puede activar')
  })

  it('throws when trying to activate from ERROR', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ERROR' })
    expect(() => motor.activar()).toThrow('No se puede activar')
  })
})

// ─── detener() ───────────────────────────────────────────────────────────────

describe('MotorCortex.detener()', () => {
  it('transitions from ACTIVO to DETENIDO', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.detener('Mantenimiento programado')
    expect(motor.estado.valor).toBe('DETENIDO')
    expect(motor.estado.estaDetenido).toBe(true)
  })

  it('emits MOTOR_DETENIDO event with motivo', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.detener('Test shutdown')
    const eventos = motor.tomarEventos()
    expect(eventos[0].tipo).toBe('MOTOR_DETENIDO')
    expect(eventos[0].datos.motivo).toBe('Test shutdown')
  })

  it('throws when trying to stop from INICIALIZANDO', () => {
    const motor = MotorCortex.crear(baseProps)
    expect(() => motor.detener('test')).toThrow('No se puede detener')
  })
})

// ─── marcarDegradado() ────────────────────────────────────────────────────────

describe('MotorCortex.marcarDegradado()', () => {
  it('transitions from ACTIVO to DEGRADADO', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.marcarDegradado('Alta latencia detectada')
    expect(motor.estado.valor).toBe('DEGRADADO')
    expect(motor.estado.estaDegradado).toBe(true)
    expect(motor.estado.estaOperacional).toBe(true) // still operational!
  })
})

// ─── registrarEjecucion() ────────────────────────────────────────────────────

describe('MotorCortex.registrarEjecucion()', () => {
  it('increments solicitudesTotal on each call', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.registrarEjecucion(true, 120)
    motor.registrarEjecucion(false, 300)
    expect(motor.metricas.solicitudesTotal).toBe(2)
    expect(motor.metricas.solicitudesExitosas).toBe(1)
  })

  it('calculates tasaExito correctly', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.registrarEjecucion(true, 100)
    motor.registrarEjecucion(true, 100)
    motor.registrarEjecucion(false, 100)
    expect(motor.metricas.tasaExito).toBeCloseTo(66.67, 1)
  })

  it('emits EJECUCION_FALLIDA event on failure', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.registrarEjecucion(false, 5000)
    const eventos = motor.tomarEventos()
    expect(eventos[0].tipo).toBe('EJECUCION_FALLIDA')
  })

  it('does not emit event on successful execution', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.registrarEjecucion(true, 100)
    const eventos = motor.tomarEventos()
    expect(eventos.length).toBe(0)
  })

  it('updates metricaUltimaEjecucion', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    const before = Date.now()
    motor.registrarEjecucion(true, 50)
    const ult = motor.metricas.ultimaEjecucion
    expect(ult).toBeDefined()
    expect(ult!.getTime()).toBeGreaterThanOrEqual(before)
  })
})

// ─── actualizarConfiguracion() ───────────────────────────────────────────────

describe('MotorCortex.actualizarConfiguracion()', () => {
  it('updates configuracion on operational motor', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.actualizarConfiguracion({ learningRate: 0.005, batchSize: 64 })
    expect(motor.configuracion.learningRate).toBe(0.005)
    expect(motor.configuracion.batchSize).toBe(64)
  })

  it('throws when motor is not operational', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'DETENIDO' })
    expect(() =>
      motor.actualizarConfiguracion({ learningRate: 0.001 })
    ).toThrow('No se puede configurar un motor no operacional')
  })

  it('emits CONFIGURACION_ACTUALIZADA event', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ACTIVO' })
    motor.actualizarConfiguracion({ newParam: 42 })
    const eventos = motor.tomarEventos()
    expect(eventos[0].tipo).toBe('CONFIGURACION_ACTUALIZADA')
  })
})

// ─── tomarEventos() (event clearing) ─────────────────────────────────────────

describe('MotorCortex.tomarEventos()', () => {
  it('clears events after taking them', () => {
    const motor = MotorCortex.crear(baseProps)
    const first = motor.tomarEventos()
    expect(first.length).toBe(1)

    const second = motor.tomarEventos()
    expect(second.length).toBe(0)
  })
})

// ─── State machine coverage ───────────────────────────────────────────────────

describe('Full state machine transitions', () => {
  it('INICIALIZANDO → ACTIVO → DEGRADADO → ACTIVO → DETENIDO → INICIALIZANDO', () => {
    const motor = MotorCortex.crear(baseProps)

    motor.activar()
    expect(motor.estado.valor).toBe('ACTIVO')

    motor.marcarDegradado('partial failure')
    expect(motor.estado.valor).toBe('DEGRADADO')

    motor.activar()
    expect(motor.estado.valor).toBe('ACTIVO')

    motor.detener('shutdown')
    expect(motor.estado.valor).toBe('DETENIDO')
  })

  it('ERROR state can only go to INICIALIZANDO or DETENIDO', () => {
    const motor = MotorCortex.reconstituir({ ...baseProps, estado: 'ERROR' })
    expect(motor.estado.puedeTransicionarA('INICIALIZANDO')).toBe(true)
    expect(motor.estado.puedeTransicionarA('DETENIDO')).toBe(true)
    expect(motor.estado.puedeTransicionarA('ACTIVO')).toBe(false)
    expect(motor.estado.puedeTransicionarA('DEGRADADO')).toBe(false)
  })
})
