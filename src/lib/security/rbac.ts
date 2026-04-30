/**
 * ðŸ›¡ï¸ SILEXAR PULSE â€” RBAC (Role-Based Access Control)
 * 
 * Sistema real de control de acceso por roles.
 * Valida permisos de usuario contra polÃ­ticas definidas.
 * 
 * @version 2026.3.0
 * @security OWASP A01 â€” Broken Access Control
 */

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TIPOS Y CONSTANTES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export type UserRole =
  | 'SUPER_CEO'
  | 'ADMIN'
  | 'CLIENT_ADMIN'
  | 'GERENTE_VENTAS'
  | 'EJECUTIVO_VENTAS'
  | 'EJECUTIVO'          // Ejecutivo general (contratos y campanas)
  | 'TM_SENIOR'          // Traffic Manager Senior (gestiÃ³n de pauta y emisiÃ³n)
  | 'FINANCIERO'         // Analista financiero (facturaciÃ³n y contratos)
  | 'PROGRAMADOR'        // Programador de emisora (scheduling de cuÃ±as)
  | 'OPERADOR_EMISION'
  | 'AGENCIA'
  | 'ANUNCIANTE'
  | 'VIEWER'
  | 'USER';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'admin' | 'export' | 'approve';

export type Resource =
  | 'contratos'
  | 'campanas'
  | 'cunas'
  | 'emisiones'
  | 'anunciantes'
  | 'paquetes'
  | 'equipos-ventas'
  | 'facturacion'
  | 'inventario'
  | 'emisoras'
  | 'usuarios'
  | 'rrss'
  | 'digital'
  | 'reportes'
  | 'configuracion'
  | 'dashboard'
  | 'analytics'
  | 'agencias-medios'
  | 'activos-digitales'
  | 'conciliacion'
  | 'vencimientos'
  | 'vencimientos.programas'
  | 'vencimientos.vencimientos'
  | 'vencimientos.alertas'
  | 'vencimientos.analytics'
  | 'vencimientos.disponibilidad'
  | 'vencimientos.search'
  | 'backup_restore'
  | 'brand_safety'
  | 'encryption'
  | 'health_monitoring'
  | 'sellos'
  | 'cortex'
  | 'politicas'
  | 'sso'
  | 'monitoreo'
  | 'feature_flags'
  | 'kill_switches'
  | 'sso_configurations';

export interface RBACPolicy {
  resource: Resource;
  actions: PermissionAction[];
  roles: UserRole[];
}

