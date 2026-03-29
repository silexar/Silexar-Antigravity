/**
 * COMMAND: CREAR ACCOUNT PLAN - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface CrearAccountPlanCommandPayload {
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  periodo: string;
  objetivos: Array<{
    descripcion: string;
    tipo: 'REVENUE' | 'EXPANSION' | 'RETENTION' | 'RELATIONSHIP';
    valorTarget?: number;
    fechaLimite: Date;
  }>;
  competitiveStrategy: string;
  expansionTargets: string[];
  kpis: Array<{
    nombre: string;
    valorTarget: number;
    unidad: string;
  }>;
}

export class CrearAccountPlanCommand {
  constructor(public readonly payload: CrearAccountPlanCommandPayload) {
    this.validate();
  }

  private validate(): void {
    if (!this.payload.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.payload.kamId) throw new Error('KamId es requerido');
    if (!this.payload.periodo) throw new Error('Periodo es requerido');
    if (this.payload.objetivos.length === 0) throw new Error('Debe tener al menos un objetivo');
  }
}
