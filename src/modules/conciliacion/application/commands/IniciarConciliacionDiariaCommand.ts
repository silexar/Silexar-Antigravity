import { z } from "zod";

export const IniciarConciliacionDiariaSchema = z.object({
  fecha: z.string().or(z.date()),
  emisoraId: z.string().min(1, "El ID de emisora es requerido"),
  emisoraNombre: z.string().min(1, "El nombre de emisora es requerido"),
});

export type IniciarConciliacionDiariaDTO = z.infer<typeof IniciarConciliacionDiariaSchema>;

export class IniciarConciliacionDiariaCommand {
  public readonly fecha: string | Date;
  public readonly emisoraId: string;
  public readonly emisoraNombre: string;

  constructor(props: IniciarConciliacionDiariaDTO) {
    this.fecha = props.fecha;
    this.emisoraId = props.emisoraId;
    this.emisoraNombre = props.emisoraNombre;
  }
}
