/**
 * SILEXAR PULSE - TIER0+ AGENCIAS CREATIVAS CONTROLLERS
 * Controladores de Agencias Creativas (Frontend)
 */

export interface AgenciaController {
    readonly name: string;
    readonly path: string;
}

export const AGENCIAS_CONTROLLERS: AgenciaController[] = [
    { name: 'listado', path: '/agencias' },
    { name: 'detalle', path: '/agencias/:id' },
    { name: 'crear', path: '/agencias/nuevo' },
    { name: 'editar', path: '/agencias/:id/editar' },
];

export const getControllerByName = (name: string): AgenciaController | undefined => {
    return AGENCIAS_CONTROLLERS.find(c => c.name === name);
};

export default AGENCIAS_CONTROLLERS;