/**
 * EXTERNAL SERVICE: BROADCAST EXPORT — TIER 0
 *
 * Exporta cuñas a los sistemas de emisión: SARA, Dalet Galaxy, WideOrbit.
 * Cada adaptador formatea el payload según el protocolo del sistema destino.
 *
 * Estado actual: STUB — los adaptadores reales están en src/modules/contratos/infrastructure/external/.
 */

import type { Cuna } from '../../domain/entities/Cuna';

export type SistemaEmision = 'SARA' | 'DALET_GALAXY' | 'WIDEORBIT' | 'MANUAL';

export interface ExportResult {
  exitoso: boolean;
  sistema: SistemaEmision;
  referencia?: string;  // ID externo en el sistema de destino
  error?: string;
}

export class BroadcastExportService {
  /**
   * Exporta una cuña aprobada al sistema de emisión indicado.
   * Solo cuñas en estado 'aprobada' o 'en_aire' pueden exportarse.
   */
  async exportar(cuna: Cuna, sistema: SistemaEmision): Promise<ExportResult> {
    if (!['aprobada', 'en_aire'].includes(cuna.estado)) {
      return {
        exitoso: false,
        sistema,
        error: `Solo cuñas aprobadas o en aire pueden exportarse. Estado actual: ${cuna.estado}`,
      };
    }

    // STUB: En producción, enrutar al adaptador correspondiente
    // → SaraIntegrationService | DaletIntegrationService | WideOrbitExportService
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      exitoso: true,
      sistema,
      referencia: `${sistema}-${cuna.codigo}-${Date.now()}`,
    };
  }
}
