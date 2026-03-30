/**
 * 🔍 SILEXAR PULSE QUANTUM - AUDIT LOGGING SYSTEM
 * 
 * Sistema de audit logging estructurado para seguridad TIER 0
 * Registro completo de eventos de seguridad y actividades del sistema
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - SECURITY FOUNDATION
 */

import { qualityLogger } from '../quality/quality-logger';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/audit-logs-schema';

// 🎯 Audit Event Types
export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  
  // Authorization Events
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  
  // Data Events
  DATA_CREATE = 'DATA_CREATE',
  DATA_READ = 'DATA_READ',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_EXPORT = 'DATA_EXPORT',
  
  // System Events
  SYSTEM_START = 'SYSTEM_START',
  SYSTEM_STOP = 'SYSTEM_STOP',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  BACKUP_CREATE = 'BACKUP_CREATE',
  BACKUP_RESTORE = 'BACKUP_RESTORE',
  
  // Security Events
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  MALWARE_DETECTED = 'MALWARE_DETECTED',
  
  // API Events
  API_CALL = 'API_CALL',
  API_ERROR = 'API_ERROR',
  API_RATE_LIMITED = 'API_RATE_LIMITED',
  
  // Admin Events
  ADMIN_ACTION = 'ADMIN_ACTION',
  USER_CREATED = 'USER_CREATED',
  USER_DELETED = 'USER_DELETED',
  USER_MODIFIED = 'USER_MODIFIED'
}

// 🔒 Audit Event Severity
export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 📊 Audit Event Interface
interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

// 🎯 Audit Filter
interface AuditFilter {
  eventType?: AuditEventType[];
  severity?: AuditSeverity[];
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  success?: boolean;
  ipAddress?: string;
  resource?: string;
}

/**
 * 🔍 Audit Logger Class
 */
export class AuditLogger {
  private events: AuditEvent[];
  private maxEvents: number;
  private loggerId: string;

  constructor(maxEvents: number = 10000) {
    this.events = [];
    this.maxEvents = maxEvents;
    this.loggerId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    qualityLogger.info('Audit Logger initialized', 'AUDIT_LOGGER', {
      loggerId: this.loggerId,
      maxEvents: this.maxEvents
    });

    // Log system start
    this.logEvent({
      eventType: AuditEventType.SYSTEM_START,
      severity: AuditSeverity.MEDIUM,
      resource: 'AUDIT_SYSTEM',
      action: 'INITIALIZE',
      details: { loggerId: this.loggerId },
      success: true
    });
  }

  /**
   * 📝 Log Audit Event
   * @param eventData - Event data to log
   */
  logEvent(eventData: Partial<AuditEvent> & { 
    eventType: AuditEventType; 
    severity: AuditSeverity; 
    success: boolean 
  }): void {
    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      details: {},
      metadata: {},
      ...eventData
    };

