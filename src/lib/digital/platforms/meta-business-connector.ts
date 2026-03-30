/**
 * META BUSINESS CONNECTOR - TIER 0 Supremacy
 * 
 * @description Conector unificado para Meta Business (Facebook + Instagram) con
 * capacidades avanzadas de gestión de campañas, optimización automática y
 * targeting de audiencias. Integración completa con Marketing API v18.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Digital Platforms Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { z } from 'zod'
import { logger } from '@/lib/observability';

// Interfaces para payloads de Meta Business API
// Meta API JSON response shape — external API boundary type
interface MetaApiResponse {
  id: string;
  data: unknown[];
  permissions?: Array<{ permission: string; status: string }>;
  [key: string]: unknown;
}

interface MetaCampaignPayload {
  name: string
  objective: string
  status: string
  buying_type: string
  bid_strategy: string
  access_token: string
  daily_budget?: number
  lifetime_budget?: number
  start_time?: string
  stop_time?: string
  special_ad_categories?: string[]
}

interface MetaAdSetPayload {
  name: string
  campaign_id: string
  status: string
  billing_event: string
  optimization_goal: string
  targeting: Record<string, unknown>
  access_token: string
  daily_budget?: number
  lifetime_budget?: number
  bid_amount?: number
  start_time?: string
  stop_time?: string
  adset_schedule?: Array<{ days: number[]; start_minute: number; end_minute: number }>
}

interface MetaAdPayload {
  name: string
  adset_id: string
  creative: {
    creative_id: string
  }
  status: string
  access_token: string
  url_tags?: string
}

interface MetaInsightsParams {
  fields: string
  time_range: string
  access_token: string
  breakdowns?: string
}

interface MetaCustomAudiencePayload {
  name: string
  description: string
  subtype: string
  rule: Record<string, unknown>
  access_token: string
  pixel_id?: string
}

// Esquemas de validación
const MetaBusinessConfigSchema = z.object({
  appId: z.string().min(1),
  appSecret: z.string().min(1),
  accessToken: z.string().min(1),
  adAccountId: z.string().min(1),
  businessId: z.string().min(1),
  pixelId: z.string().optional(),
  environment: z.enum(['production', 'sandbox']).default('production'),
  apiVersion: z.string().default('v18.0')
})

const MetaCampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  objective: z.enum([
    'AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'APP_PROMOTION',
    'SALES', 'REACH', 'BRAND_AWARENESS', 'LINK_CLICKS', 'POST_ENGAGEMENT',
    'PAGE_LIKES', 'EVENT_RESPONSES', 'MESSAGES', 'CONVERSIONS',
    'CATALOG_SALES', 'STORE_VISITS', 'VIDEO_VIEWS', 'LEAD_GENERATION'
  ]),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('ACTIVE'),
  buyingType: z.enum(['AUCTION', 'RESERVED']).default('AUCTION'),
  budget: z.object({
    dailyBudget: z.number().positive().optional(),
    lifetimeBudget: z.number().positive().optional(),
    currency: z.string().default('CLP'),
    budgetOptimization: z.boolean().default(true)
  }),
  bidStrategy: z.object({
    bidStrategy: z.enum(['LOWEST_COST_WITHOUT_CAP', 'LOWEST_COST_WITH_BID_CAP', 'TARGET_COST', 'COST_CAP']),
    bidAmount: z.number().optional(),
    targetCost: z.number().optional()
  }),
  schedule: z.object({
    startTime: z.string(),
    stopTime: z.string().optional(),
    timezone: z.string().default('America/Santiago')
  }).optional(),
  specialAdCategories: z.array(z.enum(['CREDIT', 'EMPLOYMENT', 'HOUSING', 'ISSUES_ELECTIONS_POLITICS'])).optional()
})

const MetaAdSetSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  name: z.string().min(1),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('ACTIVE'),
  billingEvent: z.enum(['IMPRESSIONS', 'CLICKS', 'ACTIONS', 'THRUPLAY', 'REACH']),
  optimizationGoal: z.enum([
    'REACH', 'IMPRESSIONS', 'CLICKS', 'ACTIONS', 'UNIQUE_ACTIONS',
    'OFFSITE_CONVERSIONS', 'SOCIAL_IMPRESSIONS', 'LINK_CLICKS',
    'POST_ENGAGEMENT', 'PAGE_LIKES', 'EVENT_RESPONSES', 'MESSAGES',
    'VIDEO_VIEWS', 'THRUPLAY', 'LANDING_PAGE_VIEWS', 'LEAD_GENERATION'
  ]),
  targeting: z.object({
    geoLocations: z.object({
      countries: z.array(z.string()).optional(),
      regions: z.array(z.object({
        key: z.string(),
        name: z.string()
      })).optional(),
      cities: z.array(z.object({
        key: z.string(),
        name: z.string(),
        radius: z.number().optional(),
        distanceUnit: z.enum(['mile', 'kilometer']).optional()
      })).optional(),
      locationTypes: z.array(z.enum(['home', 'recent', 'travel_in'])).optional()
    }).optional(),
    demographics: z.object({
      ageMin: z.number().min(13).max(65).optional(),
      ageMax: z.number().min(13).max(65).optional(),
      genders: z.array(z.enum(['male', 'female'])).optional()
    }).optional(),
    interests: z.array(z.object({
      id: z.string(),
      name: z.string()
    })).optional(),
    behaviors: z.array(z.object({
      id: z.string(),
      name: z.string()
    })).optional(),
    customAudiences: z.array(z.string()).optional(),
    lookalike: z.array(z.object({
      sourceId: z.string(),
      ratio: z.number().min(0.01).max(0.2),
      country: z.string()
    })).optional(),
    connections: z.object({
      friends: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional()
    }).optional(),
    devicePlatforms: z.array(z.enum(['mobile', 'desktop'])).optional(),
    publisherPlatforms: z.array(z.enum(['facebook', 'instagram', 'audience_network', 'messenger'])).optional(),
    facebookPositions: z.array(z.enum(['feed', 'right_hand_column', 'instant_article', 'instream_video', 'marketplace', 'story', 'search', 'video_feeds', 'groups_feed'])).optional(),
    instagramPositions: z.array(z.enum(['stream', 'story', 'explore', 'reels', 'shop'])).optional()
  }),
  budget: z.object({
    dailyBudget: z.number().positive().optional(),
    lifetimeBudget: z.number().positive().optional()
  }).optional(),
  bidAmount: z.number().optional(),
  schedule: z.object({
    startTime: z.string(),
    stopTime: z.string().optional(),
    adScheduling: z.array(z.object({
      days: z.array(z.number().min(0).max(6)),
      startMinute: z.number().min(0).max(1439),
      endMinute: z.number().min(0).max(1439)
    })).optional()
  }).optional()
})

const MetaAdSchema = z.object({
  id: z.string().optional(),
  adSetId: z.string(),
  name: z.string().min(1),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('ACTIVE'),
  creative: z.object({
    title: z.string().optional(),
    body: z.string().optional(),
    imageUrl: z.string().url().optional(),
    imageHash: z.string().optional(),
    videoId: z.string().optional(),
    linkUrl: z.string().url().optional(),
    linkDescription: z.string().optional(),
    callToActionType: z.enum([
      'OPEN_LINK', 'LIKE_PAGE', 'SHOP_NOW', 'PLAY_GAME', 'INSTALL_APP',
      'USE_APP', 'INSTALL_MOBILE_APP', 'USE_MOBILE_APP', 'BOOK_TRAVEL',
      'LISTEN_MUSIC', 'WATCH_VIDEO', 'LEARN_MORE', 'SIGN_UP', 'DOWNLOAD',
      'WATCH_MORE', 'NO_BUTTON', 'VISIT_PAGES_FEED', 'APPLY_NOW',
      'BUY_NOW', 'GET_OFFER', 'GET_OFFER_VIEW', 'BUY_TICKETS', 'UPDATE_APP',
      'GET_DIRECTIONS', 'BUY', 'MESSAGE_PAGE', 'SUBSCRIBE', 'SELL_NOW',
      'DONATE_NOW', 'GET_QUOTE', 'CONTACT_US', 'START_ORDER', 'CONTINUE_SHOPPING',
      'RECORD_NOW'
    ]).optional(),
    adFormat: z.enum([
      'SINGLE_IMAGE', 'SINGLE_VIDEO', 'CAROUSEL_IMAGE', 'CAROUSEL_VIDEO',
      'SLIDESHOW', 'COLLECTION', 'INSTANT_EXPERIENCE', 'DYNAMIC_CREATIVE'
    ]),
    carouselCards: z.array(z.object({
      imageUrl: z.string().url().optional(),
      imageHash: z.string().optional(),
      videoId: z.string().optional(),
      headline: z.string().optional(),
      description: z.string().optional(),
      linkUrl: z.string().url().optional()
    })).optional()
  }),
  tracking: z.object({
    urlTags: z.string().optional(),
    pixelId: z.string().optional(),
    conversionPixelId: z.string().optional(),
    customEvents: z.array(z.string()).optional()
  }).optional()
})

// Tipos TypeScript
export type MetaBusinessConfig = z.infer<typeof MetaBusinessConfigSchema>
export type MetaCampaign = z.infer<typeof MetaCampaignSchema>
export type MetaAdSet = z.infer<typeof MetaAdSetSchema>
export type MetaAd = z.infer<typeof MetaAdSchema>

export interface MetaMetrics {
  impressions: number
  clicks: number
  spend: number
  reach: number
  frequency: number
  ctr: number
  cpm: number
  cpc: number
  cpp: number
  actions: number
  costPerAction: number
  conversions: number
  conversionValue: number
  roas: number
  videoViews: number
  videoViewsP25: number
  videoViewsP50: number
  videoViewsP75: number
  videoViewsP100: number
  engagements: number
  linkClicks: number
  postEngagements: number
  pageEngagements: number
  date: string
}

export interface MetaInsight {
  campaignId?: string
  campaignName?: string
  adSetId?: string
  adSetName?: string
  adId?: string
  adName?: string
  metrics: MetaMetrics
  breakdown?: {
    age: string
    gender: string
    country: string
    region: string
    placement: string
    platform: string
    device: string
    hour: number
    dayOfWeek: string
  }
}

export interface MetaAudience {
  id: string
  name: string
  description: string
  type: 'CUSTOM' | 'LOOKALIKE' | 'SAVED'
  subtype: string
  size: number
  status: 'ACTIVE' | 'INACTIVE'
  createdTime: string
  updatedTime: string
  rule?: Record<string, unknown>
  sourceAudienceId?: string
  lookalikeSeed?: string
  ratio?: number
}

/**
 * Meta Business Connector TIER 0
 * Conector unificado para Facebook e Instagram
 */
