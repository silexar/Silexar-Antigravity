import { Entity } from "./base/AggregateRoot";
import { TrazabilidadCompleta } from "../value-objects/TrazabilidadCompleta";

interface AuditoriaRecuperacionProps {
  recuperacionId: string;
  tipoAccion: string;
  timestamp: Date;
  usuarioId: string;
  trazabilidad: TrazabilidadCompleta;
}

export class AuditoriaRecuperacion extends Entity<AuditoriaRecuperacionProps> {
  private constructor(props: AuditoriaRecuperacionProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<AuditoriaRecuperacionProps, 'timestamp'>, id?: string): AuditoriaRecuperacion {
    return new AuditoriaRecuperacion({
      ...props,
      timestamp: new Date()
    }, id);
  }

  public registrarEvento(accion: string, usuario: string, metadata?: Record<string, unknown>): void {
      const nuevoEvento = {
          timestamp: new Date(),
          accion,
          usuario,
          metadata
      };
      this.props.trazabilidad = this.props.trazabilidad.addEvento(nuevoEvento);
  }
}
