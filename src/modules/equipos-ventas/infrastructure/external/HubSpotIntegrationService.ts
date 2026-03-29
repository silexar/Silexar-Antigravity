import { logger } from '@/lib/observability';
/**
 * SERVICE: HUBSPOT INTEGRATION (STUB)
 * 
 * @description Alineación de Marketing y Ventas. Sincronización de Leads y Campañas.
 */

export class HubSpotIntegrationService {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMarketingQualifiedLeads(_date: Date): Promise<Record<string, unknown>[]> {
    logger.info('[HubSpot] Fetching MQLs...');
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateContactStatus(_email: string, _status: string): Promise<boolean> {
    return true;
  }
}
