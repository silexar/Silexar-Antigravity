/**
 * VALUE OBJECT NIVEL DESCUENTO - TIER 0 ENTERPRISE
 * 
 * @description Define los niveles de autorización para aplicar descuentos
 * sobre la Rate Card.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NivelJerarquia } from './NivelJerarquia';

export interface PoliticaDescuento {
  maximoAutorizado: number; // Porcentaje máximo (0-100)
  requiereAprobacion: boolean; // Si excéde, requiere aprobación superior
  nivelAprobador?: NivelJerarquia;
}

export const PoliticasDescuentoPorRol: Record<NivelJerarquia, PoliticaDescuento> = {
  [NivelJerarquia.VP_SALES]: { maximoAutorizado: 100, requiereAprobacion: false }, // Sin límite
  [NivelJerarquia.DIRECTOR]: { maximoAutorizado: 35, requiereAprobacion: true, nivelAprobador: NivelJerarquia.VP_SALES },
  [NivelJerarquia.REGIONAL_MANAGER]: { maximoAutorizado: 25, requiereAprobacion: true, nivelAprobador: NivelJerarquia.DIRECTOR },
  [NivelJerarquia.TEAM_LEAD]: { maximoAutorizado: 15, requiereAprobacion: true, nivelAprobador: NivelJerarquia.REGIONAL_MANAGER },
  [NivelJerarquia.SENIOR_AE]: { maximoAutorizado: 10, requiereAprobacion: true, nivelAprobador: NivelJerarquia.TEAM_LEAD },
  [NivelJerarquia.ACCOUNT_EXECUTIVE]: { maximoAutorizado: 5, requiereAprobacion: true, nivelAprobador: NivelJerarquia.TEAM_LEAD },
  [NivelJerarquia.SDR_BDR]: { maximoAutorizado: 0, requiereAprobacion: true, nivelAprobador: NivelJerarquia.TEAM_LEAD },
  [NivelJerarquia.JUNIOR_REP]: { maximoAutorizado: 0, requiereAprobacion: true, nivelAprobador: NivelJerarquia.TEAM_LEAD }
};
