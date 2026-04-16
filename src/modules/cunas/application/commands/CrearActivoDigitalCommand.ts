/**
 * COMMAND: CREAR ACTIVO DIGITAL
 *
 * Encapsula los datos validados para crear un activo digital.
 */

import { z } from 'zod';
import { TipoActivoDigitalSchema, FormatoArchivoSchema } from '../../domain/entities/ActivoDigital';

export const CrearActivoDigitalInputSchema = z.object({
  tenantId: z.string().uuid(),
  cunaId: z.string().uuid('El cunaId debe ser un UUID válido'),
  anuncianteId: z.string().uuid(),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  tipo: TipoActivoDigitalSchema,
  formato: FormatoArchivoSchema,
  urlOriginal: z.string().url('La URL original debe ser válida'),
  duracionSegundos: z.number().int().positive().optional().nullable(),
  pesoBytes: z.number().int().positive('El peso debe ser mayor a 0'),
  anchoPixeles: z.number().int().positive().optional().nullable(),
  altoPixeles: z.number().int().positive().optional().nullable(),
  urlThumbnail: z.string().url().optional().nullable(),
  subidoPorId: z.string().uuid(),
});

export type CrearActivoDigitalInput = z.infer<typeof CrearActivoDigitalInputSchema>;

export class CrearActivoDigitalCommand {
  constructor(public readonly input: CrearActivoDigitalInput) {}
}
