import { z } from "zod";

export const EnviarConsultaVentasSchema = z.object({
  spotNoEmitidoId: z.string().uuid(),
  ejecutivoVentaId: z.string(),
  mensajeAdicional: z.string().optional()
});

export type EnviarConsultaVentasDTO = z.infer<typeof EnviarConsultaVentasSchema>;

export class EnviarConsultaVentasCommand {
  public readonly spotNoEmitidoId: string;
  public readonly ejecutivoVentaId: string;
  public readonly mensajeAdicional?: string;

  constructor(props: EnviarConsultaVentasDTO) {
    this.spotNoEmitidoId = props.spotNoEmitidoId;
    this.ejecutivoVentaId = props.ejecutivoVentaId;
    this.mensajeAdicional = props.mensajeAdicional;
  }
}
