/**
 * REVENUE OPTIMIZATION MATRIX (TIER 0)
 * Evaluador de Balance de Portfolio y Ajustes Estacionales.
 */

export interface PortfolioBalance {
  status: 'OPTIMIZED' | 'UNBALANCED';
  score: number;
  unbalancedSectors: string[];
  suggestedProducts: string[];
}

export class RevenueOptimizationMatrix {
  
  /**
   * MOCK - Analiza si el inventario está muy concentrado en un solo producto (desbalance).
   */
  public async analyzePortfolioBalance(salesData: Record<string, number>): Promise<PortfolioBalance> {
    const totalSales = Object.values(salesData).reduce((a, b) => a + b, 0);
    
    // Si un producto lidera > 60% las ventas totales, reportar riesgo
    for (const [product, sales] of Object.entries(salesData)) {
      if ((sales / totalSales) > 0.60) {
        return {
          status: 'UNBALANCED',
          score: 65,
          unbalancedSectors: [product],
          suggestedProducts: ['Tipo B', 'Digital Podcast', 'Aus. Clima']
        };
      }
    }

    return {
      status: 'OPTIMIZED',
      score: 95,
      unbalancedSectors: [],
      suggestedProducts: []
    };
  }

  /**
   * Calculadora de Ajuste Estacional
   * @param basePrice - Precio base de tarifa
   * @param month - Mes en formato 1-12
   */
  public getSeasonalAdjustment(basePrice: number, month: number): number {
    const highSeason = [3, 9, 11, 12]; // Marzo, Sept, BlackFriday, Dic
    const lowSeason = [1, 2]; // Enero, Febrero

    if (highSeason.includes(month)) return basePrice * 1.25; // 25% Premium
    if (lowSeason.includes(month))  return basePrice * 0.85; // 15% Descuento Off-Peak
    
    return basePrice; // Tarifa Normal
  }
}
