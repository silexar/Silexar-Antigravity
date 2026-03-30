/**
 * Cortex Module — Public API
 *
 * NOTE: This is NOT a NestJS module. Silexar Pulse is a Next.js application.
 * This file serves as the public barrel export for the cortex DDD module.
 *
 * Usage in API routes:
 *   import { MotorCortexHandler, MotorCortexDrizzleRepository } from '@/modules/cortex'
 *
 *   const handler = new MotorCortexHandler(
 *     new MotorCortexDrizzleRepository(ctx.tenantId)
 *   )
 */

export { MotorCortex } from './domain/entities/MotorCortex'
export type { TipoMotorCortex, MotorCortexProps } from './domain/entities/MotorCortex'
export { EstadoMotor } from './domain/value-objects/EstadoMotor'
export type { EstadoMotorValue } from './domain/value-objects/EstadoMotor'
export { MetricasMotor } from './domain/value-objects/MetricasMotor'
export type { MetricasMotorData } from './domain/value-objects/MetricasMotor'
export type { IMotorCortexRepository } from './domain/repositories/IMotorCortexRepository'
export { MotorCortexHandler } from './application/handlers/MotorCortexHandler'
export type {
  RegistrarMotorCommand,
  ActivarMotorCommand,
  DetenerMotorCommand,
  RegistrarEjecucionCommand,
  ActualizarConfiguracionCommand,
} from './application/commands/MotorCortexCommands'
export { MotorCortexDrizzleRepository } from './infrastructure/repositories/MotorCortexDrizzleRepository'
