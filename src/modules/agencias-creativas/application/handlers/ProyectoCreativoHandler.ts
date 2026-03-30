import { logger } from '@/lib/observability';
export interface CrearProyectoCommand {
    nombre: string;
    agenciaId: string;
    clienteId: string;
    presupuesto: number;
    fechaInicio: string;
}

export interface ProyectoCreativo {
    id: string;
    nombre: string;
    agenciaId: string;
    clienteId: string;
    presupuesto: number;
    estado: 'BORRADOR' | 'EN_PROGRESO' | 'COMPLETADO';
    fechaCreacion: string;
}

export class ProyectoCreativoHandler {
    async crear(command: CrearProyectoCommand): Promise<ProyectoCreativo> {
        return {
            id: `proy_${Date.now()}`,
            nombre: command.nombre,
            agenciaId: command.agenciaId,
            clienteId: command.clienteId,
            presupuesto: command.presupuesto,
            estado: 'BORRADOR',
            fechaCreacion: command.fechaInicio
        };
    }

    async actualizar(id: string, data: Partial<CrearProyectoCommand>): Promise<ProyectoCreativo> {
        return {
            id,
            nombre: data.nombre || '',
            agenciaId: data.agenciaId || '',
            clienteId: data.clienteId || '',
            presupuesto: data.presupuesto || 0,
            estado: 'EN_PROGRESO',
            fechaCreacion: data.fechaInicio || new Date().toISOString()
        };
    }

    async obtener(id: string): Promise<ProyectoCreativo | null> {
        return id ? { id, nombre: '', agenciaId: '', clienteId: '', presupuesto: 0, estado: 'BORRADOR', fechaCreacion: '' } : null;
    }

    async eliminar(id: string): Promise<boolean> {
        logger.info(`Eliminando proyecto: ${id}`);
        return true;
    }

    async listar(agenciaId: string): Promise<ProyectoCreativo[]> {
        return agenciaId ? [] : [];
    }
}

export default new ProyectoCreativoHandler();