// Tipos de auditoría y compliance empresarial para Fortune 10

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  details: Record<string, unknown>;
  result: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  correlationId: string;
  complianceFlags: ComplianceFlag[];
  retentionPolicy: RetentionPolicy;
  hash: string; // Para integridad de datos
  signature?: string; // Firma digital
  previousHash?: string; // Para blockchain
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  certifications: ComplianceCertification[];
  applicableRegions: string[];
  industryStandards: IndustryStandard[];
  auditFrequency: 'monthly' | 'quarterly' | 'annually' | 'continuous';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAssessment: Date;
  nextAssessment: Date;
  status: 'active' | 'inactive' | 'under_review' | 'expired';
  responsibleTeam: string;
  documentationUrl: string;
}

export interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  requirementId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationStatus: 'not_started' | 'in_progress' | 'implemented' | 'verified';
  evidence: ComplianceEvidence[];
  testProcedures: TestProcedure[];
  remediationSteps: string[];
  responsibleRoles: string[];
  dueDate: Date;
  completionDate?: Date;
  validationMethod: 'automated' | 'manual' | 'hybrid';
  autoValidationScript?: string;
  complianceScore: number;
}

export interface ComplianceControl {
  id: string;
  requirementId: string;
  controlId: string;
  title: string;
  description: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  implementation: ControlImplementation;
  testing: ControlTesting;
  effectiveness: ControlEffectiveness;
  responsibleTeam: string;
  implementationDate: Date;
  lastTested: Date;
  nextTestDate: Date;
  status: 'active' | 'inactive' | 'under_review';
  dependencies: string[];
  risks: string[];
  compensatingControls: string[];
}

export interface ControlImplementation {
  type: 'technical' | 'administrative' | 'physical';
  description: string;
  configuration: Record<string, unknown>;
  evidence: string[];
  automationLevel: 'fully_automated' | 'semi_automated' | 'manual';
  implementationSteps: string[];
  rollbackProcedure: string;
  dependencies: string[];
}

export interface ControlTesting {
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  method: 'automated' | 'manual' | 'hybrid';
  testScript?: string;
  testData: TestData[];
  expectedResults: string[];
  acceptanceCriteria: string[];
  responsibleRoles: string[];
  tools: string[];
  documentation: string;
}

export interface ControlEffectiveness {
  score: number; // 0-100
  lastAssessment: Date;
  assessmentMethod: 'quantitative' | 'qualitative' | 'mixed';
  findings: Finding[];
  recommendations: string[];
  improvementPlan: ImprovementPlan;
  maturityLevel: 'initial' | 'managed' | 'defined' | 'quantitatively_managed' | 'optimizing';
}

export interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  assessmentDate: Date;
  assessor: string;
  assessmentType: 'internal' | 'external' | 'third_party';
  scope: AssessmentScope;
  findings: Finding[];
  recommendations: Recommendation[];
  overallScore: number;
  complianceLevel: 'full' | 'substantial' | 'partial' | 'non_compliant';
  reportUrl: string;
  nextAssessmentDate: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
}

export interface Finding {
  id: string;
  assessmentId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  rootCause: string;
  impact: string;
  likelihood: 'low' | 'medium' | 'high';
  riskRating: number;
  remediation: RemediationPlan;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
  assignedTo: string;
  dueDate: Date;
  completionDate?: Date;
  evidence: string[];
  comments: Comment[];
}

export interface RemediationPlan {
  steps: string[];
  timeline: string;
  resources: string[];
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  successCriteria: string[];
  validationMethod: string;
}

export interface ComplianceEvidence {
  id: string;
  requirementId: string;
  evidenceType: 'document' | 'screenshot' | 'log' | 'configuration' | 'test_result' | 'certificate';
  title: string;
  description: string;
  fileUrl: string;
  fileHash: string;
  uploadedBy: string;
  uploadedDate: Date;
  validationStatus: 'pending' | 'validated' | 'rejected';
  validator?: string;
  validationDate?: Date;
  expirationDate?: Date;
  version: string;
  tags: string[];
}

export interface AuditReport {
  id: string;
  title: string;
  frameworkId: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  generatedBy: string;
  generatedDate: Date;
  summary: AuditSummary;
  detailedFindings: DetailedFinding[];
  recommendations: Recommendation[];
  actionPlan: ActionPlan;
  complianceScore: number;
  riskAssessment: RiskAssessment;
  appendices: Appendix[];
  distributionList: string[];
  confidentialityLevel: 'public' | 'internal' | 'restricted' | 'confidential';
  digitalSignature: string;
  blockchainHash?: string;
}

export interface AuditSummary {
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
  notTestedControls: number;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyFindings: string[];
  significantDeficiencies: string[];
  materialWeaknesses: string[];
  managementResponse: string;
}

export interface DetailedFinding {
  id: string;
  controlId: string;
  finding: string;
  criteria: string;
  condition: string;
  cause: string;
  effect: string;
  recommendation: string;
  managementResponse: string;
  remediationTimeline: string;
  responsibleParty: string;
  followUpDate: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskRating: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationCost: number;
  implementationTime: string;
  expectedBenefits: string[];
  responsibleParty: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected';
  evidence: string[];
  comments: Comment[];
}

