import { z } from "zod";

export const ProcesarArchivoDaletSchema = z.object({
  conciliacionId: z.string().uuid("El ID de conciliación debe ser válido"),
  rutaArchivo: z.string().min(1),
  emisoraId: z.string().min(1)
});

export type ProcesarArchivoDaletDTO = z.infer<typeof ProcesarArchivoDaletSchema>;

export class ProcesarArchivoDaletCommand {
  public readonly conciliacionId: string;
  public readonly rutaArchivo: string;
  public readonly emisoraId: string;

  constructor(props: ProcesarArchivoDaletDTO) {
    this.conciliacionId = props.conciliacionId;
    this.rutaArchivo = props.rutaArchivo;
    this.emisoraId = props.emisoraId;
  }
}
