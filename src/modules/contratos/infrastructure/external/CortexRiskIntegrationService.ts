// @ts-nocheck

import { logger } from '@/lib/observability';
/**
 * SERVICIO INTEGRACIÓN CORTEX-RISK - TIER 0
 * 
 * @description Integración con motor de análisis de riesgo crediticio
 */

export interface CortexRiskEvaluationRequest {
  rutCliente: string
  contractValue: number
  paymentTerms: number
  contractType: 'A' | 'B' | 'C'
  isExchange: boolean
  industryCode?: string
  historicalData?: Record<string, unknown>
}

export interface CortexRiskEvaluationResponse {
  score: number
  riskLevel: 'bajo' | 'medio' | 'alto'
  factors: string[]
  recommendations: string[]
  creditLimit?: number
  recommendedPaymentTerms: number
  confidence: number
  lastUpdated: Date
}

export class CortexRiskIntegrationService {
  private baseUrl: string
  private apiKey: string
  private timeout: number = 5000
  private cache: Map<string, { data: CortexRiskEvaluationResponse; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 60 * 60 * 1000 // 1 hora

  constructor(config: { baseUrl: string; apiKey: string; timeout?: number }) {
    this.baseUrl = config.baseUrl
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 5000
  }

  async evaluateClient(request: CortexRiskEvaluationRequest): Promise<CortexRiskEvaluationResponse> {
    // Generar cache key
    const cacheKey = this.generateCacheKey(request)

    // Verificar cache (válido por 1 hora)
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.debug('[CortexRisk] Cache hit for client evaluation', { rutCliente: request.rutCliente })
      return cached.data
    }

    try {
      const response = await this.makeRequest('/api/v1/risk/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.generateRequestId()
        },
        body: JSON.stringify({
          client_rut: request.rutCliente,
          contract_value: request.contractValue,
          payment_terms_days: request.paymentTerms,
          contract_type: request.contractType,
          is_exchange: request.isExchange,
          industry_code: request.industryCode,
          historical_data: request.historicalData,
          evaluation_timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Cortex-Risk API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const result = this.mapResponse(data)

      // Guardar en cache
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })

      return result
    } catch (error) {
      logger.error('Error evaluating client risk:', error)

      // Fallback: análisis básico local
      const fallback = this.fallbackEvaluation(request)

      // También guardar fallback en cache (para no repetir cálculos)
      this.cache.set(cacheKey, { data: fallback, timestamp: Date.now() })

      return fallback
    }
  }

