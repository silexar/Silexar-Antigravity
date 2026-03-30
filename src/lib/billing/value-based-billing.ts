/**
 * VALUE-BASED BILLING ENGINE - TIER 0 Silexar Pulse 2.0
 * Motor de Facturación Basada en Valor (CPVI/CPCN)
 * 
 * @description Sistema de facturación avanzado que soporta nuevos modelos
 * CPVI (Cost Per Valuable Interaction) y CPCN (Cost Per Completed Narrative)
 * 
 * @version 2040.20.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Silexar Pulse 2.0 Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { EventEmitter } from 'events'
import { logger } from '@/lib/observability';

// Interfaces para facturación basada en valor
export interface BillingEvent {
  id: string
  contract_line_id: string
  event_type: 'impression' | 'click' | 'valuable_interaction' | 'narrative_completion'
  event_identifier: string
  user_id: string
  campaign_id: string
  creative_id: string
  timestamp: Date
  metadata: Record<string, unknown>
  value: number
  currency: string
}

export interface ContractLineItem {
  id: string
  contract_id: string
  billing_model: 'CPM' | 'CPC' | 'CPVI' | 'CPCN'
  billing_event_identifier?: string
  narrative_completion_node?: string
  rate: number
  currency: string
  budget_limit?: number
  current_spend: number
  event_count: number
  status: 'active' | 'paused' | 'completed' | 'budget_exhausted'
  created_at: Date
  updated_at: Date
}

export interface ValueInteractionDefinition {
  id: string
  name: string
  description: string
  event_identifier: string
  category: 'utility' | 'engagement' | 'conversion' | 'completion'
  base_value: number
  quality_multipliers: {
    time_spent: number
    completion_rate: number
    user_satisfaction: number
  }
}

export interface NarrativeCompletionRule {
  id: string
  narrative_id: string
  completion_node_id: string
  completion_criteria: {
    min_nodes_visited: number
    min_time_spent: number
    required_interactions: string[]
  }
  value_calculation: 'fixed' | 'progressive' | 'quality_based'
  base_value: number
}

export interface BillingMetrics {
  total_events: number
  total_value: number
  average_value_per_event: number
  conversion_rate: number
  quality_score: number
  roi_estimate: number
  cost_efficiency: number
}

export class ValueBasedBillingEngine extends EventEmitter {
  private contractLines: Map<string, ContractLineItem> = new Map()
  private valueInteractions: Map<string, ValueInteractionDefinition> = new Map()
  private narrativeRules: Map<string, NarrativeCompletionRule> = new Map()
  private billingEvents: BillingEvent[] = []
  private isProcessing = false

  constructor() {
    super()
    this.initializeDefaultInteractions()
    this.initializeEventProcessing()
  }

  /**
   * Inicializa interacciones valiosas predefinidas
   */
  private initializeDefaultInteractions(): void {
    const defaultInteractions: ValueInteractionDefinition[] = [
      {
        id: 'loan_calculated',
        name: 'Cálculo de Préstamo Completado',
        description: 'Usuario completó cálculo en calculadora de préstamos',
        event_identifier: 'loan_calculated',
        category: 'utility',
        base_value: 5.0,
        quality_multipliers: {
          time_spent: 1.2,
          completion_rate: 1.5,
          user_satisfaction: 1.3
        }
      },
      {
        id: 'quote_requested',
        name: 'Cotización Solicitada',
        description: 'Usuario solicitó cotización después de usar utilidad',
        event_identifier: 'quote_requested',
        category: 'conversion',
        base_value: 15.0,
        quality_multipliers: {
          time_spent: 1.1,
          completion_rate: 2.0,
          user_satisfaction: 1.8
        }
      },
      {
        id: 'checklist_completed',
        name: 'Checklist Completado',
        description: 'Usuario completó checklist de viaje',
        event_identifier: 'checklist_completed',
        category: 'engagement',
        base_value: 3.0,
        quality_multipliers: {
          time_spent: 1.3,
          completion_rate: 1.4,
          user_satisfaction: 1.2
        }
      },
      {
        id: 'game_completed',
        name: 'Juego Completado',
        description: 'Usuario completó mini-juego de memoria',
        event_identifier: 'game_completed',
        category: 'engagement',
        base_value: 4.0,
        quality_multipliers: {
          time_spent: 1.4,
          completion_rate: 1.6,
          user_satisfaction: 1.5
        }
      },
      {
        id: 'narrative_journey_completed',
        name: 'Narrativa Completada',
        description: 'Usuario completó journey narrativo completo',
        event_identifier: 'narrative_journey_completed',
        category: 'completion',
        base_value: 12.0,
        quality_multipliers: {
          time_spent: 1.5,
          completion_rate: 2.2,
          user_satisfaction: 2.0
        }
      }
    ]

    defaultInteractions.forEach(interaction => {
      this.valueInteractions.set(interaction.event_identifier, interaction)
    })
  }

  /**
   * Inicializa el procesamiento de eventos en tiempo real
   */
  private initializeEventProcessing(): void {
    // Simular suscripción a Kafka topics
    setInterval(() => {
      if (!this.isProcessing) {
        this.processQueuedEvents()
      }
    }, 1000)
  }

  /**
   * Registra una nueva línea de contrato
   */
  public registerContractLine(contractLine: ContractLineItem): void {
    this.contractLines.set(contractLine.id, contractLine)
    this.emit('contract_line_registered', contractLine)
  }

  /**
   * Procesa un evento de facturación
   */
  public async processBillingEvent(event: BillingEvent): Promise<boolean> {
    try {
      const contractLine = this.contractLines.get(event.contract_line_id)
      if (!contractLine || contractLine.status !== 'active') {
        return false
      }

      // Verificar límite de presupuesto
      if (contractLine.budget_limit && 
          contractLine.current_spend >= contractLine.budget_limit) {
        contractLine.status = 'budget_exhausted'
        this.emit('budget_exhausted', contractLine)
        return false
      }

      let billableValue = 0
      let shouldBill = false

      switch (contractLine.billing_model) {
        case 'CPM':
          shouldBill = event.event_type === 'impression'
          billableValue = contractLine.rate / 1000
          break

        case 'CPC':
          shouldBill = event.event_type === 'click'
          billableValue = contractLine.rate
          break

        case 'CPVI':
          shouldBill = this.isValuableInteraction(event, contractLine)
          billableValue = this.calculateValueInteractionCost(event, contractLine)
          break

        case 'CPCN':
          shouldBill = this.isNarrativeCompletion(event, contractLine)
          billableValue = this.calculateNarrativeCompletionCost(event, contractLine)
          break
      }

      if (shouldBill && billableValue > 0) {
        // Actualizar línea de contrato
        contractLine.current_spend += billableValue
        contractLine.event_count += 1
        contractLine.updated_at = new Date()

        // Registrar evento de facturación
        event.value = billableValue
        this.billingEvents.push(event)

        // Emitir eventos
        this.emit('billing_event_processed', {
          event,
          contractLine,
          billableValue
        })

        // Verificar alertas de presupuesto
        this.checkBudgetAlerts(contractLine)

        return true
      }

      return false
    } catch (error) {
      logger.error('Error procesando evento de facturación:', error instanceof Error ? error : undefined)
      this.emit('billing_error', { event, error })
      return false
    }
  }

  /**
   * Verifica si un evento es una interacción valiosa
   */
  private isValuableInteraction(event: BillingEvent, contractLine: ContractLineItem): boolean {
    if (event.event_type !== 'valuable_interaction') return false
    
    return contractLine.billing_event_identifier === event.event_identifier
  }

  /**
   * Calcula el costo de una interacción valiosa
   */
  private calculateValueInteractionCost(event: BillingEvent, contractLine: ContractLineItem): number {
    const interaction = this.valueInteractions.get(event.event_identifier)
    if (!interaction) return contractLine.rate

    let finalValue = interaction.base_value

    // Aplicar multiplicadores de calidad
    const timeSpent = Number(event.metadata.time_spent) || 0
    const completionRate = Number(event.metadata.completion_rate) || 0
    const userSatisfaction = Number(event.metadata.user_satisfaction) || 0

    if (timeSpent > 30) { // 30 segundos mínimo
      finalValue *= interaction.quality_multipliers.time_spent
    }

    if (completionRate > 0.8) { // 80% completado
      finalValue *= interaction.quality_multipliers.completion_rate
    }

    if (userSatisfaction > 0.7) { // 70% satisfacción
      finalValue *= interaction.quality_multipliers.user_satisfaction
    }

    return Math.min(finalValue, contractLine.rate * 2) // Máximo 2x el rate base
  }

  /**
   * Verifica si un evento es una finalización de narrativa
   */
  private isNarrativeCompletion(event: BillingEvent, contractLine: ContractLineItem): boolean {
    if (event.event_type !== 'narrative_completion') return false
    
    return contractLine.narrative_completion_node === event.metadata.completion_node_id
  }

  /**
   * Calcula el costo de una finalización de narrativa
   */
  private calculateNarrativeCompletionCost(event: BillingEvent, contractLine: ContractLineItem): number {
    const narrativeRule = this.narrativeRules.get(event.metadata.narrative_id as string)
    if (!narrativeRule) return contractLine.rate

    let finalValue = narrativeRule.base_value

    switch (narrativeRule.value_calculation) {
      case 'progressive':
        const nodesVisited = Number(event.metadata.nodes_visited) || 0
        const progressMultiplier = Math.min(nodesVisited / 5, 2.0) // Máximo 2x por progreso
        finalValue *= progressMultiplier
        break

      case 'quality_based':
        const engagementScore = Number(event.metadata.engagement_score) || 0
        const qualityMultiplier = 1 + (engagementScore * 0.5) // Hasta 50% extra por calidad
        finalValue *= qualityMultiplier
        break

      case 'fixed':
      default:
        // Usar valor base sin modificaciones
        break
    }

    return Math.min(finalValue, contractLine.rate * 3) // Máximo 3x el rate base
  }

  /**
   * Verifica alertas de presupuesto
   */
  private checkBudgetAlerts(contractLine: ContractLineItem): void {
    if (!contractLine.budget_limit) return

    const spendPercentage = (contractLine.current_spend / contractLine.budget_limit) * 100

    if (spendPercentage >= 90) {
      this.emit('budget_alert', {
        level: 'critical',
        contractLine,
        spendPercentage,
        message: 'Presupuesto casi agotado (90%+)'
      })
    } else if (spendPercentage >= 75) {
      this.emit('budget_alert', {
        level: 'warning',
        contractLine,
        spendPercentage,
        message: 'Presupuesto en 75%'
      })
    } else if (spendPercentage >= 50) {
      this.emit('budget_alert', {
        level: 'info',
        contractLine,
        spendPercentage,
        message: 'Presupuesto en 50%'
      })
    }
  }

  /**
   * Procesa eventos en cola
   */
  private async processQueuedEvents(): Promise<void> {
    this.isProcessing = true
    
    try {
      // En implementación real, consumir de Kafka
      // Por ahora, simular procesamiento de eventos pendientes
      
      this.emit('events_processed', {
        processed: 0,
        timestamp: new Date()
      })
    } catch (error) {
      logger.error('Error procesando eventos en cola:', error instanceof Error ? error : undefined)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Obtiene métricas de facturación para una línea de contrato
   */
  public getBillingMetrics(contractLineId: string): BillingMetrics | null {
    const contractLine = this.contractLines.get(contractLineId)
    if (!contractLine) return null

    const lineEvents = this.billingEvents.filter(e => e.contract_line_id === contractLineId)
    
    if (lineEvents.length === 0) {
      return {
        total_events: 0,
        total_value: 0,
        average_value_per_event: 0,
        conversion_rate: 0,
        quality_score: 0,
        roi_estimate: 0,
        cost_efficiency: 0
      }
    }

    const totalValue = lineEvents.reduce((sum, event) => sum + event.value, 0)
    const averageValue = totalValue / lineEvents.length

    // Calcular tasa de conversión (eventos valiosos vs impresiones)
    const valuableEvents = lineEvents.filter(e => 
      e.event_type === 'valuable_interaction' || e.event_type === 'narrative_completion'
    ).length
    const impressionEvents = lineEvents.filter(e => e.event_type === 'impression').length
    const conversionRate = impressionEvents > 0 ? (valuableEvents / impressionEvents) * 100 : 0

    // Calcular puntuación de calidad promedio
    const qualityScores = lineEvents
      .filter(e => e.metadata.quality_score)
      .map(e => e.metadata.quality_score as number)
    const qualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0

    // Estimar ROI (simplificado)
    const estimatedRevenue = totalValue * 3 // Asumiendo 3x retorno
    const roiEstimate = totalValue > 0 ? ((estimatedRevenue - totalValue) / totalValue) * 100 : 0

    // Calcular eficiencia de costo
    const costEfficiency = averageValue > 0 ? (qualityScore * conversionRate) / averageValue : 0

    return {
      total_events: lineEvents.length,
      total_value: totalValue,
      average_value_per_event: averageValue,
      conversion_rate: conversionRate,
      quality_score: qualityScore,
      roi_estimate: roiEstimate,
      cost_efficiency: costEfficiency
    }
  }

  /**
   * Obtiene resumen de facturación por período
   */
  public getBillingSummary(startDate: Date, endDate: Date): {
    total_revenue: number
    events_by_type: Record<string, number>
    top_performing_lines: ContractLineItem[]
    efficiency_metrics: BillingMetrics
  } {
    const periodEvents = this.billingEvents.filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    )

    const totalRevenue = periodEvents.reduce((sum, event) => sum + event.value, 0)

    const eventsByType = periodEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Obtener líneas de mejor rendimiento
    const linePerformance = Array.from(this.contractLines.values())
      .map(line => ({
        line,
        metrics: this.getBillingMetrics(line.id)
      }))
      .filter(item => item.metrics)
      .sort((a, b) => (b.metrics!.cost_efficiency || 0) - (a.metrics!.cost_efficiency || 0))
      .slice(0, 5)
      .map(item => item.line)

    // Métricas de eficiencia generales
    const allMetrics = Array.from(this.contractLines.keys())
      .map(id => this.getBillingMetrics(id))
      .filter(m => m) as BillingMetrics[]

    const efficiencyMetrics: BillingMetrics = {
      total_events: allMetrics.reduce((sum, m) => sum + m.total_events, 0),
      total_value: allMetrics.reduce((sum, m) => sum + m.total_value, 0),
      average_value_per_event: allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.average_value_per_event, 0) / allMetrics.length 
        : 0,
      conversion_rate: allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.conversion_rate, 0) / allMetrics.length 
        : 0,
      quality_score: allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.quality_score, 0) / allMetrics.length 
        : 0,
      roi_estimate: allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.roi_estimate, 0) / allMetrics.length 
        : 0,
      cost_efficiency: allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.cost_efficiency, 0) / allMetrics.length 
        : 0
    }

    return {
      total_revenue: totalRevenue,
      events_by_type: eventsByType,
      top_performing_lines: linePerformance,
      efficiency_metrics: efficiencyMetrics
    }
  }

  /**
   * Registra una nueva regla de finalización de narrativa
   */
  public registerNarrativeRule(rule: NarrativeCompletionRule): void {
    this.narrativeRules.set(rule.narrative_id, rule)
    this.emit('narrative_rule_registered', rule)
  }

  /**
   * Obtiene estadísticas en tiempo real
   */
  public getRealTimeStats(): {
    active_contracts: number
    events_per_minute: number
    current_revenue_rate: number
    top_billing_models: Array<{ model: string; percentage: number }>
  } {
    const activeContracts = Array.from(this.contractLines.values())
      .filter(line => line.status === 'active').length

    // Eventos en los últimos 60 segundos
    const oneMinuteAgo = new Date(Date.now() - 60000)
    const recentEvents = this.billingEvents.filter(event => event.timestamp >= oneMinuteAgo)
    const eventsPerMinute = recentEvents.length

    // Tasa de ingresos actual (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 300000)
    const recentRevenue = this.billingEvents
      .filter(event => event.timestamp >= fiveMinutesAgo)
      .reduce((sum, event) => sum + event.value, 0)
    const currentRevenueRate = recentRevenue / 5 // Por minuto

    // Modelos de facturación más utilizados
    const modelCounts = Array.from(this.contractLines.values())
      .reduce((acc, line) => {
        acc[line.billing_model] = (acc[line.billing_model] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const totalLines = Array.from(this.contractLines.values()).length
    const topBillingModels = Object.entries(modelCounts)
      .map(([model, count]) => ({
        model,
        percentage: totalLines > 0 ? (count / totalLines) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)

    return {
      active_contracts: activeContracts,
      events_per_minute: eventsPerMinute,
      current_revenue_rate: currentRevenueRate,
      top_billing_models: topBillingModels
    }
  }
}

// Instancia singleton del motor de facturación
export const valueBillingEngine = new ValueBasedBillingEngine()

// Funciones de utilidad para integración
export const BillingUtils = {
  /**
   * Crea un evento de interacción valiosa
   */
  createValueInteractionEvent: (
    contractLineId: string,
    eventIdentifier: string,
    userId: string,
    campaignId: string,
    creativeId: string,
    metadata: Record<string, unknown> = {}
  ): BillingEvent => ({
    id: crypto.randomUUID(),
    contract_line_id: contractLineId,
    event_type: 'valuable_interaction',
    event_identifier: eventIdentifier,
    user_id: userId,
    campaign_id: campaignId,
    creative_id: creativeId,
    timestamp: new Date(),
    metadata,
    value: 0, // Se calculará en el procesamiento
    currency: 'CLP'
  }),

  /**
   * Crea un evento de finalización de narrativa
   */
  createNarrativeCompletionEvent: (
    contractLineId: string,
    narrativeId: string,
    completionNodeId: string,
    userId: string,
    campaignId: string,
    metadata: Record<string, unknown> = {}
  ): BillingEvent => ({
    id: crypto.randomUUID(),
    contract_line_id: contractLineId,
    event_type: 'narrative_completion',
    event_identifier: 'narrative_journey_completed',
    user_id: userId,
    campaign_id: campaignId,
    creative_id: narrativeId,
    timestamp: new Date(),
    metadata: {
      ...metadata,
      narrative_id: narrativeId,
      completion_node_id: completionNodeId
    },
    value: 0, // Se calculará en el procesamiento
    currency: 'CLP'
  }),

  /**
   * Formatea valor monetario
   */
  formatCurrency: (value: number, currency: string = 'CLP'): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(value)
  },

  /**
   * Calcula proyección de presupuesto
   */
  calculateBudgetProjection: (
    currentSpend: number,
    budgetLimit: number,
    daysElapsed: number,
    totalDays: number
  ): {
    projected_spend: number
    budget_utilization: number
    pace: 'under' | 'on_track' | 'over'
  } => {
    const expectedSpend = (budgetLimit / totalDays) * daysElapsed
    const projectedSpend = (currentSpend / daysElapsed) * totalDays
    const budgetUtilization = (currentSpend / budgetLimit) * 100

    let pace: 'under' | 'on_track' | 'over' = 'on_track'
    if (currentSpend < expectedSpend * 0.9) pace = 'under'
    else if (currentSpend > expectedSpend * 1.1) pace = 'over'

    return {
      projected_spend: projectedSpend,
      budget_utilization: budgetUtilization,
      pace
    }
  }
}