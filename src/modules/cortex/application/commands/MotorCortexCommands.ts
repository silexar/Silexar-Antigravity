/**
 * MotorCortexCommands — Commands for Cortex AI motor management
 */

import type { TipoMotorCortex } from '../../domain/entities/MotorCortex';

export interface RegistrarMotorCommand {
  tenantId: string;
  tipo: TipoMotorCortex;
  nombre: string;
  version: string;
  configuracion: Record<string, unknown>;
}

export interface ActivarMotorCommand {
  motorId: string;
  tenantId: string;
}

export interface DetenerMotorCommand {
  motorId: string;
  tenantId: string;
  motivo: string;
}

export interface RegistrarEjecucionCommand {
  motorId: string;
  tenantId: string;
  exitosa: boolean;
  latenciaMs: number;
}

export interface ActualizarConfiguracionCommand {
  motorId: string;
  tenantId: string;
  configuracion: Record<string, unknown>;
}