    // Add to events array
    this.events.push(event);

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events.shift(); // Remove oldest event
    }

    // Log to quality logger (stdout / log aggregator)
    qualityLogger.info(`Audit Event: ${event.eventType}`, 'AUDIT', {
      auditId: event.id,
      eventType: event.eventType,
      severity: event.severity,
      userId: event.userId,
      resource: event.resource,
      success: event.success,
      details: event.details
    });

    // Persist to DB asynchronously — fire-and-forget, never block the request
    // Capture db in local const so TS knows it's non-null inside the callback
    const dbInstance = db;
    if (dbInstance) {
      Promise.resolve().then(() =>
        dbInstance.insert(auditLogs).values({
          eventId:     event.id,
          eventType:   event.eventType,
          eventCategory: 'SECURITY',
          userId:      event.userId as string | undefined,
          sessionId:   event.sessionId,
          ipAddress:   event.ipAddress,
          userAgent:   event.userAgent,
          resource:    event.resource,
          action:      event.action,
          result:      event.success ? 'success' : 'failure',
          eventData:   event.details as Record<string, unknown>,
          metadata:    event.metadata as Record<string, unknown>,
          severity:    event.severity,
          timestamp:   event.timestamp,
        }).catch(() => { /* DB unavailable — in-memory fallback is sufficient */ })
      );
    }

    // Alert on critical events immediately
    if (event.severity === AuditSeverity.CRITICAL) {
      this.handleCriticalEvent(event);
    }
  }

  /**
   * 🚨 Handle Critical Events
   * @param event - Critical audit event
   */
  private handleCriticalEvent(event: AuditEvent): void {
    qualityLogger.error(`CRITICAL AUDIT EVENT: ${event.eventType}`, 'AUDIT_CRITICAL', {
      auditId: event.id,
      eventType: event.eventType,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
      timestamp: event.timestamp
    });

    // Here you could add additional alerting mechanisms:
    // - Send email alerts
    // - Trigger security notifications
    // - Escalate to security team
    // - Auto-block suspicious IPs
  }

  /**
   * 🔍 Query Audit Events
   * @param filter - Filter criteria
   * @param limit - Maximum number of results
   * @returns Filtered audit events
   */
  queryEvents(filter: AuditFilter = {}, limit: number = 100): AuditEvent[] {
    let filteredEvents = [...this.events];

    // Apply filters
    if (filter.eventType && filter.eventType.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filter.eventType!.includes(event.eventType)
      );
    }

    if (filter.severity && filter.severity.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filter.severity!.includes(event.severity)
      );
    }

    if (filter.userId) {
      filteredEvents = filteredEvents.filter(event => 
        event.userId === filter.userId
      );
    }

    if (filter.dateFrom) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= filter.dateFrom!
      );
    }

    if (filter.dateTo) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp <= filter.dateTo!
      );
    }

    if (filter.success !== undefined) {
      filteredEvents = filteredEvents.filter(event => 
        event.success === filter.success
      );
    }

    if (filter.ipAddress) {
      filteredEvents = filteredEvents.filter(event => 
        event.ipAddress === filter.ipAddress
      );
    }

    if (filter.resource) {
      filteredEvents = filteredEvents.filter(event => 
        event.resource?.includes(filter.resource!)
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    return filteredEvents.slice(0, limit);
  }

  /**
   * 📊 Get Audit Statistics
   * @param timeframe - Timeframe in hours (default: 24)
   * @returns Audit statistics
   */
  getStatistics(timeframe: number = 24): {
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    successRate: number;
    criticalEvents: number;
    topUsers: Array<{ userId: string; count: number }>;
    topIPs: Array<{ ipAddress: string; count: number }>;
  } {
    const cutoffTime = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
    const recentEvents = this.events.filter(event => event.timestamp >= cutoffTime);

    // Count by type
    const eventsByType = {} as Record<AuditEventType, number>;
    Object.values(AuditEventType).forEach(type => {
      eventsByType[type] = 0;
    });

    // Count by severity
    const eventsBySeverity = {} as Record<AuditSeverity, number>;
    Object.values(AuditSeverity).forEach(severity => {
      eventsBySeverity[severity] = 0;
    });

    // Count users and IPs
    const userCounts = new Map<string, number>();
    const ipCounts = new Map<string, number>();
    let successfulEvents = 0;
    let criticalEvents = 0;

    recentEvents.forEach(event => {
      // Count by type
      eventsByType[event.eventType]++;

      // Count by severity
      eventsBySeverity[event.severity]++;

      // Count success
      if (event.success) successfulEvents++;

      // Count critical
      if (event.severity === AuditSeverity.CRITICAL) criticalEvents++;

      // Count users
      if (event.userId) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }

      // Count IPs
      if (event.ipAddress) {
        ipCounts.set(event.ipAddress, (ipCounts.get(event.ipAddress) || 0) + 1);
      }
    });

    // Top users
    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top IPs
    const topIPs = Array.from(ipCounts.entries())
      .map(([ipAddress, count]) => ({ ipAddress, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      successRate: recentEvents.length > 0 ? (successfulEvents / recentEvents.length) * 100 : 0,
      criticalEvents,
      topUsers,
      topIPs
    };
  }

  /**
   * 📤 Export Audit Log
   * @param filter - Filter criteria
   * @param format - Export format
   * @returns Exported data
   */
  exportAuditLog(filter: AuditFilter = {}, format: 'json' | 'csv' = 'json'): string {
    const events = this.queryEvents(filter, 10000); // Export up to 10k events

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // CSV format
      const headers = [
        'ID', 'Timestamp', 'Event Type', 'Severity', 'User ID', 'IP Address', 
        'Resource', 'Action', 'Success', 'Error Message'
      ];
      
      const csvRows = [
        headers.join(','),
        ...events.map(event => [
          event.id,
          event.timestamp.toISOString(),
          event.eventType,
          event.severity,
          event.userId || '',
          event.ipAddress || '',
          event.resource || '',
          event.action || '',
          event.success,
          event.errorMessage || ''
        ].map(field => `"${field}"`).join(','))
      ];

      return csvRows.join('\n');
    }
  }

  /**
   * 🧹 Cleanup Old Events
   * @param olderThanDays - Remove events older than specified days
   */
  cleanupOldEvents(olderThanDays: number = 90): number {
    const cutoffTime = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
    const initialCount = this.events.length;
    
    this.events = this.events.filter(event => event.timestamp >= cutoffTime);
    
    const removedCount = initialCount - this.events.length;
    
    if (removedCount > 0) {
      qualityLogger.info(`Cleaned up ${removedCount} old audit events`, 'AUDIT_CLEANUP', {
        removedCount,
        olderThanDays,
        remainingEvents: this.events.length
      });
    }

    return removedCount;
  }
}

