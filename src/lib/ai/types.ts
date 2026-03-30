/**
 * Quantum AI Dashboard Evolution - Core Types
 * TIER 0 Military-Grade AI Dashboard System
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

export interface PredictiveAnalytics {
  id: string;
  timestamp: Date;
  predictions: {
    performance: PerformancePrediction;
    security: SecurityPrediction;
    business: BusinessPrediction;
    infrastructure: InfrastructurePrediction;
    user: UserBehaviorPrediction;
  };
  confidence: number;
  accuracy: number;
  modelVersion: string;
}

export interface PerformancePrediction {
  nextHour: {
    latency: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  next24Hours: {
    peakLoad: number;
    averageLatency: number;
    expectedDowntime: number;
    resourceUtilization: number;
  };
  nextWeek: {
    trafficGrowth: number;
    performanceTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    maintenanceWindows: Date[];
    capacityRequirements: number;
  };
}

export interface SecurityPrediction {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedThreats: {
    type: string;
    probability: number;
    estimatedImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timeframe: string;
    mitigationSuggestions: string[];
  }[];
  vulnerabilityScore: number;
  complianceRisk: number;
  recommendedActions: string[];
}

export interface BusinessPrediction {
  revenue: {
    nextMonth: number;
    nextQuarter: number;
    yearEnd: number;
    confidence: number;
  };
  userGrowth: {
    newUsers: number;
    churnRate: number;
    retentionRate: number;
    lifetimeValue: number;
  };
  marketTrends: {
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    competitorAnalysis: string[];
    opportunities: string[];
    risks: string[];
  };
}

export interface InfrastructurePrediction {
  scaling: {
    recommendedActions: ScalingAction[];
    costImpact: number;
    performanceImpact: number;
    timeline: string;
  };
  maintenance: {
    predictedFailures: MaintenancePrediction[];
    recommendedMaintenance: string[];
    costOptimization: number;
  };
  capacity: {
    currentUtilization: number;
    predictedUtilization: number;
    bottlenecks: string[];
    expansionNeeded: boolean;
  };
}

export interface UserBehaviorPrediction {
  engagement: {
    activeUsers: number;
    sessionDuration: number;
    featureUsage: Record<string, number>;
    dropoffPoints: string[];
  };
  preferences: {
    popularFeatures: string[];
    usagePatterns: string[];
    devicePreferences: string[];
    timePatterns: string[];
  };
  churn: {
    riskScore: number;
    riskFactors: string[];
    retentionStrategies: string[];
    predictedChurnDate?: Date;
  };
}

export interface ScalingAction {
  type: 'SCALE_UP' | 'SCALE_DOWN' | 'SCALE_OUT' | 'SCALE_IN';
  component: string;
  reason: string;
  impact: number;
  cost: number;
  timeline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MaintenancePrediction {
  component: string;
  failureProbability: number;
  estimatedFailureDate: Date;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  cost: number;
}

export interface AIAssistant {
  id: string;
  name: string;
  capabilities: AssistantCapability[];
  status: 'ACTIVE' | 'LEARNING' | 'UPDATING' | 'OFFLINE';
  conversationHistory: Conversation[];
  knowledgeBase: KnowledgeBase;
  personalityProfile: PersonalityProfile;
}

export interface AssistantCapability {
  name: string;
  description: string;
  confidence: number;
  examples: string[];
  supportedLanguages: string[];
}

export interface Conversation {
  id: string;
  timestamp: Date;
  userQuery: string;
  assistantResponse: string;
  queryType: 'ANALYTICS' | 'CONTROL' | 'REPORT' | 'PREDICTION' | 'GENERAL';
  confidence: number;
  feedback?: 'HELPFUL' | 'NOT_HELPFUL' | 'PARTIALLY_HELPFUL';
  followUpSuggestions: string[];
}

export interface KnowledgeBase {
  domains: string[];
  lastUpdated: Date;
  totalEntries: number;
  accuracy: number;
  sources: string[];
}

export interface PersonalityProfile {
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'TECHNICAL' | 'CASUAL';
  verbosity: 'CONCISE' | 'DETAILED' | 'COMPREHENSIVE';
  expertise: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ADAPTIVE';
  language: string;
  customizations: Record<string, unknown>;
}

export interface AnomalyDetection {
  id: string;
  timestamp: Date;
  anomalies: DetectedAnomaly[];
  patterns: PatternAnalysis[];
  alerts: AnomalyAlert[];
  recommendations: AnomalyRecommendation[];
  systemHealth: SystemHealthScore;
}

export interface DetectedAnomaly {
  id: string;
  type: 'PERFORMANCE' | 'SECURITY' | 'BUSINESS' | 'USER_BEHAVIOR' | 'INFRASTRUCTURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedComponents: string[];
  detectionTime: Date;
  confidence: number;
  historicalContext: {
    firstSeen: Date;
    frequency: number;
    previousOccurrences: number;
  };
  impact: {
    users: number;
    revenue: number;
    performance: number;
    security: number;
  };
  rootCause?: {
    identified: boolean;
    cause: string;
    confidence: number;
    evidence: string[];
  };
}

export interface PatternAnalysis {
  id: string;
  patternType: 'SEASONAL' | 'TRENDING' | 'CYCLICAL' | 'IRREGULAR' | 'NORMAL';
  description: string;
  confidence: number;
  timeframe: string;
  predictedEvolution: string;
  businessImpact: string;
  recommendations: string[];
}

export interface AnomalyAlert {
  id: string;
  anomalyId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
  assignedTo?: string;
  escalationLevel: number;
  autoResolution?: {
    attempted: boolean;
    successful: boolean;
    actions: string[];
  };
}

export interface AnomalyRecommendation {
  id: string;
  anomalyId: string;
  type: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM' | 'PREVENTIVE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  estimatedImpact: {
    performance: number;
    cost: number;
    risk: number;
    effort: number;
  };
  implementation: {
    steps: string[];
    timeline: string;
    resources: string[];
    dependencies: string[];
  };
  success_metrics: string[];
}

export interface SystemHealthScore {
  overall: number;
  categories: {
    performance: number;
    security: number;
    reliability: number;
    scalability: number;
    maintainability: number;
  };
  trends: {
    direction: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    velocity: number;
    confidence: number;
  };
  benchmarks: {
    industry: number;
    historical: number;
    target: number;
  };
}

export interface AIInsight {
  id: string;
  type: 'PREDICTION' | 'RECOMMENDATION' | 'ALERT' | 'OPTIMIZATION' | 'DISCOVERY';
  title: string;
  description: string;
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  timestamp: Date;
  source: {
    model: string;
    version: string;
    dataPoints: number;
  };
  actionable: boolean;
  actions?: {
    primary: string;
    secondary: string[];
    automated: boolean;
  };
  metrics?: {
    before: Record<string, number>;
    predicted: Record<string, number>;
    improvement: number;
  };
}

export interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  timestamp: Date;
  userId: string;
  response: string;
  executed: boolean;
  executionResult?: {
    success: boolean;
    data?: unknown;
    error?: string;
  };
}

export interface SmartSuggestion {
  id: string;
  type: 'QUERY' | 'ACTION' | 'INSIGHT' | 'OPTIMIZATION' | 'EXPLORATION';
  title: string;
  description: string;
  relevanceScore: number;
  context: string[];
  userProfile: string;
  timestamp: Date;
  interactionData?: {
    clicks: number;
    views: number;
    conversions: number;
    feedback: number;
  };
}

export interface QuantumDashboardConfig {
  ai: {
    enablePredictiveAnalytics: boolean;
    enableAssistant: boolean;
    enableAnomalyDetection: boolean;
    enableVoiceControl: boolean;
    enableSmartSuggestions: boolean;
    confidenceThreshold: number;
    updateInterval: number;
  };
  visualization: {
    theme: 'LIGHT' | 'DARK' | 'AUTO' | 'QUANTUM';
    animations: boolean;
    realTimeUpdates: boolean;
    interactiveElements: boolean;
    responsiveLayout: boolean;
  };
  performance: {
    maxDataPoints: number;
    cacheSize: number;
    refreshRate: number;
    lazyLoading: boolean;
    compression: boolean;
  };
  security: {
    encryptData: boolean;
    auditLogs: boolean;
    accessControl: boolean;
    dataRetention: number;
  };
}