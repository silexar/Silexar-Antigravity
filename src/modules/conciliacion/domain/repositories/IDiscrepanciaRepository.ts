import { DiscrepanciaEmision } from "../entities/DiscrepanciaEmision";
import { SpotNoEmitido } from "../entities/SpotNoEmitido";
import { TipoDiscrepancia } from "../value-objects/TipoDiscrepancia";

export interface IDiscrepanciaRepository {
  save(discrepancia: DiscrepanciaEmision, conciliacionId: string): Promise<void>;
  saveMany(discrepancias: DiscrepanciaEmision[], conciliacionId: string): Promise<void>;
  findById(id: string): Promise<DiscrepanciaEmision | null>;
  findByConciliacionId(conciliacionId: string): Promise<DiscrepanciaEmision[]>;
  findByTipo(tipo: TipoDiscrepancia, limit?: number): Promise<DiscrepanciaEmision[]>;
  update(discrepancia: DiscrepanciaEmision): Promise<void>;
  
  // Manejo de Spots específicos (Puente Tráfico-Ventas)
  findSpotById(id: string): Promise<SpotNoEmitido | null>;
  saveSpot(spot: SpotNoEmitido): Promise<void>;
}

