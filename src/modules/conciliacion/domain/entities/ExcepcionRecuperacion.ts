import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";

interface ExcepcionRecuperacionProps {
  codigoSP: CodigoSP;
  razon: string;
  usuarioId: string;
  fechaExcepcion: Date;
  activa: boolean;
}

export class ExcepcionRecuperacion extends Entity<ExcepcionRecuperacionProps> {
  private constructor(props: ExcepcionRecuperacionProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<ExcepcionRecuperacionProps, 'fechaExcepcion' | 'activa'>, id?: string): ExcepcionRecuperacion {
    return new ExcepcionRecuperacion({
      ...props,
      fechaExcepcion: new Date(),
      activa: true
    }, id);
  }

  public desactivar(): void {
    this.props.activa = false;
  }
}
