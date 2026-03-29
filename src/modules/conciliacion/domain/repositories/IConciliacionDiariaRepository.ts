import { ConciliacionDiaria } from "../entities/ConciliacionDiaria";
import { FechaConciliacion } from "../value-objects/FechaConciliacion";

export interface IConciliacionDiariaRepository {
  save(conciliacion: ConciliacionDiaria): Promise<void>;
  findById(id: string): Promise<ConciliacionDiaria | null>;
  findByFechaAndEmisora(fecha: FechaConciliacion, emisoraId: string): Promise<ConciliacionDiaria | null>;
  findAllPendientes(): Promise<ConciliacionDiaria[]>;
  update(conciliacion: ConciliacionDiaria): Promise<void>;
}
