import { RegistroEmisionProgramada } from "../entities/RegistroEmisionProgramada";
import { RegistroEmisionReal } from "../entities/RegistroEmisionReal";
import { FechaConciliacion } from "../value-objects/FechaConciliacion";
import { EmisoraTarget } from "../value-objects/EmisoraTarget";

export interface IRegistroEmisionRepository {
  saveProgramados(registros: RegistroEmisionProgramada[], fecha: FechaConciliacion, emisora: EmisoraTarget): Promise<void>;
  saveReales(registros: RegistroEmisionReal[], fecha: FechaConciliacion, emisora: EmisoraTarget): Promise<void>;
  
  findProgramadosByFechaAndEmisora(fecha: FechaConciliacion, emisoraId: string): Promise<RegistroEmisionProgramada[]>;
  findRealesByFechaAndEmisora(fecha: FechaConciliacion, emisoraId: string): Promise<RegistroEmisionReal[]>;
  
  clearProgramados(fecha: FechaConciliacion, emisoraId: string): Promise<void>;
  clearReales(fecha: FechaConciliacion, emisoraId: string): Promise<void>;
}
