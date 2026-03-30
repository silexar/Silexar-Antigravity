export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'denied';
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'security' | 'billing';
  complianceFlags: string[];
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  result?: 'success' | 'failure' | 'denied';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  ipAddress?: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  standard: 'SOX' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC2' | 'ISO27001' | 'Custom';
  requirements: string[];
  auditFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastAuditDate: Date;
  nextAuditDate: Date;
  status: 'compliant' | 'non-compliant' | 'partial' | 'pending';
  responsibleTeam: string;
  evidence: string[];
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  category: 'audit_logs' | 'user_data' | 'financial' | 'system_logs' | 'communications';
  retentionPeriod: number; // in days
  deletionMethod: 'automatic' | 'manual' | 'review_required';
  legalHoldEnabled: boolean;
  encryptionRequired: boolean;
  geographicRestrictions: string[];
}

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/observability';

export class EnterpriseAuditService {
  private auditEvents: AuditEvent[] = [];
  private complianceRequirements: ComplianceRequirement[] = [];
  private dataRetentionPolicies: DataRetentionPolicy[] = [];
  private maxEventsInMemory = 10000;
  private eventCallbacks: Array<(event: AuditEvent) => void> = [];

  constructor() {
    this.initializeComplianceRequirements();
    this.initializeDataRetentionPolicies();
  }

  private initializeComplianceRequirements(): void {
    this.complianceRequirements = [
      {
        id: 'sox-compliance',
        name: 'SOX Financial Reporting',
        description: 'Sarbanes-Oxley Act compliance for financial data integrity',
        standard: 'SOX',
        requirements: [
          'All financial data access must be logged',
          'Data modifications require approval workflow',
          'Segregation of duties enforced',
          'Regular access reviews conducted',
          'Change management documented'
        ],
        auditFrequency: 'quarterly',
        lastAuditDate: new Date('2024-01-01'),
        nextAuditDate: new Date('2024-04-01'),
        status: 'compliant',
        responsibleTeam: 'Finance & IT Security',
        evidence: ['Access logs', 'Approval workflows', 'User access reviews']
      },
      {
        id: 'gdpr-compliance',
        name: 'GDPR Data Protection',
        description: 'General Data Protection Regulation compliance',
        standard: 'GDPR',
        requirements: [
          'User consent management',
          'Right to erasure (deletion)',
          'Data portability',
          'Privacy by design',
          'Data breach notification'
        ],
        auditFrequency: 'monthly',
        lastAuditDate: new Date('2024-02-15'),
        nextAuditDate: new Date('2024-03-15'),
        status: 'partial',
        responsibleTeam: 'Privacy & Legal',
        evidence: ['Consent records', 'Deletion logs', 'Breach notifications']
      },
      {
        id: 'soc2-compliance',
        name: 'SOC 2 Type II',
        description: 'Service Organization Control 2 compliance',
        standard: 'SOC2',
        requirements: [
          'Security controls implementation',
          'Availability monitoring',
          'Processing integrity',
          'Confidentiality protection',
          'Privacy controls'
        ],
        auditFrequency: 'annually',
        lastAuditDate: new Date('2023-12-01'),
        nextAuditDate: new Date('2024-12-01'),
        status: 'compliant',
        responsibleTeam: 'Information Security',
        evidence: ['Security assessments', 'Penetration tests', 'Control testing']
      },
      {
        id: 'pci-compliance',
        name: 'PCI-DSS Payment Security',
        description: 'Payment Card Industry Data Security Standard',
        standard: 'PCI-DSS',
        requirements: [
          'Secure network maintenance',
          'Cardholder data protection',
          'Vulnerability management',
          'Access control measures',
          'Network monitoring'
        ],
        auditFrequency: 'quarterly',
        lastAuditDate: new Date('2024-01-15'),
        nextAuditDate: new Date('2024-04-15'),
        status: 'compliant',
        responsibleTeam: 'Payment Security',
        evidence: ['Network scans', 'Penetration tests', 'Access controls']
      }
    ];
  }

