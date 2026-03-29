import { AggregateRoot } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { FechaConciliacion } from "../value-objects/FechaConciliacion";

interface RecuperacionManualProps {
  codigoSP: CodigoSP;
  fechaOriginal: FechaConciliacion;
  fechaNueva: Date;
  bloqueNueva: string;
  operadorId: string;
  justificacion: string;
  confirmada: boolean;
}

export class RecuperacionManual extends AggregateRoot<RecuperacionManualProps> {
  private constructor(props: RecuperacionManualProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<RecuperacionManualProps, 'confirmada'>, id?: string): RecuperacionManual {
    return new RecuperacionManual({
      ...props,
      confirmada: false
    }, id);
  }

  public confirmar(): void {
    this.props.confirmada = true;
  }

  get isConfirmada(): boolean { return this.props.confirmada; }
}
