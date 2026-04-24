/**
 * QUERY: GENERAR REPORTE DISTRIBUCIÓN — TIER 0
 *
 * Genera métricas sobre la distribución de cuñas a las emisoras:
 * tasa de éxito, errores comunes, y tiempos promedio.
 */

export interface GenerarReporteDistribucionInput {
  tenantId: string;
  fechaInicio: Date;
  fechaFin: Date;
  emisoraId?: string | null;
  canal?: 'email' | 'whatsapp' | 'ftp' | 'api' | null;
}

export class GenerarReporteDistribucionQuery {
  constructor(public readonly input: GenerarReporteDistribucionInput) {}
}
