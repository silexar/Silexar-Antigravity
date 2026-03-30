/**
 * ⭐ VALUE OBJECT: SCORE CREATIVO
 * 
 * Representa el puntaje de calidad creativa de una agencia
 * Escala de 0-1000 con clasificaciones automáticas
 */

export type ScoreCreativoLevel = 
  | 'NOVATO'      // 0-199
  | 'BASICO'      // 200-399
  | 'COMPETENTE'  // 400-599
  | 'AVANZADO'    // 600-799
  | 'EXPERTO'     // 800-899
  | 'MAESTRO'     // 900-949
  | 'LEYENDA'     // 950-999
  | 'SUPREMO'     // 1000

export class ScoreCreativo {
  private readonly _value: number
  
  constructor(score: number) {
    this._value = this.normalizeScore(score)
    this.validate()
  }
  
  get value(): number {
    return this._value
  }
  
  get level(): ScoreCreativoLevel {
    if (this._value >= 1000) return 'SUPREMO'
    if (this._value >= 950) return 'LEYENDA'
    if (this._value >= 900) return 'MAESTRO'
    if (this._value >= 800) return 'EXPERTO'
    if (this._value >= 600) return 'AVANZADO'
    if (this._value >= 400) return 'COMPETENTE'
    if (this._value >= 200) return 'BASICO'
    return 'NOVATO'
  }
  
  get displayName(): string {
    const names: Record<ScoreCreativoLevel, string> = {
      'NOVATO': 'Novato',
      'BASICO': 'Básico',
      'COMPETENTE': 'Competente',
      'AVANZADO': 'Avanzado',
      'EXPERTO': 'Experto',
      'MAESTRO': 'Maestro',
      'LEYENDA': 'Leyenda',
      'SUPREMO': 'Supremo'
    }
    
    return names[this.level]
  }
  
  get emoji(): string {
    const emojis: Record<ScoreCreativoLevel, string> = {
      'NOVATO': '🌱',
      'BASICO': '🥉',
      'COMPETENTE': '🥈',
      'AVANZADO': '🥇',
      'EXPERTO': '⭐',
      'MAESTRO': '🏆',
      'LEYENDA': '👑',
      'SUPREMO': '💎'
    }
    
    return emojis[this.level]
  }
  
  get color(): string {
    const colors: Record<ScoreCreativoLevel, string> = {
      'NOVATO': '#9CA3AF',      // Gray
      'BASICO': '#CD7F32',      // Bronze
      'COMPETENTE': '#C0C0C0',  // Silver
      'AVANZADO': '#FFD700',    // Gold
      'EXPERTO': '#FF6B35',     // Orange
      'MAESTRO': '#8B5CF6',     // Purple
      'LEYENDA': '#EC4899',     // Pink
      'SUPREMO': '#06B6D4'      // Cyan
    }
    
    return colors[this.level]
  }
  
  /**
   * Obtiene la descripción del nivel
   */
  get description(): string {
    const descriptions: Record<ScoreCreativoLevel, string> = {
      'NOVATO': 'Agencia nueva o con experiencia limitada. Requiere supervisión cercana.',
      'BASICO': 'Agencia con habilidades básicas. Adecuada para proyectos simples.',
      'COMPETENTE': 'Agencia confiable con buena calidad. Maneja proyectos estándar.',
      'AVANZADO': 'Agencia experimentada con alta calidad. Ideal para proyectos complejos.',
      'EXPERTO': 'Agencia de élite con excelencia comprobada. Maneja proyectos premium.',
      'MAESTRO': 'Agencia excepcional con innovación constante. Referente del mercado.',
      'LEYENDA': 'Agencia legendaria con impacto transformador. Casos de estudio.',
      'SUPREMO': 'Agencia suprema. Perfección absoluta y liderazgo mundial.'
    }
    
    return descriptions[this.level]
  }
  
  /**
   * Obtiene el rango de score para el nivel actual
   */
  get range(): { min: number; max: number } {
    const ranges: Record<ScoreCreativoLevel, { min: number; max: number }> = {
      'NOVATO': { min: 0, max: 199 },
      'BASICO': { min: 200, max: 399 },
      'COMPETENTE': { min: 400, max: 599 },
      'AVANZADO': { min: 600, max: 799 },
      'EXPERTO': { min: 800, max: 899 },
      'MAESTRO': { min: 900, max: 949 },
      'LEYENDA': { min: 950, max: 999 },
      'SUPREMO': { min: 1000, max: 1000 }
    }
    
    return ranges[this.level]
  }
  
  /**
   * Calcula el progreso dentro del nivel actual (0-100%)
   */
  get progressInLevel(): number {
    const range = this.range
    if (range.min === range.max) return 100 // SUPREMO
    
    const progress = ((this._value - range.min) / (range.max - range.min)) * 100
    return Math.min(100, Math.max(0, progress))
  }
  
  /**
   * Puntos necesarios para el siguiente nivel
   */
  get pointsToNextLevel(): number {
    if (this.level === 'SUPREMO') return 0
    
    const nextLevelMin = this.getNextLevelMinScore()
    return Math.max(0, nextLevelMin - this._value)
  }
  
  /**
   * Obtiene el multiplicador de confianza basado en el score
   */
  get confidenceMultiplier(): number {
    const multipliers: Record<ScoreCreativoLevel, number> = {
      'NOVATO': 0.5,
      'BASICO': 0.7,
      'COMPETENTE': 0.85,
      'AVANZADO': 1.0,
      'EXPERTO': 1.15,
      'MAESTRO': 1.3,
      'LEYENDA': 1.5,
      'SUPREMO': 2.0
    }
    
    return multipliers[this.level]
  }
  
