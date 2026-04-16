import { z } from 'zod';

export const PublicarAhoraRrssSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export type PublicarAhoraRrssInput = z.infer<typeof PublicarAhoraRrssSchema>;

export class PublicarAhoraRrssCommand {
  constructor(public readonly input: PublicarAhoraRrssInput) {
    const result = PublicarAhoraRrssSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