  async getBulkEvaluations(requests: CortexRiskEvaluationRequest[]): Promise<CortexRiskEvaluationResponse[]> {
    try {
      const response = await this.makeRequest('/api/v1/risk/evaluate/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          evaluations: requests.map(req => ({
            client_rut: req.rutCliente,
            contract_value: req.contractValue,
            payment_terms_days: req.paymentTerms,
            contract_type: req.contractType,
            is_exchange: req.isExchange
          }))
        })
      })

      const data = await response.json() as { results: Record<string, unknown>[] }

      return data.results.map((result) => this.mapResponse(result))
    } catch (error) {
      logger.error('Error in bulk evaluation:', error)

      // Fallback: evaluaciones individuales
      return Promise.all(requests.map(req => this.fallbackEvaluation(req)))
    }
  }

  async getClientHistory(rutCliente: string): Promise<unknown> {
    try {
      const response = await this.makeRequest(`/api/v1/risk/client/${rutCliente}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return await response.json()
    } catch (error) {
      logger.error('Error getting client history:', error)
      return null
    }
  }

  async updateClientData(rutCliente: string, data: Record<string, unknown>): Promise<void> {
    try {
      await this.makeRequest(`/api/v1/risk/client/${rutCliente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      })
    } catch (error) {
      logger.error('Error updating client data:', error)
      throw error
    }
  }

  async getIndustryBenchmarks(industryCode: string): Promise<unknown> {
    try {
      const response = await this.makeRequest(`/api/v1/risk/industry/${industryCode}/benchmarks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return await response.json()
    } catch (error) {
      logger.error('Error getting industry benchmarks:', error)
      return null
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private mapResponse(data: Record<string, unknown>): CortexRiskEvaluationResponse {
    return {
      score: (data.risk_score as number | undefined) || 650,
      riskLevel: this.mapRiskLevel((data.risk_level || data.risk_score) as string | number),
      factors: (data.risk_factors as string[] | undefined) || [],
      recommendations: (data.recommendations as string[] | undefined) || [],
      creditLimit: data.credit_limit as number | undefined,
      recommendedPaymentTerms: (data.recommended_payment_terms as number | undefined) || 30,
      confidence: (data.confidence as number | undefined) || 0.85,
      lastUpdated: new Date((data.last_updated as string | number | undefined) || Date.now())
    }
  }

  private mapRiskLevel(level: string | number): 'bajo' | 'medio' | 'alto' {
    if (typeof level === 'number') {
      if (level >= 750) return 'bajo'
      if (level >= 600) return 'medio'
      return 'alto'
    }

    const levelMap: Record<string, 'bajo' | 'medio' | 'alto'> = {
      'low': 'bajo',
      'medium': 'medio',
      'high': 'alto',
      'bajo': 'bajo',
      'medio': 'medio',
      'alto': 'alto'
    }

    return levelMap[level.toLowerCase()] || 'medio'
  }

  private fallbackEvaluation(request: CortexRiskEvaluationRequest): CortexRiskEvaluationResponse {
    // Análisis básico cuando Cortex-Risk no está disponible
    let score = 650 // Score base
    const factors: string[] = ['Análisis básico - Cortex-Risk no disponible']

    // Ajustes básicos por valor del contrato
    if (request.contractValue > 100000000) {
      score -= 50
      factors.push('Contrato de alto valor')
    }

    // Ajustes por términos de pago
    if (request.paymentTerms > 60) {
      score -= 30
      factors.push('Términos de pago extendidos')
    }

    // Ajustes por tipo de contrato
    if (request.contractType === 'C') {
      score -= 20
      factors.push('Contrato tipo C - Mayor riesgo')
    }

    // Ajustes por canje
    if (request.isExchange) {
      score -= 40
      factors.push('Contrato de canje - Sin flujo de efectivo')
    }

    // Determinar nivel de riesgo
    const riskLevel = this.mapRiskLevel(score)

    // Generar recomendaciones básicas
    const recommendations: string[] = []

    if (riskLevel === 'alto') {
      recommendations.push('Requiere garantía bancaria')
      recommendations.push('Términos máximos de 15 días')
      recommendations.push('Monitoreo semanal de cuenta')
    } else if (riskLevel === 'medio') {
      recommendations.push('Términos máximos de 45 días')
      recommendations.push('Monitoreo mensual recomendado')
    } else {
      recommendations.push('Cliente de bajo riesgo')
      recommendations.push('Términos estándar aplicables')
    }

    return {
      score: Math.max(300, Math.min(900, score)), // Limitar entre 300-900
      riskLevel,
      factors,
      recommendations,
      creditLimit: this.calculateCreditLimit(score, request.contractValue),
      recommendedPaymentTerms: this.calculateRecommendedTerms(riskLevel),
      confidence: 0.6, // Baja confianza para análisis básico
      lastUpdated: new Date()
    }
  }

  private calculateCreditLimit(score: number, contractValue: number): number {
    const baseLimit = contractValue * 2 // 2x el valor del contrato como base

    if (score >= 750) return baseLimit * 1.5
    if (score >= 650) return baseLimit
    if (score >= 550) return baseLimit * 0.7
    return baseLimit * 0.5
  }

  private calculateRecommendedTerms(riskLevel: 'bajo' | 'medio' | 'alto'): number {
    const termsMap = {
      'bajo': 60,
      'medio': 30,
      'alto': 15
    }

    return termsMap[riskLevel]
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private generateCacheKey(request: CortexRiskEvaluationRequest): string {
    return `cortex_risk_${request.rutCliente}_${request.contractValue}_${request.paymentTerms}_${request.contractType}`
  }

  /**
   * Limpiar cache de forma manual
   */
  clearCache(): void {
    this.cache.clear()
    logger.info('[CortexRisk] Cache cleared')
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }

  // Métodos de configuración y monitoreo
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/v1/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  async getApiStatus(): Promise<unknown> {
    try {
      const response = await this.makeRequest('/api/v1/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return await response.json()
    } catch (error) {
      return { status: 'unavailable', error: error instanceof Error ? error.message : String(error) }
    }
  }
}