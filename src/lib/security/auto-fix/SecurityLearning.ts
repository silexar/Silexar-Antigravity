/**
 * Sistema de aprendizaje para el auto-fixer de seguridad
 * @module SecurityAutoFix/SecurityLearning
 * 
 * Aprende de correcciones manuales y aplica patrones similares automáticamente
 */

import { promises as fs } from 'fs';
import { resolve } from 'path';
import type {
  LearnedPattern,
  FixHistoryEntry,
  SecurityIssue,
  IssueType,
} from './types';

/** Configuración por defecto del sistema de aprendizaje */
const DEFAULT_CONFIG = {
  knowledgeBasePath: '.security/knowledge-base.json',
  historyPath: '.security/fix-history.json',
  minSuccessRate: 0.8,
  maxPatterns: 1000,
  confidenceDecay: 0.95, // Decay factor para patrones no usados
};

/** Base de conocimiento del sistema */
interface KnowledgeBase {
  version: string;
  patterns: LearnedPattern[];
  lastUpdated: string;
  totalCorrections: number;
  successRate: number;
}

/** Historial de correcciones */
interface FixHistory {
  entries: FixHistoryEntry[];
  lastUpdated: string;
}

/**
 * Sistema de aprendizaje para correcciones de seguridad
 */
export class SecurityLearning {
  private config: typeof DEFAULT_CONFIG;
  private knowledgeBase: KnowledgeBase;
  private history: FixHistory;
  private patterns: Map<string, LearnedPattern>;
  private initialized = false;

  constructor(config: Partial<typeof DEFAULT_CONFIG> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.patterns = new Map();
    this.knowledgeBase = this.createEmptyKnowledgeBase();
    this.history = { entries: [], lastUpdated: new Date().toISOString() };
  }

