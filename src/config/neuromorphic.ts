// Navigation configuration for neuromorphic components
export const neuromorphicRoutes = [
  {
    path: '/command-center',
    name: 'Command Center',
    description: 'SILEXAR PULSE Command Center - Neural Operations',
    icon: 'Cpu',
    securityLevel: 'MILITARY',
    category: 'Operations'
  },
  {
    path: '/sdk-portal',
    name: 'SDK Portal',
    description: 'Mobile SDK Integration & API Key Management',
    icon: 'Smartphone',
    securityLevel: 'ADMIN',
    category: 'Integration'
  },
  {
    path: '/value-billing',
    name: 'Value Billing',
    description: 'CPVI/CPCN Billing Models & Kafka Integration',
    icon: 'DollarSign',
    securityLevel: 'ADMIN',
    category: 'Finance'
  },
  {
    path: '/narrative-dashboard',
    name: 'Narrative Dashboard',
    description: 'Interactive Narrative Flow & Engagement Analytics',
    icon: 'GitBranch',
    securityLevel: 'USER',
    category: 'Analytics'
  }
];

// Security levels mapping
export const securityLevels = {
  PUBLIC: 0,
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
  MILITARY: 4,
  TIER0: 5
};

// API endpoints configuration
export const apiEndpoints = {
  billing: {
    models: '/api/v2/billing/models',
    events: '/api/v2/events',
    reports: '/api/v2/reports'
  },
  kafka: {
    userInteractions: '/api/v2/events/user-interaction',
    narrativeProgress: '/api/v2/events/narrative-progress'
  },
  analytics: {
    attention: '/api/v2/reports/attention',
    utility: '/api/v2/reports/utility',
    narrative: '/api/v2/reports/narrative'
  }
};

// Kafka topics configuration
export const kafkaTopics = {
  userInteractions: 'user_interactions',
  narrativeProgress: 'narrative_progress',
  billingEvents: 'billing_events'
};

// Billing model types
export const billingModelTypes = {
  CPM: 'CPM',      // Cost Per Mille
  CPC: 'CPC',      // Cost Per Click
  CPVI: 'CPVI',    // Cost Per Value Interaction
  CPCN: 'CPCN'     // Cost Per Completion Node
};

// Component export mapping
export const componentExports = {
  CommandCenter: '@/app/command-center/page',
  SDKMobilePortal: '@/app/sdk-portal/page',
  ValueBasedBilling: '@/app/value-billing/page',
  NarrativeEngagementDashboard: '@/app/narrative-dashboard/page',
  NeuromorphicComponents: '@/components/ui/neuromorphic',
  MilitarySecurity: '@/lib/military-security',
  KafkaBillingIntegration: '@/lib/kafka-billing-integration'
};

// Default configuration
export const defaultConfig = {
  kafka: {
    brokers: ['localhost:9092'],
    clientId: 'silexar-pulse-billing',
    topics: kafkaTopics
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long',
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000
  },
  billing: {
    defaultCurrency: 'USD',
    maxRate: 1000,
    minRate: 0.01
  }
};

export default {
  neuromorphicRoutes,
  securityLevels,
  apiEndpoints,
  kafkaTopics,
  billingModelTypes,
  componentExports,
  defaultConfig
};