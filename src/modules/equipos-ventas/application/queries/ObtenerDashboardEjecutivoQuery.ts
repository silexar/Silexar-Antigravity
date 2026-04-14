/**
 * QUERY: OBTENER DASHBOARD EJECUTIVO
 *
 * @description Recupera las métricas agregadas de alto nivel para VPs y Directores.
 * Incluye ventas totales vs meta, forecast ponderado y alertas críticas.
 */

import { IQuery } from '@/lib/cqrs';

export class ObtenerDashboardEjecutivoQuery implements IQuery {
  readonly _result?: unknown
  constructor(
    public readonly tenantId: string,
    public readonly periodo: string, // Ej: '2025-Q1'
    public readonly nivelJerarquia?: number, // Opcional: filtrar por nivel
    public readonly regionId?: string // Opcional: filtrar por región
  ) {}
}
