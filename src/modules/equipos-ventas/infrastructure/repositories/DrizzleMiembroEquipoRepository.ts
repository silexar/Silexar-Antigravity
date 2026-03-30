/**
 * REPOSITORY IMPLEMENTATION: MIEMBRO EQUIPO (DRIZZLE)
 */

import { IMiembroEquipoRepository } from '../../domain/repositories/IMiembroEquipoRepository';
import { MiembroEquipo } from '../../domain/entities/MiembroEquipo';

export class DrizzleMiembroEquipoRepository implements IMiembroEquipoRepository {
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(_id: string): Promise<MiembroEquipo | null> {
    // Implementación real con Drizzle
    return null; // Stub temporal
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByEquipoId(_equipoId: string): Promise<MiembroEquipo[]> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByVendedorId(_vendedorId: string): Promise<MiembroEquipo | null> {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(_miembro: MiembroEquipo): Promise<void> {
    // const data = miembro.toSnapshot();
    // await db.insert(miembros).values(data)...
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(_id: string): Promise<void> {
    // await db.delete(miembros)...
  }
}
