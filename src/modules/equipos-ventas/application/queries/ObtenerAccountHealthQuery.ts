/**
 * QUERY: OBTENER ACCOUNT HEALTH - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface AccountHealthResult {
  cuentaId: string;
  cuentaNombre: string;
  scoreGeneral: number;
  dimensiones: Array<{
    nombre: string;
    score: number;
    tendencia: string;
  }>;
  trend: string;
  riskLevel: string;
  alertasActivas: number;
  ultimaInteraccion: Date;
  historico: Array<{
    fecha: Date;
    score: number;
  }>;
}

export class ObtenerAccountHealthQuery {
  constructor(
    public readonly kamId: string,
    public readonly cuentaId?: string,
    public readonly soloEnRiesgo?: boolean
  ) {
    if (!kamId) throw new Error('KamId es requerido');
  }
}
