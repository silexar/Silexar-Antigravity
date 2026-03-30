import { AggregateRoot, DomainEvent } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { FechaConciliacion } from "../value-objects/FechaConciliacion";
import { ModoRecuperacion } from "../value-objects/ModoRecuperacion";
import { TipoRecuperacion } from "../value-objects/TipoRecuperacion";

export class RecuperacionIniciadaEvent extends DomainEvent {
  constructor(public readonly recuperacionId: string, public readonly codigoSP: string) {
    super();
  }
}

interface RecuperacionAutomaticaProps {
  codigoSP: CodigoSP;
  fechaOriginal: FechaConciliacion;
  fechaRecuperacion: Date;
  bloqueDestino: string;
  modo: ModoRecuperacion;
  tipo: TipoRecuperacion;
  estado: 'PENDIENTE' | 'PROCESADA' | 'FALLIDA';
  error?: string;
}

export class RecuperacionAutomatica extends AggregateRoot<RecuperacionAutomaticaProps> {
  private constructor(props: RecuperacionAutomaticaProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<RecuperacionAutomaticaProps, 'estado'>, id?: string): RecuperacionAutomatica {
    const recuperacion = new RecuperacionAutomatica({
      ...props,
      estado: 'PENDIENTE'
    }, id);

    recuperacion.addDomainEvent(new RecuperacionIniciadaEvent(recuperacion.id, props.codigoSP.value));
    return recuperacion;
  }

  public marcarComoProcesada(): void {
    this.props.estado = 'PROCESADA';
  }

  public marcarComoFallida(error: string): void {
    this.props.estado = 'FALLIDA';
    this.props.error = error;
  }

  get codigoSP(): CodigoSP { return this.props.codigoSP; }
  get estado(): string { return this.props.estado; }
}
