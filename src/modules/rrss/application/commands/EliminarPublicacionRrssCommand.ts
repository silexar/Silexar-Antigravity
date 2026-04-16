import { z } from 'zod';

export const EliminarPublicacionRrssSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export type EliminarPublicacionRrssInput = z.infer<typeof EliminarPublicacionRrssSchema>;

export class EliminarPublicacionRrssCommand {
  constructor(public readonly input: EliminarPublicacionRrssInput) {
    const result = EliminarPublicacionRrssSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
