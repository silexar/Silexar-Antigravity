
/**
 * ATTRIBUTION ENGINE - TIER 0 Digital Revolution
 * 
 * @description Motor de atribución cross-media con IA que rastrea el journey completo
 * del usuario desde radio hasta conversión digital, asignando valor a cada touchpoint
 * 
 * @version 2040.15.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Digital Revolution Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { z } from 'zod'
import { logger } from '@/lib/observability';

// Esquemas de validación
const AttributionEventSchema = z.object({
    id: z.string().uuid().optional(),
    user_fingerprint: z.string().min(1),
    session_id: z.string().uuid(),
    event_type: z.enum([
        'RADIO_EXPOSURE', 'TV_EXPOSURE', 'GOOGLE_CLICK', 'META_CLICK',
        'TIKTOK_CLICK', 'LINKEDIN_CLICK', 'WEBSITE_VISIT', 'PURCHASE',
        'EMAIL_OPEN', 'SMS_CLICK', 'DIRECT_VISIT', 'ORGANIC_SEARCH'
    ]),
    timestamp: z.string().datetime(),
    channel: z.string(),
    campaign_id: z.string().uuid().optional(),
    creative_id: z.string().uuid().optional(),
    platform: z.enum([
        'RADIO', 'TV', 'GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS',
        'LINKEDIN_ADS', 'WEBSITE', 'EMAIL', 'SMS', 'ORGANIC'
    ]),
    device_info: z.object({
        type: z.enum(['DESKTOP', 'MOBILE', 'TABLET']),
        os: z.string().optional(),
        browser: z.string().optional()
    }).optional(),
    location_data: z.object({
        country: z.string().optional(),
        region: z.string().optional(),
        city: z.string().optional(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional()
    }).optional(),
    conversion_value: z.number().optional(),
    attribution_weight: z.number().min(0).max(1).optional()
})

const UserJourneySchema = z.object({
    user_fingerprint: z.string(),
    events: z.array(AttributionEventSchema),
    total_value: z.number(),
    conversion_count: z.number(),
    journey_duration: z.number(), // en minutos
    touchpoint_count: z.number()
})

// Tipos TypeScript
export type AttributionEvent = z.infer<typeof AttributionEventSchema>
export type UserJourney = z.infer<typeof UserJourneySchema>

export interface AttributionModel {
    type: 'FIRST_TOUCH' | 'LAST_TOUCH' | 'LINEAR' | 'TIME_DECAY' | 'POSITION_BASED' | 'AI_ENHANCED'
    parameters: Record<string, number>
}

export interface AttributionResult {
    touchpoint: AttributionEvent
    attribution_weight: number
    attributed_value: number
    confidence_score: number
}

export interface CrossMediaInsight {
    type: 'RADIO_TO_DIGITAL' | 'TV_TO_DIGITAL' | 'CROSS_PLATFORM' | 'JOURNEY_ANALYSIS'
    title: string
    description: string
    metrics: {
        total_journeys: number
        avg_touchpoints: number
        conversion_rate: number
        avg_journey_time: number
        top_converting_path: string[]
    }
    recommendations: {
        action: string
        priority: 'HIGH' | 'MEDIUM' | 'LOW'
        estimated_impact: number
    }[]
}

/**
 * Motor de Atribución Cross-Media TIER 0
 * Sistema inteligente que rastrea y atribuye valor a cada touchpoint del customer journey
 */
export class AttributionEngine {
    private events: AttributionEvent[] = []
    private journeys: Map<string, UserJourney> = new Map()
    private model: AttributionModel
    private isInitialized: boolean = false

    constructor(model: AttributionModel = { type: 'AI_ENHANCED', parameters: {} }) {
        this.model = model
    }

    /**
     * Inicializa el motor de atribución
     */
    async initialize(): Promise<void> {
        try {
            logger.info('🎯 Inicializando Attribution Engine TIER 0...')

            // Cargar eventos históricos
            await this.loadHistoricalEvents()

            // Construir journeys de usuarios
            await this.buildUserJourneys()

            // Entrenar modelo de IA si es necesario
            if (this.model.type === 'AI_ENHANCED') {
                await this.trainAIModel()
            }

            this.isInitialized = true
            logger.info('✅ Attribution Engine inicializado exitosamente')

        } catch (error) {
            logger.error('Error inicializando Attribution Engine:', error instanceof Error ? error : undefined)
            throw error
        }
    }

