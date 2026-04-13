export interface ConsciousnessMetrics {
  level: number;
  awareness: number;
  intelligence: number;
  transcendence: number;
  quantumCoherence: number;
}

export interface QuantumPerformanceMetrics {
  renderTime: number;
  responseTime: number;
  coherenceLevel: number;
  optimizationScore: number;
  universalSync: number;
}

export interface PentagonPlusSecurity {
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  quantumEncryption: boolean;
  consciousnessValidation: boolean;
  multiDimensionalProtection: boolean;
  auditLogging: boolean;
  universalCompliance: boolean;
}

export interface PlatformConnection {
  platform: string;
  name: string;
  icon: string;
  connected: boolean;
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  lastSync: string | null;
  campaignCount: number;
  totalSpend: number;
  errors: string[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
  consciousness: ConsciousnessMetrics;
  quantumPerformance: QuantumPerformanceMetrics;
  security: PentagonPlusSecurity;
  tier0Compliance: boolean;
}

export interface CampaignData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
  platforms: string[];
  budget: {
    total: number;
    spent: number;
    remaining: number;
    currency: string;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED';
  };
  lastUpdated: string;
}

export interface CrossPlatformInsight {
  type: 'PERFORMANCE_COMPARISON' | 'AUDIENCE_OVERLAP' | 'BUDGET_ALLOCATION' | 'CREATIVE_PERFORMANCE';
  title: string;
  description: string;
  platforms: string[];
  metrics: Record<string, number>;
  recommendation: {
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedImpact: number;
  };
}

export interface TotalMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  avgConsciousness: number;
  connectedPlatforms: number;
}

export interface PerformanceMetrics {
  avgCtr: number;
  avgCpc: number;
  avgCostPerConversion: number;
  consciousnessEfficiency: number;
  quantumROAS: number;
}
