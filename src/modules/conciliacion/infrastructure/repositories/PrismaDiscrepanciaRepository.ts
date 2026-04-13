/**
 * PrismaDiscrepanciaRepository
 * In-memory implementation of IDiscrepanciaRepository.
 * Provides an in-process store until the PostgreSQL/Drizzle migration is complete.
 */
import { DiscrepanciaEmision } from '../../domain/entities/DiscrepanciaEmision';
import { SpotNoEmitido } from '../../domain/entities/SpotNoEmitido';
import { TipoDiscrepancia } from '../../domain/value-objects/TipoDiscrepancia';
import { IDiscrepanciaRepository } from '../../domain/repositories/IDiscrepanciaRepository';

export class PrismaDiscrepanciaRepository implements IDiscrepanciaRepository {
  private discrepancias = new Map<string, DiscrepanciaEmision>();
  private spots = new Map<string, SpotNoEmitido>();

  async save(discrepancia: DiscrepanciaEmision, _conciliacionId: string): Promise<void> {
    this.discrepancias.set(discrepancia.id, discrepancia);
  }

  async saveMany(discrepancias: DiscrepanciaEmision[], conciliacionId: string): Promise<void> {
    for (const d of discrepancias) {
      await this.save(d, conciliacionId);
    }
  }

  async findById(id: string): Promise<DiscrepanciaEmision | null> {
    return this.discrepancias.get(id) ?? null;
  }

  async findByConciliacionId(_conciliacionId: string): Promise<DiscrepanciaEmision[]> {
    return [...this.discrepancias.values()];
  }

  async findByTipo(tipo: TipoDiscrepancia, limit = 100): Promise<DiscrepanciaEmision[]> {
    return [...this.discrepancias.values()]
      .filter(d => d.tipo.value === tipo.value)
      .slice(0, limit);
  }

  async update(discrepancia: DiscrepanciaEmision): Promise<void> {
    this.discrepancias.set(discrepancia.id, discrepancia);
  }

  async findSpotById(id: string): Promise<SpotNoEmitido | null> {
    return this.spots.get(id) ?? null;
  }

  async saveSpot(spot: SpotNoEmitido): Promise<void> {
    this.spots.set(spot.id, spot);
  }
}
