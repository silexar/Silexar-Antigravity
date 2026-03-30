import { logger } from '@/lib/observability';
/**
 * SERVICE: HRIS INTEGRATION (STUB)
 * 
 * @description Sincronización del ciclo de vida del empleado (Altas, Bajas, Cambios).
 */

export class HRISIntegrationService {
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async syncEmployeeData(_employeeId: string): Promise<{ status: string; department: string; managerId: string }> {
    logger.info('[HRIS] Fetching employee details...');
    return { status: 'ACTIVE', department: 'SALES', managerId: 'mgr-001' };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async reportPerformanceReview(_reviewId: string, _rating: number): Promise<boolean> {
    return true;
  }
}
