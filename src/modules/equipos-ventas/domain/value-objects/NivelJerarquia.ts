/**
 * VALUE OBJECT NIVEL JERARQUÍA - TIER 0 ENTERPRISE
 * 
 * @description Define los niveles jerárquicos dentro de la estructura comercial
 * para control de acceso, reporting y compensación.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export enum NivelJerarquia {
  VP_SALES = 'VP_SALES',
  DIRECTOR = 'DIRECTOR',
  REGIONAL_MANAGER = 'REGIONAL_MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  SENIOR_AE = 'SENIOR_AE',
  ACCOUNT_EXECUTIVE = 'ACCOUNT_EXECUTIVE',
  SDR_BDR = 'SDR_BDR',
  JUNIOR_REP = 'JUNIOR_REP'
}

export const NivelJerarquiaRanking: Record<NivelJerarquia, number> = {
  [NivelJerarquia.VP_SALES]: 100,
  [NivelJerarquia.DIRECTOR]: 90,
  [NivelJerarquia.REGIONAL_MANAGER]: 80,
  [NivelJerarquia.TEAM_LEAD]: 70,
  [NivelJerarquia.SENIOR_AE]: 60,
  [NivelJerarquia.ACCOUNT_EXECUTIVE]: 50,
  [NivelJerarquia.SDR_BDR]: 40,
  [NivelJerarquia.JUNIOR_REP]: 30
};

export const NivelJerarquiaLabels: Record<NivelJerarquia, string> = {
  [NivelJerarquia.VP_SALES]: 'VP de Ventas',
  [NivelJerarquia.DIRECTOR]: 'Director Comercial',
  [NivelJerarquia.REGIONAL_MANAGER]: 'Gerente Regional',
  [NivelJerarquia.TEAM_LEAD]: 'Líder de Equipo',
  [NivelJerarquia.SENIOR_AE]: 'Ejecutivo Senior',
  [NivelJerarquia.ACCOUNT_EXECUTIVE]: 'Ejecutivo de Cuentas',
  [NivelJerarquia.SDR_BDR]: 'Desarrollo de Negocios (SDR/BDR)',
  [NivelJerarquia.JUNIOR_REP]: 'Representante Junior'
};
