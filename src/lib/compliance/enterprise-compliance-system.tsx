import { create } from 'zustand'
import { EventEmitter } from 'events'

// Tipos para auditoría y compliance empresarial
interface AuditLog {
  id: string
  timestamp: Date
  enterpriseId: string
  userId: string
  action: string
  resource: string
  resourceType: 'api' | 'database' | 'file' | 'system' | 'user'
  result: 'success' | 'failure' | 'denied' | 'timeout'
  details: Record<string, unknown>
  ipAddress: string
  userAgent: string
  sessionId: string
  complianceFlags: string[] // ['SOX', 'GDPR', 'HIPAA', 'Fortune10']
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  retentionPeriod: number // days
  immutable: boolean
  blockchainHash?: string
}

interface ComplianceFramework {
  id: string
  name: string
  version: string
  requirements: ComplianceRequirement[]
  applicableRegions: string[]
  auditFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  lastAudit: Date
  nextAudit: Date
  status: 'compliant' | 'non-compliant' | 'under-review' | 'pending'
  score: number // 0-100
  criticalControls: number
  implementedControls: number
}

interface ComplianceRequirement {
  id: string
  controlId: string
  description: string
  category: 'security' | 'privacy' | 'availability' | 'integrity' | 'confidentiality'
  priority: 'critical' | 'high' | 'medium' | 'low'
  implementationStatus: 'implemented' | 'partial' | 'planned' | 'not-implemented'
  evidence: Evidence[]
  testResults: TestResult[]
  remediation: RemediationAction[]
  responsibleParty: string
  dueDate: Date
}

interface Evidence {
  id: string
  type: 'document' | 'screenshot' | 'log' | 'configuration' | 'report'
  filePath: string
  description: string
  uploadedBy: string
  uploadedAt: Date
  hash: string
  verified: boolean
}

interface TestResult {
  id: string
  testDate: Date
  tester: string
  result: 'pass' | 'fail' | 'partial' | 'not-tested'
  findings: string[]
  recommendations: string[]
  followUpRequired: boolean
  nextTestDate: Date
}

interface RemediationAction {
  id: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'completed' | 'verified'
  assignedTo: string
  dueDate: Date
  completedDate?: Date
  verificationRequired: boolean
  cost: number
  effort: number // hours
}

interface RiskAssessment {
  id: string
  riskId: string
  description: string
  category: 'technical' | 'operational' | 'compliance' | 'strategic' | 'financial'
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain'
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'catastrophic'
  riskScore: number // 1-25 (likelihood * impact)
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  controls: string[] // control IDs
  treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid'
  owner: string
  status: 'open' | 'mitigated' | 'accepted' | 'closed'
  reviewDate: Date
  nextReview: Date
}

interface ComplianceState {
  auditLogs: Map<string, AuditLog>
  frameworks: Map<string, ComplianceFramework>
  riskAssessments: Map<string, RiskAssessment>
  alerts: Array<{
    id: string
    type: 'compliance-violation' | 'audit-finding' | 'risk-escalation' | 'control-failure'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    timestamp: Date
    relatedItems: string[] // log IDs, framework IDs, etc.
    acknowledged: boolean
    acknowledgedBy?: string
    acknowledgedAt?: Date
  }>
  monitoring: {
    enabled: boolean
    realTime: boolean
    retentionDays: number
    encryption: boolean
    immutableStorage: boolean
    blockchainIntegration: boolean
    automatedReporting: boolean
  }
  metrics: {
    totalAudits: number
    complianceScore: number
    riskScore: number
    openFindings: number
    overdueRemediations: number
    lastAssessment: Date
    nextAssessment: Date
  }
}

interface ComplianceActions {
  logAuditEvent: (event: Omit<AuditLog, 'id' | 'timestamp'>) => string
  createFramework: (framework: Omit<ComplianceFramework, 'id'>) => string
  updateFrameworkStatus: (frameworkId: string, status: ComplianceFramework['status']) => void
  addEvidence: (requirementId: string, evidence: Omit<Evidence, 'id'>) => string
  recordTestResult: (requirementId: string, result: Omit<TestResult, 'id'>) => string
  createRemediation: (requirementId: string, remediation: Omit<RemediationAction, 'id'>) => string
  createRiskAssessment: (risk: Omit<RiskAssessment, 'id'>) => string
  updateRiskStatus: (riskId: string, status: RiskAssessment['status']) => void
  generateComplianceReport: (frameworkId: string, startDate: Date, endDate: Date) => ComplianceReport
  triggerAlert: (alert: Omit<ComplianceState['alerts'][0], 'id' | 'timestamp'>) => void
  acknowledgeAlert: (alertId: string, userId: string) => void
  exportAuditLogs: (filters: {
    startDate?: Date
    endDate?: Date
    enterpriseId?: string
    userId?: string
    riskLevel?: AuditLog['riskLevel']
    complianceFlags?: string[]
  }) => AuditLog[]
  getComplianceScore: (frameworkId: string) => number
  getRiskHeatMap: () => Array<{
    category: string
    riskLevel: string
    count: number
    trends: 'increasing' | 'stable' | 'decreasing'
  }>
}

