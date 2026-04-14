import { useCallback, useEffect, useState } from 'react';
import { auditService, AuditEvent, AuditFilter } from '@/lib/audit/enterprise-audit';

export interface UseAuditOptions {
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  autoLog?: boolean;
}

export interface AuditLogger {
  logAuthentication: (
    action: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled',
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, any>
  ) => AuditEvent;
  
  logAuthorization: (
    action: 'access_granted' | 'access_denied' | 'permission_modified' | 'role_changed',
    resource: string,
    resourceId: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, any>
  ) => AuditEvent;
  
  logDataAccess: (
    action: 'read' | 'write' | 'delete' | 'export' | 'import',
    resource: string,
    resourceId: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, any>
  ) => AuditEvent;
  
  logSecurity: (
    action: 'security_breach' | 'suspicious_activity' | 'policy_violation' | 'unauthorized_access',
    resource: string,
    resourceId: string,
    result: 'success' | 'failure' | 'denied',
    details?: Record<string, any>
  ) => AuditEvent;
  
  logCustom: (
    action: string,
    resource: string,
    resourceId: string,
    result: 'success' | 'failure' | 'denied',
    category: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, any>
  ) => AuditEvent;
}

export function useAudit(options: UseAuditOptions = {}): AuditLogger {
  const {
    userId = 'anonymous',
    userEmail = 'anonymous@system.com',
    ipAddress = 'unknown',
    userAgent = 'unknown',
    autoLog = true,
  } = options;

  const logAuthentication = useCallback(
    (
      action: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled',
      result: 'success' | 'failure' | 'denied',
      details?: Record<string, any>
    ): AuditEvent => {
      return auditService.logAuthenticationEvent(
        userId,
        userEmail,
        action,
        ipAddress,
        userAgent,
        result,
        details
      );
    },
    [userId, userEmail, ipAddress, userAgent]
  );

  const logAuthorization = useCallback(
    (
      action: 'access_granted' | 'access_denied' | 'permission_modified' | 'role_changed',
      resource: string,
      resourceId: string,
      result: 'success' | 'failure' | 'denied',
      details?: Record<string, any>
    ): AuditEvent => {
      return auditService.logAuthorizationEvent(
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        result,
        details
      );
    },
    [userId, userEmail, ipAddress, userAgent]
  );

  const logDataAccess = useCallback(
    (
      action: 'read' | 'write' | 'delete' | 'export' | 'import',
      resource: string,
      resourceId: string,
      result: 'success' | 'failure' | 'denied',
      details?: Record<string, any>
    ): AuditEvent => {
      return auditService.logDataAccessEvent(
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        result,
        details
      );
    },
    [userId, userEmail, ipAddress, userAgent]
  );

  const logSecurity = useCallback(
    (
      action: 'security_breach' | 'suspicious_activity' | 'policy_violation' | 'unauthorized_access',
      resource: string,
      resourceId: string,
      result: 'success' | 'failure' | 'denied',
      details?: Record<string, any>
    ): AuditEvent => {
      return auditService.logSecurityEvent(
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        result,
        details
      );
    },
    [userId, userEmail, ipAddress, userAgent]
  );

  const logCustom = useCallback(
    (
      action: string,
      resource: string,
      resourceId: string,
      result: 'success' | 'failure' | 'denied',
      category: string,
      severity: 'low' | 'medium' | 'high' | 'critical',
      details?: Record<string, any>
    ): AuditEvent => {
      return auditService.logEvent({
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        result,
        details: details || {},
        severity,
        category: category as any,
        complianceFlags: [],
      });
    },
    [userId, userEmail, ipAddress, userAgent]
  );

  return {
    logAuthentication,
    logAuthorization,
    logDataAccess,
    logSecurity,
    logCustom,
  };
}

export function useAuditEvents(filter: AuditFilter = {}) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filteredEvents = auditService.getEvents(filter);
    setEvents(filteredEvents);
    setLoading(false);
  }, [filter]);

  return { events, loading };
}

export function useCompliance() {
  const [requirements, setRequirements] = useState(auditService.getComplianceRequirements());
  const [overdue, setOverdue] = useState(auditService.getOverdueComplianceRequirements());

  const refreshCompliance = useCallback(() => {
    setRequirements(auditService.getComplianceRequirements());
    setOverdue(auditService.getOverdueComplianceRequirements());
  }, []);

  const updateComplianceStatus = useCallback((id: string, status: 'compliant' | 'non-compliant' | 'partial' | 'pending') => {
    auditService.updateComplianceStatus(id, status);
    refreshCompliance();
  }, [refreshCompliance]);

  return {
    requirements,
    overdue,
    refreshCompliance,
    updateComplianceStatus,
  };
}

export function useAuditSubscription(callback: (event: AuditEvent) => void) {
  useEffect(() => {
    const unsubscribe = auditService.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}

export function useAuditSummary(startDate: Date, endDate: Date) {
  const [summary, setSummary] = useState(() => auditService.getAuditSummary(startDate, endDate));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const newSummary = auditService.getAuditSummary(startDate, endDate);
    setSummary(newSummary);
    setLoading(false);
  }, [startDate, endDate]);

  return { summary, loading };
}

// Utility hook for component-level audit logging
export function useComponentAudit(componentName: string, options: UseAuditOptions = {}) {
  const audit = useAudit(options);

  const logComponentMount = useCallback(() => {
    audit.logCustom(
      'component_mount',
      'ui_component',
      componentName,
      'success',
      'system',
      'low'
    );
  }, [audit, componentName]);

  const logComponentUnmount = useCallback(() => {
    audit.logCustom(
      'component_unmount',
      'ui_component',
      componentName,
      'success',
      'system',
      'low'
    );
  }, [audit, componentName]);

  const logUserAction = useCallback((
    action: string,
    result: 'success' | 'failure' | 'denied' = 'success',
    details?: Record<string, any>
  ) => {
    audit.logCustom(
      action,
      'ui_component',
      componentName,
      result,
      'user_action',
      result === 'denied' ? 'medium' : 'low',
      details
    );
  }, [audit, componentName]);

  const logError = useCallback((
    error: string,
    details?: Record<string, any>
  ) => {
    audit.logCustom(
      'component_error',
      'ui_component',
      componentName,
      'failure',
      'system',
      'high',
      { error, ...details }
    );
  }, [audit, componentName]);

  useEffect(() => {
    if (options.autoLog !== false) {
      logComponentMount();
      return () => {
        logComponentUnmount();
      };
    }
  }, [logComponentMount, logComponentUnmount, options.autoLog]);

  return {
    logComponentMount,
    logComponentUnmount,
    logUserAction,
    logError,
    ...audit,
  };
}