import { TipoPropiedad } from '../../domain/entities/TipoPropiedad';
import { ValorPropiedad } from '../../domain/entities/ValorPropiedad';
import { 
  ITipoPropiedadRepository, 
  IValorPropiedadRepository,
  FiltrosBusquedaTipos,
  FiltrosValoresPropiedad
} from '../../domain/repositories/IRepositories';

// Estado global para persistencia en entorno de desarrollo (Mock)
// En un entorno de producción, esto será reemplazado por la implementación de Prisma o Drizzle
const globalState = global as unknown as {
  _propiedadesTipos: TipoPropiedad[];
  _propiedadesValores: ValorPropiedad[];
};

if (!globalState._propiedadesTipos) {
  globalState._propiedadesTipos = [];
}
if (!globalState._propiedadesValores) {
  globalState._propiedadesValores = [];
}

export class MockTipoPropiedadRepository implements ITipoPropiedadRepository {
  async findById(id: string): Promise<TipoPropiedad | null> {
    return globalState._propiedadesTipos.find(t => t.id === id) || null;
  }
  async findByCodigo(codigo: string): Promise<TipoPropiedad | null> {
    return globalState._propiedadesTipos.find(t => t.codigo === codigo) || null;
  }
  async findAll(filtros?: FiltrosBusquedaTipos): Promise<TipoPropiedad[]> {
    let result = [...globalState._propiedadesTipos];
    if (filtros?.estado) {
      result = result.filter(t => t.estado === filtros.estado);
    }
    if (filtros?.busqueda) {
      const b = filtros.busqueda.toLowerCase();
      result = result.filter(t => t.nombre.toLowerCase().includes(b) || t.codigo.toLowerCase().includes(b));
    }
    if (filtros?.aplicacion) {
      result = result.filter(t => t.aplicacion.includes(filtros.aplicacion!));
    }
    return result;
  }
  async save(tipoPropiedad: TipoPropiedad): Promise<void> {
    globalState._propiedadesTipos.push(tipoPropiedad);
  }
  async update(tipoPropiedad: TipoPropiedad): Promise<void> {
    const index = globalState._propiedadesTipos.findIndex(t => t.id === tipoPropiedad.id);
    if (index !== -1) {
      globalState._propiedadesTipos[index] = tipoPropiedad;
    }
  }
  async delete(id: string): Promise<void> {
    globalState._propiedadesTipos = globalState._propiedadesTipos.filter(t => t.id !== id);
  }
}

export class MockValorPropiedadRepository implements IValorPropiedadRepository {
  async findById(id: string): Promise<ValorPropiedad | null> {
    return globalState._propiedadesValores.find(v => v.id === id) || null;
  }
  async findByTipoAndCodigoRef(tipoPropiedadId: string, codigoRef: string): Promise<ValorPropiedad | null> {
    return globalState._propiedadesValores.find(v => v.tipoPropiedadId === tipoPropiedadId && v.codigoRef === codigoRef) || null;
  }
  async findByTipoPropiedadId(tipoPropiedadId: string, filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]> {
    let result = globalState._propiedadesValores.filter(v => v.tipoPropiedadId === tipoPropiedadId);
    if (filtros?.estado) {
      result = result.filter(v => v.estado === filtros.estado);
    }
    if (filtros?.busqueda) {
      const b = filtros.busqueda.toLowerCase();
      result = result.filter(v => v.descripcion.toLowerCase().includes(b) || v.codigoRef.toLowerCase().includes(b));
    }
    return result;
  }
  async findAll(filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]> {
    let result = [...globalState._propiedadesValores];
    if (filtros?.tipoPropiedadId) {
      result = result.filter(v => v.tipoPropiedadId === filtros.tipoPropiedadId);
    }
    if (filtros?.estado) {
      result = result.filter(v => v.estado === filtros.estado);
    }
    return result;
  }
  async save(valorPropiedad: ValorPropiedad): Promise<void> {
    globalState._propiedadesValores.push(valorPropiedad);
  }
  async update(valorPropiedad: ValorPropiedad): Promise<void> {
    const index = globalState._propiedadesValores.findIndex(v => v.id === valorPropiedad.id);
    if (index !== -1) {
      globalState._propiedadesValores[index] = valorPropiedad;
    }
  }
  async delete(id: string): Promise<void> {
    globalState._propiedadesValores = globalState._propiedadesValores.filter(v => v.id !== id);
  }
  async deleteByTipoPropiedadId(tipoPropiedadId: string): Promise<void> {
    globalState._propiedadesValores = globalState._propiedadesValores.filter(v => v.tipoPropiedadId !== tipoPropiedadId);
  }
}
