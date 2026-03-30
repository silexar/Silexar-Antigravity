import { logger } from '@/lib/observability';
export interface CrearContratoCommand {
    numero: string;
    clienteId: string;
    valor: number;
    fechaInicio: string;
    fechaFin: string;
}

export interface Contrato {
    id: string;
    numero: string;
    clienteId: string;
    valor: number;
    estado: 'BORRADOR' | 'ACTIVO' | 'FINALIZADO';
    fechaCreacion: string;
}

export class ContratoCommandHandler {
    async crear(command: CrearContratoCommand): Promise<Contrato> {
        return {
            id: `cont_${Date.now()}`,
            numero: command.numero,
            clienteId: command.clienteId,
            valor: command.valor,
            estado: 'BORRADOR',
            fechaCreacion: command.fechaInicio
        };
    }

    async actualizar(id: string, data: Partial<CrearContratoCommand>): Promise<Contrato> {
        return {
            id,
            numero: data.numero || '',
            clienteId: data.clienteId || '',
            valor: data.valor || 0,
            estado: 'ACTIVO',
            fechaCreacion: data.fechaInicio || new Date().toISOString()
        };
    }

    async obtener(id: string): Promise<Contrato | null> {
        return id ? { id, numero: '', clienteId: '', valor: 0, estado: 'BORRADOR', fechaCreacion: '' } : null;
    }

    async eliminar(id: string): Promise<boolean> {
        logger.info(`Eliminando contrato: ${id}`);
        return true;
    }
}

export default new ContratoCommandHandler();