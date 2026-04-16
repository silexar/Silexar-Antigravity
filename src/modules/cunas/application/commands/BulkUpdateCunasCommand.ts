/**
 * COMMAND: BULK UPDATE CUÑAS — TIER 0
 *
 * Acciones masivas sobre múltiples cuñas en una sola operación.
 */

import { z } from 'zod';

export const BulkUpdateCunasInputSchema = z.object({
  cunaIds: z.array(z.string().uuid()).min(1, 'Se requiere al menos 1 ID').max(100),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  accion: z.enum(['aprobar', 'poner_en_aire', 'pausar', 'finalizar', 'eliminar', 'cambiar_urgencia']),
  urgencia: z.string().max(50).optional(),
  motivo: z.string().max(500).optional(),
});

export type BulkUpdateCunasInput = z.infer<typeof BulkUpdateCunasInputSchema>;

export interface BulkUpdateResult {
  exitosos: number;
  fallidos: number;
  errores: Array<{ cunaId: string; error: string }>;
}

export class BulkUpdateCunasCommand {
  constructor(public readonly input: BulkUpdateCunasInput) {}
}
