/**
 * COMMAND: CREAR CUÑA — TIER 0
 *
 * Encapsula los datos validados necesarios para crear una nueva cuña.
 * La validación Zod ocurre en la API route antes de construir el command.
 */

import { z } from 'zod';

export const CrearCunaInputSchema = z.object({
  tenantId: z.string().uuid(),
  nombre: z.string().min(5, 'El nombre debe tener al menos 5 caracteres').max(100),
  tipo: z.enum([
    'spot', 'mencion', 'auspicio', 'jingle', 'promo',
    'institucional', 'promo_ida', 'presentacion', 'cierre', 'audio'
  ]).default('spot'),
  anuncianteId: z.string().uuid('El anuncianteId debe ser un UUID válido'),
  campanaId: z.string().uuid().optional().nullable(),
  contratoId: z.string().uuid().optional().nullable(),
  productoNombre: z.string().max(255).optional().nullable(),
  descripcion: z.string().max(1000).optional().nullable(),
  pathAudio: z.string().min(1, 'La ruta del audio es requerida'),
  duracionSegundos: z.number().int().positive().default(30),
  duracionMilisegundos: z.number().int().min(0).max(999).optional().nullable(),
  formatoAudio: z.enum(['mp3', 'wav', 'aac', 'flac', 'ogg']).default('mp3'),
  bitrate: z.number().int().positive().optional().nullable(),
  sampleRate: z.number().int().positive().optional().nullable(),
  tamanoBytes: z.number().int().positive().optional().nullable(),
  fechaInicioVigencia: z.coerce.date().optional().nullable(),
  fechaFinVigencia: z.coerce.date().optional().nullable(),
  urgencia: z.string().max(50).optional().nullable(),
  notas: z.string().max(2000).optional().nullable(),
  subidoPorId: z.string().uuid(),
});

export type CrearCunaInput = z.infer<typeof CrearCunaInputSchema>;

export class CrearCunaCommand {
  constructor(public readonly input: CrearCunaInput) {}
}
