/**
 * Audit constants — isolated so routes can import without pulling
 * in the full audit-logger dependency chain (which depends on quality-logger).
 */

export enum AuditSeverity {
  LOW      = 'LOW',
  MEDIUM   = 'MEDIUM',
  HIGH     = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuditEventType {
  LOGIN_SUCCESS      = 'LOGIN_SUCCESS',
  LOGIN_FAILURE      = 'LOGIN_FAILURE',
  LOGOUT             = 'LOGOUT',
  PASSWORD_CHANGE    = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED     = 'ACCOUNT_LOCKED',
  ACCESS_GRANTED     = 'ACCESS_GRANTED',
  ACCESS_DENIED      = 'ACCESS_DENIED',
  PERMISSION_CHANGE  = 'PERMISSION_CHANGE',
  ROLE_CHANGE        = 'ROLE_CHANGE',
  DATA_CREATE        = 'DATA_CREATE',
  DATA_READ          = 'DATA_READ',
  DATA_UPDATE        = 'DATA_UPDATE',
  DATA_DELETE        = 'DATA_DELETE',
  DATA_EXPORT        = 'DATA_EXPORT',
  SYSTEM_START       = 'SYSTEM_START',
  SYSTEM_STOP        = 'SYSTEM_STOP',
  CONFIG_CHANGE      = 'CONFIG_CHANGE',
  BACKUP_CREATE      = 'BACKUP_CREATE',
  BACKUP_RESTORE     = 'BACKUP_RESTORE',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  RATE_LIMIT_EXCEEDED= 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY= 'SUSPICIOUS_ACTIVITY',
  MALWARE_DETECTED   = 'MALWARE_DETECTED',
  API_CALL           = 'API_CALL',
  API_ERROR          = 'API_ERROR',
  ADMIN_ACTION       = 'ADMIN_ACTION',
  USER_CREATED       = 'USER_CREATED',
  USER_UPDATED       = 'USER_UPDATED',
  USER_DELETED       = 'USER_DELETED',
}
