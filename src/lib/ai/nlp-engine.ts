import { logger } from '@/lib/observability';
/**
 * Motor de Procesamiento de Lenguaje Natural (NLP) Empresarial
 * TIER 0 - Sistema de IA Conversacional de Próxima Generación
 * Optimizado para Fortune 10 y operación 24/7
 */

export interface NLPConfig {
  confidenceThreshold: number;
  maxContextLength: number;
  language: string;
  enableSentiment: boolean;
  enableEntityRecognition: boolean;
  enableIntentClassification: boolean;
}

export interface Intent {
  name: string;
  confidence: number;
  entities: Entity[];
  context: Record<string, unknown>;
}

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface Sentiment {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface NLPResult {
  text: string;
  intent: Intent;
  sentiment: Sentiment;
  entities: Entity[];
  confidence: number;
  processingTime: number;
  language: string;
}

export class NLPEngine {
  private config: NLPConfig;
  private context: string[] = [];
  private intents: Map<string, string[]> = new Map();
  private entities: Map<string, RegExp> = new Map();

  constructor(config: Partial<NLPConfig> = {}) {
    this.config = {
      confidenceThreshold: 0.8,
      maxContextLength: 10,
      language: 'es',
      enableSentiment: true,
      enableEntityRecognition: true,
      enableIntentClassification: true,
      ...config
    };

    this.initializeIntents();
    this.initializeEntities();
  }

  private initializeIntents(): void {
    // Intents empresariales de alto nivel
    this.intents.set('billing', [
      'factura', 'facturación', 'pago', 'cobro', 'saldo', 'cuenta', 'cargo', 'abono'
    ]);
    
    this.intents.set('analytics', [
      'reporte', 'análisis', 'métrica', 'dashboard', 'gráfico', 'dato', 'estadística'
    ]);
    
    this.intents.set('support', [
      'ayuda', 'soporte', 'problema', 'error', 'falla', 'asistencia', 'dudas'
    ]);
    
    this.intents.set('contract', [
      'contrato', 'cpvi', 'cpcn', 'acuerdo', 'término', 'condición', 'cláusula'
    ]);
    
    this.intents.set('system', [
      'sistema', 'configuración', 'usuario', 'permiso', 'acceso', 'seguridad', 'monitor'
    ]);
  }

  private initializeEntities(): void {
    // Entidades empresariales comunes
    this.entities.set('amount', /\$?\d+(?:\.\d{2})?/g);
    this.entities.set('date', /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g);
    this.entities.set('contract', /CPVI-\d+|CPCN-\d+/gi);
    this.entities.set('email', /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    this.entities.set('percentage', /\d+(?:\.\d+)?%?/g);
  }

  async process(text: string): Promise<NLPResult> {
    const startTime = performance.now();
    
    try {
      // Preprocesamiento
      const normalizedText = this.preprocess(text);
      
      // Clasificación de intención
      const intent = this.classifyIntent(normalizedText);
      
      // Reconocimiento de entidades
      const entities = this.extractEntities(text);
      
      // Análisis de sentimiento
      const sentiment = this.analyzeSentiment(normalizedText);
      
      // Gestión de contexto
      this.updateContext(text);
      
      const processingTime = performance.now() - startTime;
      
      return {
        text: normalizedText,
        intent,
        sentiment,
        entities,
        confidence: intent.confidence,
        processingTime,
        language: this.config.language
      };
    } catch (error) {
      logger.error('Error en procesamiento NLP:', error instanceof Error ? error : undefined);
      throw new Error(`Fallo en procesamiento NLP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private preprocess(text: string): string {
    // Normalización básica
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\sáéíóúñ$%\-@]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private classifyIntent(text: string): Intent {
    const scores: { [key: string]: number } = {};
    let maxScore = 0;
    let bestIntent = 'unknown';

    // Calcular puntuación para cada intent
    for (const [intentName, keywords] of this.intents.entries()) {
      let score = 0;
      let matchedKeywords = 0;

      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
          matchedKeywords++;
        }
      }

      if (matchedKeywords > 0) {
        score = score / keywords.length;
        scores[intentName] = score;
        
        if (score > maxScore) {
          maxScore = score;
          bestIntent = intentName;
        }
      }
    }

    // Calcular confianza basada en coincidencias y contexto
    const confidence = Math.min(maxScore * 0.9 + this.getContextScore(text) * 0.1, 1);

    return {
      name: bestIntent,
      confidence,
      entities: [],
      context: { scores }
    };
  }

  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    for (const [type, pattern] of this.entities.entries()) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            type,
            value: match[0],
            start: match.index,
            end: match.index + match[0].length,
            confidence: 0.95
          });
        }
      }
    }

    return entities;
  }

  private analyzeSentiment(text: string): Sentiment {
    // Análisis básico de sentimiento
    const positiveWords = ['bien', 'excelente', 'perfecto', 'rápido', 'eficiente', 'bueno', 'mejor', 'satisfactorio'];
    const negativeWords = ['mal', 'lento', 'problema', 'error', 'falla', 'malo', 'peor', 'insatisfactorio'];

    let positiveScore = 0;
    let negativeScore = 0;

    const words = text.split(' ');
    
    for (const word of words) {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    }

    const total = positiveScore + negativeScore;
    let score = 0;
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';

    if (total > 0) {
      score = (positiveScore - negativeScore) / total;
      if (score > 0.1) label = 'positive';
      else if (score < -0.1) label = 'negative';
    }

    return {
      score,
      label,
      confidence: total > 0 ? 0.8 : 0.5
    };
  }

  private getContextScore(text: string): number {
    if (this.context.length === 0) return 0;
    
    const recentContext = this.context.slice(-3).join(' ');
    const words = text.split(' ');
    const contextWords = recentContext.split(' ');
    
    const overlap = words.filter(word => contextWords.includes(word)).length;
    return overlap / words.length;
  }

  private updateContext(text: string): void {
    this.context.push(text);
    if (this.context.length > this.config.maxContextLength) {
      this.context.shift();
    }
  }

  addIntent(name: string, keywords: string[]): void {
    this.intents.set(name, keywords);
  }

  addEntity(type: string, pattern: RegExp): void {
    this.entities.set(type, pattern);
  }

  getContext(): string[] {
    return [...this.context];
  }

  clearContext(): void {
    this.context = [];
  }

  updateConfig(newConfig: Partial<NLPConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getStats(): {
    intents: number;
    entities: number;
    contextLength: number;
    config: NLPConfig;
  } {
    return {
      intents: this.intents.size,
      entities: this.entities.size,
      contextLength: this.context.length,
      config: this.config
    };
  }
}

// Singleton para uso global
export const nlpEngine = new NLPEngine({
  confidenceThreshold: 0.85,
  maxContextLength: 15,
  language: 'es',
  enableSentiment: true,
  enableEntityRecognition: true,
  enableIntentClassification: true
});

export default NLPEngine;