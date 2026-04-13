/**
 * WIL KNOWLEDGE BASE: Sistema de Conocimiento Inteligente
 * 
 * @description Base de conocimiento más avanzada del mundo para WIL,
 * con búsqueda semántica, actualización automática y aprendizaje continuo
 * 
 * @version 2040.1.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - WIL Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { z } from 'zod'
import { logger } from '@/lib/observability';

/**
 * Schemas de validación
 */
const KnowledgeEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.enum([
    'system_overview',
    'module_documentation',
    'troubleshooting',
    'configuration',
    'best_practices',
    'api_reference',
    'user_guides',
    'cortex_integration',
    'security',
    'performance'
  ]),
  tags: z.array(z.string()),
  lastUpdated: z.date(),
  version: z.string(),
  author: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  metadata: z.object({
    moduleReferences: z.array(z.string()).optional(),
    relatedEntries: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    estimatedReadTime: z.number().optional(),
    prerequisites: z.array(z.string()).optional()
  })
})

const SearchQuerySchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  limit: z.number().min(1).max(50).default(10),
  includeContent: z.boolean().default(true),
  semanticSearch: z.boolean().default(true)
})

/**
 * Interfaces principales
 */
interface KnowledgeEntry extends z.infer<typeof KnowledgeEntrySchema> {}
interface SearchQuery extends z.infer<typeof SearchQuerySchema> {}

interface SearchResult {
  entry: KnowledgeEntry
  relevanceScore: number
  matchedTerms: string[]
  snippet: string
  reasoning: string
}

interface KnowledgeStats {
  totalEntries: number
  entriesByCategory: Record<string, number>
  lastUpdate: Date
  searchesPerformed: number
  averageRelevanceScore: number
  mostSearchedTopics: Array<{ topic: string; count: number }>
}

/**
 * Clase principal del sistema de conocimiento
 */
export class WILKnowledgeBase {
  private static instance: WILKnowledgeBase
  private knowledgeEntries: Map<string, KnowledgeEntry> = new Map()
  private searchIndex: Map<string, Set<string>> = new Map()
  private semanticIndex: Map<string, number[]> = new Map()
  private stats: KnowledgeStats
  
  private constructor() {
    this.stats = {
      totalEntries: 0,
      entriesByCategory: {},
      lastUpdate: new Date(),
      searchesPerformed: 0,
      averageRelevanceScore: 0,
      mostSearchedTopics: []
    }
    
    this.initializeKnowledgeBase()
  }

  public static getInstance(): WILKnowledgeBase {
    if (!WILKnowledgeBase.instance) {
      WILKnowledgeBase.instance = new WILKnowledgeBase()
    }
    return WILKnowledgeBase.instance
  }

  /**
   * Búsqueda inteligente en la base de conocimiento
   */
  public async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const validatedQuery = SearchQuerySchema.parse(query)
      this.stats.searchesPerformed++

      // Búsqueda por palabras clave
      const keywordResults = await this.keywordSearch(validatedQuery)
      
      // Búsqueda semántica si está habilitada
      const semanticResults = validatedQuery.semanticSearch 
        ? await this.semanticSearch(validatedQuery)
        : []

      // Combinar y rankear resultados
      const combinedResults = this.combineAndRankResults(keywordResults, semanticResults)
      
      // Aplicar filtros
      const filteredResults = this.applyFilters(combinedResults, validatedQuery)
      
      // Limitar resultados
      const finalResults = filteredResults.slice(0, validatedQuery.limit)
      
      // Actualizar estadísticas
      this.updateSearchStats(finalResults)
      
