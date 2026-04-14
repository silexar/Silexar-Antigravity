// @ts-nocheck

import { logger } from '@/lib/observability';
/**
 * SILEXAR PULSE - TIER0+ FRONTEND SERVICE
 * ContratoService - Servicio de Contratos para Frontend
 */

export interface ContratoResumen {
    readonly id: string;
    readonly numeroContrato: string;
    readonly nombreAnunciante: string;
    readonly nombreAgencia?: string;
    readonly estado: string;
    readonly fechaInicio: Date;
    readonly fechaTermino: Date;
    readonly valorTotal: number;
}

export interface FiltrosContrato {
    readonly estado?: string;
    readonly anunciante?: string;
    readonly fechaInicio?: Date;
    readonly fechaFin?: Date;
}

class ContratoServiceImpl {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    }

    async obtenerListado(filtros?: FiltrosContrato): Promise<ContratoResumen[]> {
        try {
            const params = new URLSearchParams();
            if (filtros?.estado) params.append('estado', filtros.estado);
            if (filtros?.anunciante) params.append('anunciante', filtros.anunciante);
            
            const response = await fetch(`${this.baseUrl}/contratos?${params.toString()}`);
            if (!response.ok) throw new Error('Error al obtener contratos');
            return await response.json();
        } catch (error) {
            logger.error('ContratoService.obtenerListado error:', error);
            return [];
        }
    }

    async obtenerPorId(id: string): Promise<ContratoResumen | null> {
        try {
            const response = await fetch(`${this.baseUrl}/contratos/${id}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            logger.error('ContratoService.obtenerPorId error:', error);
            return null;
        }
    }
}

export const ContratoService = new ContratoServiceImpl();
