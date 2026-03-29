/**
 * TIKTOK ADS CONNECTOR - TIER 0 Supremacy
 * 
 * @description Conector nativo para TikTok Ads con capacidades mobile-first,
 * optimización automática y targeting de audiencias Gen Z/Millennial.
 * Integración completa con TikTok Marketing API v1.3.
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

// TikTok API JSON response shape — external API boundary type
interface TikTokApiResponse {
  code: number;
  message?: string;
  data?: {
    campaign_id?: string;
    adgroup_id?: string;
    ad_id?: string;
    custom_audience_id?: string;
    list?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Interfaces para payloads de TikTok Ads API
interface TikTokCampaignPayload {
  advertiser_id: string
  campaign_name: string
  objective_type: string
  campaign_type: string
  budget: number
  budget_mode: string
  operation_status: string
  schedule_type: string
  schedule_start_time?: string
  schedule_end_time?: string
  bid?: number
  special_industries?: string[]
}

interface TikTokAdGroupPayload {
  advertiser_id: string
  campaign_id: string
  adgroup_name: string
  operation_status: string
  optimization_goal: string
  budget: number
  budget_mode: string
  schedule_type: string
  bid?: number
  schedule_start_time?: string
  schedule_end_time?: string
  targeting?: Record<string, unknown>
  frequency_cap?: number
  frequency_schedule?: string
  dayparting?: unknown[]
}

interface TikTokAdPayload {
  advertiser_id: string
  adgroup_id: string
  ad_name: string
  operation_status: string
  ad_format: string
  creative_type: string
  landing_page_url: string
  ad_text: string
  call_to_action: string
  display_name?: string
  profile_image?: string
  video_id?: string
  image_ids?: string[]
  carousel_image_ids?: string[]
  click_tracking_url?: string
  impression_tracking_url?: string
  pixel_id?: string
  brand_safety_type?: string
  brand_safety_partner?: string
}

// Esquemas de validación
const TikTokAdsConfigSchema = z.object({
  appId: z.string().min(1),
  secret: z.string().min(1),
  accessToken: z.string().min(1),
  advertiserId: z.string().min(1),
  environment: z.enum(['production', 'sandbox']).default('production'),
  apiVersion: z.string().default('v1.3')
})

const TikTokCampaignSchema = z.object({
  id: z.string().optional(),
  campaignName: z.string().min(1),
  objective: z.enum([
    'REACH', 'TRAFFIC', 'VIDEO_VIEW', 'LEAD_GENERATION', 'ENGAGEMENT',
    'APP_PROMOTION', 'WEB_CONVERSIONS', 'PRODUCT_SALES', 'SHOP_PURCHASES',
    'RF_REACH', 'RF_TRAFFIC', 'RF_VIDEO_VIEW'
  ]),
  campaignType: z.enum(['REGULAR_CAMPAIGN', 'IOS14_CAMPAIGN', 'SPARK_ADS']).default('REGULAR_CAMPAIGN'),
  status: z.enum(['ENABLE', 'DISABLE', 'DELETE']).default('ENABLE'),
  budget: z.number().positive(),
  budgetMode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']),
  bidType: z.enum(['BID_TYPE_NO_BID', 'BID_TYPE_CUSTOM']).default('BID_TYPE_NO_BID'),
  scheduleType: z.enum(['SCHEDULE_FROM_NOW', 'SCHEDULE_START_END']).default('SCHEDULE_FROM_NOW'),
  scheduleStartTime: z.string().optional(),
  scheduleEndTime: z.string().optional(),
  deepBidType: z.enum(['BID_TYPE_AUTO', 'BID_TYPE_MANUAL']).optional(),
  bid: z.number().optional(),
  specialIndustries: z.array(z.enum(['HOUSING', 'EMPLOYMENT', 'CREDIT'])).optional()
})

const TikTokAdGroupSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  adgroupName: z.string().min(1),
  status: z.enum(['ENABLE', 'DISABLE', 'DELETE']).default('ENABLE'),
  optimizationGoal: z.enum([
    'CLICK', 'REACH', 'IMPRESSION', 'VIDEO_VIEW_6S', 'COMPLETE_PAYMENT',
    'INSTALL', 'LAUNCH_APP', 'REGISTRATION', 'PURCHASE', 'ADD_TO_CART',
    'PAGE_VIEW', 'INITIATE_CHECKOUT', 'ADD_PAYMENT_INFO', 'COMPLETE_PAYMENT_ROAS',
    'VALUE_ADDED', 'ENGAGED_VIEW'
  ]),
  billingEvent: z.enum(['CPC', 'CPM', 'CPA', 'CPV']),
  bidType: z.enum(['BID_TYPE_AUTO', 'BID_TYPE_MANUAL']),
  bid: z.number().optional(),
  budget: z.number().positive(),
  budgetMode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']),
  scheduleType: z.enum(['SCHEDULE_FROM_NOW', 'SCHEDULE_START_END']).default('SCHEDULE_FROM_NOW'),
  scheduleStartTime: z.string().optional(),
  scheduleEndTime: z.string().optional(),
  targeting: z.object({
    locations: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['COUNTRY', 'REGION', 'CITY'])
    })).optional(),
    demographics: z.object({
      ageGroups: z.array(z.enum(['AGE_13_17', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_PLUS'])).optional(),
      genders: z.array(z.enum(['MALE', 'FEMALE'])).optional(),
      languages: z.array(z.string()).optional()
    }).optional(),
    interests: z.array(z.object({
      interestCategoryId: z.string(),
      interestKeywordId: z.string().optional()
    })).optional(),
    behaviors: z.array(z.object({
      behaviorCategoryId: z.string(),
      behaviorId: z.string()
    })).optional(),
    deviceModels: z.array(z.string()).optional(),
    operatingSystems: z.array(z.enum(['ANDROID', 'IOS'])).optional(),
    networkTypes: z.array(z.enum(['2G', '3G', '4G', '5G', 'WIFI'])).optional(),
    carriers: z.array(z.string()).optional(),
    placements: z.array(z.enum(['PLACEMENT_TIKTOK', 'PLACEMENT_PANGLE', 'PLACEMENT_GLOBAL_APP_BUNDLE'])).optional(),
    excludedCustomAudiences: z.array(z.string()).optional(),
    includedCustomAudiences: z.array(z.string()).optional(),
    lookalikeSimilarAudiences: z.array(z.object({
      customAudienceId: z.string(),
      lookalikeSimilarType: z.enum(['LOOKALIKE_SIMILAR_TYPE_1_PERCENT', 'LOOKALIKE_SIMILAR_TYPE_5_PERCENT', 'LOOKALIKE_SIMILAR_TYPE_10_PERCENT'])
    })).optional()
  }).optional(),
  conversionWindow: z.enum(['WINDOW_1D', 'WINDOW_7D', 'WINDOW_15D', 'WINDOW_30D']).optional(),
  attributionWindow: z.enum(['ATTRIBUTION_WINDOW_1D_1D', 'ATTRIBUTION_WINDOW_1D_7D', 'ATTRIBUTION_WINDOW_7D_1D', 'ATTRIBUTION_WINDOW_7D_7D']).optional(),
  frequencyCap: z.object({
    frequency: z.number().min(1).max(10),
    interval: z.enum(['LIFETIME', 'DAY', 'HOUR'])
  }).optional(),
  dayparting: z.array(z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startHour: z.number().min(0).max(23),
    endHour: z.number().min(0).max(23)
  })).optional()
})

const TikTokAdSchema = z.object({
  id: z.string().optional(),
  adgroupId: z.string(),
  adName: z.string().min(1),
  status: z.enum(['ENABLE', 'DISABLE', 'DELETE']).default('ENABLE'),
  adFormat: z.enum(['SINGLE_IMAGE', 'SINGLE_VIDEO', 'CAROUSEL', 'SPARK_AD', 'COLLECTION']),
  creativeType: z.enum(['CUSTOM_CREATIVE', 'DYNAMIC_CREATIVE', 'SPARK_CREATIVE']),
  landingPageUrl: z.string().url(),
  displayName: z.string().optional(),
  profileImage: z.string().optional(),
  adText: z.string().max(100),
  callToAction: z.enum([
    'LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'DOWNLOAD', 'BOOK_NOW',
    'GET_OFFER', 'CONTACT_US', 'APPLY_NOW', 'WATCH_MORE', 'PLAY_GAME',
    'INSTALL_NOW', 'USE_APP', 'ORDER_NOW', 'VIEW_DETAILS'
  ]),
  creativeAssets: z.object({
    videos: z.array(z.object({
      videoId: z.string(),
      videoUrl: z.string().url().optional(),
      duration: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional()
    })).optional(),
    images: z.array(z.object({
      imageId: z.string(),
      imageUrl: z.string().url().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional()
    })).optional(),
    carouselCards: z.array(z.object({
      imageId: z.string(),
      videoId: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      landingPageUrl: z.string().url().optional()
    })).optional()
  }),
  trackingInfo: z.object({
    clickTrackingUrl: z.string().url().optional(),
    impressionTrackingUrl: z.string().url().optional(),
    videoViewTrackingUrl: z.string().url().optional(),
    pixelId: z.string().optional(),
    pixelCode: z.string().optional()
  }).optional(),
  brandSafety: z.object({
    brandSafetyType: z.enum(['NO_BRAND_SAFETY', 'STANDARD_INVENTORY', 'LIMITED_INVENTORY']).default('STANDARD_INVENTORY'),
    brandSafetyPartner: z.enum(['OPEN_SLATE', 'IAS', 'DOUBLE_VERIFY']).optional()
  }).optional()
})

// Tipos TypeScript
export type TikTokAdsConfig = z.infer<typeof TikTokAdsConfigSchema>
export type TikTokCampaign = z.infer<typeof TikTokCampaignSchema>
export type TikTokAdGroup = z.infer<typeof TikTokAdGroupSchema>
export type TikTokAd = z.infer<typeof TikTokAdSchema>

export interface TikTokMetrics {
  impressions: number
  clicks: number
  spend: number
  reach: number
  ctr: number
  cpm: number
  cpc: number
  conversions: number
  conversionRate: number
  costPerConversion: number
  videoViews: number
  videoViewRate: number
  videoWatchedP25: number
  videoWatchedP50: number
  videoWatchedP75: number
  videoWatchedP100: number
  engagements: number
  shares: number
  comments: number
  likes: number
  profileVisits: number
  follows: number
  date: string
}

export interface TikTokReport {
  campaignId?: string
  campaignName?: string
  adgroupId?: string
  adgroupName?: string
  adId?: string
  adName?: string
  metrics: TikTokMetrics
  dimensions?: {
    age: string
    gender: string
    country: string
    platform: string
    placement: string
    hour: number
    dayOfWeek: string
  }
}

export interface TikTokAudience {
  customAudienceId: string
  customAudienceName: string
  audienceType: 'CUSTOMER_FILE' | 'PIXEL' | 'MOBILE_APP' | 'ENGAGEMENT'
  audienceSize: number
  status: 'PENDING' | 'READY' | 'FAILED'
  createTime: string
  updateTime: string
  rule?: Record<string, unknown>
  retentionInDays: number
}

/**
 * TikTok Ads Connector TIER 0
 * Conector mobile-first para TikTok Ads
 */
