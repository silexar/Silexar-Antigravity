import { z } from "zod";

export const RegistrarDecisionVentasSchema = z.object({
  spotNoEmitidoId: z.string().uuid(),
  aprobado: z.boolean(),
  instrucciones: z.string()
});

export type RegistrarDecisionVentasDTO = z.infer<typeof RegistrarDecisionVentasSchema>;

export class RegistrarDecisionVentasCommand {
  public readonly spotNoEmitidoId: string;
  public readonly aprobado: boolean;
  public readonly instrucciones: string;

  constructor(props: RegistrarDecisionVentasDTO) {
    this.spotNoEmitidoId = props.spotNoEmitidoId;
    this.aprobado = props.aprobado;
    this.instrucciones = props.instrucciones;
  }
}
