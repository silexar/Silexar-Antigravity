import { RecuperacionAutomatica } from "../entities/RecuperacionAutomatica";
import { RecuperacionManual } from "../entities/RecuperacionManual";

export interface IRecuperacionRepository {
  saveAutomatica(recuperacion: RecuperacionAutomatica): Promise<void>;
  saveManual(recuperacion: RecuperacionManual): Promise<void>;
  findAutomaticaById(id: string): Promise<RecuperacionAutomatica | null>;
  findManualById(id: string): Promise<RecuperacionManual | null>;
  findAllPendientes(): Promise<(RecuperacionAutomatica | RecuperacionManual)[]>;
}
