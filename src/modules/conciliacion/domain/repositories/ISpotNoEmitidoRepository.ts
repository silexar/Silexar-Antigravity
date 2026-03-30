import { SpotNoEmitido } from "../entities/SpotNoEmitido";
import { FechaConciliacion } from "../value-objects/FechaConciliacion";

export interface ISpotNoEmitidoRepository {
  save(spot: SpotNoEmitido): Promise<void>;
  saveMany(spots: SpotNoEmitido[]): Promise<void>;
  findById(id: string): Promise<SpotNoEmitido | null>;
  findByFecha(fecha: FechaConciliacion): Promise<SpotNoEmitido[]>;
  findByEmisora(emisoraId: string): Promise<SpotNoEmitido[]>;
  delete(id: string): Promise<void>;
}