// 🛡️ Global Audit Logger Instance
const _auditLogger = new AuditLogger();

// 🔧 Utility Functions for Common Audit Events

export function logLoginSuccess(userId: string, userEmail: string, ipAddress: string, sessionId: string): void {
  auditLogger.logEvent({
    eventType: AuditEventType.LOGIN_SUCCESS,
    severity: AuditSeverity.LOW,
    userId,
    userEmail,
    ipAddress,
    sessionId,
    resource: 'AUTH_SYSTEM',
    action: 'LOGIN',
    details: { loginMethod: 'credentials' },
    success: true
  });
}

export function logLoginFailure(userEmail: string, ipAddress: string, reason: string): void {
  auditLogger.logEvent({
    eventType: AuditEventType.LOGIN_FAILURE,
    severity: AuditSeverity.MEDIUM,
    userEmail,
    ipAddress,
    resource: 'AUTH_SYSTEM',
    action: 'LOGIN',
    details: { reason, attemptedEmail: userEmail },
    success: false,
    errorMessage: reason
  });
}

export function logDataAccess(userId: string, resource: string, action: string, success: boolean, details?: Record<string, unknown>): void {
  auditLogger.logEvent({
    eventType: AuditEventType.DATA_READ,
    severity: AuditSeverity.LOW,
    userId,
    resource,
    action,
    details: details || {},
    success
  });
}

export function logSecurityViolation(userId: string, ipAddress: string, violation: string, details: Record<string, unknown>): void {
  auditLogger.logEvent({
    eventType: AuditEventType.SECURITY_VIOLATION,
    severity: AuditSeverity.CRITICAL,
    userId,
    ipAddress,
    resource: 'SECURITY_SYSTEM',
    action: 'VIOLATION_DETECTED',
    details: { violation, ...details },
    success: false,
    errorMessage: violation
  });
}

export function logAdminAction(userId: string, action: string, resource: string, details: Record<string, unknown>): void {
  auditLogger.logEvent({
    eventType: AuditEventType.ADMIN_ACTION,
    severity: AuditSeverity.HIGH,
    userId,
    resource,
    action,
    details,
    success: true
  });
}

