// Tipos de integración ERP enterprise para Fortune 10

export interface ERPIntegrationConfig {
  id: string;
  name: string;
  systemType: 'sap' | 'oracle' | 'microsoft_dynamics' | 'netsuite' | 'workday' | 'custom';
  version: string;
  endpoint: string;
  authentication: ERPAuthentication;
  connectionSettings: ConnectionSettings;
  dataMapping: DataMapping[];
  syncSettings: SyncSettings;
  errorHandling: ErrorHandling;
  monitoring: MonitoringConfig;
  compliance: ComplianceConfig;
  status: 'active' | 'inactive' | 'testing' | 'error' | 'maintenance';
  lastSync?: Date;
      nextSync?: Date;
  totalRecords: number;
  successRate: number;
  averageResponseTime: number;
  responsibleTeam: string;
  documentation: string;
}

export interface ERPAuthentication {
  type: 'oauth2' | 'api_key' | 'basic_auth' | 'certificate' | 'saml' | 'kerberos';
  credentials: Record<string, unknown>;
  tokenEndpoint?: string;
  certificatePath?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string[];
  refreshToken?: string;
  expiresAt?: Date;
  rotationPolicy: TokenRotationPolicy;
}

export interface TokenRotationPolicy {
  enabled: boolean;
  rotationInterval: string; // ISO 8601 duration
  autoRotate: boolean;
  notificationBefore: string; // ISO 8601 duration
  emergencyRotation: boolean;
}

export interface ConnectionSettings {
  timeout: number; // milliseconds
  retries: number;
  retryDelay: number; // milliseconds
  maxConcurrentRequests: number;
  rateLimit: RateLimitConfig;
  connectionPool: ConnectionPoolConfig;
  ssl: SSLConfig;
  proxy?: ProxyConfig;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstCapacity: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffMultiplier: number;
  maxBackoff: number; // milliseconds
}

export interface ConnectionPoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeout: number; // milliseconds
  connectionTimeout: number; // milliseconds
  healthCheckInterval: number; // milliseconds
}

export interface SSLConfig {
  enabled: boolean;
  verifyCertificate: boolean;
  certificatePath?: string;
  keyPath?: string;
  caPath?: string;
  protocols: string[];
  cipherSuites: string[];
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks5';
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: DataTransformation;
  validation: FieldValidation;
  defaultValue?: unknown;
  required: boolean;
  nullable: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  maxLength?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  description: string;
}

export interface DataTransformation {
  type: 'format' | 'calculate' | 'lookup' | 'concatenate' | 'split' | 'convert';
  parameters: Record<string, unknown>;
  fallback?: unknown;
  validation?: TransformationValidation;
}

export interface FieldValidation {
  required: boolean;
  type: 'regex' | 'range' | 'list' | 'custom';
  rule: string | Record<string, unknown>;
  errorMessage: string;
  allowNull: boolean;
  sanitize: boolean;
}

export interface TransformationValidation {
  enabled: boolean;
  rules: ValidationRule[];
  onError: 'skip' | 'fail' | 'use_fallback';
}

export interface ValidationRule {
  field: string;
  condition: string;
  expectedValue?: unknown;
  errorMessage: string;
}

export interface SyncSettings {
  direction: 'inbound' | 'outbound' | 'bidirectional';
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  batchSize: number;
  deltaSync: boolean;
  conflictResolution: ConflictResolution;
  dataFilter: DataFilter[];
  fieldMapping: FieldMapping[];
  transformationRules: TransformationRule[];
  validationRules: ValidationRule[];
}

export interface ConflictResolution {
  strategy: 'source_wins' | 'target_wins' | 'timestamp_wins' | 'manual' | 'merge';
  timestampField?: string;
  mergeRules?: MergeRule[];
  manualReviewThreshold: number;
}

export interface MergeRule {
  field: string;
  strategy: 'concatenate' | 'sum' | 'average' | 'max' | 'min' | 'custom';
  customFunction?: string;
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: string | number | boolean | string[];
  logic: 'and' | 'or';
}

export interface FieldMapping {
  source: string;
  target: string;
  transformation?: string;
  condition?: string;
}

export interface TransformationRule {
  name: string;
  condition: string;
  action: 'transform' | 'skip' | 'validate' | 'enrich';
  parameters: Record<string, unknown>;
  priority: number;
}

export interface ErrorHandling {
  retryPolicy: RetryPolicy;
  errorNotification: ErrorNotification;
  deadLetterQueue: DeadLetterQueueConfig;
  circuitBreaker: CircuitBreakerConfig;
  logging: LoggingConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: string[];
  nonRetryableErrors: string[];
}

export interface ErrorNotification {
  enabled: boolean;
  channels: NotificationChannel[];
  severityThreshold: 'info' | 'warning' | 'error' | 'critical';
  rateLimit: number; // notifications per hour
  escalation: EscalationPolicy;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
  config: Record<string, unknown>;
  enabled: boolean;
  severityFilter: string[];
}

