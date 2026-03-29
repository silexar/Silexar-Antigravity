/**
 * MotorCortexHandler unit tests — Application layer
 * Repository is fully mocked (unit test, no DB needed)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MotorCortexHandler } from '../../../modules/cortex/application/handlers/MotorCortexHandler'
import type { IMotorCortexRepository } from '../../../modules/cortex/domain/repositories/IMotorCortexRepository'
import { MotorCortex } from '../../../modules/cortex/domain/entities/MotorCortex'

// ─── Mocked repository ────────────────────────────────────────────────────────

function makeMotor(overrides: Partial<Parameters<typeof MotorCortex.reconstituir>[0]> = {}) {
  return MotorCortex.reconstituir({
    id: 'motor-001',
    tenantId: 'tenant-001',
    tipo: 'ORCHESTRATOR',
    nombre: 'Cortex Orchestrator',
    version: '2.0.0',
    estado: 'INICIALIZANDO',
    metricas: {
      precision: 0,
      latenciaMs: 0,
      solicitudesTotal: 0,
      solicitudesExitosas: 0,
    },
    configuracion: {},
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    ...overrides,
  })
}

function makeMockRepo(): IMotorCortexRepository {
  return {
    buscarPorId: vi.fn(),
    buscarPorTipo: vi.fn(),
    listarPorTenant: vi.fn(),
    listarPorEstado: vi.fn(),
    guardar: vi.fn(),
    actualizar: vi.fn(),
    obtenerResumenEstados: vi.fn(),
  }
}

// ─── registrarMotor() ─────────────────────────────────────────────────────────

describe('MotorCortexHandler.registrarMotor()', () => {
  let repo: IMotorCortexRepository
  let handler: MotorCortexHandler

  beforeEach(() => {
    repo = makeMockRepo()
    handler = new MotorCortexHandler(repo)
  })

  it('should register a new motor and return its id', async () => {
    vi.mocked(repo.buscarPorTipo).mockResolvedValue(null)
    vi.mocked(repo.guardar).mockResolvedValue(undefined)

    const id = await handler.registrarMotor({
      tenantId: 'tenant-001',
      tipo: 'ORCHESTRATOR',
      nombre: 'Cortex Orchestrator',
      version: '2.0.0',
      configuracion: {},
    })

    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
    expect(repo.guardar).toHaveBeenCalledOnce()
  })

  it('should throw if motor type already registered for tenant', async () => {
    vi.mocked(repo.buscarPorTipo).mockResolvedValue(makeMotor())

    await expect(
      handler.registrarMotor({
        tenantId: 'tenant-001',
        tipo: 'ORCHESTRATOR',
        nombre: 'Duplicate',
        version: '1.0.0',
        configuracion: {},
      })
    ).rejects.toThrow('ya registrado')

    expect(repo.guardar).not.toHaveBeenCalled()
  })
})

// ─── activarMotor() ───────────────────────────────────────────────────────────

describe('MotorCortexHandler.activarMotor()', () => {
  let repo: IMotorCortexRepository
  let handler: MotorCortexHandler

  beforeEach(() => {
    repo = makeMockRepo()
    handler = new MotorCortexHandler(repo)
  })

  it('should activate a motor in INICIALIZANDO state', async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(makeMotor({ estado: 'INICIALIZANDO' }))
    vi.mocked(repo.actualizar).mockResolvedValue(undefined)

    await handler.activarMotor({ motorId: 'motor-001', tenantId: 'tenant-001' })

    expect(repo.actualizar).toHaveBeenCalledOnce()
    // The motor passed to actualizar should be in ACTIVO state
    const updatedMotor = vi.mocked(repo.actualizar).mock.calls[0][0]
    expect(updatedMotor.estado.valor).toBe('ACTIVO')
  })

  it('should throw when motor not found', async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(null)

    await expect(
      handler.activarMotor({ motorId: 'non-existent', tenantId: 'tenant-001' })
    ).rejects.toThrow('Motor Cortex no encontrado')
  })

  it('should throw when motor cannot transition to ACTIVO', async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(makeMotor({ estado: 'DETENIDO' }))

    await expect(
      handler.activarMotor({ motorId: 'motor-001', tenantId: 'tenant-001' })
    ).rejects.toThrow()

    expect(repo.actualizar).not.toHaveBeenCalled()
  })
})

// ─── detenerMotor() ───────────────────────────────────────────────────────────

describe('MotorCortexHandler.detenerMotor()', () => {
  let repo: IMotorCortexRepository
  let handler: MotorCortexHandler

  beforeEach(() => {
    repo = makeMockRepo()
    handler = new MotorCortexHandler(repo)
  })

  it('should stop an ACTIVO motor', async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(makeMotor({ estado: 'ACTIVO' }))
    vi.mocked(repo.actualizar).mockResolvedValue(undefined)

    await handler.detenerMotor({
      motorId: 'motor-001',
      tenantId: 'tenant-001',
      motivo: 'Maintenance',
    })

    const updatedMotor = vi.mocked(repo.actualizar).mock.calls[0][0]
    expect(updatedMotor.estado.valor).toBe('DETENIDO')
  })
})

// ─── registrarEjecucion() ────────────────────────────────────────────────────

describe('MotorCortexHandler.registrarEjecucion()', () => {
  let repo: IMotorCortexRepository
  let handler: MotorCortexHandler

  beforeEach(() => {
    repo = makeMockRepo()
    handler = new MotorCortexHandler(repo)
    vi.mocked(repo.actualizar).mockResolvedValue(undefined)
  })

  it('should record successful execution', async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(makeMotor({ estado: 'ACTIVO' }))

    await handler.registrarEjecucion({
      motorId: 'motor-001',
      tenantId: 'tenant-001',
      exitosa: true,
      latenciaMs: 150,
    })

    const updatedMotor = vi.mocked(repo.actualizar).mock.calls[0][0]
    expect(updatedMotor.metricas.solicitudesTotal).toBe(1)
    expect(updatedMotor.metricas.solicitudesExitosas).toBe(1)
  })

  it('should record failed execution', async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(makeMotor({ estado: 'ACTIVO' }))

    await handler.registrarEjecucion({
      motorId: 'motor-001',
      tenantId: 'tenant-001',
      exitosa: false,
      latenciaMs: 5000,
    })

    const updatedMotor = vi.mocked(repo.actualizar).mock.calls[0][0]
    expect(updatedMotor.metricas.solicitudesTotal).toBe(1)
    expect(updatedMotor.metricas.solicitudesExitosas).toBe(0)
  })
})

// ─── listarMotores() + obtenerResumenEstados() ────────────────────────────────

describe('MotorCortexHandler read operations', () => {
  let repo: IMotorCortexRepository
  let handler: MotorCortexHandler

  beforeEach(() => {
    repo = makeMockRepo()
    handler = new MotorCortexHandler(repo)
  })

  it('listarMotores returns all motors for tenant', async () => {
    const motors = [makeMotor(), makeMotor({ id: 'motor-002', tipo: 'PROPHET' })]
    vi.mocked(repo.listarPorTenant).mockResolvedValue(motors)

    const result = await handler.listarMotores('tenant-001')
    expect(result.length).toBe(2)
    expect(repo.listarPorTenant).toHaveBeenCalledWith('tenant-001')
  })

  it('obtenerResumenEstados returns count per estado', async () => {
    const resumen = {
      INICIALIZANDO: 0,
      ACTIVO: 5,
      DEGRADADO: 1,
      DETENIDO: 2,
      ERROR: 0,
    }
    vi.mocked(repo.obtenerResumenEstados).mockResolvedValue(resumen)

    const result = await handler.obtenerResumenEstados('tenant-001')
    expect(result.ACTIVO).toBe(5)
    expect(result.DEGRADADO).toBe(1)
  })
})
