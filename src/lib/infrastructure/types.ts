/**
 * AI-Powered Global Infrastructure - Core Types
 * TIER 0 Military-Grade Global Infrastructure System
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

export interface GlobalRegion {
  id: string;
  name: string;
  code: string;
  location: {
    continent: string;
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: 'ACTIVE' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  capacity: {
    current: number;
    maximum: number;
    utilization: number;
  };
  performance: {
    latency: number;
    throughput: number;
    availability: number;
  };
  compliance: {
    regulations: string[];
    certifications: string[];
    dataResidency: boolean;
  };
}

export interface EdgeNode {
  id: string;
  regionId: string;
  tier: 1 | 2 | 3;
  status: 'ONLINE' | 'OFFLINE' | 'PROVISIONING' | 'DECOMMISSIONING';
  resources: {
    cpu: ResourceMetrics;
    memory: ResourceMetrics;
    storage: ResourceMetrics;
    network: NetworkMetrics;
  };
  capabilities: string[];
  lastHealthCheck: Date;
}

export interface ResourceMetrics {
  total: number;
  used: number;
  available: number;
  utilization: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  connections: number;
}

export interface AIOrchestrator {
  id: string;
  type: 'GLOBAL' | 'REGIONAL' | 'EDGE';
  models: {
    threatDetection: AIModel;
    performanceOptimization: AIModel;
    predictiveMaintenance: AIModel;
    loadBalancing: AIModel;
    costOptimization: AIModel;
  };
  status: 'ACTIVE' | 'TRAINING' | 'UPDATING' | 'OFFLINE';
  lastUpdate: Date;
}

export interface AIModel {
  name: string;
  version: string;
  accuracy: number;
  trainingData: number;
  lastTrained: Date;
  predictions: number;
  confidence: number;
}

export interface GlobalInfrastructureMetrics {
  timestamp: Date;
  global: {
    totalRegions: number;
    activeRegions: number;
    totalEdgeNodes: number;
    activeEdgeNodes: number;
    globalLatency: number;
    globalThroughput: number;
    globalAvailability: number;
  };
  performance: {
    averageResponseTime: number;
    peakThroughput: number;
    errorRate: number;
    successRate: number;
  };
  ai: {
    threatsDetected: number;
    threatsBlocked: number;
    optimizationsApplied: number;
    predictionsAccuracy: number;
  };
  costs: {
    totalCost: number;
    costPerRegion: Record<string, number>;
    optimizationSavings: number;
  };
}

export interface InfrastructureAlert {
  id: string;
  type: 'PERFORMANCE' | 'SECURITY' | 'CAPACITY' | 'COMPLIANCE' | 'COST';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  regionId?: string;
  edgeNodeId?: string;
  timestamp: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
  autoResolution?: {
    attempted: boolean;
    successful: boolean;
    actions: string[];
  };
}

export interface ComplianceStatus {
  regionId: string;
  regulations: {
    name: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' | 'UNKNOWN';
    lastAudit: Date;
    nextAudit: Date;
    violations: string[];
  }[];
  dataResidency: {
    enforced: boolean;
    violations: number;
    lastCheck: Date;
  };
  encryption: {
    inTransit: boolean;
    atRest: boolean;
    keyRotation: Date;
  };
}

export interface TrafficPattern {
  timestamp: Date;
  regionId: string;
  requests: number;
  bandwidth: number;
  latency: number;
  errorRate: number;
  userSessions: number;
  geolocation: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface AutoScalingEvent {
  id: string;
  timestamp: Date;
  type: 'SCALE_UP' | 'SCALE_DOWN' | 'SCALE_OUT' | 'SCALE_IN';
  trigger: 'CPU' | 'MEMORY' | 'NETWORK' | 'LATENCY' | 'PREDICTION' | 'MANUAL';
  regionId: string;
  edgeNodeId?: string;
  before: ResourceMetrics;
  after: ResourceMetrics;
  duration: number;
  success: boolean;
  cost: number;
}

export interface SecurityThreat {
  id: string;
  timestamp: Date;
  type: 'DDoS' | 'INTRUSION' | 'MALWARE' | 'DATA_BREACH' | 'ANOMALY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: {
    ip: string;
    country: string;
    asn: string;
  };
  target: {
    regionId: string;
    edgeNodeId?: string;
    service: string;
  };
  aiDetection: {
    model: string;
    confidence: number;
    responseTime: number;
  };
  mitigation: {
    automatic: boolean;
    actions: string[];
    effectiveness: number;
  };
  status: 'DETECTED' | 'MITIGATING' | 'BLOCKED' | 'RESOLVED';
}

export interface GlobalInfrastructureConfig {
  regions: {
    minActiveRegions: number;
    maxRegions: number;
    autoProvisioning: boolean;
    failoverThreshold: number;
  };
  edgeNodes: {
    minNodesPerRegion: number;
    maxNodesPerRegion: number;
    autoScaling: boolean;
    healthCheckInterval: number;
  };
  ai: {
    enabledModels: string[];
    trainingSchedule: string;
    confidenceThreshold: number;
    autoResponse: boolean;
  };
  security: {
    zeroTrust: boolean;
    threatDetection: boolean;
    autoMitigation: boolean;
    encryptionLevel: 'AES-256' | 'AES-512';
  };
  compliance: {
    enforceDataResidency: boolean;
    auditInterval: number;
    autoRemediation: boolean;
  };
  performance: {
    targetLatency: number;
    targetAvailability: number;
    targetThroughput: number;
  };
}