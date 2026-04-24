/**
 * COMMAND: PROCESAR AUDIO — TIER 0
 *
 * Dispara el pipeline de análisis técnico para un archivo de audio subido.
 * Valida formatos, LUFS, bitrate, sampleRate y genera fingerprint.
 */

import type { FormatoAudioValor } from '../../domain/entities/Audio';

export interface ProcesarAudioInput {
  tenantId: string;
  cunaId: string;              // Cuña a la que pertenece
  pathOriginal: string;        // Ruta GCS del archivo original
  nombreArchivo: string;
  tamanoBytes: number;
  formato: FormatoAudioValor;
  subidoPorId: string;
  generarTranscripcion?: boolean;  // Si se requiere speech-to-text
}

export class ProcesarAudioCommand {
  constructor(public readonly input: ProcesarAudioInput) {}
}
