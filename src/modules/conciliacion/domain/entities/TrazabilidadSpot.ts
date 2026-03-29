import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { TrazabilidadCompleta } from "../value-objects/TrazabilidadCompleta";

interface TrazabilidadSpotProps {
  codigoSP: CodigoSP;
  eventos: TrazabilidadCompleta;
  ultimaActualizacion: Date;
}

export class TrazabilidadSpot extends Entity<TrazabilidadSpotProps> {
  private constructor(props: TrazabilidadSpotProps, id?: string) {
    super(props, id);
  }

  public static create(codigoSP: CodigoSP, id?: string): TrazabilidadSpot {
    return new TrazabilidadSpot({
      codigoSP,
      eventos: TrazabilidadCompleta.empty(),
      ultimaActualizacion: new Date()
    }, id);
  }

  public registrarHito(accion: string, usuario: string, metadata?: Record<string, unknown>): void {
      this.props.eventos = this.props.eventos.addEvento({
          timestamp: new Date(),
          accion,
          usuario,
          metadata
      });
      this.props.ultimaActualizacion = new Date();
  }
}
