import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { HorarioEmision } from "../value-objects/HorarioEmision";
import { DuracionSpot } from "../value-objects/DuracionSpot";

interface RegistroEmisionRealProps {
  codigoSP: CodigoSP;
  horarioReal: HorarioEmision;
  duracionReal: DuracionSpot;
  archivoOrigen: string; // Ej: radio_corazon_20250820.csv
  lineaArchivo: number;
}

export class RegistroEmisionReal extends Entity<RegistroEmisionRealProps> {
  
  private constructor(props: RegistroEmisionRealProps, id?: string) {
    super(props, id);
  }

  public static create(props: RegistroEmisionRealProps, id?: string): RegistroEmisionReal {
    // Validaciones basicas si es necesario, o relying on Value Objects
    if (!props.archivoOrigen || props.archivoOrigen.trim() === '') {
        throw new Error("El archivo origen es requerido para un registro real.");
    }

    return new RegistroEmisionReal(props, id);
  }

  get codigoSP(): CodigoSP { return this.props.codigoSP; }
  get horarioReal(): HorarioEmision { return this.props.horarioReal; }
  get duracionReal(): DuracionSpot { return this.props.duracionReal; }
  get archivoOrigen(): string { return this.props.archivoOrigen; }
  get lineaArchivo(): number { return this.props.lineaArchivo; }
}