  /**
   * Verifica si puede manejar proyectos de alta complejidad
   */
  canHandleComplexProjects(): boolean {
    return this._value >= 600 // AVANZADO o superior
  }
  
  /**
   * Verifica si puede manejar proyectos premium
   */
  canHandlePremiumProjects(): boolean {
    return this._value >= 800 // EXPERTO o superior
  }
  
  /**
   * Verifica si es elegible para proyectos tier 0
   */
  isTier0Eligible(): boolean {
    return this._value >= 900 // MAESTRO o superior
  }
  
  /**
   * Calcula la diferencia con otro score
   */
  differenceWith(other: ScoreCreativo): number {
    return Math.abs(this._value - other._value)
  }
  
  /**
   * Verifica si es mejor que otro score
   */
  isBetterThan(other: ScoreCreativo): boolean {
    return this._value > other._value
  }
  
  /**
   * Verifica si está en el mismo nivel que otro score
   */
  isSameLevelAs(other: ScoreCreativo): boolean {
    return this.level === other.level
  }
  
  /**
   * Suma puntos al score actual
   */
  add(points: number): ScoreCreativo {
    return new ScoreCreativo(this._value + points)
  }
  
  /**
   * Resta puntos al score actual
   */
  subtract(points: number): ScoreCreativo {
    return new ScoreCreativo(this._value - points)
  }
  
  /**
   * Aplica un multiplicador al score
   */
  multiply(factor: number): ScoreCreativo {
    return new ScoreCreativo(this._value * factor)
  }
  
  /**
   * Obtiene el score mínimo para el siguiente nivel
   */
  private getNextLevelMinScore(): number {
    const currentLevel = this.level
    const levels: ScoreCreativoLevel[] = [
      'NOVATO', 'BASICO', 'COMPETENTE', 'AVANZADO', 
      'EXPERTO', 'MAESTRO', 'LEYENDA', 'SUPREMO'
    ]
    
    const currentIndex = levels.indexOf(currentLevel)
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
      return 1000 // Ya está en el máximo
    }
    
    const nextLevel = levels[currentIndex + 1]
    const ranges: Record<ScoreCreativoLevel, number> = {
      'NOVATO': 0,
      'BASICO': 200,
      'COMPETENTE': 400,
      'AVANZADO': 600,
      'EXPERTO': 800,
      'MAESTRO': 900,
      'LEYENDA': 950,
      'SUPREMO': 1000
    }
    
    return ranges[nextLevel]
  }
  
  /**
   * Normaliza el score al rango válido
   */
  private normalizeScore(score: number): number {
    return Math.min(1000, Math.max(0, Math.round(score)))
  }
  
  /**
   * Valida el score
   */
  private validate(): void {
    if (isNaN(this._value)) {
      throw new Error('El score debe ser un número válido')
    }
    
    if (this._value < 0 || this._value > 1000) {
      throw new Error('El score debe estar entre 0 y 1000')
    }
  }
  
  /**
   * Compara con otro score
   */
  equals(other: ScoreCreativo): boolean {
    return this._value === other._value
  }
  
  /**
   * Representación como string
   */
  toString(): string {
    return `${this._value} (${this.displayName})`
  }
  
  /**
   * Serialización para JSON
   */
  toJSON(): number {
    return this._value
  }
  
  /**
   * Crea un score desde un valor numérico
   */
  static fromNumber(value: number): ScoreCreativo {
    return new ScoreCreativo(value)
  }
  
  /**
   * Crea un score desde un nivel específico (valor mínimo del nivel)
   */
  static fromLevel(level: ScoreCreativoLevel): ScoreCreativo {
    const minScores: Record<ScoreCreativoLevel, number> = {
      'NOVATO': 0,
      'BASICO': 200,
      'COMPETENTE': 400,
      'AVANZADO': 600,
      'EXPERTO': 800,
      'MAESTRO': 900,
      'LEYENDA': 950,
      'SUPREMO': 1000
    }
    
    return new ScoreCreativo(minScores[level])
  }
  
  /**
   * Calcula un score basado en métricas de performance
   */
  static calculateFromMetrics(
    calidad: number,        // 0-10
    puntualidad: number,    // 0-100%
    satisfaccion: number,   // 0-10
    innovacion: number,     // 0-10
    experiencia: number     // años
  ): ScoreCreativo {
    // Normalizar métricas a escala 0-100
    const calidadNorm = (calidad / 10) * 100
    const puntualidadNorm = puntualidad
    const satisfaccionNorm = (satisfaccion / 10) * 100
    const innovacionNorm = (innovacion / 10) * 100
    const experienciaNorm = Math.min(100, (experiencia / 20) * 100) // Max 20 años
    
    // Pesos para cada métrica
    const score = (
      calidadNorm * 0.3 +        // 30% calidad
      puntualidadNorm * 0.25 +   // 25% puntualidad
      satisfaccionNorm * 0.2 +   // 20% satisfacción
      innovacionNorm * 0.15 +    // 15% innovación
      experienciaNorm * 0.1      // 10% experiencia
    ) * 10 // Escalar a 0-1000
    
    return new ScoreCreativo(score)
  }
  
  /**
   * Score mínimo (novato)
   */
  static get MIN(): ScoreCreativo {
    return new ScoreCreativo(0)
  }
  
  /**
   * Score máximo (supremo)
   */
  static get MAX(): ScoreCreativo {
    return new ScoreCreativo(1000)
  }
}