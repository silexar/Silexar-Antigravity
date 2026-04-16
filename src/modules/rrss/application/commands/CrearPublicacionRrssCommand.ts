import { z } from 'zod';

export const CrearPublicacionRrssSchema = z.object({
  tenantId: z.string().uuid(),
  creadoPorId: z.string().uuid(),
  connectionId: z.string().uuid(),
  campanaId: z.string().uuid().optional(),
  contratoId: z.string().uuid().optional(),
  contenido: z.string().min(1).max(2200),
  hashtags: z.array(z.string()).default([]),
  mediaUrls: z.array(z.string().url()).default([]),
  estado: z.enum(['borrador', 'programada']).default('borrador'),
  scheduledAt: z.coerce.date().optional(),
}).refine((data) => {
  if (data.estado === 'programada' && !data.scheduledAt) {
    return false;
  }
  return true;
}, {
  message: 'scheduledAt es requerido cuando el estado es programada',
  path: ['scheduledAt'],
});

export type CrearPublicacionRrssInput = z.infer<typeof CrearPublicacionRrssSchema>;

export class CrearPublicacionRrssCommand {
  constructor(public readonly input: CrearPublicacionRrssInput) {
    const result = CrearPublicacionRrssSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
