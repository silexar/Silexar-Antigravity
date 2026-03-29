/**
 * VALUE OBJECT: EXPANSION TYPE - TIER 0 ENTERPRISE
 *
 * @description Tipos de oportunidad de expansión dentro de cuenta.
 * Incluye revenue multiplier y probabilidad base.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export enum ExpansionType {
  CROSS_SELL = 'CROSS_SELL',
  UPSELL = 'UPSELL',
  NEW_DIVISION = 'NEW_DIVISION',
  NEW_PRODUCT = 'NEW_PRODUCT',
  RENEWAL_UPLIFT = 'RENEWAL_UPLIFT',
}

export const EXPANSION_CONFIG: Record<ExpansionType, {
  label: string;
  descripcion: string;
  revenueMultiplier: number; // Multiplicador sobre deal promedio
  probabilidadBase: number;  // Probabilidad base de cierre (%)
  cicloVentaDias: number;    // Ciclo de venta estimado en días
  esfuerzoRequerido: 'LOW' | 'MEDIUM' | 'HIGH';
}> = {
  [ExpansionType.CROSS_SELL]: {
    label: 'Cross-Sell',
    descripcion: 'Vender producto/servicio complementario al existente',
    revenueMultiplier: 0.3,
    probabilidadBase: 60,
    cicloVentaDias: 45,
    esfuerzoRequerido: 'MEDIUM',
  },
  [ExpansionType.UPSELL]: {
    label: 'Upsell',
    descripcion: 'Upgradar plan actual o aumentar volumen',
    revenueMultiplier: 0.25,
    probabilidadBase: 70,
    cicloVentaDias: 30,
    esfuerzoRequerido: 'LOW',
  },
  [ExpansionType.NEW_DIVISION]: {
    label: 'Nueva División',
    descripcion: 'Expandir a otra área/división de la empresa',
    revenueMultiplier: 0.8,
    probabilidadBase: 40,
    cicloVentaDias: 90,
    esfuerzoRequerido: 'HIGH',
  },
  [ExpansionType.NEW_PRODUCT]: {
    label: 'Nuevo Producto',
    descripcion: 'Vender un nuevo producto al cliente existente',
    revenueMultiplier: 0.5,
    probabilidadBase: 50,
    cicloVentaDias: 60,
    esfuerzoRequerido: 'MEDIUM',
  },
  [ExpansionType.RENEWAL_UPLIFT]: {
    label: 'Renewal Uplift',
    descripcion: 'Incremento en valor de renovación de contrato',
    revenueMultiplier: 0.15,
    probabilidadBase: 80,
    cicloVentaDias: 20,
    esfuerzoRequerido: 'LOW',
  },
};
