/**
 * SILEXAR PULSE - TIER0+ FRONTEND ROUTES
 * Rutas de Navegación para Contratos (Frontend)
 * 
 * NOTA: Este archivo es para definir rutas de navegación del frontend,
 * NO rutas de Express (backend). Las rutas de API están en el backend.
 */

export interface ContratoRoute {
    readonly path: string;
    readonly nombre: string;
    readonly icono?: string;
    readonly permisos: string[];
}

export const CONTRATO_ROUTES: ContratoRoute[] = [
    { path: '/contratos', nombre: 'Listado de Contratos', permisos: ['contratos:read'] },
    { path: '/contratos/nuevo', nombre: 'Nuevo Contrato', permisos: ['contratos:write'] },
    { path: '/contratos/:id', nombre: 'Detalle de Contrato', permisos: ['contratos:read'] },
    { path: '/contratos/:id/editar', nombre: 'Editar Contrato', permisos: ['contratos:write'] },
    { path: '/contratos/:id/campanas', nombre: 'Campañas del Contrato', permisos: ['contratos:read', 'campanas:read'] },
];

export const getContratoRoute = (path: string): ContratoRoute | undefined => {
    return CONTRATO_ROUTES.find(r => r.path === path);
};

export const contratoRoutes = CONTRATO_ROUTES;
export default CONTRATO_ROUTES;