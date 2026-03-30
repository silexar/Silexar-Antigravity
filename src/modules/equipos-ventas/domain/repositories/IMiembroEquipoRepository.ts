/**
 * REPOSITORY INTERFACE: MIEMBRO EQUIPO
 */

import { MiembroEquipo } from '../entities/MiembroEquipo';

export interface IMiembroEquipoRepository {
  findById(id: string): Promise<MiembroEquipo | null>;
  findByEquipoId(equipoId: string): Promise<MiembroEquipo[]>;
  findByVendedorId(vendedorId: string): Promise<MiembroEquipo | null>;
  save(miembro: MiembroEquipo): Promise<void>;
  delete(id: string): Promise<void>;
}
