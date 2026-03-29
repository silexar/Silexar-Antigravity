import { logger } from '@/lib/observability';
export interface MobileAPIResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

export interface ContratoMovil {
    id: string;
    numero: string;
    estado: string;
    valor: number;
}

export class MobileApiController {
    async listar(usuarioId: string, page = 1, limit = 20): Promise<MobileAPIResponse<ContratoMovil[]>> {
        logger.info(`Listando contratos para usuario: ${usuarioId}, page: ${page}, limit: ${limit}`);
        return { success: true, data: [], timestamp: new Date().toISOString() };
    }

    async obtener(contratoId: string): Promise<MobileAPIResponse<ContratoMovil | null>> {
        return {
            success: true,
            data: contratoId ? { id: contratoId, numero: '', estado: 'ACTIVO', valor: 0 } : null,
            timestamp: new Date().toISOString()
        };
    }

    async sincronizar(usuarioId: string, ultimaSync: string): Promise<MobileAPIResponse<{ updated: number }>> {
        logger.info(`Sync para ${usuarioId} desde ${ultimaSync}`);
        return { success: true, data: { updated: 0 }, timestamp: new Date().toISOString() };
    }

    async offline(contratoId: string, accion: string): Promise<MobileAPIResponse<boolean>> {
        logger.info(`Acción offline: ${accion} en contrato: ${contratoId}`);
        return { success: true, data: true, timestamp: new Date().toISOString() };
    }
}

export default new MobileApiController();