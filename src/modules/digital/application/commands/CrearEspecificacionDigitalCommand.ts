import { z } from 'zod';

export const CrearEspecificacionDigitalSchema = z.object({
  tenantId: z.string().uuid(),
  campanaId: z.string().uuid().optional(),
  contratoId: z.string().uuid().optional(),
  plataformas: z.array(z.string()).default([]),
  presupuestoDigital: z.number().min(0).optional(),
  moneda: z.string().max(3).default('CLP'),
  tipoPresupuesto: z.enum(['diario', 'total']).optional(),
  objetivos: z.record(z.string(), z.any()).optional(),
  trackingLinks: z.array(z.string()).default([]),
  configuracionTargeting: z.record(z.string(), z.any()).optional(),
  estado: z.string().max(50).default('borrador'),
  notas: z.string().optional(),
  creadoPorId: z.string().uuid(),
}).refine(data => data.campanaId || data.contratoId, {
  message: 'Debe especificar al menos campanaId o contratoId',
});

export type CrearEspecificacionDigitalInput = z.infer<typeof CrearEspecificacionDigitalSchema>;

export class CrearEspecificacionDigitalCommand {
  constructor(public readonly input: CrearEspecificacionDigitalInput) {
    const result = CrearEspecificacionDigitalSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input invalido: ${result.error.message}`);
    }
  }
}
