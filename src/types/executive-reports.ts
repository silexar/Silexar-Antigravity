// Tipos para el sistema de reportes ejecutivos Fortune 10

export interface ExecutiveReport {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  generatedAt: Date;
  generatedBy?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  metrics: ReportMetric[];
  data: ReportData;
  filters: ReportFilter[];
  settings?: ReportSettings;
  permissions?: ReportPermissions;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'market' | 'risk' | 'strategic' | 'compliance';
  metrics: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  audience: 'c-suite' | 'board' | 'investors' | 'regulators' | 'operations' | 'strategy' | 'compliance';
  layout?: ReportLayout;
  charts?: ChartConfiguration[];
  sections?: ReportSection[];
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend: 'up' | 'down' | 'stable';
  target?: string | number;
  status: 'exceeds' | 'approaching' | 'below' | 'on-target';
  benchmark?: string | number;
  industryAverage?: string | number;
  historicalData?: HistoricalDataPoint[];
  alerts?: MetricAlert[];
}

export interface ReportFilter {
  id: string;
  name: string;
  type: 'date-range' | 'select' | 'multi-select' | 'text' | 'number' | 'boolean';
  options?: string[];
  defaultValue?: string | number | boolean | string[];
  required?: boolean;
  dependsOn?: string; // ID de otro filtro
  validation?: FilterValidation;
}

export interface ReportData {
  financial?: FinancialData[];
  operational?: OperationalData[];
  market?: MarketData[];
  risk?: RiskData[];
  strategic?: StrategicData[];
  compliance?: ComplianceData[];
  custom?: Record<string, unknown>;
}

export interface FinancialData {
  period: string;
  revenue: number;
  profit: number;
  expenses: number;
  growth: number;
  roi: number;
  margin: number;
  ebitda: number;
  cashFlow: number;
}

export interface OperationalData {
  metric: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  unit?: string;
  trend: 'improving' | 'stable' | 'declining';
  efficiency?: number;
}

export interface MarketData {
  segment: string;
  share: number;
  revenue: number;
  growth: number;
  competitors?: CompetitorData[];
  trends?: MarketTrend[];
}

export interface RiskData {
  category: string;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number;
  mitigation?: string[];
}

export interface StrategicData {
  initiative: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  budget: number;
  spent: number;
  roiProjection: number;
  milestones?: Milestone[];
}

export interface ComplianceData {
  regulation: string;
  complianceRate: number;
  findings: number;
  criticalFindings: number;
  status: 'compliant' | 'minor-issues' | 'major-issues' | 'non-compliant';
  nextAudit: Date;
  remediation?: string[];
}

export interface HistoricalDataPoint {
  date: Date;
  value: number;
  context?: string;
}

export interface MetricAlert {
  type: 'threshold' | 'anomaly' | 'trend' | 'benchmark';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: Date;
  acknowledged?: boolean;
  acknowledgedBy?: string;
}

export interface ReportLayout {
  type: 'dashboard' | 'narrative' | 'presentation' | 'executive-summary';
  sections: LayoutSection[];
  branding?: BrandingConfig;
  theme?: 'light' | 'dark' | 'corporate';
}

export interface LayoutSection {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'image';
  position: { x: number; y: number; width: number; height: number };
  dataSource?: string;
  configuration?: Record<string, unknown>;
}

export interface ChartConfiguration {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'gauge';
  title: string;
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  interactive?: boolean;
  drillDown?: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'executive-summary' | 'detailed-analysis' | 'recommendations' | 'appendix';
}

export interface ReportSettings {
  autoGenerate: boolean;
  schedule?: string; // Cron expression
  notifications: NotificationConfig[];
  dataRetention: number; // days
  accessLevel: 'public' | 'restricted' | 'confidential';
  encryption?: boolean;
  watermark?: boolean;
}

export interface ReportPermissions {
  view: string[]; // User/Role IDs
  edit: string[];
  approve: string[];
  distribute: string[];
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'teams' | 'webhook';
  recipients: string[];
  triggers: NotificationTrigger[];
  template?: string;
}

export interface NotificationTrigger {
  event: 'report-generated' | 'report-failed' | 'threshold-exceeded' | 'anomaly-detected';
  conditions?: Record<string, unknown>;
}

export interface FilterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  custom?: (value: unknown) => boolean;
}

export interface CompetitorData {
  name: string;
  marketShare: number;
  revenue: number;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketTrend {
  indicator: string;
  direction: 'up' | 'down' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timeframe: string;
}

export interface Milestone {
  name: string;
  date: Date;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  completion: number;
}

export interface BrandingConfig {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  footer?: string;
}

// Tipos para exportación de reportes
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'powerpoint' | 'word' | 'json' | 'csv';
  includeCharts?: boolean;
  includeRawData?: boolean;
  password?: string;
  watermark?: string;
  pageSize?: 'A4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

// Tipos para análisis predictivo y ML
export interface PredictiveAnalysis {
  forecast: ForecastData[];
  confidence: number;
  model: string;
  accuracy: number;
  seasonality?: boolean;
  trends?: TrendAnalysis;
}

export interface ForecastData {
  period: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  actual?: number;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  significance: number;
  changePoints?: Date[];
}

// Tipos para integración con sistemas externos
export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'erp' | 'crm' | 'hrm' | 'bi-tool' | 'data-warehouse';
  connection: ConnectionConfig;
  syncSchedule?: string;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface ConnectionConfig {
  endpoint: string;
  authentication: 'api-key' | 'oauth' | 'basic' | 'certificate';
  credentials: Record<string, unknown>;
  timeout: number;
  retryAttempts: number;
}

// Tipos para auditoría y trazabilidad
export interface ReportAudit {
  id: string;
  reportId: string;
  action: 'created' | 'modified' | 'viewed' | 'exported' | 'approved' | 'distributed';
  userId: string;
  timestamp: Date;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Constantes y enums
export const REPORT_CATEGORIES = {
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational',
  MARKET: 'market',
  RISK: 'risk',
  STRATEGIC: 'strategic',
  COMPLIANCE: 'compliance'
} as const;

export const REPORT_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  ON_DEMAND: 'on-demand'
} as const;

export const AUDIENCES = {
  C_SUITE: 'c-suite',
  BOARD: 'board',
  INVESTORS: 'investors',
  REGULATORS: 'regulators',
  OPERATIONS: 'operations',
  STRATEGY: 'strategy',
  COMPLIANCE: 'compliance'
} as const;

export type ReportCategory = typeof REPORT_CATEGORIES[keyof typeof REPORT_CATEGORIES];
export type ReportFrequency = typeof REPORT_FREQUENCIES[keyof typeof REPORT_FREQUENCIES];
export type Audience = typeof AUDIENCES[keyof typeof AUDIENCES];