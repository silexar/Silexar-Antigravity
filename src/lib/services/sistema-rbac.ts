/**
 * 🔐 SILEXAR PULSE - Sistema RBAC
 * 
 * @description Sistema de Control de Acceso Basado en Roles
 * Role-Based Access Control (RBAC) para el sistema
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════

export type Rol = 
  | 'super_admin'
  | 'admin_tenant'
  | 'gerente_ventas'
  | 'ejecutivo_ventas'
  | 'operador_pauta'
  | 'operador_trafico'
  | 'contador'
  | 'auditor'
  | 'cliente_externo';

export type Recurso = 
  | 'anunciantes'
  | 'agencias'
  | 'emisoras'
  | 'cunas'
  | 'campanas'
  | 'contratos'
  | 'facturacion'
  | 'inventario'
  | 'pauta'
  | 'tandas'
  | 'emision'
  | 'conciliacion'
  | 'informes'
  | 'usuarios'
  | 'configuracion';

export type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'aprobar' | 'exportar';

export interface Permiso {
  recurso: Recurso;
  acciones: Accion[];
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  tenantId: string;
  emisorasAsignadas?: string[]; // Para operadores
  anunciantesAsignados?: string[]; // Para ejecutivos
  activo: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MATRIZ DE PERMISOS
// ═══════════════════════════════════════════════════════════════

const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  super_admin: [
    { recurso: 'anunciantes', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { recurso: 'agencias', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { recurso: 'emisoras', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { recurso: 'cunas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'campanas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'contratos', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'facturacion', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'inventario', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { recurso: 'pauta', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'tandas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'emision', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'conciliacion', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'informes', acciones: ['ver', 'crear', 'exportar'] },
    { recurso: 'usuarios', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
    { recurso: 'configuracion', acciones: ['ver', 'editar'] }
  ],
  admin_tenant: [
    { recurso: 'anunciantes', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { recurso: 'agencias', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { recurso: 'emisoras', acciones: ['ver', 'crear', 'editar', 'exportar'] },
    { recurso: 'cunas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'campanas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { recurso: 'contratos', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'facturacion', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'inventario', acciones: ['ver', 'editar', 'exportar'] },
    { recurso: 'pauta', acciones: ['ver', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'tandas', acciones: ['ver', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'emision', acciones: ['ver', 'aprobar', 'exportar'] },
    { recurso: 'conciliacion', acciones: ['ver', 'aprobar', 'exportar'] },
    { recurso: 'informes', acciones: ['ver', 'crear', 'exportar'] },
    { recurso: 'usuarios', acciones: ['ver', 'crear', 'editar'] },
    { recurso: 'configuracion', acciones: ['ver', 'editar'] }
  ],
  gerente_ventas: [
    { recurso: 'anunciantes', acciones: ['ver', 'crear', 'editar', 'exportar'] },
    { recurso: 'agencias', acciones: ['ver', 'crear', 'editar', 'exportar'] },
    { recurso: 'campanas', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'contratos', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'inventario', acciones: ['ver', 'exportar'] },
    { recurso: 'informes', acciones: ['ver', 'exportar'] }
  ],
  ejecutivo_ventas: [
    { recurso: 'anunciantes', acciones: ['ver', 'crear', 'editar'] },
    { recurso: 'agencias', acciones: ['ver'] },
    { recurso: 'campanas', acciones: ['ver', 'crear'] },
    { recurso: 'contratos', acciones: ['ver', 'crear'] },
    { recurso: 'inventario', acciones: ['ver'] },
    { recurso: 'informes', acciones: ['ver'] }
  ],
  operador_pauta: [
    { recurso: 'emisoras', acciones: ['ver'] },
    { recurso: 'cunas', acciones: ['ver', 'crear', 'editar'] },
    { recurso: 'campanas', acciones: ['ver'] },
    { recurso: 'inventario', acciones: ['ver', 'editar'] },
    { recurso: 'pauta', acciones: ['ver', 'crear', 'editar', 'exportar'] },
    { recurso: 'tandas', acciones: ['ver', 'crear', 'editar', 'exportar'] }
  ],
  operador_trafico: [
    { recurso: 'emisoras', acciones: ['ver'] },
    { recurso: 'cunas', acciones: ['ver'] },
    { recurso: 'pauta', acciones: ['ver'] },
    { recurso: 'tandas', acciones: ['ver'] },
    { recurso: 'emision', acciones: ['ver', 'crear', 'editar'] },
    { recurso: 'conciliacion', acciones: ['ver', 'crear'] }
  ],
  contador: [
    { recurso: 'anunciantes', acciones: ['ver'] },
    { recurso: 'contratos', acciones: ['ver'] },
    { recurso: 'facturacion', acciones: ['ver', 'crear', 'editar', 'aprobar', 'exportar'] },
    { recurso: 'informes', acciones: ['ver', 'exportar'] }
  ],
  auditor: [
    { recurso: 'anunciantes', acciones: ['ver'] },
    { recurso: 'contratos', acciones: ['ver'] },
    { recurso: 'facturacion', acciones: ['ver', 'exportar'] },
    { recurso: 'emision', acciones: ['ver', 'exportar'] },
    { recurso: 'conciliacion', acciones: ['ver', 'exportar'] },
    { recurso: 'informes', acciones: ['ver', 'exportar'] }
  ],
  cliente_externo: [
    { recurso: 'campanas', acciones: ['ver'] },
    { recurso: 'informes', acciones: ['ver'] }
  ]
};

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class SistemaRBAC {

  /**
   * Verifica si un usuario tiene permiso para una acción
   */
  static tienePermiso(usuario: Usuario, recurso: Recurso, accion: Accion): boolean {
    if (!usuario.activo) return false;
    
    const permisos = PERMISOS_POR_ROL[usuario.rol];
    if (!permisos) return false;

    const permiso = permisos.find(p => p.recurso === recurso);
    if (!permiso) return false;

    return permiso.acciones.includes(accion);
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  static getPermisosRol(rol: Rol): Permiso[] {
    return PERMISOS_POR_ROL[rol] || [];
  }

  /**
   * Obtiene los recursos accesibles por un usuario
   */
  static getRecursosAccesibles(usuario: Usuario): Recurso[] {
    const permisos = PERMISOS_POR_ROL[usuario.rol] || [];
    return permisos.map(p => p.recurso);
  }

  /**
   * Verifica si el usuario puede ver el menú de un módulo
   */
  static puedeVerModulo(usuario: Usuario, modulo: string): boolean {
    const mapeoModulos: Record<string, Recurso[]> = {
      'dashboard': ['informes'],
      'anunciantes': ['anunciantes'],
      'agencias': ['agencias'],
      'emisoras': ['emisoras'],
      'cunas': ['cunas'],
      'campanas': ['campanas'],
      'contratos': ['contratos'],
      'facturacion': ['facturacion'],
      'inventario': ['inventario'],
      'pauta': ['pauta', 'tandas'],
      'emision': ['emision', 'conciliacion'],
      'informes': ['informes'],
      'usuarios': ['usuarios'],
      'configuracion': ['configuracion']
    };

    const recursos = mapeoModulos[modulo] || [];
    return recursos.some(r => this.tienePermiso(usuario, r, 'ver'));
  }

  /**
   * Filtra menú según permisos del usuario
   */
  static filtrarMenu(usuario: Usuario, items: { id: string; label: string }[]): { id: string; label: string }[] {
    return items.filter(item => this.puedeVerModulo(usuario, item.id));
  }

  /**
   * Obtiene descripción del rol
   */
  static getDescripcionRol(rol: Rol): string {
    const descripciones: Record<Rol, string> = {
      super_admin: 'Acceso total al sistema',
      admin_tenant: 'Administrador de la empresa',
      gerente_ventas: 'Gestión comercial y aprobaciones',
      ejecutivo_ventas: 'Ventas y clientes',
      operador_pauta: 'Programación de spots',
      operador_trafico: 'Verificación de emisiones',
      contador: 'Facturación y finanzas',
      auditor: 'Revisión y auditoría',
      cliente_externo: 'Acceso limitado a campañas propias'
    };
    return descripciones[rol];
  }

  /**
   * Lista todos los roles disponibles
   */
  static getRoles(): { id: Rol; nombre: string; descripcion: string }[] {
    return [
      { id: 'super_admin', nombre: 'Super Administrador', descripcion: 'Acceso total al sistema' },
      { id: 'admin_tenant', nombre: 'Administrador', descripcion: 'Administrador de la empresa' },
      { id: 'gerente_ventas', nombre: 'Gerente de Ventas', descripcion: 'Gestión comercial y aprobaciones' },
      { id: 'ejecutivo_ventas', nombre: 'Ejecutivo de Ventas', descripcion: 'Ventas y clientes' },
      { id: 'operador_pauta', nombre: 'Operador de Pauta', descripcion: 'Programación de spots' },
      { id: 'operador_trafico', nombre: 'Operador de Tráfico', descripcion: 'Verificación de emisiones' },
      { id: 'contador', nombre: 'Contador', descripcion: 'Facturación y finanzas' },
      { id: 'auditor', nombre: 'Auditor', descripcion: 'Revisión y auditoría' },
      { id: 'cliente_externo', nombre: 'Cliente Externo', descripcion: 'Acceso limitado' }
    ];
  }
}

export default SistemaRBAC;