export interface EscalationPolicy {
  enabled: boolean;
  levels: EscalationLevel[];
  timeBetweenEscalations: number; // minutes
}

export interface EscalationLevel {
  level: number;
  recipients: string[];
  delay: number; // minutes
  severity: 'warning' | 'error' | 'critical';
}

export interface DeadLetterQueueConfig {
  enabled: boolean;
  maxRetries: number;
  queueName: string;
  retentionPeriod: string; // ISO 8601 duration
  processingInterval: number; // milliseconds
  manualReview: boolean;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number; // percentage
  recoveryTimeout: number; // milliseconds
  halfOpenMaxCalls: number;
  successThreshold: number; // percentage
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  includePayload: boolean;
  includeHeaders: boolean;
  maskSensitiveFields: string[];
  logRotation: LogRotationConfig;
  auditTrail: boolean;
}

export interface LogRotationConfig {
  enabled: boolean;
  maxFileSize: number; // bytes
  maxFiles: number;
  compress: boolean;
  retentionPeriod: string; // ISO 8601 duration
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricsConfig;
  healthChecks: HealthCheckConfig[];
  alerts: AlertConfig[];
  dashboards: DashboardConfig[];
  reporting: ReportingConfig;
}

export interface MetricsConfig {
  enabled: boolean;
  endpoint: string;
  interval: number; // milliseconds
  customMetrics: CustomMetric[];
  labels: Record<string, string>;
}

export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  buckets?: number[]; // for histogram
}

export interface HealthCheckConfig {
  name: string;
  endpoint: string;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  healthyThreshold: number;
  unhealthyThreshold: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  type: 'connectivity' | 'authentication' | 'data_integrity' | 'performance';
  name: string;
  endpoint?: string;
  expectedResult: unknown;
  timeout: number;
}

export interface AlertConfig {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
  cooldown: number; // minutes
  autoResolve: boolean;
  runbookUrl?: string;
}

export interface DashboardConfig {
  name: string;
  url: string;
  refreshInterval: number; // seconds
  panels: DashboardPanel[];
}

export interface DashboardPanel {
  title: string;
  type: 'graph' | 'table' | 'stat' | 'gauge';
  query: string;
  thresholds: Threshold[];
}

export interface Threshold {
  color: string;
  value: number;
  severity: 'ok' | 'warning' | 'critical';
}

export interface ReportingConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  includeMetrics: string[];
  includeLogs: boolean;
}

export interface ComplianceConfig {
  dataRetention: DataRetentionPolicy;
  auditTrail: AuditTrailConfig;
  privacy: PrivacyConfig;
  security: SecurityConfig;
  regulatory: RegulatoryConfig;
}

export interface DataRetentionPolicy {
  period: string; // ISO 8601 duration
  encryption: boolean;
  anonymization: boolean;
  deletionSchedule: string; // cron expression
}

export interface AuditTrailConfig {
  enabled: boolean;
  logAllOperations: boolean;
  includePayload: boolean;
  retentionPeriod: string; // ISO 8601 duration
  immutableStorage: boolean;
}

export interface PrivacyConfig {
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  piiHandling: 'mask' | 'encrypt' | 'tokenize' | 'remove';
  consentManagement: boolean;
  dataSubjectRights: string[];
}

export interface SecurityConfig {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  keyManagement: string; // KMS provider
  accessControls: AccessControl[];
  vulnerabilityScanning: boolean;
}

export interface AccessControl {
  role: string;
  permissions: string[];
  conditions: string[];
}

export interface RegulatoryConfig {
  applicableRegulations: string[];
  complianceReports: ComplianceReport[];
  certifications: string[];
  auditFrequency: string;
}

export interface ComplianceReport {
  type: 'sox' | 'gdpr' | 'hipaa' | 'pci_dss' | 'soc2' | 'iso27001';
  frequency: string; // ISO 8601 duration
  format: string;
  recipients: string[];
}

// Tipos específicos para sistemas ERP principales
export interface SAPIntegration extends ERPIntegrationConfig {
  systemType: 'sap';
  sapConfig: SAPSpecificConfig;
}

export interface SAPSpecificConfig {
  client: string;
  systemNumber: string;
  language: string;
  routerString?: string;
  logonGroup?: string;
  messageServer?: string;
  rfcDestinations: RFCDestination[];
  bapiFunctions: string[];
  idocTypes: string[];
}

export interface RFCDestination {
  name: string;
  connectionType: 'direct' | 'load_balancing' | 'message_server';
  applicationServer: string;
  systemNumber: string;
  sapRouter?: string;
}

export interface OracleIntegration extends ERPIntegrationConfig {
  systemType: 'oracle';
  oracleConfig: OracleSpecificConfig;
}

export interface OracleSpecificConfig {
  databaseName: string;
  schema: string;
  connectionString: string;
  walletLocation?: string;
  tnsNamesPath?: string;
  sqlScripts: SQLScript[];
  concurrentPrograms: string[];
  interfaces: OracleInterface[];
}

