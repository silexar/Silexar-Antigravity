/**
 * COMMAND: EJECUTAR SUCCESSION PLAN - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface EjecutarSuccessionPlanCommandPayload {
  rolCritico: string;
  departamento: string;
  titularActualId: string;
  titularNombre: string;
  candidatos: Array<{
    vendedorId: string;
    nombreCompleto: string;
    rolActual: string;
    readinessScore: number;
    gaps: string[];
    timelineEstimado: string;
    esInterno: boolean;
  }>;
  prioridad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  razon: string;
  fechaEstimadaTransicion?: Date;
}

export class EjecutarSuccessionPlanCommand {
  constructor(public readonly payload: EjecutarSuccessionPlanCommandPayload) {
    this.validate();
  }

  private validate(): void {
    if (!this.payload.rolCritico) throw new Error('Rol crítico es requerido');
    if (!this.payload.titularActualId) throw new Error('Titular actual es requerido');
    if (this.payload.candidatos.length === 0) throw new Error('Debe tener al menos un candidato');
  }
}