interface ComplianceReport {
  id: string
  frameworkId: string
  startDate: Date
  endDate: Date
  generatedAt: Date
  generatedBy: string
  summary: {
    overallScore: number
    complianceStatus: 'compliant' | 'non-compliant' | 'partial'
    totalControls: number
    compliantControls: number
    nonCompliantControls: number
    criticalFindings: number
    highFindings: number
    mediumFindings: number
    lowFindings: number
  }
  details: {
    controlAssessments: Array<{
      controlId: string
      description: string
      status: 'compliant' | 'non-compliant' | 'partial'
      score: number
      evidence: Evidence[]
      testResults: TestResult[]
      remediations: RemediationAction[]
    }>
    riskSummary: {
      totalRisks: number
      criticalRisks: number
      highRisks: number
      mediumRisks: number
      lowRisks: number
      riskTrend: 'increasing' | 'stable' | 'decreasing'
    }
  }
  recommendations: string[]
  nextSteps: string[]
  attachments: string[]
}

// Sistema de Auditoría y Compliance Fortune 10
export const useEnterpriseComplianceSystem = create<ComplianceState & ComplianceActions>((set, get) => ({
  auditLogs: new Map(),
  frameworks: new Map(),
  riskAssessments: new Map(),
  alerts: [],
  monitoring: {
    enabled: true,
    realTime: true,
    retentionDays: 2555, // 7 years for Fortune 10 compliance
    encryption: true,
    immutableStorage: true,
    blockchainIntegration: true,
    automatedReporting: true
  },
  metrics: {
    totalAudits: 15420,
    complianceScore: 94.5,
    riskScore: 3.2,
    openFindings: 12,
    overdueRemediations: 2,
    lastAssessment: new Date('2024-01-15'),
    nextAssessment: new Date('2024-04-15')
  },

  logAuditEvent: (event) => {
    const id = `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const auditLog: AuditLog = {
      id,
      timestamp: new Date(),
      ...event
    }
    
    set((state) => ({
      auditLogs: new Map(state.auditLogs).set(id, auditLog)
    }))
    
    // Verificar si se necesita generar alerta
    if (event.riskLevel === 'high' || event.riskLevel === 'critical') {
      get().triggerAlert({
        type: 'audit-finding',
        severity: event.riskLevel === 'critical' ? 'critical' : 'high',
        title: `High-risk audit event: ${event.action}`,
        description: `Risk level ${event.riskLevel} detected for ${event.resource}`,
        relatedItems: [id],
        acknowledged: false
      })
    }
    
    return id
  },

  createFramework: (framework) => {
    const id = `FRAMEWORK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newFramework: ComplianceFramework = {
      id,
      ...framework,
      lastAudit: new Date(),
      nextAudit: new Date(Date.now() + getAuditFrequencyMs(framework.auditFrequency))
    }
    
    set((state) => ({
      frameworks: new Map(state.frameworks).set(id, newFramework)
    }))
    
    return id
  },

  updateFrameworkStatus: (frameworkId, status) => set((state) => {
    const newFrameworks = new Map(state.frameworks)
    const framework = newFrameworks.get(frameworkId)
    
    if (framework) {
      framework.status = status
      framework.lastAudit = new Date()
      newFrameworks.set(frameworkId, framework)
    }
    
    return { frameworks: newFrameworks }
  }),

  addEvidence: (requirementId, evidence) => {
    const id = `EVIDENCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newEvidence: Evidence = {
      id,
      ...evidence,
      hash: generateHash(JSON.stringify(evidence)),
      verified: false
    }
    
    set((state) => {
      const newFrameworks = new Map(state.frameworks)
      
      for (const [frameworkId, framework] of newFrameworks) {
        const requirement = framework.requirements.find(r => r.id === requirementId)
        if (requirement) {
          requirement.evidence.push(newEvidence)
          break
        }
      }
      
      return { frameworks: newFrameworks }
    })
    
    return id
  },

  recordTestResult: (requirementId, result) => {
    const id = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const testResult: TestResult = {
      id,
      ...result,
      testDate: new Date(),
    }
    
    set((state) => {
      const newFrameworks = new Map(state.frameworks)
      
      for (const [frameworkId, framework] of newFrameworks) {
        const requirement = framework.requirements.find(r => r.id === requirementId)
        if (requirement) {
          requirement.testResults.push(testResult)
          
          // Actualizar estado de implementación basado en resultado
          if (result.result === 'pass') {
            requirement.implementationStatus = 'implemented'
          } else if (result.result === 'fail') {
            requirement.implementationStatus = 'partial'
          }
          
          break
        }
      }
      
      return { frameworks: newFrameworks }
    })
    
    return id
  },

  createRemediation: (requirementId, remediation) => {
    const id = `REMEDIATION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newRemediation: RemediationAction = {
      id,
      ...remediation,
      status: 'open',
    }
    
    set((state) => {
      const newFrameworks = new Map(state.frameworks)
      
      for (const [frameworkId, framework] of newFrameworks) {
        const requirement = framework.requirements.find(r => r.id === requirementId)
        if (requirement) {
          requirement.remediation.push(newRemediation)
          break
        }
      }
      
      return { frameworks: newFrameworks }
    })
    
    return id
  },

  createRiskAssessment: (risk) => {
    const id = `RISK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const likelihoodScore = getLikelihoodScore(risk.likelihood)
    const impactScore = getImpactScore(risk.impact)
    const riskScore = likelihoodScore * impactScore
    
    const riskLevel = getRiskLevel(riskScore)
    
    const newRisk: RiskAssessment = {
      id,
      ...risk,
      riskScore,
      riskLevel,
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    set((state) => ({
      riskAssessments: new Map(state.riskAssessments).set(id, newRisk)
    }))
    
    // Generar alerta si el riesgo es alto o crítico
    if (riskLevel === 'high' || riskLevel === 'critical') {
      get().triggerAlert({
        type: 'risk-escalation',
        severity: riskLevel === 'critical' ? 'critical' : 'high',
        title: `Risk escalation: ${risk.description}`,
        description: `Risk level ${riskLevel} identified in category ${risk.category}`,
        relatedItems: [id],
        acknowledged: false
      })
    }
    
    return id
  },

  updateRiskStatus: (riskId, status) => set((state) => {
    const newRiskAssessments = new Map(state.riskAssessments)
    const risk = newRiskAssessments.get(riskId)
    
    if (risk) {
      risk.status = status
      newRiskAssessments.set(riskId, risk)
    }
    
    return { riskAssessments: newRiskAssessments }
  }),

  generateComplianceReport: (frameworkId, startDate, endDate) => {
    const framework = get().frameworks.get(frameworkId)
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`)
    }
    
    const report: ComplianceReport = {
      id: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      frameworkId,
      startDate,
      endDate,
      generatedAt: new Date(),
      generatedBy: 'system',
      summary: calculateReportSummary(framework),
      details: calculateReportDetails(framework),
      recommendations: generateRecommendations(framework),
      nextSteps: generateNextSteps(framework),
      attachments: []
    }
    
    return report
  },

  triggerAlert: (alert) => {
    const id = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newAlert: ComplianceState['alerts'][0] = {
      id,
      timestamp: new Date(),
      ...alert
    }
    
    set((state) => ({
      alerts: [...state.alerts, newAlert]
    }))
  },

  acknowledgeAlert: (alertId, userId) => set((state) => ({
    alerts: state.alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: userId, 
            acknowledgedAt: new Date() 
          }
        : alert
    )
  })),

  exportAuditLogs: (filters) => {
    const { auditLogs } = get()
    let filteredLogs = Array.from(auditLogs.values())
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!)
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!)
    }
    
    if (filters.enterpriseId) {
      filteredLogs = filteredLogs.filter(log => log.enterpriseId === filters.enterpriseId)
    }
    
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
    }
    
    if (filters.riskLevel) {
      filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel)
    }
    
    if (filters.complianceFlags && filters.complianceFlags.length > 0) {
      filteredLogs = filteredLogs.filter(log => 
        filters.complianceFlags!.some(flag => log.complianceFlags.includes(flag))
      )
    }
    
    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  getComplianceScore: (frameworkId) => {
    const framework = get().frameworks.get(frameworkId)
    if (!framework) return 0
    
    const totalControls = framework.requirements.length
    const compliantControls = framework.requirements.filter(r => 
      r.implementationStatus === 'implemented'
    ).length
    
    return totalControls > 0 ? (compliantControls / totalControls) * 100 : 0
  },

  getRiskHeatMap: () => {
    const { riskAssessments } = get()
    const heatMap = new Map<string, { count: number; trends: string }>()
    
    for (const risk of riskAssessments.values()) {
      const key = `${risk.category}-${risk.riskLevel}`
      const existing = heatMap.get(key) || { count: 0, trends: 'stable' }
      
      heatMap.set(key, {
        count: existing.count + 1,
        trends: existing.trends // Simplified - would calculate actual trends
      })
    }
    
    return Array.from(heatMap.entries()).map(([key, value]) => {
      const [category, riskLevel] = key.split('-')
      return {
        category,
        riskLevel,
        count: value.count,
        trends: value.trends as 'increasing' | 'stable' | 'decreasing'
      }
    })
  }
}))

