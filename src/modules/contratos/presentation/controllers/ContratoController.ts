export interface ContratoDTO { id: string; numero: string; valor: number; }
class ContratoControllerImpl {
    async getAll(): Promise<ContratoDTO[]> { return []; }
    async getById(): Promise<ContratoDTO | null> { return null; }
    async create(): Promise<ContratoDTO> { return { id: `c_${Date.now()}`, numero: '', valor: 0 }; }
}
export const ContratoController = new ContratoControllerImpl();
export default ContratoController;