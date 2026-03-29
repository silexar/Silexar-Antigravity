import { z } from "zod";

export const SincronizarDaletGalaxySchema = z.object({
  emisoraId: z.string().min(1, "El ID de emisora es requerido"),
  forzarRevision: z.boolean().optional().default(false),
});

export type SincronizarDaletGalaxyDTO = z.infer<typeof SincronizarDaletGalaxySchema>;

export class SincronizarDaletGalaxyCommand {
  public readonly emisoraId: string;
  public readonly forzarRevision: boolean;

  constructor(props: SincronizarDaletGalaxyDTO) {
    this.emisoraId = props.emisoraId;
    this.forzarRevision = props.forzarRevision || false;
  }
}