export interface ActionPlan {
  items: ActionItem[];
  timeline: string;
  resources: string[];
  budget: number;
  successMetrics: string[];
  monitoringPlan: string;
  reportingSchedule: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  completionDate?: Date;
  dependencies: string[];
  resources: string[];
  estimatedHours: number;
  actualHours?: number;
  evidence: string[];
  comments: Comment[];
}

export interface RiskAssessment {
  inherentRisk: number;
  controlEffectiveness: number;
  residualRisk: number;
  riskMatrix: RiskMatrix;
  riskCategories: RiskCategory[];
  emergingRisks: EmergingRisk[];
  riskAppetite: string;
  riskTolerance: string;
  mitigationStrategies: string[];
}

export interface RiskMatrix {
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain';
  impact: 'insignificant' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  color: string;
}

export interface RiskCategory {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  controls: string[];
  mitigation: string[];
  monitoring: string[];
}

export interface EmergingRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeframe: 'short_term' | 'medium_term' | 'long_term';
  trend: 'increasing' | 'stable' | 'decreasing';
  mitigationStrategy: string;
  owner: string;
  monitoringPlan: string;
}

export interface ComplianceFlag {
  type: 'gdpr' | 'sox' | 'hipaa' | 'pci_dss' | 'iso27001' | 'soc2' | 'nist' | 'fedramp' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulation: string;
  requirement: string;
  evidenceRequired: string[];
  autoRemediate: boolean;
  remediationScript?: string;
}

export interface RetentionPolicy {
  category: 'audit_logs' | 'compliance_data' | 'personal_data' | 'financial_data' | 'operational_data';
  retentionPeriod: string; // ISO 8601 duration
  legalHold: boolean;
  jurisdiction: string;
  deletionMethod: 'automatic' | 'manual' | 'review_required';
  encryptionRequired: boolean;
  accessControls: string[];
}

export interface TestProcedure {
  id: string;
  title: string;
  description: string;
  steps: TestStep[];
  expectedResults: string[];
  passCriteria: string[];
  failCriteria: string[];
  tools: string[];
  evidence: string[];
  responsibleRoles: string[];
  frequency: 'one_time' | 'periodic' | 'continuous';
}

export interface TestStep {
  id: string;
  order: number;
  description: string;
  expectedResult: string;
  actualResult?: string;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed' | 'blocked';
  evidence: string[];
  comments: string[];
  executedBy?: string;
  executedDate?: Date;
}

export interface TestData {
  id: string;
  name: string;
  type: 'synthetic' | 'production_masked' | 'anonymized' | 'synthetic_realistic';
  description: string;
  dataSet: Record<string, unknown>;
  validationRules: string[];
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPolicy: string;
  owner: string;
}

export interface IndustryStandard {
  name: string;
  version: string;
  description: string;
  applicableRequirements: string[];
  certificationBody: string;
  certificationDate?: Date;
  expirationDate?: Date;
  status: 'active' | 'expired' | 'under_review';
}

export interface ComplianceCertification {
  id: string;
  frameworkId: string;
  certificationName: string;
  issuingBody: string;
  certificationDate: Date;
  expirationDate: Date;
  certificateUrl: string;
  status: 'active' | 'expired' | 'under_review';
  scope: string;
  renewalRequirements: string[];
  lastRenewalDate?: Date;
  nextRenewalDate: Date;
}

export interface AssessmentScope {
  systems: string[];
  processes: string[];
  locations: string[];
  businessUnits: string[];
  timePeriod: {
    start: Date;
    end: Date;
  };
  exclusions: string[];
  samplingMethod: string;
  sampleSize: number;
}

export interface ImprovementPlan {
  objectives: string[];
  activities: string[];
  timeline: string;
  resources: string[];
  successMetrics: string[];
  monitoringApproach: string;
  reviewSchedule: string;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: Date;
  content: string;
  attachments: string[];
  visibility: 'public' | 'restricted' | 'private';
}

export interface Appendix {
  id: string;
  title: string;
  content: string;
  attachments: string[];
  references: string[];
}

// Tipos de auditoría específicos para Fortune 10
export interface Fortune10AuditRequirements {
  financialControls: FinancialControl[];
  operationalControls: OperationalControl[];
  strategicControls: StrategicControl[];
  technologyControls: TechnologyControl[];
  complianceMetrics: Fortune10ComplianceMetrics;
  boardReporting: BoardReportingRequirements;
  regulatoryFilings: RegulatoryFiling[];
}

export interface FinancialControl {
  controlId: string;
  description: string;
  soxSection: string;
  testingFrequency: string;
  materialityThreshold: number;
  keyControls: string[];
  managementAssertion: string;
  auditorOpinion: string;
}

export interface OperationalControl {
  controlId: string;
  process: string;
  risk: string;
  controlActivity: string;
  controlOwner: string;
  frequency: string;
  evidence: string[];
}

