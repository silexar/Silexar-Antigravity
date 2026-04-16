/**
 * COMMAND: CAMBIAR ESTADO CUÑA — TIER 0
 *
 * Maneja transiciones de estado individuales con validación via EstadoCuna VO.
 * Incluye la información del actor para auditoría.
 */

import { z } from 'zod';

export const CambiarEstadoCunaInputSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  nuevoEstado: z.enum([
    'borrador',
    'pendiente_aprobacion',
    'aprobada',
    'en_aire',
    'pausada',
    'finalizada',
    'rechazada',
  ]),
  motivo: z.string().max(500).optional().nullable(),
});

export type CambiarEstadoCunaInput = z.infer<typeof CambiarEstadoCunaInputSchema>;

export class CambiarEstadoCunaCommand {
  constructor(public readonly input: CambiarEstadoCunaInput) {}
}