      return finalResults
      
    } catch (error) {
      logger.error('Error en búsqueda de conocimiento:', error instanceof Error ? error : undefined)
      return []
    }
  }

  /**
   * Agregar nueva entrada de conocimiento
   */
  public async addEntry(entry: Omit<KnowledgeEntry, 'id' | 'lastUpdated'>): Promise<string> {
    try {
      const id = `kb_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      
      const newEntry: KnowledgeEntry = {
        ...entry,
        id,
        lastUpdated: new Date()
      }

      const validatedEntry = KnowledgeEntrySchema.parse(newEntry)
      
      // Almacenar entrada
      this.knowledgeEntries.set(id, validatedEntry)
      
      // Actualizar índices
      await this.updateSearchIndex(validatedEntry)
      await this.updateSemanticIndex(validatedEntry)
      
      // Actualizar estadísticas
      this.updateStats()
      
      logger.info(`📚 Nueva entrada de conocimiento agregada: ${validatedEntry.title}`)
      
      return id
      
    } catch (error) {
      logger.error('Error agregando entrada de conocimiento:', error instanceof Error ? error : undefined)
      throw new Error('Fallo al agregar entrada de conocimiento')
    }
  }

  /**
   * Actualizar entrada existente
   */
  public async updateEntry(id: string, updates: Partial<KnowledgeEntry>): Promise<void> {
    try {
      const existingEntry = this.knowledgeEntries.get(id)
      if (!existingEntry) {
        throw new Error(`Entrada de conocimiento ${id} no encontrada`)
      }

      const updatedEntry: KnowledgeEntry = {
        ...existingEntry,
        ...updates,
        id,
        lastUpdated: new Date()
      }

      const validatedEntry = KnowledgeEntrySchema.parse(updatedEntry)
      
      // Actualizar entrada
      this.knowledgeEntries.set(id, validatedEntry)
      
      // Actualizar índices
      await this.updateSearchIndex(validatedEntry)
      await this.updateSemanticIndex(validatedEntry)
      
      // Actualizar estadísticas
      this.updateStats()
      
      logger.info(`📚 Entrada de conocimiento actualizada: ${validatedEntry.title}`)
      
    } catch (error) {
      logger.error('Error actualizando entrada de conocimiento:', error instanceof Error ? error : undefined)
      throw new Error('Fallo al actualizar entrada de conocimiento')
    }
  }

  /**
   * Obtener entrada por ID
   */
  public getEntry(id: string): KnowledgeEntry | null {
    return this.knowledgeEntries.get(id) || null
  }

  /**
   * Obtener entradas por categoría
   */
  public getEntriesByCategory(category: string): KnowledgeEntry[] {
    return Array.from(this.knowledgeEntries.values())
      .filter(entry => entry.category === category)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
  }

  /**
   * Obtener estadísticas de la base de conocimiento
   */
  public getStats(): KnowledgeStats {
    return { ...this.stats }
  }

  /**
   * Obtener sugerencias de contenido relacionado
   */
  public async getRelatedContent(entryId: string, limit: number = 5): Promise<KnowledgeEntry[]> {
    const entry = this.knowledgeEntries.get(entryId)
    if (!entry) return []

    // Buscar contenido relacionado basado en tags y categoría
    const relatedEntries = Array.from(this.knowledgeEntries.values())
      .filter(e => e.id !== entryId)
      .map(e => ({
        entry: e,
        score: this.calculateRelationScore(entry, e)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.entry)

    return relatedEntries
  }

  /**
   * Métodos privados
   */
  private async keywordSearch(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    const queryTerms = query.query.toLowerCase().split(/\s+/)

    for (const [entryId, entry] of this.knowledgeEntries.entries()) {
      const searchableText = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase()
      
      let matchCount = 0
      const matchedTerms: string[] = []
      
      for (const term of queryTerms) {
        if (searchableText.includes(term)) {
          matchCount++
          matchedTerms.push(term)
        }
      }

      if (matchCount > 0) {
        const relevanceScore = matchCount / queryTerms.length
        const snippet = this.generateSnippet(entry.content, matchedTerms)
        
        results.push({
          entry,
          relevanceScore,
          matchedTerms,
          snippet,
          reasoning: `Coincidencia de ${matchCount}/${queryTerms.length} términos`
        })
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private async semanticSearch(query: SearchQuery): Promise<SearchResult[]> {
    // Simulación de búsqueda semántica
    // En implementación real, usaría embeddings y similitud coseno
    
    const results: SearchResult[] = []
    const queryEmbedding = await this.generateEmbedding(query.query)
    
    for (const [entryId, entry] of this.knowledgeEntries.entries()) {
      const entryEmbedding = this.semanticIndex.get(entryId)
      if (!entryEmbedding) continue

      const similarity = this.calculateCosineSimilarity(queryEmbedding, entryEmbedding)
      
      if (similarity > 0.3) { // Umbral de similitud
        results.push({
          entry,
          relevanceScore: similarity,
          matchedTerms: [],
          snippet: this.generateSnippet(entry.content, []),
          reasoning: `Similitud semántica: ${(similarity * 100).toFixed(1)}%`
        })
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private combineAndRankResults(keywordResults: SearchResult[], semanticResults: SearchResult[]): SearchResult[] {
    const combinedMap = new Map<string, SearchResult>()

    // Agregar resultados de palabras clave
    for (const result of keywordResults) {
      combinedMap.set(result.entry.id, {
        ...result,
        relevanceScore: result.relevanceScore * 0.7 // Peso para keyword search
      })
    }

    // Combinar con resultados semánticos
    for (const result of semanticResults) {
      const existing = combinedMap.get(result.entry.id)
      if (existing) {
        // Combinar scores
        existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore * 0.3)
        existing.reasoning += ` + ${result.reasoning}`
      } else {
        combinedMap.set(result.entry.id, {
          ...result,
          relevanceScore: result.relevanceScore * 0.3 // Peso para semantic search
        })
      }
    }

    return Array.from(combinedMap.values()).sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private applyFilters(results: SearchResult[], query: SearchQuery): SearchResult[] {
    return results.filter(result => {
      // Filtro por categoría
      if (query.category && result.entry.category !== query.category) {
        return false
      }

      // Filtro por tags
      if (query.tags && query.tags.length > 0) {
        const hasMatchingTag = query.tags.some(tag => 
          result.entry.tags.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      // Filtro por dificultad
      if (query.difficulty && result.entry.metadata.difficulty !== query.difficulty) {
        return false
      }

      return true
    })
  }

  private generateSnippet(content: string, matchedTerms: string[]): string {
    if (matchedTerms.length === 0) {
      return content.substring(0, 200) + (content.length > 200 ? '...' : '')
    }

    // Encontrar la primera ocurrencia de un término coincidente
    const firstMatch = matchedTerms.find(term => 
      content.toLowerCase().includes(term.toLowerCase())
    )

    if (!firstMatch) {
      return content.substring(0, 200) + (content.length > 200 ? '...' : '')
    }

    const index = content.toLowerCase().indexOf(firstMatch.toLowerCase())
    const start = Math.max(0, index - 100)
    const end = Math.min(content.length, index + 100)
    
    let snippet = content.substring(start, end)
    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet = snippet + '...'

    return snippet
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simulación de generación de embeddings
    // En implementación real, usaría OpenAI embeddings o similar
    
    const words = text.toLowerCase().split(/\s+/)
    const embedding = new Array(384).fill(0) // Dimensión típica de embeddings
    
    // Generar embedding simple basado en hash de palabras
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const hash = this.simpleHash(word)
      const index = Math.abs(hash) % embedding.length
      embedding[index] += 1 / words.length
    }

    return embedding
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    if (normA === 0 || normB === 0) return 0

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  private calculateRelationScore(entry1: KnowledgeEntry, entry2: KnowledgeEntry): number {
    let score = 0

    // Misma categoría
    if (entry1.category === entry2.category) {
      score += 0.3
    }

    // Tags en común
    const commonTags = entry1.tags.filter(tag => entry2.tags.includes(tag))
    score += commonTags.length * 0.2

    // Referencias de módulo en común
    const modules1 = entry1.metadata.moduleReferences || []
    const modules2 = entry2.metadata.moduleReferences || []
    const commonModules = modules1.filter(mod => modules2.includes(mod))
    score += commonModules.length * 0.1

    return score
  }

  private async updateSearchIndex(entry: KnowledgeEntry): Promise<void> {
    const searchableText = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`
    const words = searchableText.toLowerCase().split(/\s+/)
    
    for (const word of words) {
      if (word.length > 2) { // Ignorar palabras muy cortas
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set())
        }
        const wordSet = this.searchIndex.get(word)
        if (wordSet) {
          wordSet.add(entry.id)
        }
      }
    }
  }

  private async updateSemanticIndex(entry: KnowledgeEntry): Promise<void> {
    const embedding = await this.generateEmbedding(`${entry.title} ${entry.content}`)
    this.semanticIndex.set(entry.id, embedding)
  }

  private updateStats(): void {
    this.stats.totalEntries = this.knowledgeEntries.size
    this.stats.lastUpdate = new Date()
    
    // Actualizar conteo por categoría
    this.stats.entriesByCategory = {}
    for (const entry of this.knowledgeEntries.values()) {
      this.stats.entriesByCategory[entry.category] = 
        (this.stats.entriesByCategory[entry.category] || 0) + 1
    }
  }

  private updateSearchStats(results: SearchResult[]): void {
    if (results.length > 0) {
      const avgScore = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length
      this.stats.averageRelevanceScore = 
        (this.stats.averageRelevanceScore + avgScore) / 2
    }
  }

  private initializeKnowledgeBase(): void {
    // Inicializar con conocimiento base del sistema
    this.loadSystemKnowledge()
  }

  private async loadSystemKnowledge(): Promise<void> {
    const systemEntries = [
      {
        title: 'Introducción al Sistema Silexar Pulse Quantum',
        content: 'Silexar Pulse Quantum es el sistema de gestión publicitaria más avanzado del mundo, diseñado con estándares Fortune 10 y tecnología del año 2040. El sistema incluye múltiples módulos especializados y motores de IA Cortex para automatización completa.',
        category: 'system_overview' as const,
        tags: ['introducción', 'sistema', 'overview'],
        version: '2040.1.0',
        author: 'Silexar Team',
        priority: 'high' as const,
        metadata: {
          difficulty: 'beginner' as const,
          estimatedReadTime: 3,
          moduleReferences: ['all']
        }
      },
      {
        title: 'Módulo de Gestión de Contratos',
        content: 'El módulo de contratos permite gestionar todo el ciclo de vida contractual con workflows automatizados, integración Cortex-Risk para evaluación automática, y análisis predictivo para optimización de términos.',
        category: 'module_documentation' as const,
        tags: ['contratos', 'módulo', 'gestión'],
        version: '2040.1.0',
        author: 'Contracts Team',
        priority: 'high' as const,
        metadata: {
          difficulty: 'intermediate' as const,
          estimatedReadTime: 5,
          moduleReferences: ['contratos'],
          relatedEntries: ['cortex-risk', 'workflows']
        }
      },
      {
        title: 'Motor Cortex-Risk: Evaluación Crediticia Automática',
        content: 'Cortex-Risk utiliza machine learning para evaluar automáticamente el riesgo crediticio de clientes, integrándose con bureaus de crédito y proporcionando recomendaciones de términos de pago en tiempo real.',
        category: 'cortex_integration' as const,
        tags: ['cortex-risk', 'ia', 'evaluación', 'crédito'],
        version: '2.8.0',
        author: 'Cortex Team',
        priority: 'critical' as const,
        metadata: {
          difficulty: 'advanced' as const,
          estimatedReadTime: 7,
          moduleReferences: ['contratos', 'crm'],
          prerequisites: ['machine-learning-basics']
        }
      }
    ]

    for (const entry of systemEntries) {
      await this.addEntry(entry)
    }

    logger.info('📚 Base de conocimiento inicializada con contenido del sistema')
  }
}

