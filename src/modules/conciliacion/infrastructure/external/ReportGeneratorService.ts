import { logger } from '@/lib/observability';
export class ReportGeneratorService {
  public async generatePDF(data: unknown): Promise<string> {
    logger.info(`[ReportGenerator] Generando reporte PDF...`);
    return `/reports/compliance_${Date.now()}.pdf`;
  }

  public async generateExcel(data: unknown): Promise<string> {
    logger.info(`[ReportGenerator] Generando reporte Excel...`);
    return `/reports/compliance_${Date.now()}.xlsx`;
  }
}
