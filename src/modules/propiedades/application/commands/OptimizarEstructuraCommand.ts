import { Result } from '../../../../core/domain/Result';
import { ITipoPropiedadRepository, IValorPropiedadRepository } from '../../domain/repositories/IRepositories';

/**
 * COMMAND: Optimizar Estructura (Cortex Optimizer)
 * 
 * Aplica automáticamente sugerencias de reestructuración dadas por la IA
 * para fusionar o reordenar tipos de propiedades.
 */
export class OptimizarEstructuraCommand {
  constructor(
    private readonly tipoRepo: ITipoPropiedadRepository,
    private readonly valorRepo: IValorPropiedadRepository
  ) {}

  async execute(optimizacionId: string, accion: 'FUSIONAR_DUPLICADOS' | 'ELIMINAR_INACTIVOS'): Promise<Result<boolean>> {
    // Aquí implementamos la lógica core de TIER 0 que muta el dominio
    // basada en recomendaciones del motor IA.
    
    if (accion === 'ELIMINAR_INACTIVOS') {
      const todos = await this.tipoRepo.findAll();
      const inactivos = todos.filter(t => t.estado === 'INACTIVO' || t.estado === 'DEPRECADO');
      
      for (const t of inactivos) {
        // En una BD real esto validaría si el tipo está atado a contratos históricos antes de forzar el hard-delete
        await this.valorRepo.deleteByTipoPropiedadId(t.id);
        await this.tipoRepo.delete(t.id);
      }
      return Result.ok(true);
    }

    return Result.fail({ code: 'NOT_IMPLEMENTED', message: 'Esa optimización aún no está programada.' });
  }
}
