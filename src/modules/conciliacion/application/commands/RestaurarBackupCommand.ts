import { z } from "zod";

export const RestaurarBackupSchema = z.object({
  backupId: z.string().min(1, "El ID de backup es requerido"),
  usuarioId: z.string().min(1, "El ID de usuario es requerido"),
  confirmacion: z.boolean().refine(v => v === true, "Debe confirmar la restauración"),
});

export type RestaurarBackupDTO = z.infer<typeof RestaurarBackupSchema>;

export class RestaurarBackupCommand {
  public readonly backupId: string;
  public readonly usuarioId: string;

  constructor(props: RestaurarBackupDTO) {
    this.backupId = props.backupId;
    this.usuarioId = props.usuarioId;
  }
}
