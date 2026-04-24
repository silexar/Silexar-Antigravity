/**
 * COMMAND: CREAR CUÑA — TIER 0
 *
 * Encapsula los datos validados necesarios para crear una nueva cuña.
 * La validación Zod ocurre en la API route antes de construir el command.
 *
 * FIX DRY: tipos importados desde el dominio para evitar divergencia.
 */

import type { TipoCunaValor } from '../../domain/entities/Cuna';
import type { FormatoAudioValor } from '../../domain/entities/Audio';

export interface CrearCunaInput {
  tenantId: string;
  nombre: string;
  tipo: TipoCunaValor;
  anuncianteId: string;
  campanaId?: string | null;
  contratoId?: string | null;
  productoNombre?: string | null;
  descripcion?: string | null;
  pathAudio: string;
  duracionSegundos: number;
  duracionMilisegundos?: number | null;
  formatoAudio: FormatoAudioValor;
  bitrate?: number | null;
  sampleRate?: number | null;
  tamanoBytes?: number | null;
  fechaInicioVigencia?: Date | null;
  fechaFinVigencia?: Date | null;
  urgencia?: string | null;
  notas?: string | null;
  subidoPorId: string;
}

export class CrearCunaCommand {
  constructor(public readonly input: CrearCunaInput) {}
}