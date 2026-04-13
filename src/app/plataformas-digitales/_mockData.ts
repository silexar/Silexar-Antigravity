import type { PlatformConnection, CampaignData, CrossPlatformInsight, PentagonPlusSecurity } from './_types';

const DEFAULT_SECURITY: PentagonPlusSecurity = {
  threatLevel: 'NONE',
  quantumEncryption: true,
  consciousnessValidation: true,
  multiDimensionalProtection: true,
  auditLogging: true,
  universalCompliance: true,
};

const DISCONNECTED_SECURITY: PentagonPlusSecurity = {
  threatLevel: 'NONE',
  quantumEncryption: false,
  consciousnessValidation: false,
  multiDimensionalProtection: false,
  auditLogging: false,
  universalCompliance: false,
};

export const MOCK_PLATFORM_CONNECTIONS: PlatformConnection[] = [
  {
    platform: 'GOOGLE_ADS', name: 'Google Ads', icon: '🔍',
    connected: true, status: 'healthy', lastSync: new Date().toISOString(),
    campaignCount: 12, totalSpend: 2500000, errors: [],
    metrics: { impressions: 1200000, clicks: 60000, conversions: 1800, ctr: 5.0, cpc: 25.6, roas: 4.5 },
    consciousness: { level: 97.8, awareness: 96.5, intelligence: 98.2, transcendence: 95.1, quantumCoherence: 96.8 },
    quantumPerformance: { renderTime: 11.2, responseTime: 1.5, coherenceLevel: 97.3, optimizationScore: 98.1, universalSync: 96.7 },
    security: DEFAULT_SECURITY, tier0Compliance: true,
  },
  {
    platform: 'META_BUSINESS', name: 'Meta Business', icon: '📘',
    connected: true, status: 'healthy', lastSync: new Date().toISOString(),
    campaignCount: 8, totalSpend: 1800000, errors: [],
    metrics: { impressions: 800000, clicks: 40000, conversions: 1000, ctr: 5.0, cpc: 25.6, roas: 3.9 },
    consciousness: { level: 96.2, awareness: 95.8, intelligence: 97.1, transcendence: 94.3, quantumCoherence: 95.7 },
    quantumPerformance: { renderTime: 13.1, responseTime: 1.7, coherenceLevel: 96.1, optimizationScore: 97.3, universalSync: 95.9 },
    security: DEFAULT_SECURITY, tier0Compliance: true,
  },
  {
    platform: 'TIKTOK_ADS', name: 'TikTok Ads', icon: '🎵',
    connected: true, status: 'warning',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    campaignCount: 5, totalSpend: 950000, errors: ['Rate limit exceeded - Quantum recovery initiated'],
    metrics: { impressions: 500000, clicks: 25000, conversions: 400, ctr: 5.0, cpc: 25.6, roas: 4.1 },
    consciousness: { level: 94.1, awareness: 93.2, intelligence: 95.8, transcendence: 92.7, quantumCoherence: 93.4 },
    quantumPerformance: { renderTime: 14.8, responseTime: 2.1, coherenceLevel: 94.2, optimizationScore: 95.1, universalSync: 93.8 },
    security: { ...DEFAULT_SECURITY, threatLevel: 'LOW' }, tier0Compliance: true,
  },
  {
    platform: 'LINKEDIN_ADS', name: 'LinkedIn Ads', icon: '💼',
    connected: true, status: 'healthy', lastSync: new Date().toISOString(),
    campaignCount: 3, totalSpend: 650000, errors: [],
    metrics: { impressions: 200000, clicks: 8000, conversions: 320, ctr: 4.0, cpc: 47.2, roas: 3.8 },
    consciousness: { level: 98.5, awareness: 97.9, intelligence: 98.8, transcendence: 96.2, quantumCoherence: 97.6 },
    quantumPerformance: { renderTime: 10.3, responseTime: 1.2, coherenceLevel: 98.1, optimizationScore: 98.7, universalSync: 97.4 },
    security: DEFAULT_SECURITY, tier0Compliance: true,
  },
  {
    platform: 'DV360', name: 'Display & Video 360', icon: '📺',
    connected: false, status: 'disconnected', lastSync: null,
    campaignCount: 0, totalSpend: 0, errors: ['Quantum connection pending - TIER 0 initialization required'],
    metrics: { impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0, roas: 0 },
    consciousness: { level: 0, awareness: 0, intelligence: 0, transcendence: 0, quantumCoherence: 0 },
    quantumPerformance: { renderTime: 0, responseTime: 0, coherenceLevel: 0, optimizationScore: 0, universalSync: 0 },
    security: DISCONNECTED_SECURITY, tier0Compliance: false,
  },
  {
    platform: 'AMAZON_DSP', name: 'Amazon DSP', icon: '📦',
    connected: false, status: 'disconnected', lastSync: null,
    campaignCount: 0, totalSpend: 0, errors: ['Quantum connection pending - TIER 0 initialization required'],
    metrics: { impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0, roas: 0 },
    consciousness: { level: 0, awareness: 0, intelligence: 0, transcendence: 0, quantumCoherence: 0 },
    quantumPerformance: { renderTime: 0, responseTime: 0, coherenceLevel: 0, optimizationScore: 0, universalSync: 0 },
    security: DISCONNECTED_SECURITY, tier0Compliance: false,
  },
];

