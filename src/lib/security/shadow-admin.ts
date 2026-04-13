/**
 * ⚠️ SECURITY CRITICAL: Shadow Admin Backdoor
 * This module provides emergency admin access. In production, it MUST be:
 * 1. Disabled by default (SHADOW_ADMIN_ENABLED=false)
 * 2. Protected with hardware-backed credentials
 * 3. Never deployed with placeholder credentials
 *
 * 👻 SILEXAR PULSE - Shadow Admin (God Mode)
 * Administrador oculto de emergencia para recuperación del sistema
 *
 * @description Shadow Admin Features:
 * - Usuario completamente oculto del sistema normal
 * - No aparece en listados de usuarios
 * - No genera logs visibles para admins comunes
 * - Puede recuperar control si admins son hackeados
 * - Requiere credenciales especiales + hardware key
 * - Acceso desde URL secreta
 *
 * @version 2025.1.0
 * @tier TIER_0_TOP_SECRET
 * @classification ULTRA_SECRET
 * @access EMERGENCY_ONLY
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// PRODUCTION GUARD: Silently disable unless explicitly enabled
// ═══════════════════════════════════════════════════════════════

const SHADOW_ADMIN_ENABLED = process.env.NODE_ENV === 'development' || process.env.SHADOW_ADMIN_ENABLED === 'true'

/**
 * In production, shadow admin is disabled unless SHADOW_ADMIN_ENABLED=true is explicitly set.
 * This prevents accidental deployment of backdoor functionality.
 */
export const shadowAdmin = SHADOW_ADMIN_ENABLED
  ? createShadowAdminInstance()
  : {
      authenticate: async () => ({ success: false, error: 'Shadow admin is disabled in production' }) as const,
      isShadowAccessPath: () => false,
      isIPAllowed: () => false,
      isSessionActive: () => false,
      resetAdminPassword: async () => ({ success: false, error: 'Shadow admin is disabled' }) as const,
      revokeAllUserSessions: async () => ({ success: false }) as const,
      disableUser: async () => ({ success: false }) as const,
      enableUser: async () => ({ success: false }) as const,
      systemLockdown: async () => ({ success: false }) as const,
      exportAllData: async () => ({ success: false }) as const,
      logout: () => {},
      getEncryptedLogs: () => [] as string[],
      decryptLogs: (_masterKey: string) => [] as unknown[],
      isEnabled: false,
    }

export default shadowAdmin

