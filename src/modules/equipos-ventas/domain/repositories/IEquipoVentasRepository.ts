/**
 * REPOSITORY INTERFACE: EQUITY VENTAS
 */

import { EquipoVentas } from '../entities/EquipoVentas';

export interface IEquipoVentasRepository {
  findById(id: string): Promise<EquipoVentas | null>;
  findByLiderId(liderId: string): Promise<EquipoVentas[]>;
  findAll(filters?: Record<string, unknown>): Promise<EquipoVentas[]>;
  save(equipo: EquipoVentas): Promise<void>;
  delete(id: string): Promise<void>;
}
