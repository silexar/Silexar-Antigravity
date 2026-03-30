// Tipos para el sistema de IA Conversacional Enterprise

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system' | 'agent';
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system' | 'error' | 'welcome' | 'analysis';
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: Entity[];
    context?: ConversationContext;
    responseTime?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    language?: string;
    translated?: boolean;
    originalContent?: string;
    attachments?: MessageAttachment[];
    reactions?: MessageReaction[];
    error?: boolean;
    fallback?: boolean;
    automated?: boolean;
    agentName?: string;
    capabilities?: string[];
  };
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string; // ID del mensaje al que responde
}

export interface ChatSession {
  id: string;
  userId: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'paused' | 'ended' | 'escalated' | 'timeout';
  context: ConversationContext;
  messages: ChatMessage[];
  metrics: ConversationMetrics;
  settings: ChatSettings;
  participants?: Participant[];
  tags?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  satisfaction?: number; // 1-10
  resolution?: 'resolved' | 'unresolved' | 'escalated';
  followUpRequired?: boolean;
  lastActivity: Date;
  customFields?: Record<string, unknown>;
}

export interface AIAgent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  capabilities: string[];
  personality: 'professional' | 'friendly' | 'technical' | 'analytical' | 'casual' | 'formal';
  language: string;
  maxContextLength: number;
  responseTime: number;
  confidenceThreshold: number;
  welcomeMessage?: string;
  systemPrompt?: string;
  fineTunedModel?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: AgentSettings;
  knowledgeBase?: KnowledgeBaseConfig;
  integrations?: AgentIntegration[];
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  department: string;
  intent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  language: string;
  timezone: string;
  location?: {
    country: string;
    region: string;
    city?: string;
  };
  device?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  previousInteractions: number;
  customerTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  accountType: 'individual' | 'business' | 'enterprise' | 'partner';
  accountValue?: number;
  subscriptionStatus?: 'active' | 'inactive' | 'trial' | 'cancelled';
  permissions: string[];
  customData?: Record<string, unknown>;
  history?: ConversationHistory[];
}

export interface ConversationMetrics {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  averageResponseTime: number; // milliseconds
  totalDuration: number; // milliseconds
  satisfactionScore: number; // 1-10
  resolutionRate: number; // percentage
  escalationCount: number;
  fallbackCount: number;
  errorCount: number;
  languageSwitches: number;
  fileTransfers: number;
  voiceMessages: number;
  emojiReactions: number;
  topicChanges: number;
  sentimentChanges: number;
}

export interface ChatSettings {
  enableVoice: boolean;
  enableFileSharing: boolean;
  enableAnalytics: boolean;
  enableTranslation: boolean;
  enableSentimentAnalysis: boolean;
  enableSpellCheck: boolean;
  autoCorrect: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  encryption: boolean;
  dataRetention: number; // days
}

export interface Entity {
  text: string;
  label: string; // PERSON, ORGANIZATION, LOCATION, DATE, NUMBER, etc.
  start: number;
  end: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'file';
  size: number;
  url: string;
  mimeType: string;
  thumbnail?: string;
  duration?: number; // for audio/video
  pages?: number; // for documents
  metadata?: Record<string, unknown>;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'agent' | 'admin' | 'observer';
  status: 'active' | 'inactive' | 'away';
  joinedAt: Date;
  leftAt?: Date;
  permissions: string[];
}

export interface ConversationHistory {
  sessionId: string;
  date: Date;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  resolution: 'resolved' | 'unresolved' | 'escalated';
  category: string;
  tags: string[];
  duration: number;
  messageCount: number;
}

export interface AgentSettings {
  maxConcurrentChats: number;
  autoEscalationThreshold: number;
  workingHours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      day: number; // 0-6, Sunday to Saturday
      start: string; // HH:MM
      end: string; // HH:MM
    }[];
  };
  escalationRules: EscalationRule[];
  responseTemplates: ResponseTemplate[];
  proactiveMessages: ProactiveMessage[];
  integrationSettings: Record<string, unknown>;
}

