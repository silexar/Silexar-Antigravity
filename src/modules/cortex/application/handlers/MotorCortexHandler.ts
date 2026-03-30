/**
 * MotorCortexHandler — Orchestrates Cortex AI motor use cases
 */

import { randomUUID } from 'crypto';

import { MotorCortex } from '../../domain/entities/MotorCortex';
import type { IMotorCortexRepository } from '../../domain/repositories/IMotorCortexRepository';
import type { EstadoMotorValue } from '../../domain/value-objects/EstadoMotor';
import type {
  RegistrarMotorCommand,
  ActivarMotorCommand,
  DetenerMotorCommand,
  RegistrarEjecucionCommand,
  ActualizarConfiguracionCommand,
} from '../commands/MotorCortexCommands';

export class MotorCortexHandler {
  constructor(private readonly repository: IMotorCortexRepository) {}

  async registrarMotor(command: RegistrarMotorCommand): Promise<string> {
    // Verify it doesn't already exist for this tenant
    const existente = await this.repository.buscarPorTipo(command.tipo, command.tenantId);
    if (existente) {
      throw new Error(`Motor ${command.tipo} ya registrado para este tenant`);
    }

    const motor = MotorCortex.crear({
      id: randomUUID(),
      tenantId: command.tenantId,
      tipo: command.tipo,
      nombre: command.nombre,
      version: command.version,
      estado: 'INICIALIZANDO',
      metricas: {
        precision: 0,
        latenciaMs: 0,
        solicitudesTotal: 0,
        solicitudesExitosas: 0,
      },
      configuracion: command.configuracion,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    await this.repository.guardar(motor);
    return motor.id;
  }

  async activarMotor(command: ActivarMotorCommand): Promise<void> {
    const motor = await this._obtenerOLanzar(command.motorId, command.tenantId);
    motor.activar();
    await this.repository.actualizar(motor);
  }

  async detenerMotor(command: DetenerMotorCommand): Promise<void> {
    const motor = await this._obtenerOLanzar(command.motorId, command.tenantId);
    motor.detener(command.motivo);
    await this.repository.actualizar(motor);
  }

  async registrarEjecucion(command: RegistrarEjecucionCommand): Promise<void> {
    const motor = await this._obtenerOLanzar(command.motorId, command.tenantId);
    motor.registrarEjecucion(command.exitosa, command.latenciaMs);
    await this.repository.actualizar(motor);
  }

  async actualizarConfiguracion(command: ActualizarConfiguracionCommand): Promise<void> {
    const motor = await this._obtenerOLanzar(command.motorId, command.tenantId);
    motor.actualizarConfiguracion(command.configuracion);
    await this.repository.actualizar(motor);
  }

  async listarMotores(tenantId: string): Promise<MotorCortex[]> {
    return this.repository.listarPorTenant(tenantId);
  }

  async obtenerResumenEstados(tenantId: string): Promise<Record<EstadoMotorValue, number>> {
    return this.repository.obtenerResumenEstados(tenantId);
  }

  private async _obtenerOLanzar(motorId: string, tenantId: string): Promise<MotorCortex> {
    const motor = await this.repository.buscarPorId(motorId, tenantId);
    if (!motor) {
      throw new Error(`Motor Cortex no encontrado: ${motorId}`);
    }
    return motor;
  }
}
