/**
 * QUERY: ANALISIS FLIGHT RISK - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface FlightRiskResult {
  vendedorId: string;
  vendedorNombre: string;
  riskScore: number;
  riskLevel: string;
  tendencia: string;
  factoresTop: Array<{
    categoria: string;
    score: number;
    detalle: string;
  }>;
  impactoSiSale: string;
  arrEnRiesgo: number;
  accountsEnRiesgo: number;
  accionesPendientes: number;
  accionesCompletadas: number;
}

export interface FlightRiskAnalysisResult {
  resumen: {
    totalEvaluados: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    arrTotalEnRiesgo: number;
  };
  vendedoresEnRiesgo: FlightRiskResult[];
}

export class AnalisisFlightRiskQuery {
  constructor(
    public readonly equipoId?: string,
    public readonly soloAltoRiesgo?: boolean,
    public readonly managerId?: string
  ) {}
}