export class MetaBusinessConnector {
  private config: MetaBusinessConfig
  private isConnected: boolean = false
  private apiBaseUrl: string

  constructor(config: MetaBusinessConfig) {
    this.config = MetaBusinessConfigSchema.parse(config)
    this.apiBaseUrl = `https://graph.facebook.com/${this.config.apiVersion}`
  }

  /**
   * Establece conexión con Meta Business API
   */
  async connect(): Promise<void> {
    try {
      logger.info('🔗 Conectando a Meta Business API...')
      
      // Validar access token
      await this.validateAccessToken()
      
      // Validar permisos
      await this.validatePermissions()
      
      this.isConnected = true
      logger.info('✅ Conectado exitosamente a Meta Business')
      
    } catch (error) {
      logger.error('Error conectando a Meta Business:', error instanceof Error ? error : undefined)
      throw new Error(`Failed to connect to Meta Business: ${error}`)
    }
  }

  /**
   * Desconecta de Meta Business API
   */
  async disconnect(): Promise<void> {
    this.isConnected = false
    logger.info('🔌 Desconectado de Meta Business')
  }

  /**
   * Crea una nueva campaña
   */
  async createCampaign(campaign: MetaCampaign): Promise<string> {
    this.ensureConnected()
    
    try {
      const validatedCampaign = MetaCampaignSchema.parse(campaign)
      
      const payload: MetaCampaignPayload = {
        name: validatedCampaign.name,
        objective: validatedCampaign.objective,
        status: validatedCampaign.status,
        buying_type: validatedCampaign.buyingType,
        bid_strategy: validatedCampaign.bidStrategy.bidStrategy,
        access_token: this.config.accessToken
      }

      // Agregar presupuesto
      if (validatedCampaign.budget.dailyBudget) {
        payload.daily_budget = validatedCampaign.budget.dailyBudget * 100 // Centavos
      }
      if (validatedCampaign.budget.lifetimeBudget) {
        payload.lifetime_budget = validatedCampaign.budget.lifetimeBudget * 100 // Centavos
      }

      // Agregar programación
      if (validatedCampaign.schedule) {
        payload.start_time = validatedCampaign.schedule.startTime
        if (validatedCampaign.schedule.stopTime) {
          payload.stop_time = validatedCampaign.schedule.stopTime
        }
      }

      // Agregar categorías especiales
      if (validatedCampaign.specialAdCategories) {
        payload.special_ad_categories = validatedCampaign.specialAdCategories
      }

      const response = await this.makeApiRequest(
        `act_${this.config.adAccountId}/campaigns`,
        'POST',
        payload
      )

      logger.info(`✅ Campaña Meta creada: ${response.id}`)
      return response.id
      
    } catch (error) {
      logger.error('Error creando campaña Meta:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea un nuevo ad set
   */
  async createAdSet(adSet: MetaAdSet): Promise<string> {
    this.ensureConnected()
    
    try {
      const validatedAdSet = MetaAdSetSchema.parse(adSet)
      
      const payload: MetaAdSetPayload = {
        name: validatedAdSet.name,
        campaign_id: validatedAdSet.campaignId,
        status: validatedAdSet.status,
        billing_event: validatedAdSet.billingEvent,
        optimization_goal: validatedAdSet.optimizationGoal,
        targeting: this.buildTargeting(validatedAdSet.targeting),
        access_token: this.config.accessToken
      }

      // Agregar presupuesto
      if (validatedAdSet.budget?.dailyBudget) {
        payload.daily_budget = validatedAdSet.budget.dailyBudget * 100
      }
      if (validatedAdSet.budget?.lifetimeBudget) {
        payload.lifetime_budget = validatedAdSet.budget.lifetimeBudget * 100
      }

      // Agregar bid amount
      if (validatedAdSet.bidAmount) {
        payload.bid_amount = validatedAdSet.bidAmount * 100
      }

      // Agregar programación
      if (validatedAdSet.schedule) {
        payload.start_time = validatedAdSet.schedule.startTime
        if (validatedAdSet.schedule.stopTime) {
          payload.stop_time = validatedAdSet.schedule.stopTime
        }
        if (validatedAdSet.schedule.adScheduling) {
          payload.adset_schedule = validatedAdSet.schedule.adScheduling
        }
      }

      const response = await this.makeApiRequest(
        `act_${this.config.adAccountId}/adsets`,
        'POST',
        payload
      )

      logger.info(`✅ Ad Set Meta creado: ${response.id}`)
      return response.id
      
    } catch (error) {
      logger.error('Error creando Ad Set Meta:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea un nuevo anuncio
   */
  async createAd(ad: MetaAd): Promise<string> {
    this.ensureConnected()
    
    try {
      const validatedAd = MetaAdSchema.parse(ad)
      
      // Primero crear el creative
      const creativeId = await this.createAdCreative(validatedAd.creative, validatedAd.adSetId)
      
      const payload: MetaAdPayload = {
        name: validatedAd.name,
        adset_id: validatedAd.adSetId,
        creative: { creative_id: creativeId },
        status: validatedAd.status,
        access_token: this.config.accessToken
      }

      // Agregar tracking
      if (validatedAd.tracking?.urlTags) {
        payload.url_tags = validatedAd.tracking.urlTags
      }

      const response = await this.makeApiRequest(
        `act_${this.config.adAccountId}/ads`,
        'POST',
        payload
      )

      logger.info(`✅ Anuncio Meta creado: ${response.id}`)
      return response.id
      
    } catch (error) {
      logger.error('Error creando anuncio Meta:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Obtiene insights/métricas
   */
  async getInsights(
    level: 'account' | 'campaign' | 'adset' | 'ad',
    objectId: string,
    dateRange: { since: string; until: string },
    breakdowns?: string[]
  ): Promise<MetaInsight[]> {
    this.ensureConnected()
    
    try {
      const fields = [
        'impressions', 'clicks', 'spend', 'reach', 'frequency',
        'ctr', 'cpm', 'cpc', 'cpp', 'actions', 'cost_per_action_type',
        'conversions', 'conversion_values', 'video_30_second_watched_actions',
        'video_p25_watched_actions', 'video_p50_watched_actions',
        'video_p75_watched_actions', 'video_p100_watched_actions'
      ].join(',')

      const params: MetaInsightsParams = {
        fields,
        time_range: JSON.stringify({
          since: dateRange.since,
          until: dateRange.until
        }),
        access_token: this.config.accessToken
      }

      if (breakdowns && breakdowns.length > 0) {
        params.breakdowns = breakdowns.join(',')
      }

      let endpoint: string
      switch (level) {
        case 'account':
          endpoint = `act_${this.config.adAccountId}/insights`
          break
        case 'campaign':
          endpoint = `${objectId}/insights`
          break
        case 'adset':
          endpoint = `${objectId}/insights`
          break
        case 'ad':
          endpoint = `${objectId}/insights`
          break
        default:
          throw new Error(`Invalid level: ${level}`)
      }

      const response = await this.makeApiRequest(endpoint, 'GET', params)
      
      return this.parseInsights(response.data, level)
      
    } catch (error) {
      logger.error('Error obteniendo insights Meta:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea audiencia personalizada
   */
  async createCustomAudience(
    name: string,
    description: string,
    rule: Record<string, unknown>,
    pixelId?: string
  ): Promise<string> {
    this.ensureConnected()
    
    try {
      const payload: MetaCustomAudiencePayload = {
        name,
        description,
        subtype: 'CUSTOM',
        rule,
        access_token: this.config.accessToken
      }

      if (pixelId) {
        payload.pixel_id = pixelId
      }

      const response = await this.makeApiRequest(
        `act_${this.config.adAccountId}/customaudiences`,
        'POST',
        payload
      )

      logger.info(`✅ Audiencia personalizada creada: ${response.id}`)
      return response.id
      
    } catch (error) {
      logger.error('Error creando audiencia personalizada:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea audiencia lookalike
   */
  async createLookalikeAudience(
    name: string,
    sourceAudienceId: string,
    targetCountry: string,
    ratio: number = 0.01
  ): Promise<string> {
    this.ensureConnected()
    
    try {
      const payload = {
        name,
        subtype: 'LOOKALIKE',
        lookalike_spec: {
          ratio,
          country: targetCountry,
          type: 'similarity'
        },
        origin_audience_id: sourceAudienceId,
        access_token: this.config.accessToken
      }

      const response = await this.makeApiRequest(
        `act_${this.config.adAccountId}/customaudiences`,
        'POST',
        payload
      )

      logger.info(`✅ Audiencia lookalike creada: ${response.id}`)
      return response.id
      
    } catch (error) {
      logger.error('Error creando audiencia lookalike:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Optimización automática con IA
   */
  async runAutomaticOptimization(campaignId: string): Promise<any[]> {
    this.ensureConnected()
    
    try {
      logger.info(`🤖 Ejecutando optimización automática Meta para campaña: ${campaignId}`)
      
      // 1. Obtener insights actuales
      const insights = await this.getInsights('campaign', campaignId, {
        since: this.getDateDaysAgo(30),
        until: this.getDateDaysAgo(1)
      })

      // 2. Analizar performance
      const optimizations = await this.analyzePerformanceAndOptimize(campaignId, insights)
      
      logger.info(`✅ Optimización Meta completada. ${optimizations.length} acciones realizadas`)
      return optimizations
      
    } catch (error) {
      logger.error('Error en optimización automática Meta:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  // Métodos privados

  private async validateAccessToken(): Promise<void> {
    try {
      await this.makeApiRequest('me', 'GET', {
        fields: 'id,name',
        access_token: this.config.accessToken
      })
    } catch (error) {
      throw new Error(`Invalid access token: ${error}`)
    }
  }

  private async validatePermissions(): Promise<void> {
    try {
      const response = await this.makeApiRequest('me/permissions', 'GET', {
        access_token: this.config.accessToken
      })

      const requiredPermissions = [
        'ads_management',
        'ads_read',
        'business_management'
      ]

      const grantedPermissions = (response.permissions as Array<{ permission: string; status: string }>)
        .filter((perm) => perm.status === 'granted')
        .map((perm) => perm.permission)

      const missingPermissions = requiredPermissions.filter(
        perm => !grantedPermissions.includes(perm)
      )

      if (missingPermissions.length > 0) {
        throw new Error(`Missing permissions: ${missingPermissions.join(', ')}`)
      }
    } catch (error) {
      throw new Error(`Permission validation failed: ${error}`)
    }
  }

  // External API boundary — Meta API response is dynamically shaped
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async makeApiRequest(endpoint: string, method: string, params?: Record<string, any>): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`
    
    let requestUrl = url
    let body: string | undefined

    if (method === 'GET' && params) {
      const searchParams = new URLSearchParams(params as Record<string, string>)
      requestUrl = `${url}?${searchParams.toString()}`
    } else if (method === 'POST' && params) {
      body = new URLSearchParams(params as Record<string, string>).toString()
    }

    const response = await fetch(requestUrl, {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Meta API request failed: ${response.status} ${errorText}`)
    }

    return await response.json()
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to Meta Business. Call connect() first.')
    }
  }

  private buildTargeting(targeting: MetaAdSet['targeting']): Record<string, unknown> {
    const targetingSpec: Record<string, unknown> = {}

    if (targeting.geoLocations) {
      targetingSpec.geo_locations = {}
      
      if (targeting.geoLocations.countries) {
        targetingSpec.geo_locations.countries = targeting.geoLocations.countries
      }
      
      if (targeting.geoLocations.regions) {
        targetingSpec.geo_locations.regions = targeting.geoLocations.regions
      }
      
      if (targeting.geoLocations.cities) {
        targetingSpec.geo_locations.cities = targeting.geoLocations.cities
      }
      
      if (targeting.geoLocations.locationTypes) {
        targetingSpec.geo_locations.location_types = targeting.geoLocations.locationTypes
      }
    }

    if (targeting.demographics) {
      if (targeting.demographics.ageMin) {
        targetingSpec.age_min = targeting.demographics.ageMin
      }
      if (targeting.demographics.ageMax) {
        targetingSpec.age_max = targeting.demographics.ageMax
      }
      if (targeting.demographics.genders) {
        targetingSpec.genders = targeting.demographics.genders.map(g => g === 'male' ? 1 : 2)
      }
    }

    if (targeting.interests) {
      targetingSpec.interests = targeting.interests.map(i => ({ id: i.id, name: i.name }))
    }

    if (targeting.behaviors) {
      targetingSpec.behaviors = targeting.behaviors.map(b => ({ id: b.id, name: b.name }))
    }

    if (targeting.customAudiences) {
      targetingSpec.custom_audiences = targeting.customAudiences.map(id => ({ id }))
    }

    if (targeting.devicePlatforms) {
      targetingSpec.device_platforms = targeting.devicePlatforms
    }

    if (targeting.publisherPlatforms) {
      targetingSpec.publisher_platforms = targeting.publisherPlatforms
    }

    if (targeting.facebookPositions) {
      targetingSpec.facebook_positions = targeting.facebookPositions
    }

    if (targeting.instagramPositions) {
      targetingSpec.instagram_positions = targeting.instagramPositions
    }

    return targetingSpec
  }

  private async createAdCreative(creative: MetaAd['creative'], adSetId: string): Promise<string> {
    const payload: Record<string, unknown> = {
      name: `Creative for AdSet ${adSetId}`,
      access_token: this.config.accessToken
    }

    switch (creative.adFormat) {
      case 'SINGLE_IMAGE':
        payload.object_story_spec = {
          page_id: this.config.businessId,
          link_data: {
            image_hash: creative.imageHash,
            link: creative.linkUrl,
            message: creative.body,
            name: creative.title,
            description: creative.linkDescription,
            call_to_action: creative.callToActionType ? {
              type: creative.callToActionType,
              value: { link: creative.linkUrl }
            } : undefined
          }
        }
        break

      case 'SINGLE_VIDEO':
        payload.object_story_spec = {
          page_id: this.config.businessId,
          video_data: {
            video_id: creative.videoId,
            message: creative.body,
            title: creative.title,
            call_to_action: creative.callToActionType ? {
              type: creative.callToActionType,
              value: { link: creative.linkUrl }
            } : undefined
          }
        }
        break

      case 'CAROUSEL_IMAGE':
        payload.object_story_spec = {
          page_id: this.config.businessId,
          link_data: {
            link: creative.linkUrl,
            message: creative.body,
            child_attachments: creative.carouselCards?.map(card => ({
              link: card.linkUrl,
              image_hash: card.imageHash,
              name: card.headline,
              description: card.description
            }))
          }
        }
        break

      default:
        throw new Error(`Unsupported ad format: ${creative.adFormat}`)
    }

    const response = await this.makeApiRequest(
      `act_${this.config.adAccountId}/adcreatives`,
      'POST',
      payload
    )

    return response.id
  }

  private parseInsights(data: Array<Record<string, unknown>>, level: string): MetaInsight[] {
    type ActionItem = { action_type: string; value: string };
    type ValueItem = { value: string };
    return data.map(item => {
      const actions = (item.actions as ActionItem[]) ?? [];
      const conversions = (item.conversions as ValueItem[]) ?? [];
      const conversionValues = (item.conversion_values as ValueItem[]) ?? [];
      const costPerActionType = (item.cost_per_action_type as ValueItem[]) ?? [];
      return {
        campaignId: item.campaign_id as string | undefined,
        campaignName: item.campaign_name as string | undefined,
        adSetId: item.adset_id as string | undefined,
        adSetName: item.adset_name as string | undefined,
        adId: item.ad_id as string | undefined,
        adName: item.ad_name as string | undefined,
        metrics: {
          impressions: parseInt(item.impressions as string) || 0,
          clicks: parseInt(item.clicks as string) || 0,
          spend: parseFloat(item.spend as string) || 0,
          reach: parseInt(item.reach as string) || 0,
          frequency: parseFloat(item.frequency as string) || 0,
          ctr: parseFloat(item.ctr as string) || 0,
          cpm: parseFloat(item.cpm as string) || 0,
          cpc: parseFloat(item.cpc as string) || 0,
          cpp: parseFloat(item.cpp as string) || 0,
          actions: this.sumActions(actions),
          costPerAction: this.calculateCostPerAction(costPerActionType),
          conversions: this.sumConversions(conversions),
          conversionValue: parseFloat(conversionValues[0]?.value) || 0,
          roas: this.calculateRoas(item.spend as string, conversionValues),
          videoViews: this.getVideoViews(item, '30_second_watched'),
          videoViewsP25: this.getVideoViews(item, 'p25_watched'),
          videoViewsP50: this.getVideoViews(item, 'p50_watched'),
          videoViewsP75: this.getVideoViews(item, 'p75_watched'),
          videoViewsP100: this.getVideoViews(item, 'p100_watched'),
          engagements: this.sumEngagements(actions),
          linkClicks: this.getActionValue(actions, 'link_click'),
          postEngagements: this.getActionValue(actions, 'post_engagement'),
          pageEngagements: this.getActionValue(actions, 'page_engagement'),
          date: item.date_start as string
        }
      };
    })
  }

  private async analyzePerformanceAndOptimize(campaignId: string, insights: MetaInsight[]): Promise<unknown[]> {
    const optimizations: unknown[] = []
    
    // Análisis básico de performance
    const avgCtr = insights.reduce((sum, i) => sum + i.metrics.ctr, 0) / insights.length
    const avgCpm = insights.reduce((sum, i) => sum + i.metrics.cpm, 0) / insights.length
    
    // Optimizaciones basadas en thresholds
    if (avgCtr < 1.0) {
      optimizations.push({
        type: 'LOW_CTR',
        action: 'Revisar creatividades y targeting',
        value: avgCtr
      })
    }
    
    if (avgCpm > 10000) { // 10,000 CLP
      optimizations.push({
        type: 'HIGH_CPM',
        action: 'Ajustar targeting o bid strategy',
        value: avgCpm
      })
    }
    
    return optimizations
  }

  private sumActions(actions: Array<{ action_type: string; value: string }>): number {
    return actions?.reduce((sum, action) => sum + parseInt(action.value), 0) || 0
  }

  private sumConversions(conversions: Array<{ value: string }>): number {
    return conversions?.reduce((sum, conv) => sum + parseFloat(conv.value), 0) || 0
  }

  private calculateCostPerAction(costPerActionType: Array<{ value: string }>): number {
    return costPerActionType?.[0]?.value ? parseFloat(costPerActionType[0].value) : 0
  }

  private calculateRoas(spend: string, conversionValues: Array<{ value: string }>): number {
    const spendValue = parseFloat(spend) || 0
    const convValue = conversionValues?.[0]?.value ? parseFloat(conversionValues[0].value) : 0
    return spendValue > 0 ? convValue / spendValue : 0
  }

  private getVideoViews(item: Record<string, unknown>, type: string): number {
    const videoActions = item[`video_${type}_actions`] as Array<{ value: string }> | undefined
    return videoActions?.[0]?.value ? parseInt(videoActions[0].value) : 0
  }

  private sumEngagements(actions: Array<{ action_type: string; value: string }>): number {
    const engagementTypes = ['post_engagement', 'page_engagement', 'like', 'comment', 'share']
    return actions?.filter(action => engagementTypes.includes(action.action_type))
      .reduce((sum, action) => sum + parseInt(action.value), 0) || 0
  }

  private getActionValue(actions: Array<{ action_type: string; value: string }>, actionType: string): number {
    const action = actions?.find(a => a.action_type === actionType)
    return action ? parseInt(action.value) : 0
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }
}

// Instancia singleton para uso global
let metaBusinessConnectorInstance: MetaBusinessConnector | null = null

export function getMetaBusinessConnector(config?: MetaBusinessConfig): MetaBusinessConnector {
  if (!metaBusinessConnectorInstance && config) {
    metaBusinessConnectorInstance = new MetaBusinessConnector(config)
  }
  
  if (!metaBusinessConnectorInstance) {
    throw new Error('Meta Business Connector not initialized. Provide config first.')
  }
  
  return metaBusinessConnectorInstance
}