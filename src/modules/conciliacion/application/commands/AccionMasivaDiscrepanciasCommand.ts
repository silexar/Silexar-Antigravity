import { z } from "zod";

export const AccionMasivaDiscrepanciasSchema = z.object({
  spotIds: z.array(z.string().uuid()),
  tipoAccion: z.enum(['CONSULTAR_VENTAS', 'RECUPERAR_AHORA', 'DESCARTAR']),
  mensajeComun: z.string().optional()
});

export type AccionMasivaDiscrepanciasInput = z.infer<typeof AccionMasivaDiscrepanciasSchema>;

export class AccionMasivaDiscrepanciasCommand {
  public readonly spotIds: string[];
  public readonly tipoAccion: 'CONSULTAR_VENTAS' | 'RECUPERAR_AHORA' | 'DESCARTAR';
  public readonly mensajeComun?: string;

  constructor(input: AccionMasivaDiscrepanciasInput) {
    this.spotIds = input.spotIds;
    this.tipoAccion = input.tipoAccion;
    this.mensajeComun = input.mensajeComun;
  }
}
