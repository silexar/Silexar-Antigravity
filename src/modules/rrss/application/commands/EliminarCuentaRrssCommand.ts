import { z } from 'zod';

export const EliminarCuentaRrssSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export type EliminarCuentaRrssInput = z.infer<typeof EliminarCuentaRrssSchema>;

export class EliminarCuentaRrssCommand {
  constructor(public readonly input: EliminarCuentaRrssInput) {
    const result = EliminarCuentaRrssSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
