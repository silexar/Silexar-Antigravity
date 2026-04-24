import { randomUUID } from 'crypto';
import type { IClipExtractionService, ClipExtractionRequest, ClipExtractionResult } from '../../application/services/IClipExtractionService';

/**
 * ClipExtractionStub
 * Stub de FFmpeg para extraer fragmentos de audio.
 * Simula generación de un archivo de clip.
 */
export class ClipExtractionStub implements IClipExtractionService {
  async extraerClip(request: ClipExtractionRequest): Promise<ClipExtractionResult> {
    await this._delay(200 + Math.random() * 300);

    const inicioSegundos = this._horaASegundos(request.horaInicio);
    const finSegundos = this._horaASegundos(request.horaFin);
    const duracion = finSegundos - inicioSegundos;

    if (duracion <= 0) {
      return {
        urlArchivoClip: '',
        duracionSegundos: 0,
        formato: request.formatoSalida ?? 'mp3',
        exito: false,
        error: 'La duración del clip debe ser mayor a 0',
      };
    }

    const clipId = randomUUID();
    const formato = request.formatoSalida ?? 'mp3';

    return {
      urlArchivoClip: `/uploads/clips/${clipId}.${formato}`,
      duracionSegundos: duracion,
      formato,
      exito: true,
    };
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private _horaASegundos(hora: string): number {
    const [h, m, s] = hora.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }
}