export interface KnowledgeBaseConfig {
  sources: string[];
  updateFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  embeddingModel: string;
  similarityThreshold: number;
  maxResults: number;
  categories: string[];
  accessLevel: 'public' | 'restricted' | 'private';
}

export interface AgentIntegration {
  name: string;
  type: 'crm' | 'erp' | 'helpdesk' | 'analytics' | 'notification' | 'calendar';
  enabled: boolean;
  config: Record<string, unknown>;
  webhook?: string;
  apiKey?: string;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  action: 'transfer' | 'notify' | 'create-ticket' | 'schedule-callback';
  target: string; // agent ID, department, email, etc.
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timeout: number; // seconds
}

export interface EscalationCondition {
  type: 'sentiment' | 'keyword' | 'intent' | 'response-time' | 'message-count' | 'user-tier';
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than' | 'in';
  value: string | number | boolean | string[];
  confidence?: number;
}

export interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  conditions?: ResponseCondition[];
  usage: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseCondition {
  type: 'intent' | 'sentiment' | 'context' | 'user-tier' | 'time' | 'language';
  operator: 'equals' | 'contains' | 'matches';
  value: string | number | boolean | string[];
}

export interface ProactiveMessage {
  id: string;
  name: string;
  trigger: 'user-inactive' | 'page-visited' | 'time-spent' | 'scroll-depth' | 'exit-intent';
  conditions: ProactiveCondition[];
  message: string;
  delay: number; // seconds
  maxShowCount: number;
  targetAudience: string[];
  enabled: boolean;
  createdAt: Date;
}

export interface ProactiveCondition {
  type: 'time-on-page' | 'scroll-percentage' | 'pages-visited' | 'user-segment' | 'device-type';
  operator: 'greater-than' | 'less-than' | 'equals';
  value: string | number | boolean | string[];
}

export interface AIResponse {
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  confidence: number;
  intent: string;
  entities: Entity[];
  context: Partial<ConversationContext>;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
    sources?: string[];
    reasoning?: string;
    alternatives?: string[];
  };
  responseTime: number;
  fallback?: boolean;
  escalationRecommended?: boolean;
}

export interface ConversationAnalytics {
  sessionId: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
  primaryIntent: string;
  intents: { intent: string; confidence: number }[];
  topics: string[];
  entities: Entity[];
  satisfactionScore: number; // 1-10
  resolution: 'resolved' | 'unresolved' | 'escalated';
  keyPhrases: string[];
  language: string;
  conversationFlow: 'smooth' | 'interrupted' | 'confused' | 'escalated';
  agentPerformance: {
    responseTime: number;
    helpfulness: number;
    accuracy: number;
    empathy: number;
  };
  userEngagement: {
    messageCount: number;
    avgMessageLength: number;
    questionsAsked: number;
    positiveReactions: number;
    negativeReactions: number;
  };
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

export interface ExportFormat {
  format: 'json' | 'csv' | 'pdf' | 'txt' | 'html';
  includeMetadata: boolean;
  includeAnalytics: boolean;
  anonymize: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ConversationExport {
  filename: string;
  content: string;
  mimeType: string;
  size: number;
  format: ExportFormat;
  generatedAt: Date;
}

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
  recognitionEnabled: boolean;
  recognitionLanguage: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface TranslationConfig {
  enabled: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  autoDetect: boolean;
  provider: 'google' | 'azure' | 'aws' | 'openai';
  apiKey?: string;
}

// Constantes y enums
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
  SYSTEM: 'system',
  ERROR: 'error',
  WELCOME: 'welcome',
  ANALYSIS: 'analysis'
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral'
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
  ESCALATED: 'escalated',
  TIMEOUT: 'timeout'
} as const;

export const AGENT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  AWAY: 'away'
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
export type SentimentType = typeof SENTIMENT_TYPES[keyof typeof SENTIMENT_TYPES];
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];
export type AgentStatus = typeof AGENT_STATUS[keyof typeof AGENT_STATUS];