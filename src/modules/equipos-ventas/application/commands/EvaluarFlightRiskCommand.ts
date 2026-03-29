/**
 * COMMAND: EVALUAR FLIGHT RISK - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface EvaluarFlightRiskCommandPayload {
  vendedorId: string;
  vendedorNombre: string;
  factores: Array<{
    categoria: 'COMPENSACION' | 'ENGAGEMENT' | 'PERFORMANCE' | 'MERCADO' | 'CRECIMIENTO' | 'LIDERAZGO';
    nombre: string;
    score: number;
    peso: number;
    detalle: string;
  }>;
  impactoSiSale: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  arrEnRiesgo: number;
  accountsEnRiesgo: number;
}

export class EvaluarFlightRiskCommand {
  constructor(public readonly payload: EvaluarFlightRiskCommandPayload) {
    this.validate();
  }

  private validate(): void {
    if (!this.payload.vendedorId) throw new Error('VendedorId es requerido');
    if (this.payload.factores.length === 0) throw new Error('Debe tener al menos un factor');
    for (const f of this.payload.factores) {
      if (f.score < 0 || f.score > 100) throw new Error(`Score inválido para ${f.categoria}`);
    }
  }
}
