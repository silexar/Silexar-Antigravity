/**
 * SILEXAR PULSE - TIER0+ AGENCIAS CREATIVAS COMMANDS
 * Comandos para módulo de Agencias Creativas
 */

export interface CrearAgenciaCommand {
    readonly nombre: string;
    readonly tipo: 'CREATIVA' | 'MEDIOS';
    readonly contacto: string;
    readonly email: string;
}

export interface ActualizarAgenciaCommand {
    readonly id: string;
    readonly nombre?: string;
    readonly contacto?: string;
    readonly email?: string;
}

export interface EliminarAgenciaCommand {
    readonly id: string;
}

export const createCrearAgenciaCommand = (data: CrearAgenciaCommand): CrearAgenciaCommand => data;
export const createActualizarAgenciaCommand = (data: ActualizarAgenciaCommand): ActualizarAgenciaCommand => data;
export const createEliminarAgenciaCommand = (data: EliminarAgenciaCommand): EliminarAgenciaCommand => data;

export default {
    createCrearAgenciaCommand,
    createActualizarAgenciaCommand,
    createEliminarAgenciaCommand,
};