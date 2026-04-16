import { AnuncianteEstado } from '../../domain/entities/Anunciante';

export interface BuscarAnunciantesQueryInput {
  tenantId: string;
  search?: string;
  estado?: AnuncianteEstado;
  activo?: boolean;
  page: number;
  limit: number;
}

export class BuscarAnunciantesQuery {
  constructor(public readonly input: BuscarAnunciantesQueryInput) {}
}
