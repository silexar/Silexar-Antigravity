import { Result } from '../../../../core/domain/Result';
import { ITipoPropiedadRepository } from '../../domain/repositories/IRepositories';
import { EstadoPropiedad } from '../../domain/value-objects/TiposBase';

/**
 * COMMAND: Sincronizar Sistemas Periféricos
 * 
 * Invoca la serialización de la estructura de taxonomías de Propiedades
 * hacia sistemas externos que dependen de estas clasificaciones (Ej: ERP SAP, Salesforce).
 */
export class SincronizarSistemasCommand {
  constructor(
    private readonly tipoRepo: ITipoPropiedadRepository,
    // future: private readonly integracionExternaService: IIntegracionSistemasService
  ) {}

  async execute(sistemaObjetivo: 'ERP_CONTABLE' | 'CRM_VENTAS' | 'TODOS'): Promise<Result<boolean>> {
    try {
      // 1. Obtener la jerarquía actual activa (verify connectivity)
      await this.tipoRepo.findAll({ estado: EstadoPropiedad.ACTIVO });
      
      // 2. Aquí iría la lógica de mapeo y envío, por ejemplo:
      // await this.integracionExternaService.enviarTaxonomia(sistemaObjetivo, _tiposActivos);
      
      // Simulamos la latencia de red para demostrar el concepto
      await new Promise(resolve => setTimeout(resolve, 800));

      return Result.ok(true);
    } catch (error: unknown) {
      return Result.fail({ 
        code: 'SYNC_ERROR', 
        message: `Falló la sincronización con ${sistemaObjetivo}: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }
}
