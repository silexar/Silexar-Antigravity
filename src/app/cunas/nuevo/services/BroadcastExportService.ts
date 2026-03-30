import { format } from 'date-fns';
import { logger } from '@/lib/observability';

interface CunaExportData {
  nombre: string;
  spxCodigo?: string;
  anuncianteNombre: string;
  audioMetadata?: { fileName: string };
  duracionSegundos?: number;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
  tipo: string;
  urgencia?: string;
}

interface TargetStation {
  name: string;
  system: string;
}

export interface ExportResult {
  station: string;
  system: string;
  status: 'success' | 'error';
  message?: string;
  data?: Record<string, unknown>;
}

export class BroadcastExportService {

  /**
   * Exporta la cuña a todos los sistemas de emisión configurados
   */
  static async exportToAllSystems(cunaData: CunaExportData): Promise<ExportResult[]> {
    // Mock: Get target stations from cunaData or service
    const targetStations = [
      { name: 'Radio Corazón', system: 'wideorbit' },
      { name: 'FM Dos', system: 'dalet' },
      { name: 'Radio Imagina', system: 'sara' }
    ];

    const results: ExportResult[] = [];

    for (const station of targetStations) {
      try {
        const result = await this.exportToSystem(cunaData, station);
        results.push({
          station: station.name,
          system: station.system,
          status: 'success',
          data: result
        });
      } catch (error: unknown) {
        results.push({
          station: station.name,
          system: station.system,
          status: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  private static async exportToSystem(cuna: CunaExportData, station: TargetStation) {
    switch (station.system) {
      case 'wideorbit': return this.exportToWideOrbit(cuna, station);
      case 'sara': return this.exportToSara(cuna, station);
      case 'dalet': return this.exportToDalet(cuna, station);
      default: throw new Error(`Sistema ${station.system} no soportado`);
    }
  }

  // --- EXPORTERS ---

  private static async exportToWideOrbit(cuna: CunaExportData, station: TargetStation) {
    logger.info(`[WideOrbit] Exportando ${cuna.nombre} a ${station.name}...`);
    
    const wideOrbitPayload = {
      cartNumber: `WO-${cuna.spxCodigo || Date.now()}`,
      title: cuna.nombre,
      advertiser: cuna.anuncianteNombre,
      audioFile: cuna.audioMetadata?.fileName || 'pending_upload',
      duration: Math.ceil((cuna.duracionSegundos || 30) * 1000),
      startDate: cuna.fechaInicioVigencia ? format(new Date(cuna.fechaInicioVigencia), 'MM/dd/yyyy') : '',
      endDate: cuna.fechaFinVigencia ? format(new Date(cuna.fechaFinVigencia), 'MM/dd/yyyy') : '',
      category: cuna.tipo.toUpperCase(),
      priority: cuna.urgencia || 'normal'
    };

    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 800));
    return { id: wideOrbitPayload.cartNumber, status: 'INGEST_QUEUED' };
  }

  private static async exportToSara(cuna: CunaExportData, station: TargetStation) {
    logger.info(`[Sara] Exportando ${cuna.nombre} a ${station.name}...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    return { id: `SARA-${Date.now()}`, status: 'OK' };
  }

  private static async exportToDalet(cuna: CunaExportData, station: TargetStation) {
    logger.info(`[Dalet] Exportando ${cuna.nombre} a ${station.name}...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    return { id: `DLT-${Date.now()}`, status: 'OK' };
  }
}
