import { z } from 'zod';
import { TipoActivoDigitalSchema, FormatoArchivoSchema } from '../../domain/entities/ActivoDigital';

export const ActualizarActivoDigitalInputSchema = z.object({
  activoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string().min(3).max(255).optional(),
  urlOptimizada: z.string().url().optional().nullable(),
  urlThumbnail: z.string().url().optional().nullable(),
  calidadScore: z.number().min(0).max(100).optional(),
  scoreBrandSafety: z.number().min(0).max(100).optional(),
  fechaInicio: z.coerce.date().optional().nullable(),
  fechaFin: z.coerce.date().optional().nullable(),
  plataformasDestino: z.array(z.string()).optional(),
  userId: z.string().uuid(),
});

export type ActualizarActivoDigitalInput = z.infer<typeof ActualizarActivoDigitalInputSchema>;

export class ActualizarActivoDigitalCommand {
  constructor(public readonly input: ActualizarActivoDigitalInput) { }
}