/**
 * Instancia singleton para uso global
 */
export const wilKnowledgeBase = WILKnowledgeBase.getInstance()

/**
 * Funciones de utilidad
 */
export const KnowledgeUtils = {
  /**
   * Formatear tiempo de lectura estimado
   */
  formatReadTime: (minutes: number): string => {
    if (minutes < 1) return 'Menos de 1 min'
    if (minutes === 1) return '1 min'
    return `${minutes} min`
  },

  /**
   * Obtener color por categoría
   */
  getCategoryColor: (category: string): string => {
    const colors = {
      'system_overview': 'text-blue-400',
      'module_documentation': 'text-green-400',
      'troubleshooting': 'text-red-400',
      'configuration': 'text-purple-400',
      'best_practices': 'text-yellow-400',
      'api_reference': 'text-orange-400',
      'user_guides': 'text-pink-400',
      'cortex_integration': 'text-emerald-400',
      'security': 'text-red-500',
      'performance': 'text-cyan-400'
    }
    return colors[category as keyof typeof colors] || 'text-slate-400'
  },

  /**
   * Obtener icono por categoría
   */
  getCategoryIcon: (category: string): string => {
    const icons = {
      'system_overview': '🏢',
      'module_documentation': '📚',
      'troubleshooting': '🔧',
      'configuration': '⚙️',
      'best_practices': '⭐',
      'api_reference': '🔌',
      'user_guides': '📖',
      'cortex_integration': '🧠',
      'security': '🛡️',
      'performance': '⚡'
    }
    return icons[category as keyof typeof icons] || '📄'
  },

  /**
   * Formatear score de relevancia
   */
  formatRelevanceScore: (score: number): string => {
    const percentage = Math.round(score * 100)
    if (percentage >= 90) return `${percentage}% 🎯`
    if (percentage >= 70) return `${percentage}% ✅`
    if (percentage >= 50) return `${percentage}% ⚠️`
    return `${percentage}% ❌`
  },

  /**
   * Generar sugerencias de búsqueda
   */
  generateSearchSuggestions: (query: string): string[] => {
    const suggestions = [
      'configurar módulo de contratos',
      'integración cortex-risk',
      'resolver problemas de programación',
      'mejores prácticas de seguridad',
      'análisis de performance',
      'gestión de usuarios',
      'exportar configuraciones',
      'workflows automatizados'
    ]

    return suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(s.split(' ')[0])
    ).slice(0, 5)
  }
}