export interface AuthContext {
  userId: string;
  role: UserRole | string;
  tenantId: string;
  permissions?: string[];
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MATRIZ DE PERMISOS POR ROL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, PermissionAction[]>> = {
  SUPER_CEO: {
    contratos: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    campanas: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    cunas: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    emisiones: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    anunciantes: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    paquetes: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    'equipos-ventas': ['create', 'read', 'update', 'delete', 'admin'],
    facturacion: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    inventario: ['create', 'read', 'update', 'delete', 'admin'],
    emisoras: ['create', 'read', 'update', 'delete', 'admin'],
    usuarios: ['create', 'read', 'update', 'delete', 'admin'],
    rrss: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    digital: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    reportes: ['read', 'export', 'admin'],
    configuracion: ['read', 'update', 'admin'],
    dashboard: ['read', 'admin'],
    analytics: ['read', 'export', 'admin'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'delete', 'admin', 'export'],
    vencimientos: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    conciliacion: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    'vencimientos.programas': ['create', 'read', 'update', 'delete', 'admin'],
    'vencimientos.vencimientos': ['create', 'read', 'update', 'delete', 'admin'],
    'vencimientos.alertas': ['create', 'read', 'update', 'delete', 'admin'],
    'vencimientos.analytics': ['read', 'export', 'admin'],
    'vencimientos.disponibilidad': ['read', 'admin'],
    'vencimientos.search': ['read', 'admin'],
    backup_restore: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    brand_safety: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    encryption: ['create', 'read', 'update', 'delete', 'admin'],
    health_monitoring: ['create', 'read', 'update', 'delete', 'admin'],
    sellos: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    cortex: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    politicas: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    sso: ['create', 'read', 'update', 'delete', 'admin'],
    monitoreo: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    feature_flags: ['create', 'read', 'update', 'delete', 'admin'],
    kill_switches: ['create', 'read', 'update', 'delete', 'admin'],
    sso_configurations: ['create', 'read', 'update', 'delete', 'admin'],
  },
  ADMIN: {
    contratos: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    campanas: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    cunas: ['create', 'read', 'update', 'delete', 'export'],
    emisiones: ['create', 'read', 'update', 'delete', 'export'],
    anunciantes: ['create', 'read', 'update', 'delete', 'export'],
    paquetes: ['create', 'read', 'update', 'delete', 'export'],
    'equipos-ventas': ['create', 'read', 'update', 'delete'],
    facturacion: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    inventario: ['create', 'read', 'update', 'delete'],
    emisoras: ['create', 'read', 'update', 'delete'],
    usuarios: ['create', 'read', 'update', 'delete'],
    rrss: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    digital: ['create', 'read', 'update', 'delete', 'export'],
    reportes: ['read', 'export'],
    configuracion: ['read', 'update'],
    dashboard: ['read'],
    analytics: ['read', 'export'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'delete', 'export'],
    vencimientos: ['create', 'read', 'update', 'delete', 'export'],
    conciliacion: ['create', 'read', 'update', 'delete', 'export'],
    'vencimientos.programas': ['create', 'read', 'update', 'delete', 'admin'],
    'vencimientos.vencimientos': ['create', 'read', 'update', 'delete', 'admin'],
    'vencimientos.alertas': ['create', 'read', 'update', 'delete', 'admin'],
    'vencimientos.analytics': ['read', 'export', 'admin'],
    'vencimientos.disponibilidad': ['read', 'admin'],
    'vencimientos.search': ['read', 'admin'],
    backup_restore: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    brand_safety: ['read', 'update', 'admin'],
    encryption: ['read', 'update', 'admin'],
    health_monitoring: ['read', 'admin'],
    sellos: ['read', 'update', 'admin'],
    cortex: ['read', 'admin'],
    politicas: ['read', 'update', 'admin'],
    sso: ['read', 'admin'],
    monitoreo: ['read', 'admin'],
    feature_flags: ['read', 'admin'],
    kill_switches: ['read', 'admin'],
    sso_configurations: ['read', 'admin'],
  },
  CLIENT_ADMIN: {
    conciliacion: ['read'],
    contratos: ['create', 'read', 'update', 'export', 'approve'],
    campanas: ['create', 'read', 'update', 'export'],
    cunas: ['create', 'read', 'update'],
    emisiones: ['read'],
    anunciantes: ['read', 'update'],
    paquetes: ['create', 'read', 'update', 'export'],
    'equipos-ventas': ['read', 'update'],
    facturacion: ['read', 'export'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: ['create', 'read', 'update'],
    rrss: ['create', 'read', 'update', 'delete', 'export'],
    digital: ['read'],
    reportes: ['read', 'export'],
    configuracion: ['read'],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: ['read'],
    health_monitoring: ['read'],
    sellos: ['read'],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  GERENTE_VENTAS: {
    contratos: ['create', 'read', 'update', 'export', 'approve'],
    campanas: ['create', 'read', 'update'],
    cunas: ['read'],
    emisiones: ['read'],
    conciliacion: ['read', 'update'],
    anunciantes: ['create', 'read', 'update'],
    paquetes: ['create', 'read', 'update', 'export'],
    'equipos-ventas': ['read', 'update'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: ['read'],
    rrss: ['create', 'read', 'update'],
    digital: ['read'],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read', 'export'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  EJECUTIVO_VENTAS: {
    contratos: ['create', 'read', 'update'],
    campanas: ['create', 'read'],
    cunas: ['read'],
    emisiones: ['read'],
    conciliacion: ['read', 'update'],
    anunciantes: ['create', 'read', 'update'],
    paquetes: ['read'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: [],
    rrss: ['create', 'read', 'update'],
    digital: ['read'],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  EJECUTIVO: {
    contratos: ['create', 'read', 'update', 'export'],
    campanas: ['create', 'read', 'update', 'approve'],
    cunas: ['read'],
    emisiones: ['read'],
    conciliacion: ['read', 'update'],
    anunciantes: ['create', 'read', 'update'],
    paquetes: ['read'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: [],
    rrss: ['create', 'read', 'update'],
    digital: ['read'],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['read'],
    vencimientos: ['read', 'create', 'update'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  TM_SENIOR: {
    conciliacion: ['read'],
    contratos: ['read'],
    campanas: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    cunas: ['create', 'read', 'update', 'delete', 'export'],
    emisiones: ['create', 'read', 'update', 'delete', 'export'],
    anunciantes: ['read'],
    paquetes: ['create', 'read', 'update', 'export'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['create', 'read', 'update', 'delete'],
    emisoras: ['read', 'update'],
    usuarios: [],
    rrss: ['read'],
    reportes: ['read', 'export'],
    configuracion: [],
    digital: ['read'],
    dashboard: ['read'],
    analytics: ['read', 'export'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  FINANCIERO: {
    contratos: ['read', 'export', 'approve'],
    campanas: ['read'],
    cunas: [],
    emisiones: [],
    anunciantes: ['read'],
    paquetes: ['read'],
    'equipos-ventas': [],
    facturacion: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    inventario: ['read'],
    emisoras: [],
    usuarios: [],
    rrss: ['read'],
    digital: ['read'],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read', 'export'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    conciliacion: ['read', 'export'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  PROGRAMADOR: {
    contratos: ['read'],
    campanas: ['read', 'update'],
    cunas: ['create', 'read', 'update', 'delete'],
    emisiones: ['create', 'read', 'update', 'delete'],
    anunciantes: ['read'],
    paquetes: ['read'],
    'equipos-ventas': [],
    facturacion: [],
    inventario: ['read', 'update'],
    emisoras: ['read', 'update'],
    usuarios: [],
    rrss: ['read'],
    reportes: ['read'],
    configuracion: [],
    digital: ['read'],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    conciliacion: ['read'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: ['read'],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  OPERADOR_EMISION: {
    contratos: ['read'],
    campanas: ['read', 'update'],
    cunas: ['create', 'read', 'update'],
    emisiones: ['create', 'read', 'update'],
    anunciantes: ['read'],
    paquetes: ['read'],
    'equipos-ventas': [],
    facturacion: [],
    inventario: ['read', 'update'],
    emisoras: ['read', 'update'],
    usuarios: [],
    rrss: ['read'],
    reportes: ['read'],
    configuracion: [],
    digital: ['read'],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['create', 'read', 'update', 'export'],
    vencimientos: ['read'],
    conciliacion: ['read'],
    'vencimientos.programas': ['read'],
    'vencimientos.vencimientos': ['read'],
    'vencimientos.alertas': ['read'],
    'vencimientos.analytics': ['read'],
    'vencimientos.disponibilidad': ['read'],
    'vencimientos.search': ['read'],
    backup_restore: [],
    brand_safety: [],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  AGENCIA: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['create', 'read', 'update'],
    emisiones: ['read'],
    conciliacion: [],
    anunciantes: [],
    paquetes: ['read'],
    'equipos-ventas': [],
    facturacion: [],
    inventario: [],
    emisoras: [],
    usuarios: [],
    rrss: ['read'],
    reportes: ['read'],
    configuracion: [],
    digital: ['read'],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['read'],
    vencimientos: [],
    'vencimientos.programas': [],
    'vencimientos.vencimientos': [],
    'vencimientos.alertas': [],
    'vencimientos.analytics': [],
    'vencimientos.disponibilidad': [],
    'vencimientos.search': [],
    backup_restore: [],
    brand_safety: [],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  ANUNCIANTE: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['read'],
    emisiones: ['read'],
    conciliacion: [],
    anunciantes: ['read'],
    paquetes: ['read'],
    'equipos-ventas': [],
    facturacion: ['read'],
    inventario: [],
    emisoras: [],
    usuarios: [],
    rrss: ['read'],
    reportes: ['read'],
    configuracion: [],
    digital: ['read'],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['read'],
    vencimientos: [],
    'vencimientos.programas': [],
    'vencimientos.vencimientos': [],
    'vencimientos.alertas': [],
    'vencimientos.analytics': [],
    'vencimientos.disponibilidad': [],
    'vencimientos.search': [],
    backup_restore: [],
    brand_safety: [],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  VIEWER: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['read'],
    emisiones: ['read'],
    conciliacion: [],
    anunciantes: ['read'],
    paquetes: ['read'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: [],
    rrss: ['read'],
    digital: ['read'],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
    'agencias-medios': ['read'],
    'activos-digitales': ['read'],
    vencimientos: [],
    'vencimientos.programas': [],
    'vencimientos.vencimientos': [],
    'vencimientos.alertas': [],
    'vencimientos.analytics': [],
    'vencimientos.disponibilidad': [],
    'vencimientos.search': [],
    backup_restore: [],
    brand_safety: [],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
  USER: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['read'],
    emisiones: ['read'],
    conciliacion: [],
    anunciantes: [],
    paquetes: ['read'],
    'equipos-ventas': [],
    facturacion: [],
    inventario: [],
    emisoras: [],
    usuarios: [],
    rrss: ['read'],
    reportes: [],
    configuracion: [],
    digital: ['read'],
    dashboard: ['read'],
    analytics: [],
    'agencias-medios': ['read'],
    'activos-digitales': ['read'],
    vencimientos: [],
    'vencimientos.programas': [],
    'vencimientos.vencimientos': [],
    'vencimientos.alertas': [],
    'vencimientos.analytics': [],
    'vencimientos.disponibilidad': [],
    'vencimientos.search': [],
    backup_restore: [],
    brand_safety: [],
    encryption: [],
    health_monitoring: [],
    sellos: [],
    cortex: [],
    politicas: [],
    sso: [],
    monitoreo: [],
    feature_flags: [],
    kill_switches: [],
    sso_configurations: [],
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// JERARQUÃA DE ROLES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_CEO: 100,
  ADMIN: 90,
  CLIENT_ADMIN: 80,
  GERENTE_VENTAS: 70,
  TM_SENIOR: 65,
  EJECUTIVO_VENTAS: 60,
  EJECUTIVO: 58,
  FINANCIERO: 55,
  PROGRAMADOR: 52,
  OPERADOR_EMISION: 50,
  AGENCIA: 40,
  ANUNCIANTE: 30,
  VIEWER: 20,
  USER: 10,
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// FUNCIONES DE VALIDACIÃ“N
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Obtener contexto de autenticaciÃ³n desde la request
 * En producciÃ³n, esto decodifica el JWT verificado
 */
export function getAuthContext(request?: Request): AuthContext | null {
  if (!request) return null;

  // Extraer token del header o cookie
  const authHeader = request.headers?.get?.('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) return null;

  // En producciÃ³n, el middleware ya verificÃ³ el JWT
  // AquÃ­ extraemos los datos del header que el middleware inyectÃ³
  const userId = request.headers?.get?.('x-silexar-user-id');
  const role = request.headers?.get?.('x-silexar-user-role') as UserRole;
  const tenantId = request.headers?.get?.('x-silexar-tenant-id');

  if (!userId || !role || !tenantId) return null;

  return { userId, role, tenantId };
}

/**
 * Verificar si un usuario tiene permiso para una acciÃ³n sobre un recurso
 */
export function checkPermission(
  ctx: AuthContext,
  resource: Resource,
  action: PermissionAction
): boolean {
  if (!ctx || !ctx.role) return false;

  // SUPER_CEO tiene acceso total a todos los recursos y acciones
  if (ctx.role === 'SUPER_CEO') return true;

  const rolePermissions = ROLE_PERMISSIONS[ctx.role as UserRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Verificar si un usuario tiene al menos uno de los roles requeridos
 */
export function requireRole(
  ctx: AuthContext | null,
  roles: UserRole[]
): boolean {
  if (!ctx || !ctx.role) return false;
  if (!roles || roles.length === 0) return false;

  // Verificar pertenencia directa al rol
  if (roles.includes(ctx.role as UserRole)) return true;

  // Verificar jerarquÃ­a: un rol superior incluye permisos de roles inferiores
  const userLevel = ROLE_HIERARCHY[ctx.role as UserRole] ?? 0;
  const requiredMinLevel = Math.min(...roles.map(r => ROLE_HIERARCHY[r] ?? Infinity));

  return userLevel >= requiredMinLevel;
}

/**
 * Verificar si el contexto puede validar una polÃ­tica RBAC
 */
export function validatePolicy(ctx: AuthContext, policy: RBACPolicy): boolean {
  if (!ctx || !policy) return false;

  // Verificar que el rol estÃ¡ en la lista de roles permitidos
  if (!policy.roles.includes(ctx.role as UserRole)) {
    // Verificar jerarquÃ­a
    const userLevel = ROLE_HIERARCHY[ctx.role as UserRole] ?? 0;
    const requiredMinLevel = Math.min(...policy.roles.map(r => ROLE_HIERARCHY[r] ?? Infinity));
    if (userLevel < requiredMinLevel) return false;
  }

  // Verificar que tiene al menos una de las acciones requeridas
  return policy.actions.some(action => checkPermission(ctx, policy.resource, action));
}

/**
 * Retornar respuesta 403 Forbidden estÃ¡ndar
 */
export function forbid(message = 'No tiene permisos para realizar esta acciÃ³n'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

/**
 * Retornar respuesta 401 Unauthorized estÃ¡ndar
 */
export function unauthorized(message = 'AutenticaciÃ³n requerida'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'WWW-Authenticate': 'Bearer realm="Silexar Pulse"',
      },
    }
  );
}

/**
 * Helper: verificar permisos o retornar error
 */
export function requirePermission(
  ctx: AuthContext | null,
  resource: Resource,
  action: PermissionAction
): Response | null {
  if (!ctx) return unauthorized();
  if (!checkPermission(ctx, resource, action)) {
    return forbid(`No tiene permisos para ${action} en ${resource}`);
  }
  return null; // null = autorizado
}

export default {
  getAuthContext,
  checkPermission,
  requireRole,
  validatePolicy,
  forbid,
  unauthorized,
  requirePermission,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
};

