import { z } from "zod";

export const DetectarDiscrepanciasSchema = z.object({
  conciliacionId: z.string().min(1, "El ID de conciliación es requerido"),
  ignorarMargenMenor: z.boolean().optional().default(false),
});

export type DetectarDiscrepanciasDTO = z.infer<typeof DetectarDiscrepanciasSchema>;

export class DetectarDiscrepanciasCommand {
  public readonly conciliacionId: string;
  public readonly ignorarMargenMenor: boolean;

  constructor(props: DetectarDiscrepanciasDTO) {
    this.conciliacionId = props.conciliacionId;
    this.ignorarMargenMenor = props.ignorarMargenMenor || false;
  }
}