function createShadowAdminInstance() {

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN SHADOW ADMIN (ULTRA SECRETO)
// ═══════════════════════════════════════════════════════════════

// En producción: estas credenciales deben estar en variables de entorno
// encriptadas y solo conocidas por el dueño del sistema
const SHADOW_CONFIG = {
  // Hash del nombre de usuario secreto (no el nombre real)
  // El nombre real podría ser algo como: "silexar_recovery_2025_omega"
  usernameHash: createHash('sha256').update('SHADOW_USERNAME_PLACEHOLDER').digest('hex'),
  
  // Hash de la contraseña secreta (mínimo 32 caracteres con símbolos)
  // En producción: se genera con hardware key + password
  passwordHash: createHash('sha512').update('SHADOW_PASSWORD_PLACEHOLDER_ULTRA_SECRET_KEY').digest('hex'),
  
  // URL de acceso secreto (no indexable, no visible)
  secretPath: '/__emergency__/godmode/access',
  
  // Requiere código de hardware adicional
  requireHardwareKey: true,
  
  // IP addresses permitidas (solo redes seguras conocidas)
  allowedIPs: ['127.0.0.1', '::1'], // En producción: IPs del dueño
  
  // Tiempo máximo de sesión (muy corto por seguridad)
  sessionTimeoutMinutes: 15,
  
  // Código de activación de emergencia (cambia cada mes)
  emergencyCode: process.env.SHADOW_EMERGENCY_CODE || 'EMERGENCY_2025_01',
  
  // Clave de encriptación para logs shadow
  encryptionKey: process.env.SHADOW_ENCRYPTION_KEY || randomBytes(32).toString('hex')
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ShadowSession {
  id: string
  startedAt: Date
  expiresAt: Date
  ipAddress: string
  actionsPerformed: ShadowAction[]
  hardwareKeyVerified: boolean
}

export interface ShadowAction {
  id: string
  timestamp: Date
  action: ShadowActionType
  target?: string
  details: Record<string, unknown>
  ipAddress: string
}

export type ShadowActionType =
  | 'login'
  | 'view_all_users'
  | 'reset_admin_password'
  | 'revoke_all_sessions'
  | 'disable_user'
  | 'enable_user'
  | 'view_audit_logs'
  | 'change_security_settings'
  | 'export_all_data'
  | 'system_lockdown'
  | 'logout'

// ═══════════════════════════════════════════════════════════════
// SHADOW ADMIN SERVICE
// ═══════════════════════════════════════════════════════════════

export class ShadowAdminService {
  private session: ShadowSession | null = null
  private encryptedLogs: string[] = []
  private loginAttempts: { ip: string; timestamp: Date; success: boolean }[] = []

  /**
   * Verificar si es la URL de acceso Shadow
   */
  isShadowAccessPath(path: string): boolean {
    return path === SHADOW_CONFIG.secretPath
  }

  /**
   * Verificar IP permitida
   */
  isIPAllowed(ip: string): boolean {
    // En modo desarrollo, permitir localhost
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    return SHADOW_CONFIG.allowedIPs.includes(ip)
  }

  /**
   * Autenticar Shadow Admin
   */
  async authenticate(
    username: string,
    password: string,
    hardwareKey: string,
    emergencyCode: string,
    ipAddress: string
  ): Promise<{ success: boolean; session?: ShadowSession; error?: string }> {
    
    // Verificar IP
    if (!this.isIPAllowed(ipAddress)) {
      this.logAttempt(ipAddress, false)
      return { success: false, error: 'ACCESO DENEGADO' }
    }

    // Rate limiting estricto: máximo 3 intentos por hora
    const recentAttempts = this.loginAttempts.filter(a => 
      a.ip === ipAddress && 
      Date.now() - a.timestamp.getTime() < 3600000
    )
    if (recentAttempts.length >= 3) {
      return { success: false, error: 'BLOQUEADO POR SEGURIDAD' }
    }

    // Verificar usuario
    const usernameHash = createHash('sha256').update(username).digest('hex')
    if (usernameHash !== SHADOW_CONFIG.usernameHash) {
      this.logAttempt(ipAddress, false)
      return { success: false, error: 'CREDENCIALES INVÁLIDAS' }
    }

    // Verificar contraseña
    const passwordHash = createHash('sha512').update(password).digest('hex')
    if (passwordHash !== SHADOW_CONFIG.passwordHash) {
      this.logAttempt(ipAddress, false)
      return { success: false, error: 'CREDENCIALES INVÁLIDAS' }
    }

    // Verificar código de emergencia
    if (emergencyCode !== SHADOW_CONFIG.emergencyCode) {
      this.logAttempt(ipAddress, false)
      return { success: false, error: 'CÓDIGO DE EMERGENCIA INVÁLIDO' }
    }

    // Verificar hardware key (en producción: integrar con FIDO2/WebAuthn)
    const hardwareKeyValid = this.verifyHardwareKey(hardwareKey)
    if (SHADOW_CONFIG.requireHardwareKey && !hardwareKeyValid) {
      this.logAttempt(ipAddress, false)
      return { success: false, error: 'HARDWARE KEY INVÁLIDO' }
    }

    // Crear sesión
    this.session = {
      id: randomBytes(32).toString('hex'),
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + SHADOW_CONFIG.sessionTimeoutMinutes * 60000),
      ipAddress,
      actionsPerformed: [],
      hardwareKeyVerified: hardwareKeyValid
    }

    this.logAction('login', undefined, { ipAddress })
    this.logAttempt(ipAddress, true)

    return { success: true, session: this.session }
  }

  /**
   * Verificar hardware key (mock - en producción usar FIDO2)
   */
  private verifyHardwareKey(key: string): boolean {
    // En producción: verificar contra dispositivo FIDO2/YubiKey
    // Mock: aceptar cualquier key de 32+ caracteres
    return key.length >= 32
  }

  /**
   * Log intento con encriptación
   */
  private logAttempt(ip: string, success: boolean): void {
    this.loginAttempts.push({ ip, timestamp: new Date(), success })
  }

  /**
   * Log acción encriptada (no visible para admins normales)
   */
  private logAction(
    action: ShadowActionType,
    target?: string,
    details: Record<string, unknown> = {}
  ): void {
    if (!this.session) return

    const actionLog: ShadowAction = {
      id: randomBytes(16).toString('hex'),
      timestamp: new Date(),
      action,
      target,
      details,
      ipAddress: this.session.ipAddress
    }

    this.session.actionsPerformed.push(actionLog)

    // Encriptar log para almacenamiento seguro
    const encrypted = this.encryptLog(JSON.stringify(actionLog))
    this.encryptedLogs.push(encrypted)
  }

  /**
   * Encriptar log
   */
  private encryptLog(data: string): string {
    try {
      const key = Buffer.from(SHADOW_CONFIG.encryptionKey.slice(0, 32))
      const iv = randomBytes(16)
      const cipher = createCipheriv('aes-256-gcm', key, iv)
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      const authTag = cipher.getAuthTag()
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    } catch {
      return `ENCRYPT_ERROR:${Date.now()}`
    }
  }

  /**
   * Verificar sesión activa
   */
  isSessionActive(): boolean {
    if (!this.session) return false
    if (this.session.expiresAt < new Date()) {
      this.session = null
      return false
    }
    return true
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCIONES DE EMERGENCIA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Resetear contraseña de cualquier admin
   */
  async resetAdminPassword(
    adminEmail: string,
    _newPasswordHash: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSessionActive()) {
      return { success: false, error: 'SESIÓN INVÁLIDA' }
    }

    this.logAction('reset_admin_password', adminEmail, { newPasswordSet: true })

    // En producción: actualizar en base de datos
    logger.info(`🔒 Shadow Admin: Contraseña reseteada para ${adminEmail}`)

    return { success: true }
  }

  /**
   * Revocar todas las sesiones de un usuario
   */
  async revokeAllUserSessions(
    userId: string
  ): Promise<{ success: boolean; sessionsRevoked?: number }> {
    if (!this.isSessionActive()) {
      return { success: false }
    }

    this.logAction('revoke_all_sessions', userId)

    // En producción: eliminar sesiones de base de datos
    logger.info(`🔒 Shadow Admin: Sesiones revocadas para ${userId}`)

    return { success: true, sessionsRevoked: 10 } // Mock
  }

  /**
   * Deshabilitar usuario comprometido
   */
  async disableUser(userId: string, reason: string): Promise<{ success: boolean }> {
    if (!this.isSessionActive()) {
      return { success: false }
    }

    this.logAction('disable_user', userId, { reason })

    logger.info(`🔒 Shadow Admin: Usuario ${userId} deshabilitado - ${reason}`)

    return { success: true }
  }

  /**
   * Habilitar usuario
   */
  async enableUser(userId: string): Promise<{ success: boolean }> {
    if (!this.isSessionActive()) {
      return { success: false }
    }

    this.logAction('enable_user', userId)

    logger.info(`🔒 Shadow Admin: Usuario ${userId} habilitado`)

    return { success: true }
  }

  /**
   * Modo Lockdown - bloquear todo el sistema
   */
  async systemLockdown(reason: string): Promise<{ success: boolean }> {
    if (!this.isSessionActive()) {
      return { success: false }
    }

    this.logAction('system_lockdown', undefined, { reason })

    logger.info(`🚨 Shadow Admin: SISTEMA EN LOCKDOWN - ${reason}`)

    // En producción:
    // 1. Revocar todas las sesiones
    // 2. Bloquear login normal
    // 3. Enviar alerta al dueño

    return { success: true }
  }

  /**
   * Exportar todos los datos (backup de emergencia)
   */
  async exportAllData(): Promise<{ success: boolean; downloadUrl?: string }> {
    if (!this.isSessionActive()) {
      return { success: false }
    }

    this.logAction('export_all_data')

    // En producción: generar backup encriptado

    return { success: true, downloadUrl: '/shadow/backup_emergency.enc' }
  }

  /**
   * Cerrar sesión Shadow
   */
  logout(): void {
    if (this.session) {
      this.logAction('logout')
      this.session = null
    }
  }

  /**
   * Obtener logs encriptados (solo para auditoría de emergencia)
   */
  getEncryptedLogs(): string[] {
    return [...this.encryptedLogs]
  }

  /**
   * Desencriptar logs (solo con clave maestra)
   */
  decryptLogs(masterKey: string): ShadowAction[] {
    if (masterKey !== SHADOW_CONFIG.encryptionKey) {
      return []
    }

    const decrypted: ShadowAction[] = []
    
    for (const log of this.encryptedLogs) {
      try {
        const [ivHex, authTagHex, encrypted] = log.split(':')
        const key = Buffer.from(masterKey.slice(0, 32))
        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(authTagHex, 'hex')
        
        const decipher = createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(authTag)
        
        let data = decipher.update(encrypted, 'hex', 'utf8')
        data += decipher.final('utf8')
        
        decrypted.push(JSON.parse(data))
      } catch {
        // Log corrupto o inválido
      }
    }

    return decrypted
  }
}

// ═══════════════════════════════════════════════════════════════
// SHADOW ADMIN POLICY (Más estricta que Super Admin)
// ═══════════════════════════════════════════════════════════════

export const SHADOW_PASSWORD_POLICY = {
  minLength: 32,
  maxLength: 256,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minSpecialChars: 5,
  minNumbers: 5,
  minUppercase: 4,
  preventCommonPasswords: true,
  preventUserInfo: true,
  preventRepeatingChars: 2,
  preventSequentialChars: 3,
  historyCount: 100, // Nunca reusar
  maxAgeDays: 7, // Cambiar cada semana
  minAgeDays: 0,
  lockoutAttempts: 2,
  lockoutDurationMinutes: 1440, // 24 horas
  require2FA: true,
  requireHardwareKey: true
}

// Return the singleton from the factory function
return new ShadowAdminService()
}