  /** Inicializa el sistema cargando datos persistidos */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadKnowledgeBase();
      await this.loadHistory();
      this.initialized = true;
    } catch (error) {
      // Si no existe, crear base vacía
      await this.saveKnowledgeBase();
      await this.saveHistory();
      this.initialized = true;
    }
  }

  /** Crea base de conocimiento vacía */
  private createEmptyKnowledgeBase(): KnowledgeBase {
    return {
      version: '1.0.0',
      patterns: [],
      lastUpdated: new Date().toISOString(),
      totalCorrections: 0,
      successRate: 1.0,
    };
  }

  /** Carga base de conocimiento desde disco */
  private async loadKnowledgeBase(): Promise<void> {
    const path = resolve(this.config.knowledgeBasePath);
    const data = await fs.readFile(path, 'utf-8');
    this.knowledgeBase = JSON.parse(data);
    
    // Convertir a Map para acceso rápido
    this.patterns = new Map(
      this.knowledgeBase.patterns.map(p => [p.id, p])
    );
  }

  /** Carga historial desde disco */
  private async loadHistory(): Promise<void> {
    const path = resolve(this.config.historyPath);
    try {
      const data = await fs.readFile(path, 'utf-8');
      this.history = JSON.parse(data);
    } catch {
      this.history = { entries: [], lastUpdated: new Date().toISOString() };
    }
  }

  /** Guarda base de conocimiento */
  private async saveKnowledgeBase(): Promise<void> {
    const path = resolve(this.config.knowledgeBasePath);
    
    // Asegurar que el directorio existe
    await fs.mkdir(resolve('.security'), { recursive: true });
    
    // Convertir Map a array
    this.knowledgeBase.patterns = Array.from(this.patterns.values());
    this.knowledgeBase.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(
      path,
      JSON.stringify(this.knowledgeBase, null, 2),
      'utf-8'
    );
  }

  /** Guarda historial */
  private async saveHistory(): Promise<void> {
    const path = resolve(this.config.historyPath);
    await fs.mkdir(resolve('.security'), { recursive: true });
    
    this.history.lastUpdated = new Date().toISOString();
    await fs.writeFile(
      path,
      JSON.stringify(this.history, null, 2),
      'utf-8'
    );
  }

  /**
   * Registra una corrección exitosa para aprender
   */
  async recordSuccess(
    issue: SecurityIssue,
    originalCode: string,
    fixedCode: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.ensureInitialized();

    const entry: FixHistoryEntry = {
      id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueType: issue.type,
      filePath: issue.filePath,
      originalCode,
      fixedCode,
      success: true,
      timestamp: new Date(),
    };

    this.history.entries.push(entry);
    this.knowledgeBase.totalCorrections++;

    // Aprender patrón
    await this.learnPattern(issue, originalCode, fixedCode, context);
    
    // Limitar historial
    if (this.history.entries.length > 10000) {
      this.history.entries = this.history.entries.slice(-5000);
    }

    await this.saveHistory();
    await this.saveKnowledgeBase();
  }

  /**
   * Registra una corrección fallida
   */
  async recordFailure(
    issue: SecurityIssue,
    error: string
  ): Promise<void> {
    await this.ensureInitialized();

    const entry: FixHistoryEntry = {
      id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueType: issue.type,
      filePath: issue.filePath,
      originalCode: issue.originalCode,
      fixedCode: '',
      success: false,
      timestamp: new Date(),
    };

    this.history.entries.push(entry);
    await this.saveHistory();

    // Actualizar confianza del patrón si existe
    const pattern = this.findPatternForIssue(issue);
    if (pattern) {
      pattern.failureCount++;
      pattern.confidence = this.calculateConfidence(pattern);
      await this.saveKnowledgeBase();
    }
  }

  /**
   * Aprende un nuevo patrón de corrección
   */
  private async learnPattern(
    issue: SecurityIssue,
    originalCode: string,
    fixedCode: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    // Crear firma del patrón
    const patternSignature = this.createPatternSignature(issue, originalCode);
    
    // Buscar patrón existente
    let existingPattern = Array.from(this.patterns.values()).find(p =>
      p.issueType === issue.type && p.pattern === patternSignature
    );

    if (existingPattern) {
      // Actualizar patrón existente
      existingPattern.successCount++;
      existingPattern.lastUsed = new Date();
      existingPattern.confidence = this.calculateConfidence(existingPattern);
      
      // Refinar el fix si es diferente
      if (existingPattern.fix !== fixedCode) {
        existingPattern.fix = this.mergeFixes(existingPattern.fix, fixedCode);
      }
    } else {
      // Crear nuevo patrón
      const newPattern: LearnedPattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        issueType: issue.type,
        pattern: patternSignature,
        context: context ? JSON.stringify(context) : '',
        fix: fixedCode,
        successCount: 1,
        failureCount: 0,
        createdAt: new Date(),
        lastUsed: new Date(),
        confidence: 1.0,
      };

      this.patterns.set(newPattern.id, newPattern);
      
      // Limitar cantidad de patrones
      await this.pruneOldPatterns();
    }
  }

  /**
   * Crea una firma de patrón para un issue
   */
  private createPatternSignature(issue: SecurityIssue, code: string): string {
    // Normalizar el código para crear patrón más general
    return code
      .replace(/\s+/g, ' ')
      .replace(/['"`][^'"`]*['"`]/g, '{{STRING}}')
      .replace(/\d+/g, '{{NUMBER}}')
      .trim();
  }

  /**
   * Calcula confianza de un patrón
   */
  private calculateConfidence(pattern: LearnedPattern): number {
    const total = pattern.successCount + pattern.failureCount;
    if (total === 0) return 0.5;
    return pattern.successCount / total;
  }

  /**
   * Combina múltiples fixes similares
   */
  private mergeFixes(existingFix: string, newFix: string): string {
    // Si son iguales, devolver cualquiera
    if (existingFix === newFix) return existingFix;
    
    // Crear template genérico
    return existingFix
      .replace(/['"`][^'"`]*['"`]/g, '{{VALUE}}')
      .replace(/\d+/g, '{{NUM}}');
  }

  /**
   * Busca patrón para un issue
   */
  private findPatternForIssue(issue: SecurityIssue): LearnedPattern | undefined {
    const signature = this.createPatternSignature(issue, issue.originalCode);
    return Array.from(this.patterns.values()).find(
      p => p.issueType === issue.type && p.pattern === signature
    );
  }

  /**
   * Obtiene sugerencia basada en patrones aprendidos
   */
  async getSuggestion(issue: SecurityIssue): Promise<string | null> {
    await this.ensureInitialized();

    const pattern = this.findPatternForIssue(issue);
    if (!pattern) return null;
    
    if (pattern.confidence < this.config.minSuccessRate) return null;

    pattern.lastUsed = new Date();
    await this.saveKnowledgeBase();

    // Personalizar el fix basado en el contexto actual
    return this.applyPattern(pattern, issue);
  }

  /**
   * Aplica un patrón a un issue específico
   */
  private applyPattern(pattern: LearnedPattern, issue: SecurityIssue): string {
    let fix = pattern.fix;
    
    // Extraer valores del código original
    const stringMatches = issue.originalCode.match(/['"`]([^'"`]*)['"`]/g);
    const numMatches = issue.originalCode.match(/\d+/g);
    
    // Reemplazar placeholders
    if (stringMatches) {
      stringMatches.forEach((match, i) => {
        fix = fix.replace('{{VALUE}}', match);
        fix = fix.replace(`{{STRING${i}}}`, match);
      });
    }
    
    if (numMatches) {
      numMatches.forEach((match, i) => {
        fix = fix.replace('{{NUM}}', match);
        fix = fix.replace(`{{NUMBER${i}}}`, match);
      });
    }
    
    return fix;
  }

  /**
   * Elimina patrones antiguos si hay demasiados
   */
  private async pruneOldPatterns(): Promise<void> {
    if (this.patterns.size <= this.config.maxPatterns) return;

    const sortedPatterns = Array.from(this.patterns.values())
      .sort((a, b) => {
        // Priorizar por confianza y uso reciente
        const scoreA = a.confidence * this.config.confidenceDecay ** 
          ((Date.now() - a.lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        const scoreB = b.confidence * this.config.confidenceDecay ** 
          ((Date.now() - b.lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        return scoreB - scoreA;
      });

    // Mantener solo los mejores
    const keepPatterns = sortedPatterns.slice(0, this.config.maxPatterns);
    this.patterns = new Map(keepPatterns.map(p => [p.id, p]));
  }

  /**
   * Exporta base de conocimiento a JSON
   */
  async exportKnowledgeBase(): Promise<string> {
    await this.ensureInitialized();
    return JSON.stringify(this.knowledgeBase, null, 2);
  }

  /**
   * Importa base de conocimiento desde JSON
   */
  async importKnowledgeBase(jsonData: string): Promise<void> {
    const imported = JSON.parse(jsonData) as KnowledgeBase;
    
    // Merge con existente
    imported.patterns.forEach(importedPattern => {
      const existing = this.patterns.get(importedPattern.id);
      if (existing) {
        // Actualizar si el importado tiene mejor confianza
        if (importedPattern.confidence > existing.confidence) {
          this.patterns.set(importedPattern.id, importedPattern);
        }
      } else {
        this.patterns.set(importedPattern.id, importedPattern);
      }
    });

    this.knowledgeBase.totalCorrections += imported.totalCorrections;
    await this.saveKnowledgeBase();
  }

  /**
   * Obtiene estadísticas del aprendizaje
   */
  async getStatistics(): Promise<{
    totalPatterns: number;
    totalCorrections: number;
    averageConfidence: number;
    topPatterns: LearnedPattern[];
  }> {
    await this.ensureInitialized();

    const patterns = Array.from(this.patterns.values());
    const avgConfidence = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
      : 0;

    const topPatterns = patterns
      .filter(p => p.confidence >= this.config.minSuccessRate)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    return {
      totalPatterns: patterns.length,
      totalCorrections: this.knowledgeBase.totalCorrections,
      averageConfidence: avgConfidence,
      topPatterns,
    };
  }

  /**
   * Obtiene patrones por tipo de issue
   */
  async getPatternsByIssueType(issueType: IssueType): Promise<LearnedPattern[]> {
    await this.ensureInitialized();
    
    return Array.from(this.patterns.values())
      .filter(p => p.issueType === issueType)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Resetea la base de conocimiento
   */
  async reset(): Promise<void> {
    this.patterns.clear();
    this.knowledgeBase = this.createEmptyKnowledgeBase();
    this.history = { entries: [], lastUpdated: new Date().toISOString() };
    await this.saveKnowledgeBase();
    await this.saveHistory();
  }

  /**
   * Asegura que el sistema está inicializado
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Obtiene historial de correcciones
   */
  async getHistory(
    options: {
      limit?: number;
      issueType?: IssueType;
      successOnly?: boolean;
    } = {}
  ): Promise<FixHistoryEntry[]> {
    await this.ensureInitialized();

    let entries = this.history.entries;

    if (options.issueType) {
      entries = entries.filter(e => e.issueType === options.issueType);
    }

    if (options.successOnly) {
      entries = entries.filter(e => e.success);
    }

    // Ordenar por fecha descendente
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }
}

// Singleton para uso global
let globalLearningInstance: SecurityLearning | null = null;

export const getSecurityLearning = (
  config?: Partial<typeof DEFAULT_CONFIG>
): SecurityLearning => {
  if (!globalLearningInstance) {
    globalLearningInstance = new SecurityLearning(config);
  }
  return globalLearningInstance;
};

export default SecurityLearning;