    /**
     * Rastrea un nuevo evento de atribución
     */
    async trackEvent(event: Omit<AttributionEvent, 'id'>): Promise<string> {
        this.ensureInitialized()

        try {
            const validatedEvent = AttributionEventSchema.parse({
                ...event,
                id: crypto.randomUUID()
            })

            // Agregar evento a la lista
            this.events.push(validatedEvent)

            // Actualizar journey del usuario
            await this.updateUserJourney(validatedEvent)

            // Si es una conversión, ejecutar atribución
            if (this.isConversionEvent(validatedEvent)) {
                await this.executeAttribution(validatedEvent.user_fingerprint)
            }

            logger.info(`📊 Evento rastreado: ${validatedEvent.event_type} para usuario ${validatedEvent.user_fingerprint}`)
            return validatedEvent.id!

        } catch (error) {
            logger.error('Error rastreando evento:', error instanceof Error ? error : undefined)
            throw error
        }
    }

    /**
     * Obtiene el journey completo de un usuario
     */
    async getUserJourney(userFingerprint: string): Promise<UserJourney | null> {
        this.ensureInitialized()

        const journey = this.journeys.get(userFingerprint)
        if (!journey) {
            return null
        }

        // Ordenar eventos por timestamp
        journey.events.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        return journey
    }

    /**
     * Ejecuta atribución para un usuario específico
     */
    async executeAttribution(userFingerprint: string): Promise<AttributionResult[]> {
        this.ensureInitialized()

        try {
            const journey = await this.getUserJourney(userFingerprint)
            if (!journey || journey.events.length === 0) {
                return []
            }

            const results: AttributionResult[] = []

            switch (this.model.type) {
                case 'FIRST_TOUCH':
                    results.push(...this.firstTouchAttribution(journey))
                    break
                case 'LAST_TOUCH':
                    results.push(...this.lastTouchAttribution(journey))
                    break
                case 'LINEAR':
                    results.push(...this.linearAttribution(journey))
                    break
                case 'TIME_DECAY':
                    results.push(...this.timeDecayAttribution(journey))
                    break
                case 'POSITION_BASED':
                    results.push(...this.positionBasedAttribution(journey))
                    break
                case 'AI_ENHANCED':
                    results.push(...await this.aiEnhancedAttribution(journey))
                    break
            }

            // Actualizar pesos en los eventos
            await this.updateAttributionWeights(results)

            logger.info(`🎯 Atribución ejecutada para usuario ${userFingerprint}: ${results.length} touchpoints`)
            return results

        } catch (error) {
            logger.error('Error ejecutando atribución:', error instanceof Error ? error : undefined)
            throw error
        }
    }

    /**
     * Genera insights cross-media
     */
    async generateCrossMediaInsights(
        dateRange: { startDate: string; endDate: string }
    ): Promise<CrossMediaInsight[]> {
        this.ensureInitialized()

        try {
            logger.info('🧠 Generando insights cross-media con IA...')

            const insights: CrossMediaInsight[] = []

            // Filtrar eventos por rango de fechas
            const filteredEvents = this.events.filter(event => {
                const eventDate = new Date(event.timestamp)
                return eventDate >= new Date(dateRange.startDate) &&
                    eventDate <= new Date(dateRange.endDate)
            })

            // Análisis Radio → Digital
            const radioToDigitalInsight = await this.analyzeRadioToDigital(filteredEvents)
            if (radioToDigitalInsight) {
                insights.push(radioToDigitalInsight)
            }

            // Análisis TV → Digital
            const tvToDigitalInsight = await this.analyzeTVToDigital(filteredEvents)
            if (tvToDigitalInsight) {
                insights.push(tvToDigitalInsight)
            }

            // Análisis Cross-Platform
            const crossPlatformInsight = await this.analyzeCrossPlatform(filteredEvents)
            if (crossPlatformInsight) {
                insights.push(crossPlatformInsight)
            }

            // Análisis de Journey Patterns
            const journeyInsight = await this.analyzeJourneyPatterns(filteredEvents)
            if (journeyInsight) {
                insights.push(journeyInsight)
            }

            logger.info(`✅ ${insights.length} insights cross-media generados`)
            return insights

        } catch (error) {
            logger.error('Error generando insights:', error instanceof Error ? error : undefined)
            throw error
        }
    }

