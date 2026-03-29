import { logger } from '@/lib/observability';
/**
 * 🔐 SILEXAR PULSE - Middleware de Autorización de Contratos TIER 0
 * 
 * @description Middleware de seguridad que gestiona permisos granulares
 * para operaciones de contratos, incluyendo sistema anti-fraude.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

export interface AuthorizationContext {
  userId: string;
  roles: string[];
  permissions: string[];
  nivel?: 'ejecutivo' | 'jefatura_directa' | 'gerente_comercial' | 'gerente_general' | 'admin';
  departamento?: string;
  supervisorId?: string;
}

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  requiredLevel?: string;
}

// ═══════════════════════════════════════════════════════════════
// PERMISOS ANTI-FRAUDE
// ═══════════════════════════════════════════════════════════════

export const PERMISOS_ANTI_FRAUDE = {
  // Evidencias
  SUBIR_EVIDENCIA: 'contrato:evidencia:subir',
  VALIDAR_EVIDENCIA: 'contrato:evidencia:validar',
  ELIMINAR_EVIDENCIA: 'contrato:evidencia:eliminar',
  
  // Aprobaciones por nivel
  APROBAR_DESCUENTO_BAJO: 'contrato:aprobar:hasta_50',      // 0-50%
  APROBAR_DESCUENTO_MEDIO: 'contrato:aprobar:hasta_64',     // 51-64%
  APROBAR_DESCUENTO_ALTO: 'contrato:aprobar:hasta_100',     // 65-100%
  
  // Justificaciones
  REQUERIR_JUSTIFICACION: 'contrato:justificacion:requerir',
  VER_JUSTIFICACION: 'contrato:justificacion:ver',
  
  // Campañas
  CARGAR_CAMPANA: 'contrato:campana:cargar',
  BLOQUEAR_CAMPANA: 'contrato:campana:bloquear',
  
  // Admin
  OVERRIDE_APROBACION: 'contrato:aprobar:override',
  VER_HISTORIAL_COMPLETO: 'contrato:historial:completo'
} as const;

// ═══════════════════════════════════════════════════════════════
// ROLES Y PERMISOS POR NIVEL
// ═══════════════════════════════════════════════════════════════

export const PERMISOS_POR_NIVEL: Record<string, string[]> = {
  ejecutivo: [
    'contrato:crear',
    'contrato:ver',
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA
  ],
  jefatura_directa: [
    'contrato:crear',
    'contrato:editar',
    'contrato:ver',
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
    PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA
  ],
  gerente_comercial: [
    'contrato:crear',
    'contrato:editar',
    'contrato:ver',
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.ELIMINAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO,
    PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA,
    PERMISOS_ANTI_FRAUDE.BLOQUEAR_CAMPANA
  ],
  gerente_general: [
    'contrato:crear',
    'contrato:editar',
    'contrato:eliminar',
    'contrato:ver',
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.ELIMINAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_ALTO,
    PERMISOS_ANTI_FRAUDE.REQUERIR_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA,
    PERMISOS_ANTI_FRAUDE.BLOQUEAR_CAMPANA,
    PERMISOS_ANTI_FRAUDE.VER_HISTORIAL_COMPLETO
  ],
  admin: [
    'contrato:*',
    ...Object.values(PERMISOS_ANTI_FRAUDE)
  ]
};

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class ContratoAuthorizationMiddleware {
  
  /**
   * Autoriza una acción sobre un contrato
   */
  async authorize(
    context: AuthorizationContext, 
    action: string, 
    resourceId: string
  ): Promise<AuthorizationResult> {
    const requiredPermission = this.getRequiredPermission(action);
    const hasPermission = await this.checkPermission(context, requiredPermission);
    
    logger.info(`[AUTH] User ${context.userId} attempting ${action} on ${resourceId}`);
    
    if (!hasPermission) {
      await this.logAccess(context, action, resourceId, false);
      return {
        authorized: false,
        reason: `Permiso requerido: ${requiredPermission}`,
        requiredLevel: this.getRequiredLevel(action)
      };
    }
    
    await this.logAccess(context, action, resourceId, true);
    return { authorized: true };
  }
  
  /**
   * Verifica si el usuario puede aprobar un descuento específico
   */
  async puedeAprobarDescuento(
    context: AuthorizationContext, 
    descuentoPorcentaje: number
  ): Promise<AuthorizationResult> {
    let permisoRequerido: string;
    let nivelRequerido: string;
    
    if (descuentoPorcentaje <= 50) {
      permisoRequerido = PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO;
      nivelRequerido = 'jefatura_directa';
    } else if (descuentoPorcentaje <= 64) {
      permisoRequerido = PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO;
      nivelRequerido = 'gerente_comercial';
    } else {
      permisoRequerido = PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_ALTO;
      nivelRequerido = 'gerente_general';
    }
    
    const tienePermiso = await this.checkPermission(context, permisoRequerido);
    
    return {
      authorized: tienePermiso,
      reason: tienePermiso ? undefined : `Descuento de ${descuentoPorcentaje}% requiere aprobación de ${nivelRequerido}`,
      requiredLevel: nivelRequerido
    };
  }
  
  /**
   * Verifica si el usuario puede validar evidencias
   */
  async puedeValidarEvidencia(context: AuthorizationContext): Promise<boolean> {
    return this.checkPermission(context, PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA);
  }
  
  /**
   * Verifica si el usuario puede cargar campañas
   */
  async puedeCargarCampana(
    context: AuthorizationContext, 
    estadoContrato: string
  ): Promise<AuthorizationResult> {
    if (estadoContrato !== 'operativo') {
      return {
        authorized: false,
        reason: 'El contrato debe estar en estado operativo para cargar campañas'
      };
    }
    
    const tienePermiso = await this.checkPermission(
      context, 
      PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA
    );
    
    return {
      authorized: tienePermiso,
      reason: tienePermiso ? undefined : 'No tiene permiso para cargar campañas'
    };
  }
  
  /**
   * Obtiene el permiso requerido para una acción
   */
  private getRequiredPermission(action: string): string {
    const map: Record<string, string> = {
      'CREATE': 'contrato:crear',
      'UPDATE': 'contrato:editar',
      'DELETE': 'contrato:eliminar',
      'VIEW': 'contrato:ver',
      'UPLOAD_EVIDENCE': PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
      'VALIDATE_EVIDENCE': PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
      'APPROVE_LOW': PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
      'APPROVE_MEDIUM': PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO,
      'APPROVE_HIGH': PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_ALTO,
      'LOAD_CAMPAIGN': PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA
    };
    return map[action] || 'contrato:ver';
  }
  
  /**
   * Obtiene el nivel jerárquico requerido para una acción
   */
  private getRequiredLevel(action: string): string {
    const map: Record<string, string> = {
      'APPROVE_LOW': 'jefatura_directa',
      'APPROVE_MEDIUM': 'gerente_comercial',
      'APPROVE_HIGH': 'gerente_general',
      'DELETE': 'admin'
    };
    return map[action] || 'ejecutivo';
  }

  /**
   * Valida un token y retorna el contexto de autorización
   */
  async validateToken(token: string): Promise<AuthorizationContext | null> {
    if (!token) return null;
    
    // En producción esto consultaría el sistema de auth real
    // Por ahora retornamos un contexto mock para desarrollo
    return { 
      userId: `usr_${token.slice(0, 8)}`, 
      roles: ['USER'], 
      permissions: ['contrato:ver'],
      nivel: 'ejecutivo'
    };
  }

  /**
   * Verifica si el contexto tiene un permiso específico
   */
  async checkPermission(context: AuthorizationContext, permission: string): Promise<boolean> {
    // Admin tiene todos los permisos
    if (context.roles.includes('ADMIN') || context.nivel === 'admin') {
      return true;
    }
    
    // Verificar permiso directo
    if (context.permissions.includes(permission)) {
      return true;
    }
    
    // Verificar permisos por nivel jerárquico
    if (context.nivel) {
      const permisosNivel = PERMISOS_POR_NIVEL[context.nivel] || [];
      if (permisosNivel.includes(permission)) {
        return true;
      }
    }
    
    // Verificar wildcards (ej: contrato:*)
    const wildcardMatch = context.permissions.some(p => {
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -1);
        return permission.startsWith(prefix);
      }
      return false;
    });
    
    return wildcardMatch;
  }

  /**
   * Registra un acceso al sistema
   */
  async logAccess(
    context: AuthorizationContext, 
    action: string, 
    resourceId: string,
    authorized: boolean = true
  ): Promise<void> {
    const status = authorized ? '✓' : '✗';
    logger.info(`[AUDIT] ${status} User ${context.userId} (nivel: ${context.nivel}) - ${action} on ${resourceId}`);
  }
  
  /**
   * Obtiene los permisos efectivos de un usuario basado en su nivel
   */
  getPermisosEfectivos(context: AuthorizationContext): string[] {
    const permisosPorNivel = context.nivel 
      ? (PERMISOS_POR_NIVEL[context.nivel] || [])
      : [];
    
    return [...new Set([...context.permissions, ...permisosPorNivel])];
  }
}

export default new ContratoAuthorizationMiddleware();