export interface FinancialService { name: string; connected: boolean; }
class FinancialServicesManagerImpl {
    async getServices(): Promise<FinancialService[]> { return []; }
    async connect(): Promise<boolean> { return true; }
}
export const FinancialServicesManager = new FinancialServicesManagerImpl();
export default FinancialServicesManager;