/**
 * IClipExtractionService
 * Extrae un fragmento de audio de un archivo mayor.
 * Stub para futura integración con FFmpeg.
 */

export interface ClipExtractionRequest {
  urlArchivoOrigen: string;
  horaInicio: string; // HH:mm:ss
  horaFin: string;    // HH:mm:ss
  duracionTotalSegundos: number; // duración total del archivo origen
  formatoSalida?: 'mp3' | 'wav' | 'flac';
}

export interface ClipExtractionResult {
  urlArchivoClip: string;
  duracionSegundos: number;
  formato: string;
  exito: boolean;
  error?: string;
}

export interface IClipExtractionService {
  extraerClip(request: ClipExtractionRequest): Promise<ClipExtractionResult>;
}
