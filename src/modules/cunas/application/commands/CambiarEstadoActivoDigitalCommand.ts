/**
 * COMMAND: CAMBIAR ESTADO ACTIVO DIGITAL
 *
 * Define el input y la estructura del comando para cambiar
 * el estado de un activo digital.
 */

import { z } from 'zod';
import { EstadoActivoDigitalSchema } from '../../domain/entities/ActivoDigital';

export const CambiarEstadoActivoDigitalInputSchema = z.object({
  activoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  nuevoEstado: EstadoActivoDigitalSchema,
  motivoRechazo: z.string().max(500).optional().nullable(),
  userId: z.string().uuid(),
});

export type CambiarEstadoActivoDigitalInput = z.infer<typeof CambiarEstadoActivoDigitalInputSchema>;

export class CambiarEstadoActivoDigitalCommand {
  constructor(public readonly input: CambiarEstadoActivoDigitalInput) {}
}
