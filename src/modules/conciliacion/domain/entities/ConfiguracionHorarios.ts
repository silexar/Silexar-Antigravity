import { Entity } from "./base/AggregateRoot";
import { FranjaHoraria } from "../value-objects/FranjaHoraria";

interface FranjaVentana {
  franja: FranjaHoraria;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  maxSpots: number;
}

interface ConfiguracionHorariosProps {
  emisoraId: string;
  ventanas: FranjaVentana[];
  activo: boolean;
}

export class ConfiguracionHorarios extends Entity<ConfiguracionHorariosProps> {
  private constructor(props: ConfiguracionHorariosProps, id?: string) {
    super(props, id);
  }

  public static create(props: ConfiguracionHorariosProps, id?: string): ConfiguracionHorarios {
    return new ConfiguracionHorarios(props, id);
  }

  public obtenerVentanaParaFranja(franja: FranjaHoraria): FranjaVentana | undefined {
    return this.props.ventanas.find(v => v.franja.value === franja.value);
  }
}
