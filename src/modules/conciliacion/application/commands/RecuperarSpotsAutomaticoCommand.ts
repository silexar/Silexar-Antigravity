import { z } from "zod";

export const RecuperarSpotsAutomaticoSchema = z.object({
  conciliacionId: z.string().min(1, "El ID de conciliación es requerido"),
  spotIds: z.array(z.string()).min(1, "Debe seleccionar al menos un spot"),
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional().default('MEDIA'),
});

export type RecuperarSpotsAutomaticoDTO = z.infer<typeof RecuperarSpotsAutomaticoSchema>;

export class RecuperarSpotsAutomaticoCommand {
  public readonly conciliacionId: string;
  public readonly spotIds: string[];
  public readonly prioridad: string;

  constructor(props: RecuperarSpotsAutomaticoDTO) {
    this.conciliacionId = props.conciliacionId;
    this.spotIds = props.spotIds;
    this.prioridad = props.prioridad || 'MEDIA';
  }
}
