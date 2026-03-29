import { z } from "zod";
import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { HorarioEmision } from "../value-objects/HorarioEmision";
import { DuracionSpot } from "../value-objects/DuracionSpot";

interface RegistroEmisionProgramadaProps {
  codigoSP: CodigoSP;
  horario: HorarioEmision;
  duracion: DuracionSpot;
  cliente: string;
  campana: string;
  valorComercial: number;
}

export class RegistroEmisionProgramada extends Entity<RegistroEmisionProgramadaProps> {
  
  private constructor(props: RegistroEmisionProgramadaProps, id?: string) {
    super(props, id);
  }

  public static create(props: RegistroEmisionProgramadaProps, id?: string): RegistroEmisionProgramada {
    const schema = z.object({
      cliente: z.string().min(1, "El cliente es requerido"),
      campana: z.string().min(1, "La campaña es requerida"),
      valorComercial: z.number().min(0, "El valor comercial debe ser positivo"),
    });

    schema.parse({
      cliente: props.cliente,
      campana: props.campana,
      valorComercial: props.valorComercial
    });

    return new RegistroEmisionProgramada(props, id);
  }

  get codigoSP(): CodigoSP { return this.props.codigoSP; }
  get horario(): HorarioEmision { return this.props.horario; }
  get duracion(): DuracionSpot { return this.props.duracion; }
  get cliente(): string { return this.props.cliente; }
  get campana(): string { return this.props.campana; }
  get valorComercial(): number { return this.props.valorComercial; }
}
