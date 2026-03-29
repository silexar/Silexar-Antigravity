/**
 * GetCampanaQuery — Read-only operations for campaigns
 */

import type { EstadoCampanaValue } from '../../domain/value-objects/EstadoCampana';

export interface GetCampanaByIdQuery {
  campanaId: string;
  tenantId: string;
}

export interface ListCampanasQuery {
  tenantId: string;
  estado?: EstadoCampanaValue;
  anuncianteId?: string;
  contratoId?: string;
  fechaInicioDesde?: Date;
  fechaFinHasta?: Date;
  busqueda?: string;
  pagina: number;
  tamanoPagina: number;
}

export interface GetCampanasProximasAVencerQuery {
  tenantId: string;
  diasUmbral?: number;
}

export interface GetConteoEstadosQuery {
  tenantId: string;
}