export interface SQLScript {
  name: string;
  type: 'select' | 'insert' | 'update' | 'delete' | 'procedure';
  sql: string;
  parameters: SQLParameter[];
  validation: SQLValidation;
}

export interface SQLParameter {
  name: string;
  type: string;
  direction: 'in' | 'out' | 'inout';
  defaultValue?: unknown;
}

export interface SQLValidation {
  expectedRows?: number;
  maxExecutionTime: number; // seconds
  allowedErrorRate: number; // percentage
}

export interface OracleInterface {
  interfaceId: number;
  interfaceName: string;
  tableName: string;
  columns: string[];
  validation: InterfaceValidation;
}

export interface InterfaceValidation {
  requiredColumns: string[];
  dataTypes: Record<string, string>;
  constraints: string[];
}

export interface MicrosoftDynamicsIntegration extends ERPIntegrationConfig {
  systemType: 'microsoft_dynamics';
  dynamicsConfig: DynamicsSpecificConfig;
}

export interface DynamicsSpecificConfig {
  organizationUrl: string;
  apiVersion: string;
  tenantId: string;
  resource: string;
  entities: DynamicsEntity[];
  workflows: string[];
  plugins: string[];
}

export interface DynamicsEntity {
  logicalName: string;
  displayName: string;
  attributes: EntityAttribute[];
  relationships: EntityRelationship[];
}

export interface EntityAttribute {
  logicalName: string;
  displayName: string;
  type: string;
  required: boolean;
  maxLength?: number;
  precision?: number;
}

export interface EntityRelationship {
  name: string;
  relatedEntity: string;
  relationshipType: 'one_to_many' | 'many_to_one' | 'many_to_many';
}

// Tipos para sincronización de datos
export interface DataSyncResult {
  syncId: string;
  integrationId: string;
  startTime: Date;
  endTime: Date;
  status: 'success' | 'partial' | 'failed' | 'cancelled';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: SyncError[];
  warnings: SyncWarning[];
  performance: SyncPerformance;
  dataQuality: DataQualityMetrics;
}

export interface SyncError {
  errorId: string;
  timestamp: Date;
  severity: 'error' | 'critical';
  code: string;
  message: string;
  details: Record<string, unknown>;
  recordId?: string;
  field?: string;
  retryable: boolean;
  retryCount: number;
}

export interface SyncWarning {
  warningId: string;
  timestamp: Date;
  code: string;
  message: string;
  details: Record<string, unknown>;
  recordId?: string;
  field?: string;
}

export interface SyncPerformance {
  totalDuration: number; // milliseconds
  averageRecordProcessingTime: number; // milliseconds
  throughput: number; // records per second
  memoryUsage: number; // bytes
  cpuUsage: number; // percentage
  networkLatency: number; // milliseconds
}

export interface DataQualityMetrics {
  completeness: number; // percentage
  accuracy: number; // percentage
  consistency: number; // percentage
  validity: number; // percentage
  uniqueness: number; // percentage
  timeliness: number; // percentage
  score: number; // overall quality score
}

// Constantes para ERP
export const ERP_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 5,
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_BATCH_SIZE: 1000,
  RATE_LIMIT_REQUESTS_PER_SECOND: 10,
  CIRCUIT_BREAKER_THRESHOLD: 50, // percentage
  DATA_RETENTION_PERIOD: 'P7Y', // 7 years
  AUDIT_RETENTION_PERIOD: 'P10Y', // 10 years
  COMPLIANCE_SCORE_THRESHOLD: 95,
  MAX_CONCURRENT_CONNECTIONS: 50,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
};

export const ERP_ERROR_CODES = {
  AUTHENTICATION_FAILED: 'ERP_AUTH_001',
  CONNECTION_TIMEOUT: 'ERP_CONN_001',
  DATA_VALIDATION_ERROR: 'ERP_VAL_001',
  RATE_LIMIT_EXCEEDED: 'ERP_RATE_001',
  CIRCUIT_BREAKER_OPEN: 'ERP_CB_001',
  DATA_MAPPING_ERROR: 'ERP_MAP_001',
  SYNC_CONFLICT: 'ERP_SYNC_001',
  PERMISSION_DENIED: 'ERP_PERM_001',
  SYSTEM_UNAVAILABLE: 'ERP_SYS_001',
  DATA_CORRUPTION: 'ERP_DATA_001',
};

export const ERP_COMPLIANCE_REQUIREMENTS = {
  SOX: {
    financialDataRetention: 'P7Y',
    auditTrailRequired: true,
    changeManagement: true,
    segregationOfDuties: true,
  },
  GDPR: {
    dataSubjectRights: true,
    consentManagement: true,
    dataMinimization: true,
    rightToErasure: true,
  },
  HIPAA: {
    phiProtection: true,
    accessControls: true,
    auditLogging: true,
    encryptionRequired: true,
  },
  PCI_DSS: {
    cardholderDataProtection: true,
    networkSecurity: true,
    vulnerabilityManagement: true,
    accessControlMeasures: true,
  },
};