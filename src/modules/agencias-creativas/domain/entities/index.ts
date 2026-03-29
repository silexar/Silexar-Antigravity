/**
 * SILEXAR PULSE - TIER0+ AGENCIAS CREATIVAS ENTITIES
 */
export interface Agencia { id: string; nombre: string; tipo: 'CREATIVA' | 'MEDIOS'; }
export interface ProyectoCreativo { id: string; agenciaId: string; nombre: string; }
export const createAgencia = (data: Partial<Agencia>): Agencia => ({
    id: `ag_${Date.now()}`, nombre: data.nombre || '', tipo: data.tipo || 'CREATIVA'
});