export interface ContractData {
  id: string;
  advertiserId: string;
  productId?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  salesRep: string;
  requirements: { type: string; count: number }[];
}

export class ContractIntegrationService {
  
  /**
   * Valida si existe material disponible para un contrato
   */
  static async validateMaterialAvailability(contract: ContractData) {
    // Mock: Search for active cunas
    const existingCunas = [
      // Mock existing
      { id: 'SPX-001', tipo: 'audio', status: 'active', endDate: new Date(2025, 11, 31) }
    ];

    const missing = [];
    
    // Analyze requirements
    for (const req of contract.requirements) {
       const hasMaterial = existingCunas.some(c => c.tipo === req.type);
       if (!hasMaterial) {
          missing.push(req.type);
       }
    }

    return {
      hasActiveMaterial: missing.length === 0,
      availableCunas: existingCunas,
      missingMaterial: missing,
      recommendations: missing.length > 0 
        ? [`Falta crear ${missing.join(', ')} para este contrato.`] 
        : ['Todo el material necesario está cubierto.']
    };
  }

  /**
   * Crea cuñas "placeholder" desde un contrato
   */
  static async createCunasFromContract(contract: ContractData) {
    const createdTemplates = [];

    // Detect needs (Mock logic: if contract requires 'mencion', create one)
    for (const req of contract.requirements) {
       for (let i = 0; i < req.count; i++) {
          createdTemplates.push({
             id: `SPX-AUTO-${Math.floor(Math.random()*10000)}`,
             anuncianteId: contract.advertiserId,
             nombre: `${req.type.toUpperCase()} - ${contract.name} (Auto)`,
             tipo: req.type,
             fechaInicioVigencia: contract.startDate.toISOString().split('T')[0],
             fechaFinVigencia: contract.endDate.toISOString().split('T')[0],
             origen: 'contract_automation',
             estado: 'awaiting_material'
          });
       }
    }

    return createdTemplates;
  }
}
