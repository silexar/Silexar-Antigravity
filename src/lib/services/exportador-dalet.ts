import { XMLBuilder } from "fast-xml-parser";

interface DaletExportOptions {
  stationCode: string;
  date: Date;
  items: Array<{
    id: string;
    title: string;
    artist?: string;
    durationSec: number;
    scheduledTime: string;
    status: 'played' | 'skipped' | 'failed';
    playTime?: string;
  }>;
}

/**
 * Servicio para generar archivos XML compatibles con Dalet Galaxy / 5.1
 * Utilizado para reconciliación automática (As-Run Logs)
 */
export const ExportadorDalet = {
  /**
   * Genera un string XML compatible con el formato de importación de logs de Dalet
   */
  generateAsRunLog: (options: DaletExportOptions): string => {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: "  ",
    });

    const xmlData = {
      DaletLog: {
        "@_Station": options.stationCode,
        "@_Date": options.date.toISOString().split('T')[0],
        "@_Generator": "Silexar Pulse Antygravity",
        Events: {
          Event: options.items.map(item => ({
            "@_Type": "Music", // Simplificación para este ejemplo, podría ser Spot, Jingle, etc.
            "@_Status": item.status === 'played' ? 'Executed' : 'Skipped',
            Title: item.title,
            Artist: item.artist || "",
            Duration: item.durationSec,
            ScheduledTime: item.scheduledTime,
            PlayTime: item.playTime || "",
            ExternalID: item.id
          }))
        }
      }
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(xmlData)}`;
  },

  /**
   * Genera un nombre de archivo estándar para el log
   */
  getFileName: (stationCode: string, date: Date): string => {
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    return `DALET_ASRUN_${stationCode}_${dateStr}.xml`;
  }
};
