/**
 * ISpeechToTextService
 * Transcribe audio a texto para detectar menciones en vivo.
 * Stub para futura integración con Google Speech-to-Text / Whisper.
 */

export interface TranscriptionResult {
  textoCompleto: string;
  menciones: Array<{
    texto: string;
    horaInicio: string; // HH:mm:ss
    horaFin: string;
    confidence: number;
  }>;
}

export interface SpeechToTextRequest {
  urlArchivo: string;
  horaInicioBusqueda: string;
  horaFinBusqueda: string;
  palabrasClave: string[];
}

export interface ISpeechToTextService {
  transcribir(request: SpeechToTextRequest): Promise<TranscriptionResult>;
}
