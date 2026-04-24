/**
 * CONTROLLER: CUÑA - EJEMPLO DE IMPLEMENTACIÓN
 * 
 * Ejemplo de cómo usar las entidades y servicios del módulo Cuñas
 * en una capa de presentación/controladores.
 */

import { Cuna } from '../../domain/entities/Cuna';
import { Mencion } from '../../domain/entities/Mencion';
import { Presentacion } from '../../domain/entities/Presentacion';
import { Cierre } from '../../domain/entities/Cierre';
import { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import { CrearCunaCommand } from '../../application/commands/CrearCunaCommand';
import { CrearCunaHandler } from '../../application/handlers/CrearCunaHandler';
import { Result } from '@/modules/shared/domain/Result';

export interface ICunaController {
  crearCuna(datos: any): Promise<Result<Cuna, string>>;
  obtenerCunaPorId(id: string): Promise<Cuna | null>;
  crearMencion(datos: any): Promise<Result<Mencion, string>>;
  crearPresentacion(datos: any): Promise<Result<Presentacion, string>>;
  crearCierre(datos: any): Promise<Result<Cierre, string>>;
}

export class CunaController implements ICunaController {
  constructor(
    private readonly cunaRepository: ICunaRepository,
    private readonly crearCunaHandler: CrearCunaHandler
  ) {}

  async crearCuna(datos: any): Promise<Result<Cuna, string>> {
    // Validar datos de entrada
    const validation = this.validateCrearCuna(datos);
    if (!validation.isValid) {
      return Result.fail(validation.errors.join(', '));
    }

    // Crear el command
    const command = new CrearCunaCommand({
      tenantId: datos.tenantId,
      nombre: datos.nombre,
      tipo: datos.tipo,
      anuncianteId: datos.anuncianteId,
      campanaId: datos.campanaId,
      contratoId: datos.contratoId,
      productoNombre: datos.productoNombre,
      descripcion: datos.descripcion,
      pathAudio: datos.pathAudio,
      duracionSegundos: datos.duracionSegundos,
      duracionMilisegundos: datos.duracionMilisegundos,
      formatoAudio: datos.formatoAudio,
      bitrate: datos.bitrate,
      sampleRate: datos.sampleRate,
      tamanoBytes: datos.tamanoBytes,
      fechaInicioVigencia: datos.fechaInicioVigencia,
      fechaFinVigencia: datos.fechaFinVigencia,
      urgencia: datos.urgencia,
      notas: datos.notas,
      subidoPorId: datos.usuarioId,
    });

    // Ejecutar el handler
    return await this.crearCunaHandler.execute(command);
  }

  async crearMencion(datos: any): Promise<Result<Mencion, string>> {
    try {
      const mencion = Mencion.create({
        tenantId: datos.tenantId,
        codigo: datos.codigo,
        nombre: datos.nombre,
        anuncianteId: datos.anuncianteId,
        contenidoTexto: datos.contenidoTexto,
        duracionEstimadaSegundos: datos.duracionEstimadaSegundos || 0,
        necesitaConversionAudio: datos.necesitaConversionAudio || false,
        variablesPermitidas: datos.variablesPermitidas || [],
        palabrasClave: datos.palabrasClave || [],
        descripcion: datos.descripcion || null,
        campanaId: datos.campanaId || null,
        contratoId: datos.contratoId || null,
        productoNombre: datos.productoNombre || null,
        fechaInicioVigencia: datos.fechaInicioVigencia || null,
        fechaFinVigencia: datos.fechaFinVigencia || null,
        subidoPorId: datos.usuarioId,
      });

      // Aquí iría la lógica para guardar la mención
      // await this.mencionRepository.save(mencion);

      return Result.ok(mencion);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al crear la mención';
      return Result.fail(errorMsg);
    }
  }

  async crearPresentacion(datos: any): Promise<Result<Presentacion, string>> {
    try {
      const presentacion = Presentacion.create({
        tenantId: datos.tenantId,
        codigo: datos.codigo,
        nombre: datos.nombre,
        anuncianteId: datos.anuncianteId,
        contenidoTexto: datos.contenidoTexto,
        programaRelacionado: datos.programaRelacionado,
        tipoPresentacion: datos.tipoPresentacion || 'entrada',
        duracionEstimadaSegundos: datos.duracionEstimadaSegundos || 0,
        necesitaConversionAudio: datos.necesitaConversionAudio || false,
        necesitaValidacionVencimientos: datos.necesitaValidacionVencimientos || true,
        variablesPermitidas: datos.variablesPermitidas || [],
        palabrasClave: datos.palabrasClave || [],
        descripcion: datos.descripcion || null,
        campanaId: datos.campanaId || null,
        contratoId: datos.contratoId || null,
        productoNombre: datos.productoNombre || null,
        fechaInicioVigencia: datos.fechaInicioVigencia || null,
        fechaFinVigencia: datos.fechaFinVigencia || null,
        subidoPorId: datos.usuarioId,
      });

      // Aquí iría la lógica para guardar la presentación
      // await this.presentacionRepository.save(presentacion);

      return Result.ok(presentacion);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al crear la presentación';
      return Result.fail(errorMsg);
    }
  }

  async crearCierre(datos: any): Promise<Result<Cierre, string>> {
    try {
      const cierre = Cierre.create({
        tenantId: datos.tenantId,
        codigo: datos.codigo,
        nombre: datos.nombre,
        anuncianteId: datos.anuncianteId,
        contenidoTexto: datos.contenidoTexto,
        programaRelacionado: datos.programaRelacionado,
        tipoCierre: datos.tipoCierre || 'salida',
        duracionEstimadaSegundos: datos.duracionEstimadaSegundos || 0,
        necesitaConversionAudio: datos.necesitaConversionAudio || false,
        necesitaValidacionPresentacion: datos.necesitaValidacionPresentacion || true,
        variablesPermitidas: datos.variablesPermitidas || [],
        palabrasClave: datos.palabrasClave || [],
        descripcion: datos.descripcion || null,
        campanaId: datos.campanaId || null,
        contratoId: datos.contratoId || null,
        productoNombre: datos.productoNombre || null,
        fechaInicioVigencia: datos.fechaInicioVigencia || null,
        fechaFinVigencia: datos.fechaFinVigencia || null,
        subidoPorId: datos.usuarioId,
      });

      // Aquí iría la lógica para guardar el cierre
      // await this.cierreRepository.save(cierre);

      return Result.ok(cierre);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al crear el cierre';
      return Result.fail(errorMsg);
    }
  }

  async obtenerCunaPorId(id: string): Promise<Cuna | null> {
    // Aquí iría la lógica para obtener la cuña por ID
    // return await this.cunaRepository.findById(id, tenantId);
    return null; // Placeholder
  }

  private validateCrearCuna(datos: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!datos.tenantId) errors.push('Tenant ID es requerido');
    if (!datos.nombre || datos.nombre.trim().length < 3) errors.push('Nombre es requerido (mínimo 3 caracteres)');
    if (!datos.tipo) errors.push('Tipo de cuña es requerido');
    if (!datos.anuncianteId) errors.push('Anunciante ID es requerido');
    if (!datos.pathAudio) errors.push('Ruta del audio es requerida');
    if (datos.duracionSegundos === undefined || datos.duracionSegundos < 0) errors.push('Duración en segundos es requerida y debe ser positiva');
    if (!datos.usuarioId) errors.push('Usuario ID es requerido');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}