import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";

interface ReglaComercial {
  id: string;
  descripcion: string;
  condicion: (metadata: unknown) => boolean;
}

interface ValidacionComercialProps {
  codigoSP: CodigoSP;
  reglasAplicadas: string[];
  resultado: boolean;
  observaciones: string;
}

export class ValidacionComercial extends Entity<ValidacionComercialProps> {
  private constructor(props: ValidacionComercialProps, id?: string) {
    super(props, id);
  }

  public static create(codigoSP: CodigoSP, id?: string): ValidacionComercial {
    return new ValidacionComercial({
      codigoSP,
      reglasAplicadas: [],
      resultado: true,
      observaciones: "Pendiente de validación profunda."
    }, id);
  }

  public aplicarRegla(reglaId: string, paso: boolean, observacion: string): void {
      this.props.reglasAplicadas.push(reglaId);
      if (!paso) this.props.resultado = false;
      this.props.observaciones += ` | ${observacion}`;
  }
}
