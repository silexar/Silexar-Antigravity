/**
 * VALUE OBJECT TIPO EQUIPO - TIER 0 ENTERPRISE
 * 
 * @description Define los tipos de equipos de ventas soportados por el sistema.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export enum TipoEquipo {
  INSIDE_SALES = 'INSIDE_SALES',
  FIELD_SALES = 'FIELD_SALES',
  ACCOUNT_MANAGEMENT = 'ACCOUNT_MANAGEMENT',
  BUSINESS_DEVELOPMENT = 'BUSINESS_DEVELOPMENT', // BDR/SDR
  CUSTOMER_SUCCESS = 'CUSTOMER_SUCCESS',
  KEY_ACCOUNTS = 'KEY_ACCOUNTS',
  HYBRID = 'HYBRID'
}

export const TipoEquipoLabels: Record<TipoEquipo, string> = {
  [TipoEquipo.INSIDE_SALES]: 'Ventas Internas',
  [TipoEquipo.FIELD_SALES]: 'Ventas de Campo',
  [TipoEquipo.ACCOUNT_MANAGEMENT]: 'Gestión de Cuentas',
  [TipoEquipo.BUSINESS_DEVELOPMENT]: 'Desarrollo de Negocios',
  [TipoEquipo.CUSTOMER_SUCCESS]: 'Éxito del Cliente',
  [TipoEquipo.KEY_ACCOUNTS]: 'Cuentas Clave',
  [TipoEquipo.HYBRID]: 'Híbrido'
};
