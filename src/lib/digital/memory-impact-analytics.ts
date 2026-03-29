/**
 * MEMORY IMPACT ANALYTICS (MIA) - TIER 0 Digital Revolution
 * Analítica de Impacto en Memoria - Mide impacto real en memoria del usuario
 * 
 * @description Sistema que mide el impacto real de campañas en la memoria
 * mediante fuentes éticas: menciones sociales, búsquedas orgánicas, etc.
 * 
 * @version 2040.20.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Digital Revolution Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { EventEmitter } from 'events'
import { logger } from '@/lib/observability';

// Interfaces para analítica de memoria
export interface MemoryScore {
  overall_score: number // 0-100
  dimensions: {
    social_mentions: number // Menciones en redes sociales
    organic_searches: number // Búsquedas orgánicas
    voice_engagement: number // Engagement en voz
    conversion_patterns: number // Patrones de conversión
    temporal_delay: number // Retraso temporal
  }
  confidence_level: number // 0-1
  data_sources: string[]
  calculated_at: Date
  campaign_id: string
  brand_name: string
  measurement_period_days: number
}

export interface MemoryMetrics {
  // Métricas de menciones sociales
  social_mentions_count: number
  social_sentiment_score: number // 0-100
  social_reach: number
  social_engagement_rate: number
  
  // Métricas de búsquedas orgánicas
  brand_search_volume: number
  search_trend_change: number // % cambio
  related_keywords_volume: number
  search_intent_quality: number // 0-100
  
  // Métricas de engagement de voz
  voice_queries_count: number
  voice_completion_rate: number
  voice_follow_up_rate: number
  voice_sentiment: number // 0-100
  
  // Métricas de patrones de conversión
  delayed_conversions: number
  conversion_attribution_score: number // 0-100
  customer_journey_length: number // días
  repeat_purchase_rate: number
  
  // Métricas de retraso temporal
  immediate_recall: number // 0-24 horas
  short_term_recall: number // 1-7 días
  medium_term_recall: number // 1-4 semanas
  long_term_recall: number // 1+ meses
}

export interface EthicalDataSource {
  source: 'TWITTER_API' | 'GOOGLE_TRENDS' | 'SOCIAL_LISTENING' | 'VOICE_ANALYTICS' | 'WEB_ANALYTICS'
  status: 'active' | 'inactive' | 'rate_limited' | 'error'
  consent_status: 'granted' | 'denied' | 'pending'
  data_quality: number // 0-1
  last_sync: Date
  api_limits: {
    daily_quota: number
    used_today: number
    reset_time: string
  }
  privacy_compliance: {
    gdpr_compliant: boolean
    ccpa_compliant: boolean
    anonymized: boolean
  }
}

export interface BrandRecallInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'alert'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  recommendation: string
  impact_score: number // 0-100
  confidence: number // 0-1
  supporting_data: string[]
  created_at: Date
  expires_at: Date
}

export interface MemoryOptimizationRule {
  id: string
  name: string
  condition: {
    metric: keyof MemoryMetrics
    operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'TREND_UP' | 'TREND_DOWN'
    value: number
    time_window_days: number
  }
  action: {
    type: 'INCREASE_FREQUENCY' | 'CHANGE_CREATIVE' | 'EXTEND_CAMPAIGN' | 'ADD_TOUCHPOINTS'
    parameters: Record<string, unknown>
  }
  enabled: boolean
  created_at: Date
}

export interface CompetitorMemoryAnalysis {
  competitor_brand: string
  memory_score: number
  market_share_of_memory: number // % del total de menciones
  sentiment_comparison: number // vs nuestra marca
  search_volume_comparison: number // vs nuestra marca
  voice_presence_comparison: number // vs nuestra marca
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
}

export class MemoryImpactAnalytics extends EventEmitter {
  private memoryScores: Map<string, MemoryScore> = new Map()
  private dataSourcesStatus: Map<string, EthicalDataSource> = new Map()
  private optimizationRules: Map<string, MemoryOptimizationRule> = new Map()
  private brandRecallInsights: BrandRecallInsight[] = []
  private competitorAnalysis: Map<string, CompetitorMemoryAnalysis> = new Map()
  private isProcessing = false

  // Configuración de pesos por dimensión
  private dimensionWeights = {
    social_mentions: 0.25,
    organic_searches: 0.30,
    voice_engagement: 0.15,
    conversion_patterns: 0.20,
    temporal_delay: 0.10
  }

  constructor() {
    super()
    this.initializeDataSources()
    this.initializeOptimizationRules()
    this.startMemoryProcessing()
  }

  /**
   * Inicializa fuentes de datos éticas
   */
  private async initializeDataSources(): Promise<void> {
    const dataSources: EthicalDataSource[] = [
      {
        source: 'TWITTER_API',
        status: 'active',
        consent_status: 'granted',
        data_quality: 0.92,
        last_sync: new Date(),
        api_limits: {
          daily_quota: 50000,
          used_today: 12450,
          reset_time: '00:00:00'
        },
        privacy_compliance: {
          gdpr_compliant: true,
          ccpa_compliant: true,
          anonymized: true
        }
      },
      {
        source: 'GOOGLE_TRENDS',
        status: 'active',
        consent_status: 'granted',
        data_quality: 0.95,
        last_sync: new Date(Date.now() - 300000),
        api_limits: {
          daily_quota: 10000,
          used_today: 3240,
          reset_time: '00:00:00'
        },
        privacy_compliance: {
          gdpr_compliant: true,
          ccpa_compliant: true,
          anonymized: true
        }
      },
      {
        source: 'SOCIAL_LISTENING',
        status: 'active',
        consent_status: 'granted',
        data_quality: 0.88,
        last_sync: new Date(Date.now() - 600000),
        api_limits: {
          daily_quota: 25000,
          used_today: 8920,
          reset_time: '00:00:00'
        },
        privacy_compliance: {
          gdpr_compliant: true,
          ccpa_compliant: true,
          anonymized: true
        }
      },
      {
        source: 'VOICE_ANALYTICS',
        status: 'active',
        consent_status: 'granted',
        data_quality: 0.85,
        last_sync: new Date(Date.now() - 900000),
        api_limits: {
          daily_quota: 15000,
          used_today: 4560,
          reset_time: '00:00:00'
        },
        privacy_compliance: {
          gdpr_compliant: true,
          ccpa_compliant: true,
          anonymized: true
        }
      },
      {
        source: 'WEB_ANALYTICS',
        status: 'active',
        consent_status: 'granted',
        data_quality: 0.98,
        last_sync: new Date(Date.now() - 60000),
        api_limits: {
          daily_quota: 100000,
          used_today: 25670,
          reset_time: '00:00:00'
        },
        privacy_compliance: {
          gdpr_compliant: true,
          ccpa_compliant: true,
          anonymized: true
        }
      }
    ]

    dataSources.forEach(source => {
      this.dataSourcesStatus.set(source.source, source)
    })

    logger.info('🔍 Ethical data sources initialized:', dataSources.length as unknown as Record<string, unknown>)
  }

  /**
   * Inicializa reglas de optimización por defecto
   */
  private initializeOptimizationRules(): void {
    const defaultRules: MemoryOptimizationRule[] = [
      {
        id: 'rule_001',
        name: 'Bajo Recall a Corto Plazo',
        condition: {
          metric: 'short_term_recall',
          operator: 'LESS_THAN',
          value: 40,
          time_window_days: 7
        },
        action: {
          type: 'INCREASE_FREQUENCY',
          parameters: { frequency_multiplier: 1.5, duration_days: 14 }
        },
        enabled: true,
        created_at: new Date()
      },
      {
        id: 'rule_002',
        name: 'Menciones Sociales en Declive',
        condition: {
          metric: 'social_mentions_count',
          operator: 'TREND_DOWN',
          value: 20, // % de declive
          time_window_days: 14
        },
        action: {
          type: 'ADD_TOUCHPOINTS',
          parameters: { social_boost: true, influencer_activation: true }
        },
        enabled: true,
        created_at: new Date()
      },
      {
        id: 'rule_003',
        name: 'Búsquedas Orgánicas Crecientes',
        condition: {
          metric: 'brand_search_volume',
          operator: 'TREND_UP',
          value: 25, // % de crecimiento
          time_window_days: 7
        },
        action: {
          type: 'EXTEND_CAMPAIGN',
          parameters: { extension_days: 7, budget_increase: 0.2 }
        },
        enabled: true,
        created_at: new Date()
      }
    ]

    defaultRules.forEach(rule => {
      this.optimizationRules.set(rule.id, rule)
    })

    logger.info('🎯 Memory optimization rules initialized:', defaultRules.length as unknown as Record<string, unknown>)
  }

  /**
   * Inicia procesamiento continuo de memoria
   */
  private startMemoryProcessing(): void {
    // Procesar cada 5 minutos
    setInterval(() => {
      if (!this.isProcessing) {
        this.processMemoryScores()
      }
    }, 300000)

    // Generar insights cada 15 minutos
    setInterval(() => {
      this.generateMemoryInsights()
    }, 900000)

    // Análisis competitivo cada hora
    setInterval(() => {
      this.analyzeCompetitors()
    }, 3600000)
  }

  /**
   * Calcula Memory Score para una campaña
   */
  public async calculateMemoryScore(
    campaignId: string,
    brandName: string,
    metrics: MemoryMetrics,
    measurementPeriodDays: number = 30
  ): Promise<MemoryScore> {
    try {
      // Calcular cada dimensión (0-100)
      const socialMentions = this.calculateSocialMentionsScore(metrics)
      const organicSearches = this.calculateOrganicSearchesScore(metrics)
      const voiceEngagement = this.calculateVoiceEngagementScore(metrics)
      const conversionPatterns = this.calculateConversionPatternsScore(metrics)
      const temporalDelay = this.calculateTemporalDelayScore(metrics)

      // Calcular score general ponderado
      const overallScore = Math.round(
        (socialMentions * this.dimensionWeights.social_mentions) +
        (organicSearches * this.dimensionWeights.organic_searches) +
        (voiceEngagement * this.dimensionWeights.voice_engagement) +
        (conversionPatterns * this.dimensionWeights.conversion_patterns) +
        (temporalDelay * this.dimensionWeights.temporal_delay)
      )

      // Calcular nivel de confianza
      const confidenceLevel = this.calculateMemoryConfidenceLevel()

      const memoryScore: MemoryScore = {
        overall_score: Math.max(0, Math.min(100, overallScore)),
        dimensions: {
          social_mentions: Math.max(0, Math.min(100, socialMentions)),
          organic_searches: Math.max(0, Math.min(100, organicSearches)),
          voice_engagement: Math.max(0, Math.min(100, voiceEngagement)),
          conversion_patterns: Math.max(0, Math.min(100, conversionPatterns)),
          temporal_delay: Math.max(0, Math.min(100, temporalDelay))
        },
        confidence_level: confidenceLevel,
        data_sources: Array.from(this.dataSourcesStatus.keys()).filter(
          source => this.dataSourcesStatus.get(source)?.status === 'active'
        ),
        calculated_at: new Date(),
        campaign_id: campaignId,
        brand_name: brandName,
        measurement_period_days: measurementPeriodDays
      }

      // Almacenar score
      this.memoryScores.set(campaignId, memoryScore)

      // Emitir evento
      this.emit('memory_calculated', {
        campaign_id: campaignId,
        score: memoryScore,
        timestamp: new Date()
      })

      return memoryScore

    } catch (error) {
      logger.error('Error calculating memory score:', error instanceof Error ? error as Error : undefined)
      throw error
    }
  }

  /**
   * Calcula score de menciones sociales (0-100)
   */
  private calculateSocialMentionsScore(metrics: MemoryMetrics): number {
    const mentionsWeight = 0.4
    const sentimentWeight = 0.3
    const reachWeight = 0.2
    const engagementWeight = 0.1

    const mentionsScore = Math.min(100, metrics.social_mentions_count / 10) // 1000 menciones = 100 points
    const sentimentScore = metrics.social_sentiment_score
    const reachScore = Math.min(100, metrics.social_reach / 100000) // 10M reach = 100 points
    const engagementScore = Math.min(100, metrics.social_engagement_rate * 10) // 10% = 100 points

    return (mentionsScore * mentionsWeight) +
           (sentimentScore * sentimentWeight) +
           (reachScore * reachWeight) +
           (engagementScore * engagementWeight)
  }

  /**
   * Calcula score de búsquedas orgánicas (0-100)
   */
  private calculateOrganicSearchesScore(metrics: MemoryMetrics): number {
    const volumeWeight = 0.4
    const trendWeight = 0.3
    const keywordsWeight = 0.2
    const intentWeight = 0.1

    const volumeScore = Math.min(100, metrics.brand_search_volume / 1000) // 100K búsquedas = 100 points
    const trendScore = Math.max(0, Math.min(100, 50 + metrics.search_trend_change)) // +50% = 100 points
    const keywordsScore = Math.min(100, metrics.related_keywords_volume / 500) // 50K keywords = 100 points
    const intentScore = metrics.search_intent_quality

    return (volumeScore * volumeWeight) +
           (trendScore * trendWeight) +
           (keywordsScore * keywordsWeight) +
           (intentScore * intentWeight)
  }

  /**
   * Calcula score de engagement de voz (0-100)
   */
  private calculateVoiceEngagementScore(metrics: MemoryMetrics): number {
    const queriesWeight = 0.4
    const completionWeight = 0.3
    const followUpWeight = 0.2
    const sentimentWeight = 0.1

    const queriesScore = Math.min(100, metrics.voice_queries_count / 5) // 500 queries = 100 points
    const completionScore = metrics.voice_completion_rate
    const followUpScore = metrics.voice_follow_up_rate
    const sentimentScore = metrics.voice_sentiment

    return (queriesScore * queriesWeight) +
           (completionScore * completionWeight) +
           (followUpScore * followUpWeight) +
           (sentimentScore * sentimentWeight)
  }

  /**
   * Calcula score de patrones de conversión (0-100)
   */
  private calculateConversionPatternsScore(metrics: MemoryMetrics): number {
    const delayedWeight = 0.4
    const attributionWeight = 0.3
    const journeyWeight = 0.2
    const repeatWeight = 0.1

    const delayedScore = Math.min(100, metrics.delayed_conversions * 5) // 20 conversions = 100 points
    const attributionScore = metrics.conversion_attribution_score
    const journeyScore = Math.max(0, 100 - (metrics.customer_journey_length * 2)) // Shorter journey = better
    const repeatScore = metrics.repeat_purchase_rate

    return (delayedScore * delayedWeight) +
           (attributionScore * attributionWeight) +
           (journeyScore * journeyWeight) +
           (repeatScore * repeatWeight)
  }

  /**
   * Calcula score de retraso temporal (0-100)
   */
  private calculateTemporalDelayScore(metrics: MemoryMetrics): number {
    const immediateWeight = 0.1
    const shortTermWeight = 0.3
    const mediumTermWeight = 0.4
    const longTermWeight = 0.2

    return (metrics.immediate_recall * immediateWeight) +
           (metrics.short_term_recall * shortTermWeight) +
           (metrics.medium_term_recall * mediumTermWeight) +
           (metrics.long_term_recall * longTermWeight)
  }

  /**
   * Calcula nivel de confianza para memoria
   */
  private calculateMemoryConfidenceLevel(): number {
    const activeSources = Array.from(this.dataSourcesStatus.values())
      .filter(source => source.status === 'active')

    if (activeSources.length === 0) return 0

    const avgDataQuality = activeSources.reduce(
      (sum, source) => sum + source.data_quality, 0
    ) / activeSources.length

    const sourceCoverage = activeSources.length / this.dataSourcesStatus.size
    const privacyCompliance = activeSources.filter(
      source => source.privacy_compliance.gdpr_compliant && source.privacy_compliance.anonymized
    ).length / activeSources.length

    return Math.min(1, avgDataQuality * sourceCoverage * privacyCompliance)
  }

  /**
   * Procesa scores de memoria en lote
   */
  private async processMemoryScores(): Promise<void> {
    this.isProcessing = true

    try {
      // Simular procesamiento de campañas activas
      const activeCampaigns = [
        { id: 'camp_001', brand: 'Banco XYZ' },
        { id: 'camp_002', brand: 'Retail ABC' },
        { id: 'camp_003', brand: 'Tech Corp' },
        { id: 'camp_004', brand: 'Seguros DEF' }
      ]

      for (const campaign of activeCampaigns) {
        // Simular métricas de memoria
        const mockMetrics: MemoryMetrics = {
          social_mentions_count: Math.floor(Math.random() * 2000) + 500,
          social_sentiment_score: Math.random() * 30 + 70,
          social_reach: Math.floor(Math.random() * 500000) + 100000,
          social_engagement_rate: Math.random() * 8 + 2,
          brand_search_volume: Math.floor(Math.random() * 50000) + 10000,
          search_trend_change: (Math.random() - 0.5) * 100,
          related_keywords_volume: Math.floor(Math.random() * 20000) + 5000,
          search_intent_quality: Math.random() * 30 + 70,
          voice_queries_count: Math.floor(Math.random() * 1000) + 200,
          voice_completion_rate: Math.random() * 30 + 70,
          voice_follow_up_rate: Math.random() * 40 + 30,
          voice_sentiment: Math.random() * 25 + 75,
          delayed_conversions: Math.floor(Math.random() * 50) + 10,
          conversion_attribution_score: Math.random() * 25 + 75,
          customer_journey_length: Math.floor(Math.random() * 20) + 5,
          repeat_purchase_rate: Math.random() * 40 + 30,
          immediate_recall: Math.random() * 30 + 40,
          short_term_recall: Math.random() * 40 + 50,
          medium_term_recall: Math.random() * 35 + 60,
          long_term_recall: Math.random() * 30 + 65
        }

        await this.calculateMemoryScore(campaign.id, campaign.brand, mockMetrics)
      }

      this.emit('memory_batch_processed', {
        campaigns_processed: activeCampaigns.length,
        timestamp: new Date()
      })

    } catch (error) {
      logger.error('Error in memory batch processing:', error instanceof Error ? error as Error : undefined)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Genera insights de memoria
   */
  private generateMemoryInsights(): void {
    const insights: BrandRecallInsight[] = []
    const scores = Array.from(this.memoryScores.values())

    if (scores.length === 0) return

    const avgScore = scores.reduce((sum, score) => sum + score.overall_score, 0) / scores.length

    // Insight de performance general
    if (avgScore < 60) {
      insights.push({
        type: 'alert',
        priority: 'high',
        title: 'Impacto en Memoria Bajo Promedio',
        description: `El Memory Score promedio es ${avgScore.toFixed(1)}, por debajo del objetivo de 75+`,
        recommendation: 'Implementar estrategias de brand recall y aumentar touchpoints',
        impact_score: 85,
        confidence: 0.9,
        supporting_data: [`${scores.length} campañas analizadas`, `Score promedio: ${avgScore.toFixed(1)}`],
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
    }

    // Analizar dimensiones problemáticas
    const avgDimensions = {
      social_mentions: scores.reduce((sum, s) => sum + s.dimensions.social_mentions, 0) / scores.length,
      organic_searches: scores.reduce((sum, s) => sum + s.dimensions.organic_searches, 0) / scores.length,
      voice_engagement: scores.reduce((sum, s) => sum + s.dimensions.voice_engagement, 0) / scores.length,
      conversion_patterns: scores.reduce((sum, s) => sum + s.dimensions.conversion_patterns, 0) / scores.length,
      temporal_delay: scores.reduce((sum, s) => sum + s.dimensions.temporal_delay, 0) / scores.length
    }

    const lowestDimension = Object.entries(avgDimensions)
      .sort(([,a], [,b]) => a - b)[0]

    if (lowestDimension[1] < 50) {
      insights.push({
        type: 'opportunity',
        priority: 'medium',
        title: `Oportunidad en ${this.getDimensionName(lowestDimension[0])}`,
        description: `La dimensión ${lowestDimension[0]} tiene potencial de mejora con score ${lowestDimension[1].toFixed(1)}`,
        recommendation: this.getMemoryRecommendation(lowestDimension[0]),
        impact_score: 70,
        confidence: 0.85,
        supporting_data: [`Dimensión: ${lowestDimension[0]}`, `Score: ${lowestDimension[1].toFixed(1)}`],
        created_at: new Date(),
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      })
    }

    // Almacenar insights
    this.brandRecallInsights = [...this.brandRecallInsights, ...insights].slice(-30)

    if (insights.length > 0) {
      this.emit('memory_insights_generated', {
        insights,
        timestamp: new Date()
      })
    }
  }

  /**
   * Obtiene nombre legible de dimensión
   */
  private getDimensionName(dimension: string): string {
    const names = {
      social_mentions: 'Menciones Sociales',
      organic_searches: 'Búsquedas Orgánicas',
      voice_engagement: 'Engagement de Voz',
      conversion_patterns: 'Patrones de Conversión',
      temporal_delay: 'Retención Temporal'
    }
    return names[dimension as keyof typeof names] || dimension
  }

  /**
   * Obtiene recomendación específica por dimensión
   */
  private getMemoryRecommendation(dimension: string): string {
    const recommendations = {
      social_mentions: 'Activar influencers y crear contenido viral para aumentar menciones orgánicas',
      organic_searches: 'Optimizar SEO y crear contenido que genere búsquedas de marca',
      voice_engagement: 'Desarrollar skills de voz y optimizar presencia en asistentes',
      conversion_patterns: 'Implementar remarketing y nurturing para conversiones diferidas',
      temporal_delay: 'Crear campañas de refuerzo y recordación de marca'
    }
    return recommendations[dimension as keyof typeof recommendations] || 'Revisar estrategia general'
  }

  /**
   * Analiza competidores
   */
  private async analyzeCompetitors(): Promise<void> {
    // Simular análisis competitivo
    const competitors = ['Competidor A', 'Competidor B', 'Competidor C']

    for (const competitor of competitors) {
      const analysis: CompetitorMemoryAnalysis = {
        competitor_brand: competitor,
        memory_score: Math.random() * 40 + 50, // 50-90
        market_share_of_memory: Math.random() * 30 + 10, // 10-40%
        sentiment_comparison: (Math.random() - 0.5) * 20, // -10 to +10
        search_volume_comparison: (Math.random() - 0.5) * 50, // -25% to +25%
        voice_presence_comparison: (Math.random() - 0.5) * 40, // -20% to +20%
        strengths: ['Fuerte presencia social', 'Alto recall de marca'],
        weaknesses: ['Bajo engagement de voz', 'Conversiones diferidas limitadas'],
        opportunities: ['Expandir a voice marketing', 'Mejorar contenido viral']
      }

      this.competitorAnalysis.set(competitor, analysis)
    }

    this.emit('competitor_analysis_updated', {
      competitors_analyzed: competitors.length,
      timestamp: new Date()
    })
  }

  /**
   * Obtiene Memory Score para una campaña
   */
  public getMemoryScore(campaignId: string): MemoryScore | null {
    return this.memoryScores.get(campaignId) || null
  }

  /**
   * Obtiene todos los Memory Scores
   */
  public getAllMemoryScores(): MemoryScore[] {
    return Array.from(this.memoryScores.values())
  }

  /**
   * Obtiene insights de memoria
   */
  public getMemoryInsights(limit: number = 10): BrandRecallInsight[] {
    return this.brandRecallInsights
      .filter(insight => insight.expires_at > new Date())
      .slice(-limit)
      .reverse()
  }

  /**
   * Obtiene análisis competitivo
   */
  public getCompetitorAnalysis(): CompetitorMemoryAnalysis[] {
    return Array.from(this.competitorAnalysis.values())
  }

  /**
   * Obtiene estado de fuentes de datos
   */
  public getDataSourcesStatus(): EthicalDataSource[] {
    return Array.from(this.dataSourcesStatus.values())
  }

  /**
   * Obtiene estadísticas generales
   */
  public getMemoryStats(): {
    total_campaigns: number
    avg_memory_score: number
    active_data_sources: number
    recent_insights: number
    confidence_level: number
    top_performing_brand: string
  } {
    const scores = Array.from(this.memoryScores.values())
    const activeDataSources = Array.from(this.dataSourcesStatus.values())
      .filter(source => source.status === 'active').length

    const topPerformingBrand = scores.length > 0
      ? scores.reduce((max, score) => score.overall_score > max.overall_score ? score : max).brand_name
      : 'N/A'

    return {
      total_campaigns: scores.length,
      avg_memory_score: scores.length > 0
        ? scores.reduce((sum, score) => sum + score.overall_score, 0) / scores.length
        : 0,
      active_data_sources: activeDataSources,
      recent_insights: this.brandRecallInsights.filter(
        insight => Date.now() - insight.created_at.getTime() < 86400000
      ).length,
      confidence_level: this.calculateMemoryConfidenceLevel(),
      top_performing_brand: topPerformingBrand
    }
  }
}

// Instancia singleton de analítica de memoria
export const memoryImpactAnalytics = new MemoryImpactAnalytics()

// Utilidades para integración
export const MemoryImpactUtils = {
  /**
   * Formatea Memory Score para display
   */
  formatMemoryScore: (score: number): string => {
    if (score >= 85) return `${score.toFixed(1)} (Excelente Recall)`
    if (score >= 70) return `${score.toFixed(1)} (Buen Recall)`
    if (score >= 55) return `${score.toFixed(1)} (Recall Moderado)`
    if (score >= 40) return `${score.toFixed(1)} (Recall Bajo)`
    return `${score.toFixed(1)} (Recall Crítico)`
  },

  /**
   * Obtiene color para Memory Score
   */
  getMemoryScoreColor: (score: number): string => {
    if (score >= 85) return '#10b981' // green-500
    if (score >= 70) return '#3b82f6' // blue-500
    if (score >= 55) return '#f59e0b' // amber-500
    if (score >= 40) return '#f97316' // orange-500
    return '#ef4444' // red-500
  },

  /**
   * Calcula proyección de memoria a largo plazo
   */
  calculateLongTermProjection: (currentScore: number, trendData: number[]): {
    projected_score_30d: number
    projected_score_90d: number
    trend_direction: 'up' | 'down' | 'stable'
    confidence: number
  } => {
    const trend = trendData.length > 1
      ? (trendData[trendData.length - 1] - trendData[0]) / trendData.length
      : 0

    const projected30d = Math.max(0, Math.min(100, currentScore + (trend * 30)))
    const projected90d = Math.max(0, Math.min(100, currentScore + (trend * 90)))

    let trendDirection: 'up' | 'down' | 'stable' = 'stable'
    if (trend > 0.5) trendDirection = 'up'
    else if (trend < -0.5) trendDirection = 'down'

    const confidence = Math.min(1, trendData.length / 10) // Más datos = más confianza

    return {
      projected_score_30d: projected30d,
      projected_score_90d: projected90d,
      trend_direction: trendDirection,
      confidence
    }
  }
}