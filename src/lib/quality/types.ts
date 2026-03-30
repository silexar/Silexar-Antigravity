/**
 * 🎯 SILEXAR PULSE QUANTUM - QUALITY VALIDATION TYPES TIER 0
 * 
 * Tipos y interfaces para el sistema de validación de calidad
 * Definición de Done con estándares militares
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - MILITARY GRADE QUALITY SYSTEM
 */

// 📊 Base Quality Types
export type QualityStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'PENDING';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type ComplianceLevel = 'TIER_0' | 'ENTERPRISE' | 'STANDARD' | 'BASIC';

// 🎯 Quality Validation Result
export interface ValidationResult {
  id: string;
  component: string;
  timestamp: Date;
  status: QualityStatus;
  score: number; // 0-100
  message: string;
  details?: Record<string, unknown>;
  recommendations: string[];
  blockers: string[];
}

// 🔍 Code Quality Result
export interface CodeQualityResult extends ValidationResult {
  typeScriptErrors: number;
  eslintWarnings: number;
  eslintErrors: number;
  complexityScore: number;
  documentationCoverage: number;
  dependencyVulnerabilities: SecurityVulnerability[];
}

// 🛡️ Security Result
export interface SecurityResult extends ValidationResult {
  vulnerabilities: SecurityVulnerability[];
  owaspCompliance: boolean;
  encryptionValidation: boolean;
  authenticationCheck: boolean;
  inputSanitizationCheck: boolean;
  auditTrailValidation: boolean;
}

// 🚨 Security Vulnerability
export interface SecurityVulnerability {
  id: string;
  type: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: string;
  cveId?: string;
  recommendation: string;
  discoveredAt: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
}

// 🧪 Test Result
export interface TestResult extends ValidationResult {
  unitTestCoverage: number;
  integrationTestsPassed: number;
  integrationTestsFailed: number;
  securityTestsPassed: number;
  performanceTestsPassed: number;
  accessibilityTestsPassed: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

// ⚡ Performance Result
export interface PerformanceResult extends ValidationResult {
  pageLoadTime: number;
  interactionResponseTime: number;
  bundleSize: number;
  memoryUsage: number;
  databaseQueryTime: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
}

// ♿ Accessibility Result
export interface AccessibilityResult extends ValidationResult {
  wcagCompliance: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  keyboardNavigation: boolean;
  screenReaderCompatibility: boolean;
  colorContrastRatio: number;
  semanticStructure: boolean;
  violations: AccessibilityViolation[];
}

// 🚫 Accessibility Violation
export interface AccessibilityViolation {
  id: string;
  rule: string;
  severity: SeverityLevel;
  element: string;
  description: string;
  recommendation: string;
  wcagReference: string;
}

// 📚 Documentation Result
export interface DocumentationResult extends ValidationResult {
  apiDocumentationCoverage: number;
  userGuideCoverage: number;
  architectureDocumentation: boolean;
  codeCommentCoverage: number;
  migrationGuides: boolean;
  missingDocumentation: string[];
}

// 🚀 Deployment Result
export interface DeploymentResult extends ValidationResult {
  ciPipelineValidation: boolean;
  environmentConfigValidation: boolean;
  healthChecksValidation: boolean;
  monitoringSetup: boolean;
  rollbackProcedures: boolean;
  secretsManagement: boolean;
}

// 🎨 User Experience Result
export interface UserExperienceResult extends ValidationResult {
  designSystemCompliance: boolean;
  userFlowTesting: boolean;
  errorStateValidation: boolean;
  loadingStateValidation: boolean;
  responsiveDesign: boolean;
  internationalization: boolean;
}

// 🔗 Integration Result
export interface IntegrationResult extends ValidationResult {
  openApiCompliance: boolean;
  dataFormatConsistency: boolean;
  eventSchemaValidation: boolean;
  thirdPartyIntegration: boolean;
  configurationManagement: boolean;
  dependencyManagement: boolean;
}

// 📊 Quality Metrics
export interface QualityMetrics {
  timestamp: Date;
  overallQualityScore: number;
  codeQualityScore: number;
  securityScore: number;
  testCoveragePercentage: number;
  performanceScore: number;
  accessibilityScore: number;
  documentationScore: number;
  deploymentReadinessScore: number;
  userExperienceScore: number;
  integrationScore: number;
  trendsLast30Days: {
    qualityImprovement: number;
    securityImprovements: number;
    performanceGains: number;
    testCoverageIncrease: number;
  };
}

// 📋 Quality Validation Result (Complete)
export interface QualityValidationResult {
  id: string;
  component: string;
  timestamp: Date;
  overallScore: number; // 0-100
  status: QualityStatus;
  validations: {
    codeQuality: CodeQualityResult;
    security: SecurityResult;
    testing: TestResult;
    performance: PerformanceResult;
    accessibility: AccessibilityResult;
    documentation: DocumentationResult;
    deployment: DeploymentResult;
    userExperience: UserExperienceResult;
    integration: IntegrationResult;
  };
  recommendations: string[];
  blockers: string[];
  estimatedFixTime: number; // minutes
  priority: SeverityLevel;
}

// 📊 Compliance Report
export interface ComplianceReport {
  id: string;
  generatedAt: Date;
  complianceLevel: ComplianceLevel;
  overallCompliance: number; // 0-100
  categories: {
    security: ComplianceCategory;
    accessibility: ComplianceCategory;
    performance: ComplianceCategory;
    documentation: ComplianceCategory;
    testing: ComplianceCategory;
    codeQuality: ComplianceCategory;
    deployment: ComplianceCategory;
    userExperience: ComplianceCategory;
    integration: ComplianceCategory;
  };
  certifications: string[];
  auditTrail: AuditEntry[];
  recommendations: string[];
  nextReviewDate: Date;
}

// 📋 Compliance Category
export interface ComplianceCategory {
  name: string;
  score: number; // 0-100
  status: QualityStatus;
  requirements: ComplianceRequirement[];
  lastAssessment: Date;
  nextAssessment: Date;
}

// ✅ Compliance Requirement
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: QualityStatus;
  evidence: string[];
  lastVerified: Date;
  responsible: string;
}

