/**
 * Authorization helpers for campañas (framework-agnostic)
 */

export interface UserLike {
  id: string;
  permisos?: string[];
  roles?: string[];
  clienteId?: string;
}

export function tienePermiso(usuario: UserLike | undefined, permiso: string): boolean {
  if (!usuario) return false;
  if (usuario.permisos?.includes(permiso)) return true;
  if (usuario.roles?.includes('admin')) return true;
  const permisosRol: Record<string, string[]> = {
    admin: ['*'],
    traffic_manager: ['campana_crear', 'campana_editar', 'campana_eliminar', 'campana_planificar', 'campana_confirmar', 'campana_ejecutar'],
    ejecutivo_comercial: ['campana_crear', 'campana_editar', 'campana_ver'],
    programador: ['campana_planificar', 'campana_programar', 'campana_ver'],
    cliente: ['campana_ver', 'campana_comentar']
  };
  const all: string[] = [];
  for (const r of usuario.roles || []) all.push(...(permisosRol[r] || []));
  if (all.includes('*')) return true;
  return all.includes(permiso);
}

export function authorizeCampana(usuario: UserLike | undefined, accion: string): boolean {
  return tienePermiso(usuario, `campana_${accion}`);
}

