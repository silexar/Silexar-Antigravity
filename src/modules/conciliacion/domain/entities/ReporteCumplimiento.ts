import { Entity } from "./base/AggregateRoot";
import { MetricaCumplimiento } from "../value-objects/MetricaCumplimiento";

interface ReporteCumplimientoProps {
  emisoraId: string;
  fecha: Date;
  cumplimientoGlobal: MetricaCumplimiento;
  totalProgramados: number;
  totalEmitidos: number;
  totalRecuperados: number;
  generadoPor: string;
}

export class ReporteCumplimiento extends Entity<ReporteCumplimientoProps> {
  private constructor(props: ReporteCumplimientoProps, id?: string) {
    super(props, id);
  }

  public static create(props: ReporteCumplimientoProps, id?: string): ReporteCumplimiento {
    return new ReporteCumplimiento(props, id);
  }

  public get resumen(): string {
    return `Emisora: ${this.props.emisoraId} - Cumplimiento: ${this.props.cumplimientoGlobal.toString()}`;
  }
}