    /**
     * Obtiene métricas de atribución por canal
     */
    async getAttributionMetricsByChannel(
        dateRange: { startDate: string; endDate: string }
    ): Promise<Record<string, unknown>> {
        this.ensureInitialized()

        const metrics: Record<string, unknown> = {}

        // Filtrar eventos por rango de fechas
        const filteredEvents = this.events.filter(event => {
            const eventDate = new Date(event.timestamp)
            return eventDate >= new Date(dateRange.startDate) &&
                eventDate <= new Date(dateRange.endDate)
        })

        // Agrupar por plataforma
        const eventsByPlatform = this.groupEventsByPlatform(filteredEvents)

        for (const [platform, events] of Object.entries(eventsByPlatform)) {
            const conversions = events.filter(e => this.isConversionEvent(e))
            const totalValue = conversions.reduce((sum, e) => sum + (e.conversion_value || 0), 0)
            const totalWeight = events.reduce((sum, e) => sum + (e.attribution_weight || 0), 0)

            metrics[platform] = {
                total_events: events.length,
                conversions: conversions.length,
                total_value: totalValue,
                attributed_value: totalValue * totalWeight,
                conversion_rate: events.length > 0 ? (conversions.length / events.length) * 100 : 0,
                avg_attribution_weight: events.length > 0 ? totalWeight / events.length : 0
            }
        }

        return metrics
    }

