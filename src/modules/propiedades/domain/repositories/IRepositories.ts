import { TipoPropiedad } from '../entities/TipoPropiedad';
import { ValorPropiedad } from '../entities/ValorPropiedad';
import { EstadoPropiedad, TipoClasificacion } from '../value-objects/TiposBase';

export interface FiltrosBusquedaTipos {
  estado?: EstadoPropiedad;
  busqueda?: string;
  aplicacion?: TipoClasificacion;
}

export interface ITipoPropiedadRepository {
  findById(id: string): Promise<TipoPropiedad | null>;
  findByCodigo(codigo: string): Promise<TipoPropiedad | null>;
  findAll(filtros?: FiltrosBusquedaTipos): Promise<TipoPropiedad[]>;
  save(tipoPropiedad: TipoPropiedad): Promise<void>;
  update(tipoPropiedad: TipoPropiedad): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface FiltrosValoresPropiedad {
  estado?: EstadoPropiedad;
  busqueda?: string;
  tipoPropiedadId?: string;
}

export interface IValorPropiedadRepository {
  findById(id: string): Promise<ValorPropiedad | null>;
  findByTipoAndCodigoRef(tipoPropiedadId: string, codigoRef: string): Promise<ValorPropiedad | null>;
  findByTipoPropiedadId(tipoPropiedadId: string, filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]>;
  findAll(filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]>;
  save(valorPropiedad: ValorPropiedad): Promise<void>;
  update(valorPropiedad: ValorPropiedad): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByTipoPropiedadId(tipoPropiedadId: string): Promise<void>;
}
