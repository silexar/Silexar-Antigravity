import { z } from "zod";

export const CrearBackupSeguridadSchema = z.object({
  nombre: z.string().min(3, "El nombre del backup es requerido"),
  descripcion: z.string().optional(),
  usuarioId: z.string().min(1, "El ID de usuario es requerido"),
});

export type CrearBackupSeguridadDTO = z.infer<typeof CrearBackupSeguridadSchema>;

export class CrearBackupSeguridadCommand {
  public readonly nombre: string;
  public readonly descripcion?: string;
  public readonly usuarioId: string;

  constructor(props: CrearBackupSeguridadDTO) {
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.usuarioId = props.usuarioId;
  }
}
