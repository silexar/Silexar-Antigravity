import { HostVoiceManager } from './HostVoiceManager';


export interface DurationEstimation {
  estimatedSeconds: number;
  wordCount: number;
  characterCount: number;
  isOverLimit: boolean;
  limitUsed: number; // 15 or 30
  message: string;
  hostName?: string;
}

export class DurationEstimatorService {
  
  /**
   * Predice la duración exacta usando el perfil del conductor
   */
  static async estimateDuration(
    text: string, 
    type: 'audio' | 'mencion', 
    hostId?: string
  ): Promise<DurationEstimation> {
    
    const limit = type === 'mencion' ? 15 : 30;
    const host = hostId ? HostVoiceManager.getHostById(hostId) : null;
    
    // 1. Análisis básico de texto
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;

    // 2. Cálculo de ritmo (Pace)
    // Si tenemos host, usamos su WPM. Si no, estándar 150 WPM (2.5 palabras/seg)
    const wpm = host ? host.basePace : 150;
    const wordsPerSecond = wpm / 60;
    
    // Cálculo algorítmico base
    let estimatedSeconds = words / wordsPerSecond;

    // 3. Refinamiento por IA (Simulado: "Entonación Real")
    // Factores de pausas por comas/puntos
    const punctuationFactor = (text.split(',').length * 0.3) + (text.split('.').length * 0.8);
    estimatedSeconds += punctuationFactor;

    // 4. Validación Cortex (Si es necesario, llamaríamos a la API real para "pre-flight")
    // await CortexVoice.dryRun(text, host.voiceId)...

    return {
      estimatedSeconds: parseFloat(estimatedSeconds.toFixed(1)),
      wordCount: words,
      characterCount: chars,
      isOverLimit: estimatedSeconds > limit,
      limitUsed: limit,
      hostName: host?.name,
      message: this.generateFeedback(estimatedSeconds, limit, host?.name)
    };
  }

  private static generateFeedback(seconds: number, limit: number, hostName?: string): string {
    const diff = seconds - limit;
    const hostPrefix = hostName ? `Para el ritmo de ${hostName}: ` : '';

    if (diff > 0) {
      return `${hostPrefix}Excede el tiempo en ${diff.toFixed(1)}s. Se sugiere acortar ${Math.ceil(diff * 2.5)} palabras.`;
    } else if (diff < -5) {
      return `${hostPrefix}Queda espacio libre (${Math.abs(diff).toFixed(1)}s).`;
    }
    return `${hostPrefix}Tiempo perfecto.`;
  }
}
