/**
 * QUERY: OBTENER KAM DASHBOARD - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface KAMDashboardResult {
  kam: {
    id: string;
    nombre: string;
    tier: string;
    portfolioARR: number;
    accountCount: number;
    avgHealthScore: number;
    expansionOppsCount: number;
    capacidad: { actual: number; maximo: number; porcentaje: number };
  };
  strategicAccounts: Array<{
    cuentaId: string;
    nombre: string;
    arr: number;
    healthScore: number;
    healthTrend: string;
    riskLevel: string;
    nextAction: string;
    expansionPotential: number;
    championStrength: number;
  }>;
  actionItems: Array<{
    tipo: string;
    mensaje: string;
    prioridad: string;
    cuentaRelacionada?: string;
    fechaLimite?: Date;
  }>;
  expansionPipeline: {
    totalOportunidades: number;
    valorTotal: number;
    valorWeighted: number;
    porTipo: Record<string, number>;
  };
  performanceSummary: {
    quotaAttainment: number;
    growthYoY: number;
    retentionRate: number;
    npsPromedio: number;
  };
}

export class ObtenerKAMDashboardQuery {
  constructor(
    public readonly kamId: string,
    public readonly periodo?: string
  ) {
    if (!kamId) throw new Error('KamId es requerido');
  }
}
