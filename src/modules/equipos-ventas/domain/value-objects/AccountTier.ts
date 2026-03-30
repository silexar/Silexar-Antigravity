/**
 * VALUE OBJECT: ACCOUNT TIER - TIER 0 ENTERPRISE
 *
 * @description Clasificación de cuentas por nivel estratégico.
 * Define ARR threshold y nivel de servicio esperado.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export enum AccountTier {
  STRATEGIC = 'STRATEGIC',
  ENTERPRISE = 'ENTERPRISE',
  COMMERCIAL = 'COMMERCIAL',
  SMB = 'SMB',
}

export const ACCOUNT_TIER_CONFIG: Record<AccountTier, {
  label: string;
  descripcion: string;
  arrMinimo: number;
  arrMaximo: number | null;
  serviceLevel: string;
  maxAccountsPerKAM: number;
  requiereAccountPlan: boolean;
  requiereQBR: boolean;
  frecuenciaReview: string;
}> = {
  [AccountTier.STRATEGIC]: {
    label: 'Strategic',
    descripcion: 'Cuentas de alto impacto estratégico para la organización',
    arrMinimo: 500000,
    arrMaximo: null,
    serviceLevel: 'WHITE_GLOVE',
    maxAccountsPerKAM: 5,
    requiereAccountPlan: true,
    requiereQBR: true,
    frecuenciaReview: 'MENSUAL',
  },
  [AccountTier.ENTERPRISE]: {
    label: 'Enterprise',
    descripcion: 'Cuentas enterprise con alto potencial de crecimiento',
    arrMinimo: 100000,
    arrMaximo: 500000,
    serviceLevel: 'PREMIUM',
    maxAccountsPerKAM: 10,
    requiereAccountPlan: true,
    requiereQBR: true,
    frecuenciaReview: 'TRIMESTRAL',
  },
  [AccountTier.COMMERCIAL]: {
    label: 'Commercial',
    descripcion: 'Cuentas mid-market con modelo de venta consultiva',
    arrMinimo: 25000,
    arrMaximo: 100000,
    serviceLevel: 'STANDARD',
    maxAccountsPerKAM: 25,
    requiereAccountPlan: false,
    requiereQBR: false,
    frecuenciaReview: 'SEMESTRAL',
  },
  [AccountTier.SMB]: {
    label: 'SMB',
    descripcion: 'Cuentas pequeñas con modelo self-service o inside sales',
    arrMinimo: 0,
    arrMaximo: 25000,
    serviceLevel: 'SELF_SERVICE',
    maxAccountsPerKAM: 50,
    requiereAccountPlan: false,
    requiereQBR: false,
    frecuenciaReview: 'ANUAL',
  },
};

export function determinarTier(arr: number): AccountTier {
  if (arr >= 500000) return AccountTier.STRATEGIC;
  if (arr >= 100000) return AccountTier.ENTERPRISE;
  if (arr >= 25000) return AccountTier.COMMERCIAL;
  return AccountTier.SMB;
}