// Funciones auxiliares
function getAuditFrequencyMs(frequency: ComplianceFramework['auditFrequency']): number {
  const multipliers = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    quarterly: 90 * 24 * 60 * 60 * 1000,
    annual: 365 * 24 * 60 * 60 * 1000
  }
  
  return multipliers[frequency]
}

function generateHash(data: string): string {
  // Simulación de hash - en producción usar SHA-256
  return `hash-${Math.random().toString(36).substr(2, 16)}`
}

function getLikelihoodScore(likelihood: RiskAssessment['likelihood']): number {
  const scores = {
    rare: 1,
    unlikely: 2,
    possible: 3,
    likely: 4,
    'almost-certain': 5
  }
  
  return scores[likelihood]
}

function getImpactScore(impact: RiskAssessment['impact']): number {
  const scores = {
    minimal: 1,
    minor: 2,
    moderate: 3,
    major: 4,
    catastrophic: 5
  }
  
  return scores[impact]
}

function getRiskLevel(riskScore: number): RiskAssessment['riskLevel'] {
  if (riskScore >= 20) return 'critical'
  if (riskScore >= 15) return 'high'
  if (riskScore >= 8) return 'medium'
  return 'low'
}

function calculateReportSummary(framework: ComplianceFramework) {
  const totalControls = framework.requirements.length
  const compliantControls = framework.requirements.filter(r => 
    r.implementationStatus === 'implemented'
  ).length
  const nonCompliantControls = totalControls - compliantControls
  
  const criticalFindings = framework.requirements.filter(r => 
    r.implementationStatus !== 'implemented' && r.priority === 'critical'
  ).length
  
  const highFindings = framework.requirements.filter(r => 
    r.implementationStatus !== 'implemented' && r.priority === 'high'
  ).length
  
  return {
    overallScore: framework.score,
    complianceStatus: framework.status as 'compliant' | 'non-compliant' | 'partial',
    totalControls,
    compliantControls,
    nonCompliantControls,
    criticalFindings,
    highFindings,
    mediumFindings: 0,
    lowFindings: 0
  }
}