  private initializeDataRetentionPolicies(): void {
    this.dataRetentionPolicies = [
      {
        id: 'audit-logs',
        name: 'Audit Log Retention',
        category: 'audit_logs',
        retentionPeriod: 2555, // 7 years
        deletionMethod: 'automatic',
        legalHoldEnabled: true,
        encryptionRequired: true,
        geographicRestrictions: ['US', 'EU']
      },
      {
        id: 'user-data',
        name: 'User Data Retention',
        category: 'user_data',
        retentionPeriod: 1095, // 3 years after account closure
        deletionMethod: 'review_required',
        legalHoldEnabled: false,
        encryptionRequired: true,
        geographicRestrictions: ['US', 'EU', 'APAC']
      },
      {
        id: 'financial-data',
        name: 'Financial Data Retention',
        category: 'financial',
        retentionPeriod: 2555, // 7 years for tax purposes
        deletionMethod: 'manual',
        legalHoldEnabled: true,
        encryptionRequired: true,
        geographicRestrictions: ['US']
      },
      {
        id: 'system-logs',
        name: 'System Log Retention',
        category: 'system_logs',
        retentionPeriod: 90, // 90 days
        deletionMethod: 'automatic',
        legalHoldEnabled: false,
        encryptionRequired: false,
        geographicRestrictions: []
      }
    ];
  }

  // Audit Event Management
  logEvent(eventData: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const event: AuditEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      ...eventData,
    };

    this.auditEvents.push(event);

    // Maintain memory limit
    if (this.auditEvents.length > this.maxEventsInMemory) {
      this.auditEvents = this.auditEvents.slice(-this.maxEventsInMemory);
    }

