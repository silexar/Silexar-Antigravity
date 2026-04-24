import type { IAudioFingerprintService, FingerprintRequest, FingerprintMatch } from '../../application/services/IAudioFingerprintService';

/**
 * AudioFingerprintStub
 * Stub de ACRCloud / Cortex-Sense.
 * Simula detección con 70% de probabilidad de match.
 */
export class AudioFingerprintStub implements IAudioFingerprintService {
  async detectarSpot(request: FingerprintRequest): Promise<FingerprintMatch | null> {
    // Simula latencia de red/procesamiento
    await this._delay(300 + Math.random() * 400);

    const probabilidadMatch = 0.7;
    if (Math.random() > probabilidadMatch) {
      return null;
    }

    const inicioSegundos = this._horaASegundos(request.horaInicioBusqueda) + Math.floor(Math.random() * 600);
    const duracionSegundos = 15 + Math.floor(Math.random() * 45);
    const finSegundos = inicioSegundos + duracionSegundos;

    return {
      materialId: request.materialId,
      materialNombre: request.materialNombre,
      spxCode: `SPX-${Math.floor(Math.random() * 99999)}`,
      confidence: 80 + Math.floor(Math.random() * 20),
      offsetInicioSegundos: inicioSegundos,
      offsetFinSegundos: finSegundos,
      horaDetectada: this._segundosAHora(inicioSegundos),
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