// 📝 Audit Entry
export interface AuditEntry {
  id: string;
  timestamp: Date;
  event: string;
  severity: SeverityLevel;
  component: string;
  user?: string;
  details: Record<string, unknown>;
  impact: string;
}

// ⚙️ Quality Configuration
export interface QualityConfiguration {
  thresholds: {
    overallQuality: number;
    codeQuality: number;
    security: number;
    testCoverage: number;
    performance: number;
    accessibility: number;
    documentation: number;
  };
  enabledValidators: string[];
  severityLevels: {
    blocking: SeverityLevel[];
    warning: SeverityLevel[];
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: string[];
  };
  reporting: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
}

// 🎯 Quality Gate
export interface QualityGate {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: QualityCondition[];
  actions: QualityAction[];
  order: number;
}

// 📏 Quality Condition
export interface QualityCondition {
  id: string;
  metric: string;
  operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ';
  threshold: number;
  severity: SeverityLevel;
  message: string;
}

// 🎬 Quality Action
export interface QualityAction {
  id: string;
  type: 'BLOCK' | 'WARN' | 'NOTIFY' | 'AUTO_FIX';
  condition: string;
  parameters: Record<string, unknown>;
  enabled: boolean;
}

// 📈 Quality Trend
export interface QualityTrend {
  metric: string;
  timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  data: QualityTrendPoint[];
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  prediction: QualityTrendPoint[];
}

// 📊 Quality Trend Point
export interface QualityTrendPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

// 🚨 Quality Alert
export interface QualityAlert {
  id: string;
  timestamp: Date;
  severity: SeverityLevel;
  title: string;
  description: string;
  component: string;
  metric: string;
  currentValue: number;
  threshold: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  assignee?: string;
  resolvedAt?: Date;
  actions: string[];
}

// 🔧 Quality Fix Suggestion
export interface QualityFixSuggestion {
  id: string;
  issue: string;
  severity: SeverityLevel;
  category: string;
  description: string;
  solution: string;
  automatable: boolean;
  estimatedTime: number; // minutes
  impact: string;
  references: string[];
}

// 📊 Quality Dashboard Data
export interface QualityDashboardData {
  overview: QualityMetrics;
  recentValidations: QualityValidationResult[];
  activeAlerts: QualityAlert[];
  trends: QualityTrend[];
  topIssues: QualityFixSuggestion[];
  complianceStatus: ComplianceReport;
  teamPerformance: TeamQualityMetrics[];
}

// 👥 Team Quality Metrics
export interface TeamQualityMetrics {
  teamName: string;
  memberCount: number;
  averageQualityScore: number;
  totalComponents: number;
  passedComponents: number;
  failedComponents: number;
  improvementRate: number;
  topContributors: string[];
}

// 🎓 Quality Training
export interface QualityTraining {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // minutes
  prerequisites: string[];
  objectives: string[];
  content: QualityTrainingModule[];
  assessment: QualityAssessment;
}

// 📚 Quality Training Module
export interface QualityTrainingModule {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'INTERACTIVE' | 'QUIZ';
  content: string;
  duration: number;
  order: number;
}

// 📝 Quality Assessment
export interface QualityAssessment {
  id: string;
  questions: QualityQuestion[];
  passingScore: number;
  timeLimit: number; // minutes
}

// ❓ Quality Question
export interface QualityQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

// 🏆 Quality Achievement
export interface QualityAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: QualityAchievementCriteria;
  reward: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// 🎯 Quality Achievement Criteria
export interface QualityAchievementCriteria {
  metric: string;
  operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
  value: number;
  timeframe?: string;
  consecutive?: boolean;
}

// 📊 Quality Leaderboard
export interface QualityLeaderboard {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
  entries: QualityLeaderboardEntry[];
  lastUpdated: Date;
}

// 🏅 Quality Leaderboard Entry
export interface QualityLeaderboardEntry {
  rank: number;
  user: string;
  score: number;
  components: number;
  achievements: string[];
  trend: 'UP' | 'DOWN' | 'STABLE';
}