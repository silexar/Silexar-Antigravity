/**
 * SERVICE: VALIDADOR DE ANUNCIANTES - TIER 0
 *
 * Servicio para validar la existencia de anunciantes antes de crear o actualizar cuñas.
 * Implementa la conexión entre el módulo de Cuñas y el módulo de Anunciantes.
 */

export interface IAnuncianteService {
  /**
   * Verifica si un anunciante existe por su ID
   */
  existeAnunciante(anuncianteId: string): Promise<boolean>;
  
  /**
   * Obtiene información básica de un anunciante por su ID
   */
  obtenerAnunciante(anuncianteId: string): Promise<{
    id: string;
    nombre: string;
    estado: string;
    fechaCreacion: Date;
  } | null>;
}

export class AnuncianteValidatorService {
  constructor(private anuncianteService: IAnuncianteService) {}

  /**
   * Valida que un anunciante exista antes de crear o actualizar una cuña
   */
  async validarAnunciante(anuncianteId: string): Promise<boolean> {
    if (!anuncianteId) {
      throw new Error('El ID del anunciante es obligatorio');
    }

    const existe = await this.anuncianteService.existeAnunciante(anuncianteId);
    
    if (!existe) {
      throw new Error(`El anunciante con ID ${anuncianteId} no existe en el sistema`);
    }

    return true;
  }

  /**
   * Obtiene información del anunciante para usar en la creación de cuñas
   */
  async obtenerInfoAnunciante(anuncianteId: string): Promise<{
    id: string;
    nombre: string;
    estado: string;
    fechaCreacion: Date;
  }> {
    if (!anuncianteId) {
      throw new Error('El ID del anunciante es obligatorio');
    }

    const anunciante = await this.anuncianteService.obtenerAnunciante(anuncianteId);
    
    if (!anunciante) {
      throw new Error(`No se pudo obtener la información del anunciante con ID ${anuncianteId}`);
    }

    return anunciante;
  }
}