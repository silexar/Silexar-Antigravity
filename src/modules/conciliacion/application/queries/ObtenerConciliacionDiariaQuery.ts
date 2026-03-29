import { z } from "zod";

export const ObtenerConciliacionDiariaSchema = z.object({
  conciliacionId: z.string().uuid("El ID debe ser un UUID válido")
});

export type ObtenerConciliacionDiariaDTO = z.infer<typeof ObtenerConciliacionDiariaSchema>;

export class ObtenerConciliacionDiariaQuery {
  public readonly conciliacionId: string;

  constructor(props: ObtenerConciliacionDiariaDTO) {
    this.conciliacionId = props.conciliacionId;
  }
}
