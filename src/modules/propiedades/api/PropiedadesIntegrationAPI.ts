import { ServicioDeValidacionCruzada } from '../domain/services/ServicioDeValidacionCruzada';
import { ITipoPropiedadRepository, IValorPropiedadRepository } from '../domain/repositories/IRepositories';
import { Result } from '../../../core/domain/Result';

/**
 * SHARED KERNEL / FACADE TIER 0
 * -------------------------------------------------------------
 * Único punto de entrada autorizado para otros módulos (Contratos, Campañas, Reportes).
 * Protege la integridad del Módulo de Propiedades de acoplamientos indeseados.
 * NINGÚN módulo externo debe importar Entidades, Repositorios o Commands/Queries directamente.
 */
export class PropiedadesIntegrationAPI {
  private readonly validatorService: ServicioDeValidacionCruzada;
  
  constructor(
    private readonly tipoRepo: ITipoPropiedadRepository,
    private readonly valorRepo: IValorPropiedadRepository
  ) {
    this.validatorService = new ServicioDeValidacionCruzada(this.tipoRepo, this.valorRepo);
  }

  /**
   * 1. VALIDACIÓN CRUZADA:
   * Permite al Módulo de Contratos verificar la coherencia de las propiedades
   * antes de intentar crear un contrato o campaña comercial.
   */
  async validarCoherenciaPropiedades(
    selecciones: Array<{ tipoCodigo: string, valorCodigoRef: string }>
  ) {
    return await this.validatorService.validarCoherenciaSeleccion(selecciones);
  }

  /**
   * 2. SNAPSHOT INMUTABLE:
   * Permite al Módulo de Facturación o Reportes obtener una instantánea en el tiempo
   * de cómo estaba configurado un valor de propiedad, protegiéndolo de cambios futuros.
   */
  async generarSnapshotPropiedad(
    tipoPropiedadId: string, 
    valorId: string
  ): Promise<Result<{
    nombreTipo: string;
    descripcionValor: string;
    configuracionContableAsignada: {
       cuentaIngresos: string | null;
       cuentaCostos: string | null;
    } | null;
    timestamp: Date;
  }>> {
    
    const valor = await this.valorRepo.findById(valorId);
    if (!valor) return Result.fail({ code: 'NOT_FOUND', message: 'Valor de propiedad no encontrado.' });
    
    // Solo le entregamos una proyección plana e inmutable a los externos
    const snapshot = {
      nombreTipo: tipoPropiedadId, // Simulado, se buscaría con tipoRepo
      descripcionValor: valor.descripcion,
      configuracionContableAsignada: valor.configuracionContable ? {
         cuentaIngresos: valor.configuracionContable.cuentaIngresos,
         cuentaCostos: valor.configuracionContable.cuentaCostos
      } : null,
      timestamp: new Date() // El segundo exacto de la firma
    };

    return Result.ok(snapshot);
  }
}
