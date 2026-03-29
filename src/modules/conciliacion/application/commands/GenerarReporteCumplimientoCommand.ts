import { z } from "zod";

export const GenerarReporteCumplimientoSchema = z.object({
  emisoraId: z.string().min(1, "El ID de emisora es requerido"),
  fechaInicio: z.date(),
  fechaFin: z.date(),
  formato: z.enum(['PDF', 'XLSX', 'JSON']),
  usuarioId: z.string().min(1, "El ID de usuario es requerido"),
});

export type GenerarReporteCumplimientoDTO = z.infer<typeof GenerarReporteCumplimientoSchema>;

export class GenerarReporteCumplimientoCommand {
  public readonly emisoraId: string;
  public readonly fechaInicio: Date;
  public readonly fechaFin: Date;
  public readonly formato: string;
  public readonly usuarioId: string;

  constructor(props: GenerarReporteCumplimientoDTO) {
    this.emisoraId = props.emisoraId;
    this.fechaInicio = props.fechaInicio;
    this.fechaFin = props.fechaFin;
    this.formato = props.formato;
    this.usuarioId = props.usuarioId;
  }
}
