/**
 * SILEXAR PULSE - TIER0+ PLAN DE PAGOS
 * Entidad de Plan de Pagos
 */

export interface Cuota {
    readonly numero: number;
    readonly monto: number;
    readonly fechaVencimientos: Date;
    readonly estado: 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
}

export interface PlanPagos {
    readonly id: string;
    readonly contratoId: string;
    readonly cuotas: Cuota[];
    readonly montoTotal: number;
    readonly saldoPendiente: number;
}

export const crearPlanPagos = (contratoId: string, montoTotal: number, numeroCuotas: number): PlanPagos => {
    const montoPorCuota = montoTotal / numeroCuotas;
    const cuotas: Cuota[] = [];
    
    for (let i = 0; i < numeroCuotas; i++) {
        const fechaVencimientos = new Date();
        fechaVencimientos.setMonth(fechaVencimientos.getMonth() + i + 1);
        
        cuotas.push({
            numero: i + 1,
            monto: montoPorCuota,
            fechaVencimientos,
            estado: 'PENDIENTE',
        });
    }

    return {
        id: `plan_${Date.now()}`,
        contratoId,
        cuotas,
        montoTotal,
        saldoPendiente: montoTotal,
    };
};

export const calcularSaldoPendiente = (plan: PlanPagos): number => {
    return plan.cuotas
        .filter(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDA')
        .reduce((sum, c) => sum + c.monto, 0);
};

export default PlanPagos;