/**
 * 📝 SILEXAR PULSE QUANTUM - QUALITY LOGGER TIER 0
 * 
 * Sistema de logging estructurado para validación de calidad
 * Audit trail completo con correlación de eventos
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - MILITARY GRADE QUALITY LOGGING
 */

import { AuditEntry, SeverityLevel, QualityValidationResult } from './types';
import { logger } from '@/lib/observability';

// 📊 Log Entry Interface
interface QualityLogEntry {
  id: string;
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: string;
  message: string;
  component?: string;
  user?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  duration?: number;
  stackTrace?: string;
}

// 🎯 Quality Event Types
export const QUALITY_EVENTS = {
  // Validation Events
  VALIDATION_STARTED: 'VALIDATION_STARTED',
  VALIDATION_COMPLETED: 'VALIDATION_COMPLETED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // Quality Gate Events
  QUALITY_GATE_PASSED: 'QUALITY_GATE_PASSED',
  QUALITY_GATE_FAILED: 'QUALITY_GATE_FAILED',
  QUALITY_GATE_BYPASSED: 'QUALITY_GATE_BYPASSED',
  
  // Security Events
  SECURITY_SCAN_STARTED: 'SECURITY_SCAN_STARTED',
  SECURITY_VULNERABILITY_FOUND: 'SECURITY_VULNERABILITY_FOUND',
  SECURITY_VULNERABILITY_RESOLVED: 'SECURITY_VULNERABILITY_RESOLVED',
  
  // Performance Events
  PERFORMANCE_DEGRADATION: 'PERFORMANCE_DEGRADATION',
  PERFORMANCE_IMPROVEMENT: 'PERFORMANCE_IMPROVEMENT',
  PERFORMANCE_THRESHOLD_EXCEEDED: 'PERFORMANCE_THRESHOLD_EXCEEDED',
  
  // Test Events
  TEST_COVERAGE_DECREASED: 'TEST_COVERAGE_DECREASED',
  TEST_COVERAGE_IMPROVED: 'TEST_COVERAGE_IMPROVED',
  TEST_FAILURE: 'TEST_FAILURE',
  
  // Accessibility Events
  ACCESSIBILITY_VIOLATION_FOUND: 'ACCESSIBILITY_VIOLATION_FOUND',
  ACCESSIBILITY_VIOLATION_FIXED: 'ACCESSIBILITY_VIOLATION_FIXED',
  
  // Documentation Events
  DOCUMENTATION_UPDATED: 'DOCUMENTATION_UPDATED',
  DOCUMENTATION_MISSING: 'DOCUMENTATION_MISSING',
  
  // System Events
  QUALITY_SYSTEM_STARTED: 'QUALITY_SYSTEM_STARTED',
  QUALITY_SYSTEM_ERROR: 'QUALITY_SYSTEM_ERROR',
  QUALITY_CONFIG_CHANGED: 'QUALITY_CONFIG_CHANGED',
  
  // Achievement Events
  QUALITY_ACHIEVEMENT_UNLOCKED: 'QUALITY_ACHIEVEMENT_UNLOCKED',
  QUALITY_MILESTONE_REACHED: 'QUALITY_MILESTONE_REACHED',
} as const;

// 📝 Quality Logger Class
export class QualityLogger {
  private logs: QualityLogEntry[] = [];
  private auditTrail: AuditEntry[] = [];
  private correlationId: string | null = null;
  private maxLogEntries: number = 10000;
  private enableConsoleOutput: boolean = true;
  private enableFileOutput: boolean = false;
  private logLevel: QualityLogEntry['level'] = 'INFO';

  constructor(options?: {
    maxLogEntries?: number;
    enableConsoleOutput?: boolean;
    enableFileOutput?: boolean;
    logLevel?: QualityLogEntry['level'];
  }) {
    if (options) {
      this.maxLogEntries = options.maxLogEntries ?? this.maxLogEntries;
      this.enableConsoleOutput = options.enableConsoleOutput ?? this.enableConsoleOutput;
      this.enableFileOutput = options.enableFileOutput ?? this.enableFileOutput;
      this.logLevel = options.logLevel ?? this.logLevel;
    }

    this.info('Quality Logger initialized', 'SYSTEM', {
      maxLogEntries: this.maxLogEntries,
      enableConsoleOutput: this.enableConsoleOutput,
      enableFileOutput: this.enableFileOutput,
      logLevel: this.logLevel,
    });
  }

  /**
   * Sets correlation ID for tracking related events
   * @param correlationId - Unique identifier for event correlation
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  /**
   * Clears the current correlation ID
   */
  clearCorrelationId(): void {
    this.correlationId = null;
  }

