/**
 * COMMAND: ACTUALIZAR CUÑA — TIER 0
 *
 * Encapsula los datos validados necesarios para actualizar una cuña existente.
 * La validación Zod ocurre en la API route antes de construir el command.
 *
 * FIX DRY: tipos importados desde el dominio para evitar divergencia.
 */

import type { TipoCunaValor } from '../../domain/entities/Cuna';
import type { FormatoAudioValor } from '../../domain/entities/Audio';

export interface ActualizarCunaInput {
  id: string;
  tenantId: string;
  nombre?: string;
  tipo?: TipoCunaValor;
  anuncianteId?: string;
  campanaId?: string | null;
  contratoId?: string | null;
  productoNombre?: string | null;
  descripcion?: string | null;
  pathAudio?: string;
  duracionSegundos?: number;
  duracionMilisegundos?: number | null;
  formatoAudio?: FormatoAudioValor;
  bitrate?: number | null;
  sampleRate?: number | null;
  tamanoBytes?: number | null;
  fechaInicioVigencia?: Date | null;
  fechaFinVigencia?: Date | null;
  urgencia?: string | null;
  notas?: string | null;
  modificadoPorId: string;
}

export class ActualizarCunaCommand {
  constructor(public readonly input: ActualizarCunaInput) {}
}