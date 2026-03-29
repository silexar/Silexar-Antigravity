import { Result, ResultError } from '../../../../core/domain/Result';
import { ITipoPropiedadRepository, IValorPropiedadRepository } from '../../domain/repositories/IRepositories';

type PropiedadPayload = { tipoCodigo: string, valorCodigoRef: string };

type ValidacionError = ResultError & { 
  propiedadesConflictivas?: string[] 
};

/**
 * Servicio de Dominio TIER 0: 
 * Encargado de aplicar reglas complejas que involucran a múltiples propiedades a la vez.
 * Usado por el Shared Kernel para responder a los módulos de Contratos y Campañas.
 */
export class ServicioDeValidacionCruzada {
  constructor(
    private tipoRepo: ITipoPropiedadRepository,
    private valorRepo: IValorPropiedadRepository
  ) {}

  /**
   * Verifica si un conjunto de propiedades seleccionadas (ej. para un contrato) 
   * son mutuamente coherentes entre sí y cumplen las reglas de negocio globales.
   */
  async validarCoherenciaSeleccion(
    propiedadesSeleccionadas: PropiedadPayload[]
  ): Promise<Result<boolean, ValidacionError>> {
    
    // 1. Regla: Restricciones Política vs Canje (Ejemplo de negocio)
    // Si la selección tiene Política, NO puede tener Canje.
    const tienePolitica = propiedadesSeleccionadas.some(p => p.valorCodigoRef === 'POLITICA');
    const tieneCanje = propiedadesSeleccionadas.some(p => p.valorCodigoRef === 'CANJE');

    if (tienePolitica && tieneCanje) {
      return Result.fail({
        code: 'CONFLICTO_MUTUAMENTE_EXCLUYENTE',
        message: 'No se puede combinar una propiedad de Política con una de Canje en la misma operación.',
        propiedadesConflictivas: ['POLITICA', 'CANJE']
      });
    }

    // 2. Aquí se pueden agregar más reglas complejas como:
    // - Límite de Jerarquías.
    // - Validaciones de configuración contable nula.
    // - Combinaciones prohibidas para facturación.

    return Result.ok(true);
  }
}