  /**
   * Logs a debug message
   * @param message - Log message
   * @param category - Log category
   * @param metadata - Additional metadata
   * @param component - Component name
   * @param user - User identifier
   */
  debug(
    message: string,
    category: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string
  ): void {
    this.log('DEBUG', message, category, metadata, component, user);
  }

  /**
   * Logs an info message
   * @param message - Log message
   * @param category - Log category
   * @param metadata - Additional metadata
   * @param component - Component name
   * @param user - User identifier
   */
  info(
    message: string,
    category: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string
  ): void {
    this.log('INFO', message, category, metadata, component, user);
  }

  /**
   * Logs a warning message
   * @param message - Log message
   * @param category - Log category
   * @param metadata - Additional metadata
   * @param component - Component name
   * @param user - User identifier
   */
  warn(
    message: string,
    category: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string
  ): void {
    this.log('WARN', message, category, metadata, component, user);
  }

  /**
   * Logs an error message
   * @param message - Log message
   * @param category - Log category
   * @param metadata - Additional metadata
   * @param component - Component name
   * @param user - User identifier
   * @param error - Error object
   */
  error(
    message: string,
    category: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string,
    error?: Error
  ): void {
    const logMetadata = {
      ...metadata,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      }),
    };

    this.log('ERROR', message, category, logMetadata, component, user, error?.stack);
  }

  /**
   * Logs a critical message
   * @param message - Log message
   * @param category - Log category
   * @param metadata - Additional metadata
   * @param component - Component name
   * @param user - User identifier
   * @param error - Error object
   */
  critical(
    message: string,
    category: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string,
    error?: Error
  ): void {
    const logMetadata = {
      ...metadata,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      }),
    };

    this.log('CRITICAL', message, category, logMetadata, component, user, error?.stack);
  }

  /**
   * Logs a quality event with structured data
   * @param event - Quality event type
   * @param message - Event message
   * @param metadata - Event metadata
   * @param component - Component name
   * @param user - User identifier
   * @param severity - Event severity
   */
  logQualityEvent(
    event: keyof typeof QUALITY_EVENTS,
    message: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string,
    severity: SeverityLevel = 'INFO'
  ): void {
    const level = this.severityToLogLevel(severity);
    
    this.log(level, message, 'QUALITY_EVENT', {
      event: QUALITY_EVENTS[event],
      severity,
      ...metadata,
    }, component, user);

    // Add to audit trail
    this.addAuditEntry(QUALITY_EVENTS[event], severity, component || 'UNKNOWN', user, {
      message,
      ...metadata,
    });
  }

  /**
   * Logs validation start
   * @param component - Component being validated
   * @param validationType - Type of validation
   * @param user - User initiating validation
   */
  logValidationStart(component: string, validationType: string, user?: string): string {
    const correlationId = this.generateCorrelationId();
    this.setCorrelationId(correlationId);

    this.logQualityEvent('VALIDATION_STARTED', `Started ${validationType} validation`, {
      validationType,
      correlationId,
    }, component, user, 'INFO');

    return correlationId;
  }

  /**
   * Logs validation completion
   * @param component - Component that was validated
   * @param result - Validation result
   * @param duration - Validation duration in milliseconds
   * @param user - User who initiated validation
   */
  logValidationComplete(
    component: string,
    result: QualityValidationResult,
    duration: number,
    user?: string
  ): void {
    this.logQualityEvent('VALIDATION_COMPLETED', `Completed validation with score ${result.overallScore}`, {
      validationId: result.id,
      overallScore: result.overallScore,
      status: result.status,
      duration,
      blockers: result.blockers.length,
      recommendations: result.recommendations.length,
    }, component, user, result.status === 'FAILED' ? 'HIGH' : 'INFO');

    this.clearCorrelationId();
  }

  /**
   * Logs validation failure
   * @param component - Component that failed validation
   * @param error - Error that occurred
   * @param user - User who initiated validation
   */
  logValidationFailure(component: string, error: Error, user?: string): void {
    this.logQualityEvent('VALIDATION_FAILED', `Validation failed: ${error.message}`, {
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack,
    }, component, user, 'CRITICAL');

    this.clearCorrelationId();
  }

  /**
   * Logs quality gate result
   * @param gateName - Quality gate name
   * @param passed - Whether gate passed
   * @param component - Component being validated
   * @param conditions - Gate conditions and results
   * @param user - User identifier
   */
  logQualityGate(
    gateName: string,
    passed: boolean,
    component: string,
    conditions: Array<{ condition: string; passed: boolean; value: unknown; threshold: unknown }>,
    user?: string
  ): void {
    const event = passed ? 'QUALITY_GATE_PASSED' : 'QUALITY_GATE_FAILED';
    const severity = passed ? 'INFO' : 'HIGH';

    this.logQualityEvent(event, `Quality gate ${gateName} ${passed ? 'passed' : 'failed'}`, {
      gateName,
      passed,
      conditions,
      failedConditions: conditions.filter(c => !c.passed).length,
    }, component, user, severity);
  }

  /**
   * Logs security vulnerability discovery
   * @param vulnerability - Vulnerability details
   * @param component - Component where vulnerability was found
   * @param user - User who discovered vulnerability
   */
  logSecurityVulnerability(
    vulnerability: { id: string; type: string; severity: SeverityLevel; title: string },
    component: string,
    user?: string
  ): void {
    this.logQualityEvent('SECURITY_VULNERABILITY_FOUND', `Security vulnerability found: ${vulnerability.title}`, {
      vulnerabilityId: vulnerability.id,
      vulnerabilityType: vulnerability.type,
      severity: vulnerability.severity,
    }, component, user, vulnerability.severity);
  }

  /**
   * Logs performance issue
   * @param metric - Performance metric
   * @param currentValue - Current value
   * @param threshold - Threshold value
   * @param component - Component with performance issue
   * @param user - User identifier
   */
  logPerformanceIssue(
    metric: string,
    currentValue: number,
    threshold: number,
    component: string,
    user?: string
  ): void {
    const severity: SeverityLevel = currentValue > threshold * 2 ? 'HIGH' : 'MEDIUM';

    this.logQualityEvent('PERFORMANCE_THRESHOLD_EXCEEDED', `Performance threshold exceeded for ${metric}`, {
      metric,
      currentValue,
      threshold,
      exceedanceRatio: currentValue / threshold,
    }, component, user, severity);
  }

  /**
   * Gets recent log entries
   * @param limit - Number of entries to return
   * @param level - Minimum log level
   * @returns Array of log entries
   */
  getRecentLogs(limit: number = 100, level?: QualityLogEntry['level']): QualityLogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      const levelPriority = this.getLogLevelPriority(level);
      filteredLogs = this.logs.filter(log => this.getLogLevelPriority(log.level) >= levelPriority);
    }

    return filteredLogs.slice(-limit);
  }

  /**
   * Gets audit trail entries
   * @param limit - Number of entries to return
   * @returns Array of audit entries
   */
  getAuditTrail(limit: number = 100): AuditEntry[] {
    return this.auditTrail.slice(-limit);
  }

  /**
   * Gets logs by correlation ID
   * @param correlationId - Correlation ID to filter by
   * @returns Array of related log entries
   */
  getLogsByCorrelation(correlationId: string): QualityLogEntry[] {
    return this.logs.filter(log => log.correlationId === correlationId);
  }

  /**
   * Gets logs by component
   * @param component - Component name to filter by
   * @param limit - Number of entries to return
   * @returns Array of component log entries
   */
  getLogsByComponent(component: string, limit: number = 100): QualityLogEntry[] {
    return this.logs
      .filter(log => log.component === component)
      .slice(-limit);
  }

  /**
   * Gets error logs
   * @param limit - Number of entries to return
   * @returns Array of error log entries
   */
  getErrorLogs(limit: number = 100): QualityLogEntry[] {
    return this.logs
      .filter(log => log.level === 'ERROR' || log.level === 'CRITICAL')
      .slice(-limit);
  }

  /**
   * Exports logs in JSON format
   * @param filters - Optional filters
   * @returns JSON string of filtered logs
   */
  exportLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    component?: string;
    level?: QualityLogEntry['level'];
    category?: string;
  }): string {
    let filteredLogs = this.logs;

    if (filters) {
      filteredLogs = this.logs.filter(log => {
        if (filters.startDate && log.timestamp < filters.startDate) return false;
        if (filters.endDate && log.timestamp > filters.endDate) return false;
        if (filters.component && log.component !== filters.component) return false;
        if (filters.level && this.getLogLevelPriority(log.level) < this.getLogLevelPriority(filters.level)) return false;
        if (filters.category && log.category !== filters.category) return false;
        return true;
      });
    }

    return JSON.stringify(filteredLogs, null, 2);
  }

  /**
   * Clears all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.auditTrail = [];
    this.info('Logs cleared', 'SYSTEM');
  }

  // Private methods

  private log(
    level: QualityLogEntry['level'],
    message: string,
    category: string,
    metadata?: Record<string, unknown>,
    component?: string,
    user?: string,
    stackTrace?: string
  ): void {
    // Check if log level is enabled
    if (this.getLogLevelPriority(level) < this.getLogLevelPriority(this.logLevel)) {
      return;
    }

    const logEntry: QualityLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      component,
      user,
      correlationId: this.correlationId ?? undefined,
      metadata,
      stackTrace,
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Maintain max log entries
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Output to console if enabled
    if (this.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }

    // Output to file if enabled (placeholder for future implementation)
    if (this.enableFileOutput) {
      this.outputToFile(logEntry);
    }
  }

  private addAuditEntry(
    event: string,
    severity: SeverityLevel,
    component: string,
    user?: string,
    details?: Record<string, unknown>
  ): void {
    const auditEntry: AuditEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      event,
      severity,
      component,
      user,
      details: details || {},
      impact: this.calculateImpact(severity),
    };

    this.auditTrail.push(auditEntry);

    // Maintain max audit entries
    if (this.auditTrail.length > this.maxLogEntries) {
      this.auditTrail = this.auditTrail.slice(-this.maxLogEntries);
    }
  }

  private outputToConsole(logEntry: QualityLogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const correlation = logEntry.correlationId ? ` [${logEntry.correlationId}]` : '';
    const component = logEntry.component ? ` [${logEntry.component}]` : '';
    const user = logEntry.user ? ` [${logEntry.user}]` : '';
    
    const logMessage = `${timestamp} [${logEntry.level}] [${logEntry.category}]${correlation}${component}${user} ${logEntry.message}`;

    switch (logEntry.level) {
      case 'DEBUG':
        console.debug(logMessage, logEntry.metadata);
        break;
      case 'INFO':
        break;
      case 'WARN':
        logger.warn(String(logMessage), { metadata: logEntry.metadata });
        break;
      case 'ERROR':
      case 'CRITICAL':
        logger.error('Error', new Error(typeof logMessage === 'string' ? logMessage : JSON.stringify(logMessage)), { metadata: logEntry.metadata });
        if (logEntry.stackTrace) {
          logger.error('Error', logEntry.stackTrace ? new Error(String(logEntry.stackTrace)) : undefined);
        }
        break;
    }
  }

  private outputToFile(logEntry: QualityLogEntry): void {
    // Placeholder for file output implementation
    // In a real implementation, this would write to a log file
    logger.info('File output not implemented yet:', logEntry as unknown as Record<string, unknown>);
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private severityToLogLevel(severity: SeverityLevel): QualityLogEntry['level'] {
    switch (severity) {
      case 'CRITICAL': return 'CRITICAL';
      case 'HIGH': return 'ERROR';
      case 'MEDIUM': return 'WARN';
      case 'LOW': return 'INFO';
      case 'INFO': return 'INFO';
      default: return 'INFO';
    }
  }

  private getLogLevelPriority(level: QualityLogEntry['level']): number {
    switch (level) {
      case 'DEBUG': return 0;
      case 'INFO': return 1;
      case 'WARN': return 2;
      case 'ERROR': return 3;
      case 'CRITICAL': return 4;
      default: return 1;
    }
  }

  private calculateImpact(severity: SeverityLevel): string {
    switch (severity) {
      case 'CRITICAL': return 'System-wide impact, immediate attention required';
      case 'HIGH': return 'Significant impact, urgent attention required';
      case 'MEDIUM': return 'Moderate impact, attention required';
      case 'LOW': return 'Minor impact, can be addressed in normal workflow';
      case 'INFO': return 'Informational, no immediate action required';
      default: return 'Unknown impact';
    }
  }
}

// 🛡️ Global Quality Logger Instance
export const qualityLogger = new QualityLogger({
  maxLogEntries: 10000,
  enableConsoleOutput: process.env.NODE_ENV === 'development',
  enableFileOutput: process.env.NODE_ENV === 'production',
  logLevel: (process.env.QUALITY_LOG_LEVEL as QualityLogEntry['level']) || 'INFO',
});

// 🔧 Utility functions
export function createQualityLogger(options?: {
  maxLogEntries?: number;
  enableConsoleOutput?: boolean;
  enableFileOutput?: boolean;
  logLevel?: QualityLogEntry['level'];
}): QualityLogger {
  return new QualityLogger(options);
}

export function withQualityLogging<T extends (...args: unknown[]) => unknown>(
  fn: T,
  component: string,
  operation: string
): T {
  return ((...args: unknown[]) => {
    const correlationId = qualityLogger.logValidationStart(component, operation);
    const startTime = Date.now();

    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result
          .then((res) => {
            const duration = Date.now() - startTime;
            qualityLogger.info(`${operation} completed successfully`, 'OPERATION', {
              correlationId,
              duration,
            }, component);
            return res;
          })
          .catch((error) => {
            qualityLogger.logValidationFailure(component, error);
            throw error;
          });
      } else {
        const duration = Date.now() - startTime;
        qualityLogger.info(`${operation} completed successfully`, 'OPERATION', {
          correlationId,
          duration,
        }, component);
        return result;
      }
    } catch (error) {
      qualityLogger.logValidationFailure(component, error as Error);
      throw error;
    }
  }) as T;
}
