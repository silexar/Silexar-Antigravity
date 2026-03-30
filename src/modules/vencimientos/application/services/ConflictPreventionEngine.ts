/**
 * CONFLICT PREVENTION ENGINE (TIER 0)
 * Evaluador de Brand Safety y Detección de Colisiones entre Marcas.
 */

export interface ConflictAlert {
  severity: 'CRÍTICO' | 'ADVERTENCIA';
  conflictType: 'DIRECT_COMPETITOR' | 'BRAND_UNSAFE';
  description: string;
  proposedResolution: string;
}

export class ConflictPreventionEngine {
  
  /**
   * MOCK - Base de datos estática de competidores por rubro.
   */
  private readonly competitorsGraph: Record<string, string[]> = {
    'Coca-Cola': ['Pepsi', 'CCU'],
    'Pepsi': ['Coca-Cola', 'CCU'],
    'Clínica Alemana': ['Clínica Las Condes', 'RedSalud'],
    'Nike': ['Adidas', 'Puma']
  };

  /**
   * Evalúa si una nueva inserción colisiona con el inventario actual de la tanda.
   */
  public async analyzeBrandSafety(newBrand: string, currentBatchBrands: string[]): Promise<ConflictAlert | null> {
    const enemies = this.competitorsGraph[newBrand] || [];

    for (const existingBrand of currentBatchBrands) {
      if (enemies.includes(existingBrand)) {
        return {
          severity: 'CRÍTICO',
          conflictType: 'DIRECT_COMPETITOR',
          description: `Choque detectado: ${newBrand} no puede emitirse en la misma tanda que ${existingBrand}.`,
          proposedResolution: `Reemplazar ${newBrand} por una Auspicio en el bloque horario PM.`
        };
      }
    }
    return null; // Aprobado
  }

  /**
   * REGLAS DINÁMICAS (Dynamic Rules) - IA Simulation
   */
  public async suggestDynamicRules(programFormat: 'DEPORTES' | 'POLÍTICA' | 'ENTRETENCIÓN'): Promise<string[]> {
    if (programFormat === 'POLÍTICA') {
      return ["⚠️ BRAND SAFETY: Bloquear anunciantes de alcohol y juegos de azar durante debates políticos."];
    }
    if (programFormat === 'DEPORTES') {
      return ["💡 EXCLUSIVIDAD: Aplicar markup de +20% a marcas de Cerveza o Casas de Apuesta."];
    }
    return ["✅ SISTEMA: Sin reglas de brand safety restrictivas recomendadas actuales."];
  }
}