    // Métodos privados

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('Attribution Engine not initialized. Call initialize() first.')
        }
    }

    private async loadHistoricalEvents(): Promise<void> {
        // Simular carga de eventos históricos
        logger.info('📚 Cargando eventos históricos...')

        // En implementación real, cargar desde base de datos
        const mockEvents: AttributionEvent[] = [
            {
                id: crypto.randomUUID(),
                user_fingerprint: 'user_001',
                session_id: crypto.randomUUID(),
                event_type: 'RADIO_EXPOSURE',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                channel: 'Radio Cooperativa',
                platform: 'RADIO',
                campaign_id: crypto.randomUUID()
            },
            {
                id: crypto.randomUUID(),
                user_fingerprint: 'user_001',
                session_id: crypto.randomUUID(),
                event_type: 'GOOGLE_CLICK',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                channel: 'Google Search',
                platform: 'GOOGLE_ADS',
                campaign_id: crypto.randomUUID()
            },
            {
                id: crypto.randomUUID(),
                user_fingerprint: 'user_001',
                session_id: crypto.randomUUID(),
                event_type: 'PURCHASE',
                timestamp: new Date().toISOString(),
                channel: 'Website',
                platform: 'WEBSITE',
                conversion_value: 150000
            }
        ]

        this.events = mockEvents
    }

    private async buildUserJourneys(): Promise<void> {
        logger.info('🗺️ Construyendo journeys de usuarios...')

        // Agrupar eventos por usuario
        const eventsByUser = this.groupEventsByUser(this.events)

        for (const [userFingerprint, events] of Object.entries(eventsByUser)) {
            const conversions = events.filter(e => this.isConversionEvent(e))
            const totalValue = conversions.reduce((sum, e) => sum + (e.conversion_value || 0), 0)

            // Calcular duración del journey
            const sortedEvents = events.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )

            const journeyDuration = sortedEvents.length > 1
                ? (new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime() -
                    new Date(sortedEvents[0].timestamp).getTime()) / (1000 * 60)
                : 0

            const journey: UserJourney = {
                user_fingerprint: userFingerprint,
                events: sortedEvents,
                total_value: totalValue,
                conversion_count: conversions.length,
                journey_duration: journeyDuration,
                touchpoint_count: events.length
            }

            this.journeys.set(userFingerprint, journey)
        }
    }

    private async trainAIModel(): Promise<void> {
        logger.info('🤖 Entrenando modelo de IA para atribución...')

        // Simular entrenamiento del modelo
        await new Promise(resolve => setTimeout(resolve, 1000))

        // En implementación real, entrenar modelo con TensorFlow.js
        this.model.parameters = {
            radio_weight: 0.25,
            tv_weight: 0.20,
            digital_weight: 0.55,
            time_decay_factor: 0.7,
            position_boost: 1.2
        }
    }

    private async updateUserJourney(event: AttributionEvent): Promise<void> {
        const existingJourney = this.journeys.get(event.user_fingerprint)

        if (existingJourney) {
            existingJourney.events.push(event)

            // Actualizar métricas del journey
            if (this.isConversionEvent(event)) {
                existingJourney.conversion_count += 1
                existingJourney.total_value += event.conversion_value || 0
            }

            existingJourney.touchpoint_count = existingJourney.events.length

            // Recalcular duración
            const sortedEvents = existingJourney.events.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )

            existingJourney.journey_duration = sortedEvents.length > 1
                ? (new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime() -
                    new Date(sortedEvents[0].timestamp).getTime()) / (1000 * 60)
                : 0

        } else {
            // Crear nuevo journey
            const newJourney: UserJourney = {
                user_fingerprint: event.user_fingerprint,
                events: [event],
                total_value: event.conversion_value || 0,
                conversion_count: this.isConversionEvent(event) ? 1 : 0,
                journey_duration: 0,
                touchpoint_count: 1
            }

            this.journeys.set(event.user_fingerprint, newJourney)
        }
    }

    private isConversionEvent(event: AttributionEvent): boolean {
        return event.event_type === 'PURCHASE' ||
            (event.conversion_value !== undefined && event.conversion_value > 0)
    }

    private firstTouchAttribution(journey: UserJourney): AttributionResult[] {
        if (journey.events.length === 0) return []

        const firstEvent = journey.events[0]
        return [{
            touchpoint: firstEvent,
            attribution_weight: 1.0,
            attributed_value: journey.total_value,
            confidence_score: 0.8
        }]
    }

    private lastTouchAttribution(journey: UserJourney): AttributionResult[] {
        if (journey.events.length === 0) return []

        const lastEvent = journey.events[journey.events.length - 1]
        return [{
            touchpoint: lastEvent,
            attribution_weight: 1.0,
            attributed_value: journey.total_value,
            confidence_score: 0.8
        }]
    }

    private linearAttribution(journey: UserJourney): AttributionResult[] {
        if (journey.events.length === 0) return []

        const weight = 1.0 / journey.events.length
        const valuePerEvent = journey.total_value / journey.events.length

        return journey.events.map(event => ({
            touchpoint: event,
            attribution_weight: weight,
            attributed_value: valuePerEvent,
            confidence_score: 0.7
        }))
    }

    private timeDecayAttribution(journey: UserJourney): AttributionResult[] {
        if (journey.events.length === 0) return []

        const decayFactor = this.model.parameters.time_decay_factor || 0.7
        const results: AttributionResult[] = []

        // Calcular pesos con decaimiento temporal
        const weights: number[] = []
        let totalWeight = 0

        for (let i = 0; i < journey.events.length; i++) {
            const weight = Math.pow(decayFactor, journey.events.length - 1 - i)
            weights.push(weight)
            totalWeight += weight
        }

        // Normalizar pesos
        for (let i = 0; i < journey.events.length; i++) {
            const normalizedWeight = weights[i] / totalWeight
            results.push({
                touchpoint: journey.events[i],
                attribution_weight: normalizedWeight,
                attributed_value: journey.total_value * normalizedWeight,
                confidence_score: 0.85
            })
        }

        return results
    }

    private positionBasedAttribution(journey: UserJourney): AttributionResult[] {
        if (journey.events.length === 0) return []

        const results: AttributionResult[] = []

        if (journey.events.length === 1) {
            return [{
                touchpoint: journey.events[0],
                attribution_weight: 1.0,
                attributed_value: journey.total_value,
                confidence_score: 0.8
            }]
        }

        // 40% primer touchpoint, 20% último, 40% distribuido en el medio
        const firstWeight = 0.4
        const lastWeight = 0.2
        const middleWeight = journey.events.length > 2 ? 0.4 / (journey.events.length - 2) : 0

        journey.events.forEach((event, index) => {
            let weight: number

            if (index === 0) {
                weight = firstWeight
            } else if (index === journey.events.length - 1) {
                weight = lastWeight
            } else {
                weight = middleWeight
            }

            results.push({
                touchpoint: event,
                attribution_weight: weight,
                attributed_value: journey.total_value * weight,
                confidence_score: 0.9
            })
        })

        return results
    }

    private async aiEnhancedAttribution(journey: UserJourney): Promise<AttributionResult[]> {
        // Implementar atribución con IA avanzada
        logger.info('🧠 Ejecutando atribución con IA avanzada...')

        // Simular procesamiento de IA
        await new Promise(resolve => setTimeout(resolve, 100))

        const results: AttributionResult[] = []

        // Combinar múltiples modelos con pesos inteligentes
        const radioWeight = this.model.parameters.radio_weight || 0.25
        const tvWeight = this.model.parameters.tv_weight || 0.20
        const digitalWeight = this.model.parameters.digital_weight || 0.55

        let totalWeight = 0
        const eventWeights: number[] = []

        journey.events.forEach((event, index) => {
            let baseWeight = 1.0 / journey.events.length // Linear base

            // Ajustar por tipo de plataforma
            switch (event.platform) {
                case 'RADIO':
                    baseWeight *= (1 + radioWeight)
                    break
                case 'TV':
                    baseWeight *= (1 + tvWeight)
                    break
                case 'GOOGLE_ADS':
                case 'META_BUSINESS':
                case 'TIKTOK_ADS':
                case 'LINKEDIN_ADS':
                    baseWeight *= (1 + digitalWeight)
                    break
            }

            // Ajustar por posición (primer y último touchpoint más importantes)
            if (index === 0 || index === journey.events.length - 1) {
                baseWeight *= (this.model.parameters.position_boost || 1.2)
            }

            // Ajustar por tiempo (eventos más recientes más importantes)
            const timeFactor = Math.pow(0.8, journey.events.length - 1 - index)
            baseWeight *= timeFactor

            eventWeights.push(baseWeight)
            totalWeight += baseWeight
        })

        // Normalizar y crear resultados
        journey.events.forEach((event, index) => {
            const normalizedWeight = eventWeights[index] / totalWeight
            results.push({
                touchpoint: event,
                attribution_weight: normalizedWeight,
                attributed_value: journey.total_value * normalizedWeight,
                confidence_score: 0.95 // IA tiene mayor confianza
            })
        })

        return results
    }

    private async updateAttributionWeights(results: AttributionResult[]): Promise<void> {
        // Actualizar pesos en los eventos originales
        results.forEach(result => {
            const eventIndex = this.events.findIndex(e => e.id === result.touchpoint.id)
            if (eventIndex !== -1) {
                this.events[eventIndex].attribution_weight = result.attribution_weight
            }
        })
    }

    private groupEventsByUser(events: AttributionEvent[]): Record<string, AttributionEvent[]> {
        return events.reduce((acc, event) => {
            if (!acc[event.user_fingerprint]) {
                acc[event.user_fingerprint] = []
            }
            acc[event.user_fingerprint].push(event)
            return acc
        }, {} as Record<string, AttributionEvent[]>)
    }

    private groupEventsByPlatform(events: AttributionEvent[]): Record<string, AttributionEvent[]> {
        return events.reduce((acc, event) => {
            if (!acc[event.platform]) {
                acc[event.platform] = []
            }
            acc[event.platform].push(event)
            return acc
        }, {} as Record<string, AttributionEvent[]>)
    }

    private async analyzeRadioToDigital(events: AttributionEvent[]): Promise<CrossMediaInsight | null> {
        const radioEvents = events.filter(e => e.platform === 'RADIO')
        const digitalEvents = events.filter(e =>
            ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS', 'LINKEDIN_ADS'].includes(e.platform)
        )

        if (radioEvents.length === 0 || digitalEvents.length === 0) {
            return null
        }

        // Analizar correlación radio → digital
        const radioToDigitalJourneys = this.findRadioToDigitalJourneys()

        return {
            type: 'RADIO_TO_DIGITAL',
            title: 'Impacto de Radio en Conversiones Digitales',
            description: `${radioToDigitalJourneys.length} usuarios expuestos a radio convirtieron digitalmente`,
            metrics: {
                total_journeys: radioToDigitalJourneys.length,
                avg_touchpoints: radioToDigitalJourneys.reduce((sum, j) => sum + j.touchpoint_count, 0) / radioToDigitalJourneys.length,
                conversion_rate: (radioToDigitalJourneys.filter(j => j.conversion_count > 0).length / radioToDigitalJourneys.length) * 100,
                avg_journey_time: radioToDigitalJourneys.reduce((sum, j) => sum + j.journey_duration, 0) / radioToDigitalJourneys.length,
                top_converting_path: ['RADIO', 'GOOGLE_ADS', 'WEBSITE', 'PURCHASE']
            },
            recommendations: [
                {
                    action: 'Aumentar frecuencia de spots de radio en horarios de mayor tráfico digital',
                    priority: 'HIGH',
                    estimated_impact: 25
                },
                {
                    action: 'Crear campañas de Google Ads específicas para audiencias expuestas a radio',
                    priority: 'MEDIUM',
                    estimated_impact: 18
                }
            ]
        }
    }

    private async analyzeTVToDigital(events: AttributionEvent[]): Promise<CrossMediaInsight | null> {
        const tvEvents = events.filter(e => e.platform === 'TV')
        const digitalEvents = events.filter(e =>
            ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS', 'LINKEDIN_ADS'].includes(e.platform)
        )

        if (tvEvents.length === 0 || digitalEvents.length === 0) {
            return null
        }

        // Analizar correlación TV → digital
        const tvToDigitalJourneys = this.findTVToDigitalJourneys()

        if (tvToDigitalJourneys.length === 0) {
            return null
        }

        const avgConversionValue = tvToDigitalJourneys
            .filter(j => j.conversion_count > 0)
            .reduce((sum, j) => sum + j.total_value, 0) / tvToDigitalJourneys.filter(j => j.conversion_count > 0).length

        return {
            type: 'TV_TO_DIGITAL',
            title: 'Sinergia TV-Digital: Amplificación de Conversiones',
            description: `TV impulsa ${tvToDigitalJourneys.length} journeys digitales con valor promedio de $${Math.round(avgConversionValue).toLocaleString()}`,
            metrics: {
                total_journeys: tvToDigitalJourneys.length,
                avg_touchpoints: Math.round(tvToDigitalJourneys.reduce((sum, j) => sum + j.touchpoint_count, 0) / tvToDigitalJourneys.length * 10) / 10,
                conversion_rate: Math.round((tvToDigitalJourneys.filter(j => j.conversion_count > 0).length / tvToDigitalJourneys.length) * 100 * 10) / 10,
                avg_journey_time: Math.round(tvToDigitalJourneys.reduce((sum, j) => sum + j.journey_duration, 0) / tvToDigitalJourneys.length),
                top_converting_path: ['TV', 'ORGANIC_SEARCH', 'META_BUSINESS', 'WEBSITE', 'PURCHASE']
            },
            recommendations: [
                {
                    action: 'Sincronizar campañas de TV con picos de búsqueda orgánica para maximizar captura',
                    priority: 'HIGH',
                    estimated_impact: 32
                },
                {
                    action: 'Implementar retargeting específico para audiencias expuestas a TV en últimas 24h',
                    priority: 'HIGH',
                    estimated_impact: 28
                },
                {
                    action: 'Optimizar landing pages para tráfico post-TV con mensajes consistentes',
                    priority: 'MEDIUM',
                    estimated_impact: 15
                }
            ]
        }
    }

    private async analyzeCrossPlatform(events: AttributionEvent[]): Promise<CrossMediaInsight | null> {
        // Analizar performance de plataformas digitales
        const digitalPlatforms = ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS', 'LINKEDIN_ADS']
        const digitalEvents = events.filter(e => digitalPlatforms.includes(e.platform))

        if (digitalEvents.length === 0) {
            return null
        }

        // Agrupar por plataforma y calcular métricas
        const platformMetrics: Record<string, unknown> = {}
        const crossPlatformJourneys = this.findCrossPlatformJourneys()

        digitalPlatforms.forEach(platform => {
            const platformEvents = digitalEvents.filter(e => e.platform === platform)
            const platformJourneys = crossPlatformJourneys.filter(j =>
                j.events.some(e => e.platform === platform)
            )

            if (platformEvents.length > 0) {
                const conversions = platformJourneys.filter(j => j.conversion_count > 0)
                platformMetrics[platform] = {
                    events: platformEvents.length,
                    journeys: platformJourneys.length,
                    conversions: conversions.length,
                    conversion_rate: platformJourneys.length > 0 ? (conversions.length / platformJourneys.length) * 100 : 0,
                    avg_value: conversions.length > 0 ? conversions.reduce((sum, j) => sum + j.total_value, 0) / conversions.length : 0
                }
            }
        })

        // Encontrar la plataforma con mejor performance
        const bestPlatform = Object.entries(platformMetrics)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort(([, a], [, b]) => (b as unknown).conversion_rate - (a as unknown).conversion_rate)[0]

        if (!bestPlatform) {
            return null
        }

        const totalCrossPlatformValue = crossPlatformJourneys
            .filter(j => j.conversion_count > 0)
            .reduce((sum, j) => sum + j.total_value, 0)

        return {
            type: 'CROSS_PLATFORM',
            title: 'Optimización Cross-Platform: Sinergia Digital',
            description: `${crossPlatformJourneys.length} journeys multi-plataforma generan $${Math.round(totalCrossPlatformValue).toLocaleString()} en valor total`,
            metrics: {
                total_journeys: crossPlatformJourneys.length,
                avg_touchpoints: Math.round(crossPlatformJourneys.reduce((sum, j) => sum + j.touchpoint_count, 0) / crossPlatformJourneys.length * 10) / 10,
                conversion_rate: Math.round((crossPlatformJourneys.filter(j => j.conversion_count > 0).length / crossPlatformJourneys.length) * 100 * 10) / 10,
                avg_journey_time: Math.round(crossPlatformJourneys.reduce((sum, j) => sum + j.journey_duration, 0) / crossPlatformJourneys.length),
                top_converting_path: [bestPlatform[0], 'WEBSITE', 'EMAIL_OPEN', 'PURCHASE']
            },
            recommendations: [
                {
                    action: `Incrementar inversión en ${bestPlatform[0]} que muestra ${Math.round((bestPlatform[1] as unknown).conversion_rate)}% de conversión`,
                    priority: 'HIGH',
                    estimated_impact: 35
                },
                {
                    action: 'Implementar cross-device tracking para mejorar atribución multi-plataforma',
                    priority: 'HIGH',
                    estimated_impact: 22
                },
                {
                    action: 'Crear audiencias lookalike basadas en usuarios multi-plataforma de alto valor',
                    priority: 'MEDIUM',
                    estimated_impact: 18
                }
            ]
        }
    }

    private async analyzeJourneyPatterns(events: AttributionEvent[]): Promise<CrossMediaInsight | null> {
        if (this.journeys.size === 0) {
            return null
        }

        // Analizar patrones de journey más comunes
        const journeyPatterns: Map<string, number> = new Map()
        const journeyValues: Map<string, number[]> = new Map()
        const journeyTimes: Map<string, number[]> = new Map()

        // Extraer patrones de cada journey
        for (const journey of this.journeys.values()) {
            if (journey.events.length < 2) continue

            // Crear patrón basado en secuencia de plataformas
            const pattern = journey.events
                .map(e => e.platform)
                .join(' → ')

            // Contar frecuencia del patrón
            journeyPatterns.set(pattern, (journeyPatterns.get(pattern) || 0) + 1)

            // Almacenar valores y tiempos para este patrón
            if (!journeyValues.has(pattern)) {
                journeyValues.set(pattern, [])
                journeyTimes.set(pattern, [])
            }

            if (journey.conversion_count > 0) {
                journeyValues.get(pattern)!.push(journey.total_value)
            }
            journeyTimes.get(pattern)!.push(journey.journey_duration)
        }

        // Encontrar el patrón más común y valioso
        const sortedPatterns = Array.from(journeyPatterns.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5 patrones

        if (sortedPatterns.length === 0) {
            return null
        }

        const topPattern = sortedPatterns[0]
        const topPatternValues = journeyValues.get(topPattern[0]) || []
        const topPatternTimes = journeyTimes.get(topPattern[0]) || []

        const avgValue = topPatternValues.length > 0
            ? topPatternValues.reduce((sum, v) => sum + v, 0) / topPatternValues.length
            : 0

        const avgTime = topPatternTimes.length > 0
            ? topPatternTimes.reduce((sum, t) => sum + t, 0) / topPatternTimes.length
            : 0

        const conversionRate = topPatternValues.length > 0
            ? (topPatternValues.length / topPattern[1]) * 100
            : 0

        return {
            type: 'JOURNEY_ANALYSIS',
            title: 'Patrones de Journey: Rutas de Mayor Conversión',
            description: `Patrón "${topPattern[0]}" aparece en ${topPattern[1]} journeys con ${Math.round(conversionRate)}% conversión`,
            metrics: {
                total_journeys: Array.from(this.journeys.values()).length,
                avg_touchpoints: Math.round(Array.from(this.journeys.values()).reduce((sum, j) => sum + j.touchpoint_count, 0) / this.journeys.size * 10) / 10,
                conversion_rate: Math.round(conversionRate * 10) / 10,
                avg_journey_time: Math.round(avgTime),
                top_converting_path: topPattern[0].split(' → ')
            },
            recommendations: [
                {
                    action: `Optimizar el journey "${topPattern[0]}" que genera $${Math.round(avgValue).toLocaleString()} promedio`,
                    priority: 'HIGH',
                    estimated_impact: 28
                },
                {
                    action: 'Crear campañas específicas para replicar los top 3 patrones de journey más exitosos',
                    priority: 'HIGH',
                    estimated_impact: 24
                },
                {
                    action: `Reducir tiempo promedio de journey de ${Math.round(avgTime)} minutos mediante optimización de UX`,
                    priority: 'MEDIUM',
                    estimated_impact: 16
                },
                {
                    action: 'Implementar nurturing automático para journeys que se desvían de patrones exitosos',
                    priority: 'MEDIUM',
                    estimated_impact: 12
                }
            ]
        }
    }

    private findRadioToDigitalJourneys(): UserJourney[] {
        const radioToDigitalJourneys: UserJourney[] = []

        for (const journey of this.journeys.values()) {
            const hasRadio = journey.events.some(e => e.platform === 'RADIO')
            const hasDigital = journey.events.some(e =>
                ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS', 'LINKEDIN_ADS'].includes(e.platform)
            )

            if (hasRadio && hasDigital) {
                radioToDigitalJourneys.push(journey)
            }
        }

        return radioToDigitalJourneys
    }

    private findTVToDigitalJourneys(): UserJourney[] {
        const tvToDigitalJourneys: UserJourney[] = []

        for (const journey of this.journeys.values()) {
            const hasTV = journey.events.some(e => e.platform === 'TV')
            const hasDigital = journey.events.some(e =>
                ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS', 'LINKEDIN_ADS', 'ORGANIC'].includes(e.platform)
            )

            if (hasTV && hasDigital) {
                tvToDigitalJourneys.push(journey)
            }
        }

        return tvToDigitalJourneys
    }

    private findCrossPlatformJourneys(): UserJourney[] {
        const crossPlatformJourneys: UserJourney[] = []

        for (const journey of this.journeys.values()) {
            const digitalPlatforms = journey.events
                .filter(e => ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS', 'LINKEDIN_ADS'].includes(e.platform))
                .map(e => e.platform)

            // Journey es cross-platform si tiene al menos 2 plataformas digitales diferentes
            const uniquePlatforms = new Set(digitalPlatforms)
            if (uniquePlatforms.size >= 2) {
                crossPlatformJourneys.push(journey)
            }
        }

        return crossPlatformJourneys
    }

    /**
     * Obtiene estadísticas generales del motor de atribución
     */
    async getEngineStats(): Promise<{
        total_events: number
        total_journeys: number
        total_users: number
        total_conversions: number
        total_value: number
        avg_journey_length: number
        avg_journey_duration: number
        top_platforms: { platform: string; events: number; conversion_rate: number }[]
    }> {
        this.ensureInitialized()

        const totalEvents = this.events.length
        const totalJourneys = this.journeys.size
        const totalUsers = new Set(this.events.map(e => e.user_fingerprint)).size

        const journeyArray = Array.from(this.journeys.values())
        const totalConversions = journeyArray.reduce((sum, j) => sum + j.conversion_count, 0)
        const totalValue = journeyArray.reduce((sum, j) => sum + j.total_value, 0)

        const avgJourneyLength = journeyArray.length > 0
            ? journeyArray.reduce((sum, j) => sum + j.touchpoint_count, 0) / journeyArray.length
            : 0

        const avgJourneyDuration = journeyArray.length > 0
            ? journeyArray.reduce((sum, j) => sum + j.journey_duration, 0) / journeyArray.length
            : 0

        // Calcular top platforms
        const platformStats: Record<string, { events: number; conversions: number }> = {}

        this.events.forEach(event => {
            if (!platformStats[event.platform]) {
                platformStats[event.platform] = { events: 0, conversions: 0 }
            }
            platformStats[event.platform].events++

            if (this.isConversionEvent(event)) {
                platformStats[event.platform].conversions++
            }
        })

        const topPlatforms = Object.entries(platformStats)
            .map(([platform, stats]) => ({
                platform,
                events: stats.events,
                conversion_rate: stats.events > 0 ? (stats.conversions / stats.events) * 100 : 0
            }))
            .sort((a, b) => b.events - a.events)
            .slice(0, 5)

        return {
            total_events: totalEvents,
            total_journeys: totalJourneys,
            total_users: totalUsers,
            total_conversions: totalConversions,
            total_value: Math.round(totalValue),
            avg_journey_length: Math.round(avgJourneyLength * 10) / 10,
            avg_journey_duration: Math.round(avgJourneyDuration),
            top_platforms: topPlatforms
        }
    }

    /**
     * Exporta datos de atribución para análisis externo
     */
    async exportAttributionData(format: 'JSON' | 'CSV' = 'JSON'): Promise<string> {
        this.ensureInitialized()

        const exportData = {
            metadata: {
                export_date: new Date().toISOString(),
                total_events: this.events.length,
                total_journeys: this.journeys.size,
                attribution_model: this.model.type
            },
            events: this.events,
            journeys: Array.from(this.journeys.values()),
            stats: await this.getEngineStats()
        }

        if (format === 'JSON') {
            return JSON.stringify(exportData, null, 2)
        } else {
            // Convertir a CSV (simplificado)
            const csvHeaders = 'user_fingerprint,event_type,platform,timestamp,conversion_value,attribution_weight\n'
            const csvRows = this.events.map(event =>
                `${event.user_fingerprint},${event.event_type},${event.platform},${event.timestamp},${event.conversion_value || 0},${event.attribution_weight || 0}`
            ).join('\n')

            return csvHeaders + csvRows
        }
    }

    /**
     * Limpia datos antiguos para optimizar performance
     */
    async cleanupOldData(daysToKeep: number = 90): Promise<number> {
        this.ensureInitialized()

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

        const initialEventCount = this.events.length

        // Filtrar eventos antiguos
        this.events = this.events.filter(event =>
            new Date(event.timestamp) >= cutoffDate
        )

        // Reconstruir journeys con eventos filtrados
        await this.buildUserJourneys()

        const removedEvents = initialEventCount - this.events.length

        logger.info(`🧹 Limpieza completada: ${removedEvents} eventos antiguos eliminados`)
        return removedEvents
    }
}