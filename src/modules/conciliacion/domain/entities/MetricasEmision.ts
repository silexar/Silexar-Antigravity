import { Entity } from "./base/AggregateRoot";
import { MetricaCumplimiento } from "../value-objects/MetricaCumplimiento";

interface MetricasEmisionProps {
  emisoraId: string;
  fecha: Date;
  cumplimientoActual: MetricaCumplimiento;
  spotsProgramados: number;
  spotsNoEmitidos: number;
  spotsRecuperados: number;
  eficienciaRecuperacion: number;
}

export class MetricasEmision extends Entity<MetricasEmisionProps> {
  private constructor(props: MetricasEmisionProps, id?: string) {
    super(props, id);
  }

  public static create(props: MetricasEmisionProps, id?: string): MetricasEmision {
    return new MetricasEmision(props, id);
  }

  public recalcularEficiencia(): void {
    if (this.props.spotsNoEmitidos === 0) {
      this.props.eficienciaRecuperacion = 100;
    } else {
      this.props.eficienciaRecuperacion = (this.props.spotsRecuperados / this.props.spotsNoEmitidos) * 100;
    }
  }
}
