/**
 * SILEXAR PULSE - TIER0+ CORTEX ENGINES
 * Motor de Inteligencia Artificial Frontend
 */

export interface CortexEngine {
    readonly id: string;
    readonly nombre: string;
    readonly tipo: 'PREDICCION' | 'OPTIMIZACION' | 'ANALISIS' | 'AUTOMATIZACION';
    readonly activo: boolean;
}

export const CORTEX_ENGINES: CortexEngine[] = [
    { id: 'prediccion', nombre: 'Motor Predictivo', tipo: 'PREDICCION', activo: true },
    { id: 'optimizacion', nombre: 'Motor de Optimización', tipo: 'OPTIMIZACION', activo: true },
    { id: 'analisis', nombre: 'Motor de Análisis', tipo: 'ANALISIS', activo: true },
    { id: 'automatizacion', nombre: 'Motor de Automatización', tipo: 'AUTOMATIZACION', activo: true },
];

export const getEngineById = (id: string): CortexEngine | undefined => {
    return CORTEX_ENGINES.find(e => e.id === id);
};

export const getEnginesActivos = (): CortexEngine[] => {
    return CORTEX_ENGINES.filter(e => e.activo);
};

// Exportar todo
export default {
    CORTEX_ENGINES,
    getEngineById,
    getEnginesActivos,
};