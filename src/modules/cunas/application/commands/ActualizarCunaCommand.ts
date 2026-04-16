/**
 * COMMAND: ACTUALIZAR CUÑA — TIER 0
 *
 * Partial update de campos editables de una cuña existente.
 */

import { z } from 'zod';

export const ActualizarCunaInputSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  modificadoPorId: z.string().uuid(),
  nombre: z.string().min(5).max(100).optional(),
  descripcion: z.string().max(1000).nullable().optional(),
  campanaId: z.string().uuid().nullable().optional(),
  contratoId: z.string().uuid().nullable().optional(),
  productoNombre: z.string().max(255).nullable().optional(),
  fechaFinVigencia: z.coerce.date().nullable().optional(),
  urgencia: z.string().max(50).nullable().optional(),
  notas: z.string().max(2000).nullable().optional(),
});

export type ActualizarCunaInput = z.infer<typeof ActualizarCunaInputSchema>;

export class ActualizarCunaCommand {
  constructor(public readonly input: ActualizarCunaInput) {}
}
