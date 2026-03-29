export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  result: 'success' | 'failure' | 'denied';
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

export interface ComplianceReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalEvents: number;
    securityEvents: number;
    performanceEvents: number;
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    violations: number;
    remediations: number;
  };
  recommendations: string[];
  generatedAt: Date;
  status: 'draft' | 'final' | 'approved';
}

export interface Fortune10Requirement {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'availability' | 'performance' | 'compliance' | 'governance';
  weight: number;
  currentScore: number;
  targetScore: number;
  requirements: string[];
  evidence: string[];
}

export class EnterpriseAudit {
  private auditLog: AuditEvent[] = [];
  private complianceReports: ComplianceReport[] = [];
  private fortune10Requirements: Fortune10Requirement[] = [];
  private maxLogSize: number = 100000;
  private retentionPeriod: number = 2555 * 24 * 60 * 60 * 1000; // 7 years in milliseconds

  constructor() {
    this.initializeFortune10Requirements();
  }

  private initializeFortune10Requirements(): void {
    this.fortune10Requirements = [
      {
        id: 'sec-001',
        name: 'End-to-End Encryption',
        description: 'All data must be encrypted in transit and at rest using industry-standard algorithms',
        category: 'security',
        weight: 15,
        currentScore: 98,
        targetScore: 100,
        requirements: [
          'TLS 1.3 for all communications',
          'AES-256 encryption for data at rest',
          'Key rotation every 90 days',
          'Hardware Security Module (HSM) integration'
        ],
        evidence: [
          'SSL certificate validation reports',
          'Encryption audit logs',
          'Key management procedures'
        ]
      },
      {
        id: 'sec-002',
        name: 'Multi-Factor Authentication',
        description: 'All user access must require multi-factor authentication',
        category: 'security',
        weight: 12,
        currentScore: 95,
        targetScore: 100,
        requirements: [
          'MFA for all administrative accounts',
          'Biometric authentication support',
          'Hardware token integration',
          'Single Sign-On (SSO) compatibility'
        ],
        evidence: [
          'MFA implementation logs',
          'User authentication reports',
          'Security token inventory'
        ]
      },
      {
        id: 'avail-001',
        name: '99.99% Uptime SLA',
        description: 'System must maintain 99.99% availability with automatic failover',
        category: 'availability',
        weight: 20,
        currentScore: 99.97,
        targetScore: 99.99,
        requirements: [
          'Multi-region deployment',
          'Automatic failover capabilities',
          'Load balancing across regions',
          'Disaster recovery procedures'
        ],
        evidence: [
          'Uptime monitoring reports',
          'Incident response logs',
          'Disaster recovery test results'
        ]
      },
      {
        id: 'perf-001',
        name: 'Sub-200ms Response Time',
        description: 'API endpoints must respond within 200ms for 95th percentile',
        category: 'performance',
        weight: 10,
        currentScore: 94,
        targetScore: 95,
        requirements: [
          'Response time monitoring',
          'Performance optimization',
          'Caching strategies',
          'CDN integration'
        ],
        evidence: [
          'Performance monitoring dashboards',
          'Load testing results',
          'Optimization reports'
        ]
      },
      {
        id: 'comp-001',
        name: 'SOC 2 Type II Compliance',
        description: 'Annual SOC 2 Type II audit certification',
        category: 'compliance',
        weight: 18,
        currentScore: 96,
        targetScore: 100,
        requirements: [
          'Annual SOC 2 audit',
          'Continuous monitoring',
          'Control implementation',
          'Documentation maintenance'
        ],
        evidence: [
          'SOC 2 audit reports',
          'Control testing results',
          'Policy documentation'
        ]
      },
      {
        id: 'gov-001',
        name: 'Enterprise Governance',
        description: 'Comprehensive governance framework with regular reviews',
        category: 'governance',
        weight: 8,
        currentScore: 92,
        targetScore: 95,
        requirements: [
          'Regular board reviews',
          'Risk assessment procedures',
          'Policy updates',
          'Stakeholder communication'
        ],
        evidence: [
          'Board meeting minutes',
          'Risk assessment reports',
          'Policy update logs'
        ]
      }
    ];
  }

  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event
    };

    this.auditLog.push(auditEvent);

    // Maintain log size limit
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxLogSize);
    }

    // Clean up old events based on retention period
    this.cleanupOldEvents();

    return auditEvent;
  }

  logSecurityEvent(userId: string, action: string, resource: string, resourceId: string, result: AuditEvent['result'], details: Record<string, unknown> = {}): AuditEvent {
    return this.logEvent({
      userId,
      action,
      resource,
      resourceId,
      result,
      ipAddress: String(details.ipAddress || 'unknown'),
      userAgent: String(details.userAgent || 'unknown'),
      details,
      severity: this.determineSeverity(action, result),
      category: 'security',
      ...details
    });
  }

  logPerformanceEvent(action: string, resource: string, details: Record<string, unknown> = {}): AuditEvent {
    return this.logEvent({
      userId: 'system',
      action,
      resource,
      resourceId: String(details.resourceId || 'unknown'),
      result: 'success',
      ipAddress: 'localhost',
      userAgent: 'system-monitor',
      details,
      severity: 'low',
      category: 'performance'
    });
  }

  logComplianceEvent(action: string, details: Record<string, unknown> = {}): AuditEvent {
    return this.logEvent({
      userId: 'compliance-system',
      action,
      resource: 'compliance',
      resourceId: String(details.requirementId || 'unknown'),
      result: (details.result as 'success' | 'failure' | 'denied') || 'success',
      ipAddress: 'localhost',
      userAgent: 'compliance-monitor',
      details,
      severity: this.determineComplianceSeverity(action),
      category: 'compliance'
    });
  }

  private determineSeverity(action: string, result: AuditEvent['result']): AuditEvent['severity'] {
    if (result === 'denied' || action.includes('unauthorized')) return 'critical';
    if (result === 'failure') return 'high';
    if (action.includes('delete') || action.includes('modify')) return 'medium';
    return 'low';
  }

  private determineComplianceSeverity(action: string): AuditEvent['severity'] {
    if (action.includes('violation')) return 'critical';
    if (action.includes('non-compliance')) return 'high';
    if (action.includes('audit')) return 'medium';
    return 'low';
  }

  private generateEventId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldEvents(): void {
    const cutoffDate = new Date(Date.now() - this.retentionPeriod);
    this.auditLog = this.auditLog.filter(event => event.timestamp > cutoffDate);
  }

  getEvents(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: string;
    resource?: string;
    result?: AuditEvent['result'];
    severity?: AuditEvent['severity'];
    category?: string;
  } = {}): AuditEvent[] {
    return this.auditLog.filter(event => {
      if (filters.startDate && event.timestamp < filters.startDate) return false;
      if (filters.endDate && event.timestamp > filters.endDate) return false;
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.action && event.action !== filters.action) return false;
      if (filters.resource && event.resource !== filters.resource) return false;
      if (filters.result && event.result !== filters.result) return false;
      if (filters.severity && event.severity !== filters.severity) return false;
      if (filters.category && event.category !== filters.category) return false;
      return true;
    });
  }

  getEventsBySeverity(severity: AuditEvent['severity']): AuditEvent[] {
    return this.getEvents({ severity });
  }

  getSecurityEvents(): AuditEvent[] {
    return this.getEvents({ category: 'security' });
  }

  getComplianceEvents(): AuditEvent[] {
    return this.getEvents({ category: 'compliance' });
  }

  getPerformanceEvents(): AuditEvent[] {
    return this.getEvents({ category: 'performance' });
  }

  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const events = this.getEvents({ startDate, endDate });
    
    const securityEvents = events.filter(e => e.category === 'security');
    const performanceEvents = events.filter(e => e.category === 'performance');
    const violations = events.filter(e => e.result === 'failure' || e.result === 'denied');
    
    const complianceScore = this.calculateComplianceScore(events);
    const riskLevel = this.determineRiskLevel(violations.length, events.length);

    const report: ComplianceReport = {
      id: `report-${Date.now()}`,
      period: { start: startDate, end: endDate },
      metrics: {
        totalEvents: events.length,
        securityEvents: securityEvents.length,
        performanceEvents: performanceEvents.length,
        complianceScore,
        riskLevel,
        violations: violations.length,
        remediations: 0 // This would be calculated based on resolved issues
      },
      recommendations: this.generateRecommendations(events),
      generatedAt: new Date(),
      status: 'final'
    };

    this.complianceReports.push(report);
    return report;
  }

  private calculateComplianceScore(events: AuditEvent[]): number {
    if (events.length === 0) return 100;

    const violations = events.filter(e => e.result === 'failure' || e.result === 'denied');
    const criticalViolations = violations.filter(e => e.severity === 'critical');
    const highViolations = violations.filter(e => e.severity === 'high');

    let score = 100;
    score -= criticalViolations.length * 10;
    score -= highViolations.length * 5;
    score -= (violations.length - criticalViolations.length - highViolations.length) * 2;

    return Math.max(0, score);
  }

  private determineRiskLevel(violations: number, totalEvents: number): ComplianceReport['metrics']['riskLevel'] {
    const violationRate = totalEvents > 0 ? violations / totalEvents : 0;
    
    if (violationRate > 0.1) return 'high';
    if (violationRate > 0.05) return 'medium';
    return 'low';
  }

  private generateRecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = [];
    const violations = events.filter(e => e.result === 'failure' || e.result === 'denied');
    
    if (violations.length > 0) {
      const criticalViolations = violations.filter(e => e.severity === 'critical');
      if (criticalViolations.length > 0) {
        recommendations.push(`Address ${criticalViolations.length} critical security violations immediately`);
      }
      
      const highViolations = violations.filter(e => e.severity === 'high');
      if (highViolations.length > 0) {
        recommendations.push(`Review and remediate ${highViolations.length} high-severity issues`);
      }
    }

    const securityEvents = events.filter(e => e.category === 'security');
    if (securityEvents.length > events.length * 0.3) {
      recommendations.push('Consider implementing additional security controls');
    }

    const failedLogins = events.filter(e => e.action === 'login' && e.result === 'failure');
    if (failedLogins.length > 10) {
      recommendations.push('Review failed login attempts and consider account lockout policies');
    }

    return recommendations;
  }

  getFortune10Score(): number {
    if (this.fortune10Requirements.length === 0) return 0;

    const totalScore = this.fortune10Requirements.reduce((sum, req) => {
      return sum + (req.currentScore * req.weight);
    }, 0);

    const totalWeight = this.fortune10Requirements.reduce((sum, req) => sum + req.weight, 0);

    return Math.round(totalScore / totalWeight);
  }

  getFortune10Requirements(): Fortune10Requirement[] {
    return [...this.fortune10Requirements];
  }

  updateFortune10Requirement(requirementId: string, updates: Partial<Fortune10Requirement>): void {
    const requirement = this.fortune10Requirements.find(r => r.id === requirementId);
    if (requirement) {
      Object.assign(requirement, updates);
      
      // Log compliance event
      this.logComplianceEvent('requirement_updated', {
        requirementId,
        updates,
        newScore: updates.currentScore
      });
    }
  }

  getComplianceReports(): ComplianceReport[] {
    return [...this.complianceReports];
  }

  exportAuditLog(format: 'json' | 'csv' = 'json'): string {
    const events = this.getEvents();
    
    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    }
    
    // CSV format
    const headers = ['ID', 'Timestamp', 'User ID', 'Action', 'Resource', 'Resource ID', 'Result', 'Severity', 'Category', 'IP Address'];
    const rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.userId,
      event.action,
      event.resource,
      event.resourceId,
      event.result,
      event.severity,
      event.category,
      event.ipAddress
    ]);
    
    return [headers, ...rows].map(row => 
      Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : row
    ).join('\n');
  }

  generateFortune10Report(): {
    overallScore: number;
    requirements: Fortune10Requirement[];
    recommendations: string[];
    complianceLevel: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  } {
    const overallScore = this.getFortune10Score();
    const requirements = this.getFortune10Requirements();
    
    const recommendations: string[] = [];
    requirements.forEach(req => {
      if (req.currentScore < req.targetScore) {
        recommendations.push(`${req.name}: Current score ${req.currentScore}%, target ${req.targetScore}%`);
      }
    });

    let complianceLevel: 'excellent' | 'good' | 'needs_improvement' | 'critical';
    if (overallScore >= 95) {
      complianceLevel = 'excellent';
    } else if (overallScore >= 85) {
      complianceLevel = 'good';
    } else if (overallScore >= 70) {
      complianceLevel = 'needs_improvement';
    } else {
      complianceLevel = 'critical';
    }

    return {
      overallScore,
      requirements,
      recommendations,
      complianceLevel
    };
  }
}

// Singleton instance
export const globalEnterpriseAudit = new EnterpriseAudit();