import { z } from 'zod';

export const ActualizarEspecificacionDigitalSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  plataformas: z.array(z.string()).optional(),
  presupuestoDigital: z.number().min(0).optional(),
  moneda: z.string().max(3).optional(),
  tipoPresupuesto: z.enum(['diario', 'total']).optional(),
  objetivos: z.record(z.string(), z.any()).optional(),
  trackingLinks: z.array(z.string()).optional(),
  configuracionTargeting: z.record(z.string(), z.any()).optional(),
  estado: z.string().max(50).optional(),
  notas: z.string().optional(),
});

export type ActualizarEspecificacionDigitalInput = z.infer<typeof ActualizarEspecificacionDigitalSchema>;

export class ActualizarEspecificacionDigitalCommand {
  constructor(public readonly input: ActualizarEspecificacionDigitalInput) {
    const result = ActualizarEspecificacionDigitalSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