    // Trigger callbacks for real-time monitoring
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        logger.error('Audit callback error:', error instanceof Error ? error : undefined);
      }
    });

    return event;
  }

  logAuthenticationEvent(
    userId: string,
    userEmail: string,
    action: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled',
    ipAddress: string,
    userAgent: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, unknown>
  ): AuditEvent {
    return this.logEvent({
      userId,
      userEmail,
      action,
      resource: 'authentication',
      resourceId: userId,
      ipAddress,
      userAgent,
      result,
      details: details || {},
      severity: result === 'failure' ? 'high' : 'medium',
      category: 'authentication',
      complianceFlags: ['SOX', 'SOC2'],
    });
  }

  logAuthorizationEvent(
    userId: string,
    userEmail: string,
    action: 'access_granted' | 'access_denied' | 'permission_modified' | 'role_changed',
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, unknown>
  ): AuditEvent {
    return this.logEvent({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      result,
      details: details || {},
      severity: result === 'denied' ? 'high' : 'medium',
      category: 'authorization',
      complianceFlags: ['SOX', 'GDPR', 'SOC2'],
    });
  }

  logDataAccessEvent(
    userId: string,
    userEmail: string,
    action: 'read' | 'write' | 'delete' | 'export' | 'import',
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, unknown>
  ): AuditEvent {
    return this.logEvent({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      result,
      details: details || {},
      severity: action === 'delete' || action === 'export' ? 'high' : 'medium',
      category: 'data_access',
      complianceFlags: ['GDPR', 'SOX', 'HIPAA'],
    });
  }

  logSecurityEvent(
    userId: string,
    userEmail: string,
    action: 'security_breach' | 'suspicious_activity' | 'policy_violation' | 'unauthorized_access',
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, unknown>
  ): AuditEvent {
    return this.logEvent({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      result,
      details: details || {},
      severity: 'critical',
      category: 'security',
      complianceFlags: ['SOC2', 'ISO27001'],
    });
  }

  // Audit Query and Filtering
  getEvents(filter: AuditFilter = {}): AuditEvent[] {
    return this.auditEvents.filter(event => {
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      if (filter.action && event.action !== filter.action) return false;
      if (filter.resource && event.resource !== filter.resource) return false;
      if (filter.result && event.result !== filter.result) return false;
      if (filter.severity && event.severity !== filter.severity) return false;
      if (filter.category && event.category !== filter.category) return false;
      if (filter.ipAddress && event.ipAddress !== filter.ipAddress) return false;
      return true;
    });
  }

  getEventsByTimeRange(startDate: Date, endDate: Date): AuditEvent[] {
    return this.getEvents({ startDate, endDate });
  }

  getEventsByUser(userId: string): AuditEvent[] {
    return this.getEvents({ userId });
  }

  getEventsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): AuditEvent[] {
    return this.getEvents({ severity });
  }

  getEventsByCategory(category: string): AuditEvent[] {
    return this.getEvents({ category });
  }

  // Compliance Management
  getComplianceRequirements(): ComplianceRequirement[] {
    return [...this.complianceRequirements];
  }

  getComplianceRequirement(id: string): ComplianceRequirement | undefined {
    return this.complianceRequirements.find(req => req.id === id);
  }

  updateComplianceStatus(id: string, status: 'compliant' | 'non-compliant' | 'partial' | 'pending'): void {
    const requirement = this.complianceRequirements.find(req => req.id === id);
    if (requirement) {
      requirement.status = status;
      requirement.lastAuditDate = new Date();
      
      // Calculate next audit date based on frequency
      const now = new Date();
      switch (requirement.auditFrequency) {
        case 'daily':
          requirement.nextAuditDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          requirement.nextAuditDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          requirement.nextAuditDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          break;
        case 'quarterly':
          requirement.nextAuditDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
          break;
        case 'annually':
          requirement.nextAuditDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          break;
      }
    }
  }

  getOverdueComplianceRequirements(): ComplianceRequirement[] {
    const now = new Date();
    return this.complianceRequirements.filter(req => req.nextAuditDate < now);
  }

  // Data Retention Management
  getDataRetentionPolicies(): DataRetentionPolicy[] {
    return [...this.dataRetentionPolicies];
  }

  getDataRetentionPolicy(category: string): DataRetentionPolicy | undefined {
    return this.dataRetentionPolicies.find(policy => policy.category === category);
  }

  isDataRetentionCompliant(eventDate: Date, category: string): boolean {
    const policy = this.getDataRetentionPolicy(category);
    if (!policy) return true;

    const now = new Date();
    const retentionDate = new Date(now.getTime() - policy.retentionPeriod * 24 * 60 * 60 * 1000);
    
    return eventDate >= retentionDate;
  }

  // Event Subscription
  subscribe(callback: (event: AuditEvent) => void): () => void {
    this.eventCallbacks.push(callback);
    
    return () => {
      const index = this.eventCallbacks.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

  // Analytics and Reporting
  getAuditSummary(startDate: Date, endDate: Date): {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    eventsByResult: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
    complianceViolations: number;
  } {
    const events = this.getEventsByTimeRange(startDate, endDate);
    
    const summary = {
      totalEvents: events.length,
      eventsByCategory: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      eventsByResult: {} as Record<string, number>,
      topUsers: [] as Array<{ userId: string; count: number }>,
      complianceViolations: 0,
    };

    const userCounts = new Map<string, number>();

    events.forEach(event => {
      // Count by category
      summary.eventsByCategory[event.category] = 
        (summary.eventsByCategory[event.category] || 0) + 1;

      // Count by severity
      summary.eventsBySeverity[event.severity] = 
        (summary.eventsBySeverity[event.severity] || 0) + 1;

      // Count by result
      summary.eventsByResult[event.result] = 
        (summary.eventsByResult[event.result] || 0) + 1;

      // Count by user
      userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);

      // Count compliance violations
      if (event.result === 'denied' || event.severity === 'critical') {
        summary.complianceViolations++;
      }
    });

    // Get top users
    summary.topUsers = Array.from(userCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    return summary;
  }

  generateComplianceReport(): {
    requirements: ComplianceRequirement[];
    overdue: ComplianceRequirement[];
    summary: {
      total: number;
      compliant: number;
      nonCompliant: number;
      partial: number;
      pending: number;
    };
  } {
    const overdue = this.getOverdueComplianceRequirements();
    const summary = {
      total: this.complianceRequirements.length,
      compliant: this.complianceRequirements.filter(r => r.status === 'compliant').length,
      nonCompliant: this.complianceRequirements.filter(r => r.status === 'non-compliant').length,
      partial: this.complianceRequirements.filter(r => r.status === 'partial').length,
      pending: this.complianceRequirements.filter(r => r.status === 'pending').length,
    };

    return {
      requirements: this.complianceRequirements,
      overdue,
      summary,
    };
  }
}

// Global audit service instance
export const auditService = new EnterpriseAuditService();