/**
 * IMotorCortexRepository — Interface del repositorio de motores Cortex AI
 */

import type { MotorCortex, TipoMotorCortex } from '../entities/MotorCortex';
import type { EstadoMotorValue } from '../value-objects/EstadoMotor';

export interface IMotorCortexRepository {
  /** Buscar por ID */
  buscarPorId(id: string, tenantId: string): Promise<MotorCortex | null>;

  /** Buscar por tipo */
  buscarPorTipo(tipo: TipoMotorCortex, tenantId: string): Promise<MotorCortex | null>;

  /** Listar todos los motores de un tenant */
  listarPorTenant(tenantId: string): Promise<MotorCortex[]>;

  /** Listar por estado */
  listarPorEstado(tenantId: string, estado: EstadoMotorValue): Promise<MotorCortex[]>;

  /** Guardar nuevo motor */
  guardar(motor: MotorCortex): Promise<void>;

  /** Actualizar motor existente */
  actualizar(motor: MotorCortex): Promise<void>;

  /** Obtener resumen de estado de todos los motores */
  obtenerResumenEstados(tenantId: string): Promise<Record<EstadoMotorValue, number>>;
}
