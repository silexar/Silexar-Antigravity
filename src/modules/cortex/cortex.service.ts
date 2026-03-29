/**
 * CortexService — Application service facade
 *
 * Provides a simplified API for API routes to interact with the cortex module
 * without constructing Handler + Repository manually every time.
 *
 * Usage:
 *   const svc = new CortexService(ctx.tenantId)
 *   const motores = await svc.listarMotores()
 */

import { MotorCortexHandler } from './application/handlers/MotorCortexHandler'
import { MotorCortexDrizzleRepository } from './infrastructure/repositories/MotorCortexDrizzleRepository'
import type { MotorCortex } from './domain/entities/MotorCortex'
import type { EstadoMotorValue } from './domain/value-objects/EstadoMotor'
import type {
  RegistrarMotorCommand,
  ActivarMotorCommand,
  DetenerMotorCommand,
  RegistrarEjecucionCommand,
} from './application/commands/MotorCortexCommands'

export class CortexService {
  private readonly handler: MotorCortexHandler

  constructor(tenantId: string) {
    const repository = new MotorCortexDrizzleRepository(tenantId)
    this.handler = new MotorCortexHandler(repository)
  }

  listarMotores(tenantId: string): Promise<MotorCortex[]> {
    return this.handler.listarMotores(tenantId)
  }

  obtenerResumenEstados(tenantId: string): Promise<Record<EstadoMotorValue, number>> {
    return this.handler.obtenerResumenEstados(tenantId)
  }

  registrarMotor(command: RegistrarMotorCommand): Promise<string> {
    return this.handler.registrarMotor(command)
  }

  activarMotor(command: ActivarMotorCommand): Promise<void> {
    return this.handler.activarMotor(command)
  }

  detenerMotor(command: DetenerMotorCommand): Promise<void> {
    return this.handler.detenerMotor(command)
  }

  registrarEjecucion(command: RegistrarEjecucionCommand): Promise<void> {
    return this.handler.registrarEjecucion(command)
  }
}
