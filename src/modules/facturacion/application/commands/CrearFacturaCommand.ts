import { z } from 'zod';

export const CrearFacturaSchema = z.object({
  tenantId: z.string().uuid(),
  anuncianteId: z.string().uuid().optional(),
  agenciaId: z.string().uuid().optional(),
  contratoId: z.string().uuid().optional(),
  receptorRut: z.string().min(1).max(12),
  receptorRazonSocial: z.string().min(1).max(255),
  receptorGiro: z.string().max(500).optional(),
  receptorDireccion: z.string().max(500).optional(),
  receptorCiudad: z.string().max(100).optional(),
  receptorComuna: z.string().max(100).optional(),
  fechaEmision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaVencimientos: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  montoNeto: z.number().positive(),
  montoExento: z.number().min(0).default(0),
  tasaIva: z.number().min(0).max(100).default(19),
  formaPago: z.enum(['contado', 'credito_30', 'credito_45', 'credito_60', 'credito_90']).default('credito_30'),
  observaciones: z.string().optional(),
  creadoPorId: z.string().uuid(),
});

export type CrearFacturaInput = z.infer<typeof CrearFacturaSchema>;

export class CrearFacturaCommand {
  constructor(public readonly input: CrearFacturaInput) {
    const result = CrearFacturaSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input inválido: ${result.error.message}`);
    }
  }
}