export function logApiCall(userId: string, endpoint: string, method: string, statusCode: number, ipAddress?: string): void {
  auditLogger.logEvent({
    eventType: AuditEventType.API_CALL,
    severity: AuditSeverity.LOW,
    userId,
    ipAddress,
    resource: endpoint,
    action: method,
    details: { statusCode, endpoint, method },
    success: statusCode < 400
  });
}

// 🔧 Enterprise-level audit methods for monitoring and auto-scaling
export function logAuth(message: string, userId?: string, details?: Record<string, unknown>): void {
  auditLogger.logEvent({
    eventType: AuditEventType.ACCESS_GRANTED,
    severity: AuditSeverity.LOW,
    userId,
    resource: 'ENTERPRISE_SYSTEM',
    action: 'AUTH_EVENT',
    details: { message, ...details },
    success: true
  });
}

export function logError(message: string, error: Error, details?: Record<string, unknown>): void {
  auditLogger.logEvent({
    eventType: AuditEventType.SYSTEM_STOP,
    severity: AuditSeverity.HIGH,
    resource: 'ENTERPRISE_SYSTEM',
    action: 'ERROR_EVENT',
    details: { 
      message, 
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...details 
    },
    success: false,
    errorMessage: error.message
  });
}

export function logSecurity(message: string, details?: Record<string, unknown>): void {
  auditLogger.logEvent({
    eventType: AuditEventType.SECURITY_VIOLATION,
    severity: AuditSeverity.CRITICAL,
    resource: 'SECURITY_SYSTEM',
    action: 'SECURITY_EVENT',
    details: { message, ...details },
    success: false,
    errorMessage: message
  });
}

// ── Extended interface — typed, no `any` ────────────────────────────────────
// Defines all dynamic helper methods so call-sites are fully typed.

export interface ExtendedAuditLogger extends AuditLogger {
  log(entry: {
    type: AuditEventType;
    message?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }): void;
  auth(message: string, user?: unknown, details?: Record<string, unknown>): void;
  critical(message: string, details?: Record<string, unknown>): void;
  security(message: string, details?: Record<string, unknown>): void;
  error(message: string, error?: unknown, details?: Record<string, unknown>): void;
  child(context: unknown): ExtendedAuditLogger;
}

// Attach methods to the singleton instance
const extended = _auditLogger as ExtendedAuditLogger;

extended.log = (entry) => {
  try {
    _auditLogger.logEvent({
      eventType: entry.type,
      severity:
        entry.type.includes('CRITICAL') || entry.type.includes('VIOLATION')
          ? AuditSeverity.CRITICAL
          : entry.type.includes('FAILURE') || entry.type.includes('LOCKED') || entry.type.includes('DENIED')
          ? AuditSeverity.HIGH
          : AuditSeverity.LOW,
      userId: entry.userId,
      resource: (entry.metadata?.['resource'] as string | undefined) ?? 'SYSTEM',
      action: entry.type,
      details: { message: entry.message, ...entry.metadata },
      success:
        !entry.type.includes('FAILURE') &&
        !entry.type.includes('VIOLATION') &&
        !entry.type.includes('ERROR'),
    });
  } catch { /* noop */ }
};

extended.auth = (message, user?, details?) => {
  try {
    const userId =
      user != null && typeof user === 'object' && 'id' in user
        ? String((user as Record<string, unknown>)['id'])
        : typeof user === 'string'
        ? user
        : undefined;
    logAuth(message, userId, details);
  } catch { /* noop */ }
};

extended.critical = (message, details?) => {
  try { logSecurity(message, details) } catch { /* noop */ }
};

extended.security = (message, details?) => {
  try { logSecurity(message, details) } catch { /* noop */ }
};

extended.error = (message, error?, details?) => {
  try {
    logError(
      message,
      error instanceof Error ? error : new Error(String(error ?? '')),
      details,
    );
  } catch { /* noop */ }
};

extended.child = (_context) => extended;

export const auditLogger: ExtendedAuditLogger = extended;