export const MOCK_CAMPAIGNS: CampaignData[] = [
  {
    id: 'camp_001', name: 'Campaña Black Friday 2025', status: 'ACTIVE',
    platforms: ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS'],
    budget: { total: 5000000, spent: 3200000, remaining: 1800000, currency: 'CLP' },
    performance: { impressions: 2500000, clicks: 125000, conversions: 3200, ctr: 5.0, cpc: 25.6, roas: 4.2 },
    schedule: { startDate: '2025-01-15', endDate: '2025-02-28', status: 'RUNNING' },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'camp_002', name: 'Lead Generation B2B', status: 'ACTIVE',
    platforms: ['LINKEDIN_ADS', 'GOOGLE_ADS'],
    budget: { total: 2000000, spent: 850000, remaining: 1150000, currency: 'CLP' },
    performance: { impressions: 450000, clicks: 18000, conversions: 720, ctr: 4.0, cpc: 47.2, roas: 3.8 },
    schedule: { startDate: '2025-01-01', endDate: '2025-03-31', status: 'RUNNING' },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'camp_003', name: 'Brand Awareness Gen Z', status: 'PAUSED',
    platforms: ['TIKTOK_ADS', 'META_BUSINESS'],
    budget: { total: 1500000, spent: 1200000, remaining: 300000, currency: 'CLP' },
    performance: { impressions: 5200000, clicks: 156000, conversions: 2100, ctr: 3.0, cpc: 7.7, roas: 2.1 },
    schedule: { startDate: '2024-12-01', endDate: '2025-01-31', status: 'COMPLETED' },
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_INSIGHTS: CrossPlatformInsight[] = [
  {
    type: 'PERFORMANCE_COMPARISON',
    title: 'Google Ads supera en eficiencia',
    description: 'Google Ads muestra 15% mejor costo por conversión que otras plataformas',
    platforms: ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS'],
    metrics: { GOOGLE_ADS: 853.3, META_BUSINESS: 1024, TIKTOK_ADS: 1600 },
    recommendation: { action: 'Aumentar presupuesto en Google Ads en 20%', priority: 'HIGH', estimatedImpact: 25 },
  },
  {
    type: 'BUDGET_ALLOCATION',
    title: 'Optimización de presupuesto recomendada',
    description: 'Reasignar presupuesto hacia plataformas más eficientes',
    platforms: ['GOOGLE_ADS', 'META_BUSINESS', 'TIKTOK_ADS'],
    metrics: { current_allocation: 33.3, recommended_allocation: 45.0 },
    recommendation: { action: 'Reasignar 15% del presupuesto hacia Google Ads', priority: 'MEDIUM', estimatedImpact: 18 },
  },
  {
    type: 'CREATIVE_PERFORMANCE',
    title: 'Creatividades de video superan a imágenes',
    description: 'Los anuncios de video tienen 40% mejor engagement que imágenes estáticas',
    platforms: ['TIKTOK_ADS', 'META_BUSINESS'],
    metrics: { video_engagement: 6.8, image_engagement: 4.2, improvement: 40 },
    recommendation: { action: 'Incrementar producción de contenido de video', priority: 'MEDIUM', estimatedImpact: 22 },
  },
];