export class TikTokAdsConnector {
  private config: TikTokAdsConfig
  private isConnected: boolean = false
  private apiBaseUrl: string

  constructor(config: TikTokAdsConfig) {
    this.config = TikTokAdsConfigSchema.parse(config)
    this.apiBaseUrl = `https://business-api.tiktok.com/open_api/${this.config.apiVersion}`
  }

  /**
   * Establece conexión con TikTok Ads API
   */
  async connect(): Promise<void> {
    try {
      logger.info('🔗 Conectando a TikTok Ads API...')
      
      // Validar access token
      await this.validateAccessToken()
      
      // Obtener información del advertiser
      await this.getAdvertiserInfo()
      
      this.isConnected = true
      logger.info('✅ Conectado exitosamente a TikTok Ads')
      
    } catch (error) {
      logger.error('Error conectando a TikTok Ads:', error instanceof Error ? error : undefined)
      throw new Error(`Failed to connect to TikTok Ads: ${error}`)
    }
  }

  /**
   * Desconecta de TikTok Ads API
   */
  async disconnect(): Promise<void> {
    this.isConnected = false
    logger.info('🔌 Desconectado de TikTok Ads')
  }

  /**
   * Crea una nueva campaña
   */
  async createCampaign(campaign: TikTokCampaign): Promise<string> {
    this.ensureConnected()
    
    try {
      const validatedCampaign = TikTokCampaignSchema.parse(campaign)
      
      const payload: TikTokCampaignPayload = {
        advertiser_id: this.config.advertiserId,
        campaign_name: validatedCampaign.campaignName,
        objective_type: validatedCampaign.objective,
        campaign_type: validatedCampaign.campaignType,
        operation_status: validatedCampaign.status,
        budget: validatedCampaign.budget,
        budget_mode: validatedCampaign.budgetMode,
        schedule_type: validatedCampaign.scheduleType
      }

      // Agregar programación si está definida
      if (validatedCampaign.scheduleStartTime) {
        payload.schedule_start_time = validatedCampaign.scheduleStartTime
      }
      if (validatedCampaign.scheduleEndTime) {
        payload.schedule_end_time = validatedCampaign.scheduleEndTime
      }

      // Agregar bid si está definido
      if (validatedCampaign.bid) {
        payload.bid = validatedCampaign.bid
      }

      // Agregar industrias especiales
      if (validatedCampaign.specialIndustries) {
        payload.special_industries = validatedCampaign.specialIndustries
      }

      const response = await this.makeApiRequest('campaign/create/', 'POST', payload)

      if (response.code !== 0) {
        throw new Error(`TikTok API Error: ${response.message}`)
      }

      const campaignId = response.data.campaign_id
      logger.info(`✅ Campaña TikTok creada: ${campaignId}`)
      return campaignId
      
    } catch (error) {
      logger.error('Error creando campaña TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea un nuevo ad group
   */
  async createAdGroup(adGroup: TikTokAdGroup): Promise<string> {
    this.ensureConnected()
    
    try {
      const validatedAdGroup = TikTokAdGroupSchema.parse(adGroup)
      
      const payload: TikTokAdGroupPayload = {
        advertiser_id: this.config.advertiserId,
        campaign_id: validatedAdGroup.campaignId,
        adgroup_name: validatedAdGroup.adgroupName,
        operation_status: validatedAdGroup.status,
        optimization_goal: validatedAdGroup.optimizationGoal,
        budget: validatedAdGroup.budget,
        budget_mode: validatedAdGroup.budgetMode,
        schedule_type: validatedAdGroup.scheduleType
      }

      // Agregar bid si está definido
      if (validatedAdGroup.bid) {
        payload.bid = validatedAdGroup.bid
      }

      // Agregar programación
      if (validatedAdGroup.scheduleStartTime) {
        payload.schedule_start_time = validatedAdGroup.scheduleStartTime
      }
      if (validatedAdGroup.scheduleEndTime) {
        payload.schedule_end_time = validatedAdGroup.scheduleEndTime
      }

      // Agregar targeting
      if (validatedAdGroup.targeting) {
        payload.targeting = this.buildTargeting(validatedAdGroup.targeting)
      }

      // Agregar frequency cap
      if (validatedAdGroup.frequencyCap) {
        payload.frequency_cap = validatedAdGroup.frequencyCap.frequency
        payload.frequency_schedule = validatedAdGroup.frequencyCap.interval
      }

      // Agregar dayparting
      if (validatedAdGroup.dayparting) {
        payload.dayparting = validatedAdGroup.dayparting.map(dp => ({
          day: dp.dayOfWeek,
          start_hour: dp.startHour,
          end_hour: dp.endHour
        }))
      }

      const response = await this.makeApiRequest('adgroup/create/', 'POST', payload)

      if (response.code !== 0) {
        throw new Error(`TikTok API Error: ${response.message}`)
      }

      const adGroupId = response.data.adgroup_id
      logger.info(`✅ Ad Group TikTok creado: ${adGroupId}`)
      return adGroupId
      
    } catch (error) {
      logger.error('Error creando Ad Group TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea un nuevo anuncio
   */
  async createAd(ad: TikTokAd): Promise<string> {
    this.ensureConnected()
    
    try {
      const validatedAd = TikTokAdSchema.parse(ad)
      
      const payload: TikTokAdPayload = {
        advertiser_id: this.config.advertiserId,
        adgroup_id: validatedAd.adgroupId,
        ad_name: validatedAd.adName,
        operation_status: validatedAd.status,
        ad_format: validatedAd.adFormat,
        creative_type: validatedAd.creativeType,
        landing_page_url: validatedAd.landingPageUrl,
        ad_text: validatedAd.adText,
        call_to_action: validatedAd.callToAction
      }

      // Agregar display name si está definido
      if (validatedAd.displayName) {
        payload.display_name = validatedAd.displayName
      }

      // Agregar profile image si está definido
      if (validatedAd.profileImage) {
        payload.profile_image = validatedAd.profileImage
      }

      // Agregar creative assets
      if (validatedAd.creativeAssets.videos && validatedAd.creativeAssets.videos.length > 0) {
        payload.video_id = validatedAd.creativeAssets.videos[0].videoId
      }

      if (validatedAd.creativeAssets.images && validatedAd.creativeAssets.images.length > 0) {
        payload.image_ids = validatedAd.creativeAssets.images.map(img => img.imageId)
      }

      // Agregar carousel cards si están definidas
      if (validatedAd.creativeAssets.carouselCards && validatedAd.creativeAssets.carouselCards.length > 0) {
        payload.carousel_image_ids = validatedAd.creativeAssets.carouselCards.map(card => card.imageId)
      }

      // Agregar tracking info
      if (validatedAd.trackingInfo) {
        if (validatedAd.trackingInfo.clickTrackingUrl) {
          payload.click_tracking_url = validatedAd.trackingInfo.clickTrackingUrl
        }
        if (validatedAd.trackingInfo.impressionTrackingUrl) {
          payload.impression_tracking_url = validatedAd.trackingInfo.impressionTrackingUrl
        }
        if (validatedAd.trackingInfo.pixelId) {
          payload.pixel_id = validatedAd.trackingInfo.pixelId
        }
      }

      // Agregar brand safety
      if (validatedAd.brandSafety) {
        payload.brand_safety_type = validatedAd.brandSafety.brandSafetyType
        if (validatedAd.brandSafety.brandSafetyPartner) {
          payload.brand_safety_partner = validatedAd.brandSafety.brandSafetyPartner
        }
      }

      const response = await this.makeApiRequest('ad/create/', 'POST', payload)

      if (response.code !== 0) {
        throw new Error(`TikTok API Error: ${response.message}`)
      }

      const adId = response.data.ad_id
      logger.info(`✅ Anuncio TikTok creado: ${adId}`)
      return adId
      
    } catch (error) {
      logger.error('Error creando anuncio TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Obtiene reportes/métricas
   */
  async getReports(
    level: 'AUCTION_CAMPAIGN' | 'AUCTION_ADGROUP' | 'AUCTION_AD',
    objectIds: string[],
    dateRange: { startDate: string; endDate: string },
    dimensions?: string[]
  ): Promise<TikTokReport[]> {
    this.ensureConnected()
    
    try {
      const payload = {
        advertiser_id: this.config.advertiserId,
        report_type: level,
        data_level: level,
        dimensions: dimensions || ['stat_time_day'],
        metrics: [
          'impressions', 'clicks', 'spend', 'reach', 'ctr', 'cpm', 'cpc',
          'conversion', 'conversion_rate', 'cost_per_conversion',
          'video_play_actions', 'video_watched_2s', 'video_watched_6s',
          'video_view_rate', 'video_watched_p25', 'video_watched_p50',
          'video_watched_p75', 'video_watched_p100',
          'engagement', 'shares', 'comments', 'likes',
          'profile_visits', 'follows'
        ],
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        filters: this.buildFilters(level, objectIds),
        page: 1,
        page_size: 1000
      }

      const response = await this.makeApiRequest('report/integrated/get/', 'POST', payload)

      if (response.code !== 0) {
        throw new Error(`TikTok API Error: ${response.message}`)
      }

      return this.parseReports(response.data.list, level)
      
    } catch (error) {
      logger.error('Error obteniendo reportes TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Crea audiencia personalizada
   */
  async createCustomAudience(
    name: string,
    audienceType: 'CUSTOMER_FILE' | 'PIXEL' | 'MOBILE_APP' | 'ENGAGEMENT',
    rule: Record<string, unknown>,
    retentionInDays: number = 180
  ): Promise<string> {
    this.ensureConnected()
    
    try {
      const payload = {
        advertiser_id: this.config.advertiserId,
        custom_audience_name: name,
        audience_type: audienceType,
        rule,
        retention_in_days: retentionInDays
      }

      const response = await this.makeApiRequest('dmp/custom_audience/create/', 'POST', payload)

      if (response.code !== 0) {
        throw new Error(`TikTok API Error: ${response.message}`)
      }

      const audienceId = response.data.custom_audience_id
      logger.info(`✅ Audiencia personalizada TikTok creada: ${audienceId}`)
      return audienceId
      
    } catch (error) {
      logger.error('Error creando audiencia personalizada TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Sube video creative
   */
  async uploadVideo(videoFile: File, videoName: string): Promise<string> {
    this.ensureConnected()
    
    try {
      const formData = new FormData()
      formData.append('advertiser_id', this.config.advertiserId)
      formData.append('video_file', videoFile)
      formData.append('video_name', videoName)
      formData.append('upload_type', 'UPLOAD_BY_FILE')

      const response = await fetch(`${this.apiBaseUrl}/file/video/ad/upload/`, {
        method: 'POST',
        headers: {
          'Access-Token': this.config.accessToken
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.code !== 0) {
        throw new Error(`TikTok API Error: ${data.message}`)
      }

      const videoId = data.data.video_id
      logger.info(`✅ Video TikTok subido: ${videoId}`)
      return videoId
      
    } catch (error) {
      logger.error('Error subiendo video TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Sube imagen creative
   */
  async uploadImage(imageFile: File, imageName: string): Promise<string> {
    this.ensureConnected()
    
    try {
      const formData = new FormData()
      formData.append('advertiser_id', this.config.advertiserId)
      formData.append('image_file', imageFile)
      formData.append('image_name', imageName)
      formData.append('upload_type', 'UPLOAD_BY_FILE')

      const response = await fetch(`${this.apiBaseUrl}/file/image/ad/upload/`, {
        method: 'POST',
        headers: {
          'Access-Token': this.config.accessToken
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.code !== 0) {
        throw new Error(`TikTok API Error: ${data.message}`)
      }

      const imageId = data.data.image_id
      logger.info(`✅ Imagen TikTok subida: ${imageId}`)
      return imageId
      
    } catch (error) {
      logger.error('Error subiendo imagen TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Optimización automática mobile-first
   */
  async runMobileOptimization(campaignId: string): Promise<any[]> {
    this.ensureConnected()
    
    try {
      logger.info(`📱 Ejecutando optimización mobile-first para campaña: ${campaignId}`)
      
      // 1. Obtener reportes actuales
      const reports = await this.getReports('AUCTION_CAMPAIGN', [campaignId], {
        startDate: this.getDateDaysAgo(30),
        endDate: this.getDateDaysAgo(1)
      }, ['platform_type', 'placement_type'])

      // 2. Analizar performance mobile vs desktop
      const optimizations = await this.analyzeMobilePerformance(campaignId, reports)
      
      logger.info(`✅ Optimización mobile TikTok completada. ${optimizations.length} recomendaciones generadas`)
      return optimizations
      
    } catch (error) {
      logger.error('Error en optimización mobile TikTok:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  // Métodos privados

  private async validateAccessToken(): Promise<void> {
    try {
      const response = await this.makeApiRequest('oauth2/advertiser/get/', 'GET', {
        advertiser_ids: [this.config.advertiserId]
      })

      if (response.code !== 0) {
        throw new Error(`Invalid access token: ${response.message}`)
      }
    } catch (error) {
      throw new Error(`Access token validation failed: ${error}`)
    }
  }

  private async getAdvertiserInfo(): Promise<void> {
    try {
      const response = await this.makeApiRequest('advertiser/info/', 'GET', {
        advertiser_ids: [this.config.advertiserId]
      })

      if (response.code !== 0) {
        throw new Error(`Failed to get advertiser info: ${response.message}`)
      }

      logger.info(`📊 Advertiser info: ${response.data.list[0].name}`)
    } catch (error) {
      throw new Error(`Advertiser info retrieval failed: ${error}`)
    }
  }

  // External API boundary — TikTok API response is dynamically shaped
  private async makeApiRequest(endpoint: string, method: string, data?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const url = `${this.apiBaseUrl}/${endpoint}`
    
    const headers: Record<string, string> = {
      'Access-Token': this.config.accessToken,
      'Content-Type': 'application/json'
    }

    let body: string | undefined
    let requestUrl = url

    if (method === 'GET' && data) {
      const params = new URLSearchParams()
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          params.append(key, JSON.stringify(data[key]))
        } else {
          params.append(key, data[key])
        }
      })
      requestUrl = `${url}?${params.toString()}`
    } else if (method === 'POST' && data) {
      body = JSON.stringify(data)
    }

    const response = await fetch(requestUrl, {
      method,
      headers,
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TikTok API request failed: ${response.status} ${errorText}`)
    }

    return await response.json()
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to TikTok Ads. Call connect() first.')
    }
  }

  private buildTargeting(targeting: TikTokAdGroup['targeting']): Record<string, unknown> {
    const targetingSpec: Record<string, unknown> = {}

    if (targeting?.locations) {
      targetingSpec.location_ids = targeting.locations.map(loc => loc.id)
    }

    if (targeting?.demographics) {
      if (targeting.demographics.ageGroups) {
        targetingSpec.age_groups = targeting.demographics.ageGroups
      }
      if (targeting.demographics.genders) {
        targetingSpec.gender = targeting.demographics.genders
      }
      if (targeting.demographics.languages) {
        targetingSpec.languages = targeting.demographics.languages
      }
    }

    if (targeting?.interests) {
      targetingSpec.interest_category_ids = targeting.interests.map(i => i.interestCategoryId)
      if (targeting.interests.some(i => i.interestKeywordId)) {
        targetingSpec.interest_keyword_ids = targeting.interests
          .filter(i => i.interestKeywordId)
          .map(i => i.interestKeywordId)
      }
    }

    if (targeting?.behaviors) {
      targetingSpec.behavior_category_ids = targeting.behaviors.map(b => b.behaviorCategoryId)
      targetingSpec.behavior_ids = targeting.behaviors.map(b => b.behaviorId)
    }

    if (targeting?.deviceModels) {
      targetingSpec.device_model_ids = targeting.deviceModels
    }

    if (targeting?.operatingSystems) {
      targetingSpec.operating_systems = targeting.operatingSystems
    }

    if (targeting?.networkTypes) {
      targetingSpec.network_types = targeting.networkTypes
    }

    if (targeting?.placements) {
      targetingSpec.placements = targeting.placements
    }

    if (targeting?.includedCustomAudiences) {
      targetingSpec.included_custom_audiences = targeting.includedCustomAudiences.map(id => ({ custom_audience_id: id }))
    }

    if (targeting?.excludedCustomAudiences) {
      targetingSpec.excluded_custom_audiences = targeting.excludedCustomAudiences.map(id => ({ custom_audience_id: id }))
    }

    if (targeting?.lookalikeSimilarAudiences) {
      targetingSpec.lookalike_similar_audiences = targeting.lookalikeSimilarAudiences.map(la => ({
        custom_audience_id: la.customAudienceId,
        lookalike_similar_type: la.lookalikeSimilarType
      }))
    }

    return targetingSpec
  }

  private buildFilters(level: string, objectIds: string[]): Record<string, unknown> {
    const filters: Record<string, unknown> = {}

    switch (level) {
      case 'AUCTION_CAMPAIGN':
        filters.campaign_ids = objectIds
        break
      case 'AUCTION_ADGROUP':
        filters.adgroup_ids = objectIds
        break
      case 'AUCTION_AD':
        filters.ad_ids = objectIds
        break
    }

    return filters
  }

  private parseReports(data: Array<Record<string, unknown>>, level: string): TikTokReport[] {
    return data.map(item => ({
      campaignId: item.campaign_id,
      campaignName: item.campaign_name,
      adgroupId: item.adgroup_id,
      adgroupName: item.adgroup_name,
      adId: item.ad_id,
      adName: item.ad_name,
      metrics: {
        impressions: parseInt(item.impressions) || 0,
        clicks: parseInt(item.clicks) || 0,
        spend: parseFloat(item.spend) || 0,
        reach: parseInt(item.reach) || 0,
        ctr: parseFloat(item.ctr) || 0,
        cpm: parseFloat(item.cpm) || 0,
        cpc: parseFloat(item.cpc) || 0,
        conversions: parseInt(item.conversion) || 0,
        conversionRate: parseFloat(item.conversion_rate) || 0,
        costPerConversion: parseFloat(item.cost_per_conversion) || 0,
        videoViews: parseInt(item.video_play_actions) || 0,
        videoViewRate: parseFloat(item.video_view_rate) || 0,
        videoWatchedP25: parseInt(item.video_watched_p25) || 0,
        videoWatchedP50: parseInt(item.video_watched_p50) || 0,
        videoWatchedP75: parseInt(item.video_watched_p75) || 0,
        videoWatchedP100: parseInt(item.video_watched_p100) || 0,
        engagements: parseInt(item.engagement) || 0,
        shares: parseInt(item.shares) || 0,
        comments: parseInt(item.comments) || 0,
        likes: parseInt(item.likes) || 0,
        profileVisits: parseInt(item.profile_visits) || 0,
        follows: parseInt(item.follows) || 0,
        date: item.stat_time_day
      }
    }))
  }

  private async analyzeMobilePerformance(campaignId: string, reports: TikTokReport[]): Promise<any[]> {
    const optimizations: unknown[] = []
    
    // Análisis de performance mobile
    const mobileReports = reports.filter(r => r.dimensions?.platform === 'MOBILE')
    const avgVideoViewRate = mobileReports.reduce((sum, r) => sum + r.metrics.videoViewRate, 0) / mobileReports.length
    const avgEngagementRate = mobileReports.reduce((sum, r) => sum + (r.metrics.engagements / r.metrics.impressions), 0) / mobileReports.length
    
    // Recomendaciones mobile-first
    if (avgVideoViewRate < 0.3) {
      optimizations.push({
        type: 'LOW_VIDEO_VIEW_RATE',
        action: 'Optimizar videos para mobile: primeros 3 segundos críticos',
        value: avgVideoViewRate,
        priority: 'HIGH'
      })
    }
    
    if (avgEngagementRate < 0.02) {
      optimizations.push({
        type: 'LOW_ENGAGEMENT_RATE',
        action: 'Mejorar call-to-action y elementos interactivos',
        value: avgEngagementRate,
        priority: 'MEDIUM'
      })
    }
    
    return optimizations
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }
}

// Instancia singleton para uso global
let tikTokAdsConnectorInstance: TikTokAdsConnector | null = null

export function getTikTokAdsConnector(config?: TikTokAdsConfig): TikTokAdsConnector {
  if (!tikTokAdsConnectorInstance && config) {
    tikTokAdsConnectorInstance = new TikTokAdsConnector(config)
  }
  
  if (!tikTokAdsConnectorInstance) {
    throw new Error('TikTok Ads Connector not initialized. Provide config first.')
  }
  
  return tikTokAdsConnectorInstance
}