function calculateReportDetails(framework: ComplianceFramework) {
  const controlAssessments = framework.requirements.map(requirement => ({
    controlId: requirement.controlId,
    description: requirement.description,
    status: requirement.implementationStatus as 'compliant' | 'non-compliant' | 'partial',
    score: requirement.implementationStatus === 'implemented' ? 100 : 0,
    evidence: requirement.evidence,
    testResults: requirement.testResults,
    remediations: requirement.remediation
  }))
  
  return {
    controlAssessments,
    riskSummary: {
      totalRisks: 0,
      criticalRisks: 0,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0,
      riskTrend: 'stable' as const
    }
  }
}

function generateRecommendations(framework: ComplianceFramework): string[] {
  const recommendations = []
  
  const criticalRequirements = framework.requirements.filter(r => r.priority === 'critical')
  if (criticalRequirements.length > 0) {
    recommendations.push(`Address ${criticalRequirements.length} critical requirements immediately`)
  }
  
  const highRiskRequirements = framework.requirements.filter(r => r.priority === 'high')
  if (highRiskRequirements.length > 0) {
    recommendations.push(`Implement ${highRiskRequirements.length} high-priority requirements within 30 days`)
  }
  
  recommendations.push('Conduct regular testing of implemented controls')
  recommendations.push('Maintain up-to-date evidence documentation')
  recommendations.push('Schedule quarterly reviews of compliance status')
  
  return recommendations
}

function generateNextSteps(framework: ComplianceFramework): string[] {
  return [
    'Schedule follow-up audit in 90 days',
    'Implement recommended remediation actions',
    'Update risk assessments based on findings',
    'Provide training to relevant stakeholders',
    'Review and update policies and procedures'
  ]
}

// Event emitter para notificaciones de compliance
export class ComplianceEventEmitter extends EventEmitter {
  static instance: ComplianceEventEmitter
  
  static getInstance(): ComplianceEventEmitter {
    if (!ComplianceEventEmitter.instance) {
      ComplianceEventEmitter.instance = new ComplianceEventEmitter()
    }
    return ComplianceEventEmitter.instance
  }
  
  emitAuditEvent(log: AuditLog) {
    this.emit('auditEvent', log)
  }
  
  emitComplianceAlert(alert: ComplianceState['alerts'][0]) {
    this.emit('complianceAlert', alert)
  }
  
  emitRiskEscalation(risk: RiskAssessment) {
    this.emit('riskEscalation', risk)
  }
}