export interface StrategicControl {
  controlId: string;
  strategicObjective: string;
  risk: string;
  mitigation: string;
  monitoring: string;
  kpis: string[];
  reporting: string;
}

export interface TechnologyControl {
  controlId: string;
  domain: string;
  control: string;
  implementation: string;
  testing: string;
  automation: string;
  metrics: string[];
}

export interface Fortune10ComplianceMetrics {
  overallScore: number;
  financialScore: number;
  operationalScore: number;
  strategicScore: number;
  technologyScore: number;
  trend: 'improving' | 'stable' | 'declining';
  benchmark: number;
  peerComparison: number;
  blockchain?: {
    chainLength: number;
    latestBlock: string;
    pendingTransactions: number;
    networkNodes: number;
  };
}

export interface BoardReportingRequirements {
  frequency: 'monthly' | 'quarterly' | 'annually';
  format: string;
  distribution: string[];
  keyMetrics: string[];
  riskDashboard: string[];
  executiveSummary: string;
  materialChanges: string[];
}

export interface RegulatoryFiling {
  filingType: string;
  regulatoryBody: string;
  filingDate: Date;
  dueDate: Date;
  status: 'preparation' | 'review' | 'filed' | 'accepted' | 'rejected';
  responsibleParty: string;
  requirements: string[];
  supportingDocumentation: string[];
}

// Tipos para blockchain de auditoría
export interface AuditBlockchain {
  chain: AuditBlock[];
  pendingTransactions: AuditTransaction[];
  miningDifficulty: number;
  reward: number;
  networkNodes: string[];
}

export interface AuditBlock {
  index: number;
  timestamp: Date;
  transactions: AuditTransaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  validator: string;
  signature: string;
}

export interface AuditTransaction {
  id: string;
  type: 'audit_log' | 'compliance_update' | 'control_test' | 'finding' | 'remediation';
  data: Record<string, unknown>;
  timestamp: Date;
  from: string;
  to: string;
  signature: string;
  hash: string;
}

// Tipos de acción de auditoría
export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'login'
  | 'logout'
  | 'password_change'
  | 'permission_grant'
  | 'permission_revoke'
  | 'role_assignment'
  | 'system_configuration'
  | 'data_access'
  | 'backup_operation'
  | 'restore_operation'
  | 'deployment'
  | 'rollback'
  | 'compliance_check'
  | 'security_scan'
  | 'vulnerability_assessment'
  | 'incident_response'
  | 'business_continuity_test'
  | 'disaster_recovery_test';

export type ResourceType =
  | 'user'
  | 'role'
  | 'permission'
  | 'system'
  | 'application'
  | 'database'
  | 'file'
  | 'configuration'
  | 'deployment'
  | 'compliance_framework'
  | 'audit_log'
  | 'security_policy'
  | 'network'
  | 'server'
  | 'service'
  | 'api'
  | 'data'
  | 'backup'
  | 'certificate'
  | 'key';

// Constantes de compliance para Fortune 10
export const FORTUNE10_COMPLIANCE_FRAMEWORKS = {
  SOX: {
    id: 'sox-2024',
    name: 'Sarbanes-Oxley Act',
    version: '2024',
    requirements: 404,
    materialityThreshold: 5000000, // $5M
    keyControls: 89,
    testingFrequency: 'quarterly'
  },
  SOC2: {
    id: 'soc2-type2-2024',
    name: 'SOC 2 Type II',
    version: '2024',
    trustServices: ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'],
    auditFrequency: 'annually',
    keyControls: 156
  },
  ISO27001: {
    id: 'iso27001-2022',
    name: 'ISO 27001:2022',
    version: '2022',
    controls: 114,
    domains: 14,
    certificationBody: 'ANSI'
  },
  NIST: {
    id: 'nist-csf-2.0',
    name: 'NIST Cybersecurity Framework 2.0',
    version: '2.0',
    functions: 6,
    categories: 22,
    subcategories: 106
  },
  GDPR: {
    id: 'gdpr-2018',
    name: 'General Data Protection Regulation',
    version: '2018',
    articles: 99,
    keyRights: 8,
    supervisoryAuthority: 'Various EU'
  }
};

export const AUDIT_RETENTION_POLICIES = {
  FINANCIAL: { years: 7, legalHold: true },
  OPERATIONAL: { years: 3, legalHold: false },
  COMPLIANCE: { years: 5, legalHold: true },
  SECURITY: { years: 2, legalHold: true },
  PERSONAL_DATA: { years: 1, legalHold: false }
};

export const COMPLIANCE_THRESHOLDS = {
  MINIMUM_SCORE: 85,
  TARGET_SCORE: 95,
  CRITICAL_CONTROLS_PASS_RATE: 100,
  HIGH_RISK_CONTROLS_PASS_RATE: 95,
  MEDIUM_RISK_CONTROLS_PASS_RATE: 90,
  LOW_RISK_CONTROLS_PASS_RATE: 85
};