import type { ISpeechToTextService, SpeechToTextRequest, TranscriptionResult } from '../../application/services/ISpeechToTextService';

/**
 * SpeechToTextStub
 * Stub de Google Speech-to-Text / Whisper.
 * Simula transcripción con menciones detectadas.
 */
export class SpeechToTextStub implements ISpeechToTextService {
  async transcribir(request: SpeechToTextRequest): Promise<TranscriptionResult> {
    await this._delay(400 + Math.random() * 600);

    const menciones: TranscriptionResult['menciones'] = [];
    const probabilidadMencion = 0.6;

    if (Math.random() < probabilidadMencion) {
      const inicioSegundos = this._horaASegundos(request.horaInicioBusqueda) + Math.floor(Math.random() * 600);
      const duracion = 5 + Math.floor(Math.random() * 20);
      const texto = `... ${request.palabrasClave[0] ?? 'mención'} ...`;

      menciones.push({
        texto,
        horaInicio: this._segundosAHora(inicioSegundos),
        horaFin: this._segundosAHora(inicioSegundos + duracion),
        confidence: 75 + Math.floor(Math.random() * 20),
      });
    }

    return {
      textoCompleto: `Transcripción simulada de ${request.urlArchivo}. Contiene ${menciones.length} menciones.`,
      menciones,
    };
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private _horaASegundos(hora: string): number {
    const [h, m, s] = hora.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  private _segundosAHora(totalSegundos: number): string {
    const h = Math.floor(totalSegundos / 3600) % 24;
    const m = Math.floor((totalSegundos % 3600) / 60);
    const s = totalSegundos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}
