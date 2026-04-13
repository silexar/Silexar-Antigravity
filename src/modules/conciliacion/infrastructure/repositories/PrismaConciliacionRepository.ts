/**
 * PrismaConciliacionRepository
 * In-memory implementation of IConciliacionDiariaRepository.
 * Provides an in-process store until the PostgreSQL/Drizzle migration is complete.
 */
import { ConciliacionDiaria } from '../../domain/entities/ConciliacionDiaria';
import { FechaConciliacion } from '../../domain/value-objects/FechaConciliacion';
import { IConciliacionDiariaRepository } from '../../domain/repositories/IConciliacionDiariaRepository';

export class PrismaConciliacionRepository implements IConciliacionDiariaRepository {
  private store = new Map<string, ConciliacionDiaria>();

  async save(conciliacion: ConciliacionDiaria): Promise<void> {
    this.store.set(conciliacion.id, conciliacion);
  }

  async findById(id: string): Promise<ConciliacionDiaria | null> {
    return this.store.get(id) ?? null;
  }

  async findByFechaAndEmisora(
    fecha: FechaConciliacion,
    emisoraId: string
  ): Promise<ConciliacionDiaria | null> {
    for (const item of this.store.values()) {
      if (
        item.fecha.value.toDateString() === fecha.value.toDateString() &&
        item.emisora.id === emisoraId
      ) {
        return item;
      }
    }
    return null;
  }

  async findAllPendientes(): Promise<ConciliacionDiaria[]> {
    return [...this.store.values()].filter(c => c.estado === 'PENDIENTE' || c.estado === 'PROCESANDO');
  }

  async update(conciliacion: ConciliacionDiaria): Promise<void> {
    this.store.set(conciliacion.id, conciliacion);
  }
}
