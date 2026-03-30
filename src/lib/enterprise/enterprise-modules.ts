/**
 * SILEXAR PULSE - TIER0+ ENTERPRISE MODULES
 * Sistema Modular Empresarial
 */

export interface ModuloEmpresarial {
    readonly id: string;
    readonly nombre: string;
    readonly descripcion: string;
    readonly icono: string;
    readonly ruta: string;
    readonly activo: boolean;
    readonly permisos: string[];
}

export const MODULOS_EMPRESARIALES: ModuloEmpresarial[] = [
    {
        id: 'campanas',
        nombre: 'Campañas',
        descripcion: 'Gestión de campañas publicitarias',
        icono: 'megaphone',
        ruta: '/campanas',
        activo: true,
        permisos: ['campanas:read', 'campanas:write'],
    },
    {
        id: 'contratos',
        nombre: 'Contratos',
        descripcion: 'Gestión de contratos comerciales',
        icono: 'file-text',
        ruta: '/contratos',
        activo: true,
        permisos: ['contratos:read', 'contratos:write'],
    },
    {
        id: 'reportes',
        nombre: 'Reportes',
        descripcion: 'Reportes y análisis',
        icono: 'bar-chart',
        ruta: '/reportes',
        activo: true,
        permisos: ['reportes:read'],
    },
    {
        id: 'configuracion',
        nombre: 'Configuración',
        descripcion: 'Configuración del sistema',
        icono: 'settings',
        ruta: '/configuracion',
        activo: true,
        permisos: ['admin:config'],
    },
];

export const getModuloById = (id: string): ModuloEmpresarial | undefined => {
    return MODULOS_EMPRESARIALES.find(m => m.id === id);
};

export const getModulosActivos = (): ModuloEmpresarial[] => {
    return MODULOS_EMPRESARIALES.filter(m => m.activo);
};

export const verificarPermiso = (moduloId: string, permisos: string[]): boolean => {
    const modulo = getModuloById(moduloId);
    if (!modulo) return false;
    return modulo.permisos.some(p => permisos.includes(p));
};