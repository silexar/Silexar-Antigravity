export interface AdPlacement { id: string; format: string; }
class AdServerEngineImpl {
    async serve(): Promise<AdPlacement | null> { return null; }
    async track(): Promise<void> { /* Track */ }
}
export const AdServerEngine = new AdServerEngineImpl();
export default AdServerEngine;