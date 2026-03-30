'use server';

// Server Actions para interactuar con la Capa de Aplicación desde la UI TIER 0
import { CrearTipoPropiedadCommand } from '../../application/commands/CrearTipoPropiedadCommand';
import { ObtenerTiposPropiedadQuery } from '../../application/queries/ObtenerTiposPropiedadQuery';
import { MockTipoPropiedadRepository, MockValorPropiedadRepository } from '../repositories/MockPropiedadRepository';
import { CrearTipoPropiedadProps } from '../../domain/entities/TipoPropiedad';
import { CodigoPropiedad, TipoClasificacion, TipoValidacion } from '../../domain/value-objects/TiposBase';

const tipoRepo = new MockTipoPropiedadRepository();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _valorRepo = new MockValorPropiedadRepository();

// Tipo serializable plano para que Next.js pueda pasarlo por el cable al Frontend
export type TipoPropiedadDto = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  aplicacion: TipoClasificacion[];
  configuracionValidacion: Record<string, unknown>;
  tipoValidacion: string;
  creadoEn: Date;
};

export async function crearTipoPropiedadAction(codigo: CodigoPropiedad, props: CrearTipoPropiedadProps) {
  try {
    const command = new CrearTipoPropiedadCommand(tipoRepo);
    const entidad = await command.execute(codigo, props);
    return { success: true, id: entidad.id };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function obtenerTiposPropiedadAction(): Promise<TipoPropiedadDto[]> {
  const query = new ObtenerTiposPropiedadQuery(tipoRepo);
  const resultados = await query.execute();
  return resultados.map(r => ({
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion,
    aplicacion: r.aplicacion,
    estado: r.estado,
    configuracionValidacion: r.configuracionValidacion,
    tipoValidacion: r.tipoValidacion,
    creadoEn: r.creadoEn,
  }));
}

export async function inicializarDatosDemo() {
  const tipos = await tipoRepo.findAll();
  if (tipos.length === 0) {
    const cmd = new CrearTipoPropiedadCommand(tipoRepo);
    await cmd.execute('PROP-2025-00123' as CodigoPropiedad, {
      nombre: 'Tipo Pedido Campaña',
      descripcion: 'Clasificación de tipos de campaña publicitaria',
      aplicacion: [TipoClasificacion.CAMPANA, TipoClasificacion.CONTRATO],
      tipoValidacion: TipoValidacion.LISTA_UNICA
    });
    
    await cmd.execute('PROP-2025-00124' as CodigoPropiedad, {
      nombre: 'Industria',
      descripcion: 'Sector industrial del anunciante',
      aplicacion: [TipoClasificacion.CLIENTE],
      tipoValidacion: TipoValidacion.LISTA_UNICA
    });
  }
  return { success: true };
}
