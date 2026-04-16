import { z } from 'zod';

export const ActualizarPublicacionRrssSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  connectionId: z.string().uuid().optional(),
  campanaId: z.string().uuid().optional().nullable(),
  contratoId: z.string().uuid().optional().nullable(),
  contenido: z.string().min(1).max(2200).optional(),
  hashtags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  estado: z.enum(['borrador', 'programada', 'cancelada']).optional(),
  scheduledAt: z.coerce.date().optional().nullable(),
}).refine((data) => {
  if (data.estado === 'programada' && !data.scheduledAt) {
    return false;
  }
  return true;
}, {
  message: 'scheduledAt es requerido cuando el estado es programada',
  path: ['scheduledAt'],
});

export type ActualizarPublicacionRrssInput = z.infer<typeof ActualizarPublicacionRrssSchema>;

export class ActualizarPublicacionRrssCommand {
  constructor(public readonly input: ActualizarPublicacionRrssInput) {
    const result = ActualizarPublicacionRrssSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
