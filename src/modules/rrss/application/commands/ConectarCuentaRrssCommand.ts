import { z } from 'zod';

export const ConectarCuentaRrssSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  plataforma: z.enum(['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'youtube']),
  accountId: z.string().min(1),
  accountName: z.string().optional(),
  accountAvatar: z.string().url().optional(),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.coerce.date().optional(),
});

export type ConectarCuentaRrssInput = z.infer<typeof ConectarCuentaRrssSchema>;

export class ConectarCuentaRrssCommand {
  constructor(public readonly input: ConectarCuentaRrssInput) {
    const result = ConectarCuentaRrssSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
