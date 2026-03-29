import { logger } from '@/lib/observability';
/**
 * SERVICE: SALESFORCE INTEGRATION (STUB)
 * 
 * @description Sincronización bidireccional de Deals, Contactos y Actividades.
 */

export class SalesforceIntegrationService {
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async syncDeals(_lastSync: Date): Promise<Record<string, unknown>[]> {
    logger.info('[SFDC] Syncing deals...');
    return [];
  }

  async pushOpportunity(opportunity: Record<string, unknown>): Promise<boolean> {
    logger.info(`[SFDC] Pushing new opportunity: ${String(opportunity.id ?? '')}`);
    return true;
  }

  async getAccountDetails(accountId: string): Promise<{ id: string; name: string; status: string }> {
    return { id: accountId, name: 'Mock Account', status: 'Active' };
  }
}
