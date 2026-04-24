/**
 * IAudioFingerprintService
 * Detecta spots pre-grabados dentro de una grabación de aire.
 * Stub para futura integración con ACRCloud.
 */

export interface FingerprintMatch {
  materialId: string;
  materialNombre: string;
  spxCode?: string;
  confidence: number; // 0-100
  offsetInicioSegundos: number;
  offsetFinSegundos: number;
  horaDetectada: string; // HH:mm:ss
}

export interface FingerprintRequest {
  urlArchivo: string;
  horaInicioBusqueda: string; // HH:mm:ss
  horaFinBusqueda: string;   // HH:mm:ss
  materialUrl: string;        // URL del spot de referencia
  materialId: string;
  materialNombre: string;
}

export interface IAudioFingerprintService {
  detectarSpot(request: FingerprintRequest): Promise<FingerprintMatch | null>;
}
