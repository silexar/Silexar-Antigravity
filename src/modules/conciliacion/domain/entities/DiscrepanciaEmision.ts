import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { TipoDiscrepancia } from "../value-objects/TipoDiscrepancia";
import { HorarioEmision } from "../value-objects/HorarioEmision";
import { DuracionSpot } from "../value-objects/DuracionSpot";

interface DiscrepanciaEmisionProps {
  codigoSP: CodigoSP;
  tipo: TipoDiscrepancia;
  horarioProgramado: HorarioEmision;
  horarioReal?: HorarioEmision; // Opcional si no se emitió
  duracionProgramada: DuracionSpot;
  duracionReal?: DuracionSpot; // Opcional si no se emitió o fue distinta
  detalles: string;
  resuelta: boolean;
}

export class DiscrepanciaEmision extends Entity<DiscrepanciaEmisionProps> {
  
  private constructor(props: DiscrepanciaEmisionProps, id?: string) {
    super(props, id);
  }

  public static create(props: DiscrepanciaEmisionProps, id?: string): DiscrepanciaEmision {
    return new DiscrepanciaEmision({
      ...props,
      resuelta: props.resuelta ?? false
    }, id);
  }

  public marcarComoResuelta(): void {
    this.props.resuelta = true;
  }

  get codigoSP(): CodigoSP { return this.props.codigoSP; }
  get tipo(): TipoDiscrepancia { return this.props.tipo; }
  get resuelta(): boolean { return this.props.resuelta; }
}
