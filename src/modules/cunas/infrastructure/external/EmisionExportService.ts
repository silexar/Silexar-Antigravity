/**
 * SERVICE: EMISIÓN EXPORT - TIER 0
 *
 * Servicio para exportar cuñas a sistemas de emisión como WideOrbit, Sara y Dalet.
 * Implementa la integración con sistemas de aire para la distribución automática de contenido.
 */

import { Cuna } from '../../domain/entities/Cuna';
import { Mencion } from '../../domain/entities/Mencion';
import { Presentacion } from '../../domain/entities/Presentacion';
import { Cierre } from '../../domain/entities/Cierre';

export interface IEmisionExportService {
  exportarACuña(cuna: Cuna, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean>;
  exportarAMencion(mencion: Mencion, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean>;
  exportarAPresentacion(presentacion: Presentacion, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean>;
  exportarACierre(cierre: Cierre, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean>;
  exportarPaqueteContenido(
    cunas: (Cuna | Mencion | Presentacion | Cierre)[], 
    sistema: 'wideorbit' | 'sara' | 'dalet'
  ): Promise<boolean>;
}

export class EmisionExportService implements IEmisionExportService {
  private readonly wideOrbitUrl: string;
  private readonly saraUrl: string;
  private readonly daletUrl: string;
  private readonly apiKey: string;

  constructor(wideOrbitUrl: string, saraUrl: string, daletUrl: string, apiKey: string) {
    this.wideOrbitUrl = wideOrbitUrl;
    this.saraUrl = saraUrl;
    this.daletUrl = daletUrl;
    this.apiKey = apiKey;
  }

  /**
   * Exporta una cuña a un sistema de emisión
   */
  async exportarACuña(cuna: Cuna, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean> {
    try {
      console.log(`Exportando cuña ${cuna.codigo} a ${sistema}...`);

      // Validar que la cuña esté en estado apropiado para emisión
      if (cuna.estado !== 'en_aire' && cuna.estado !== 'aprobada') {
        throw new Error(`La cuña ${cuna.codigo} no está en estado apto para emisión (${cuna.estado})`);
      }

      // Preparar datos para exportación
      const datosExportacion = {
        id: cuna.id,
        codigo: cuna.codigo,
        nombre: cuna.nombre,
        tipo: cuna.tipo,
        anunciante: cuna.anuncianteId,
        duracion: cuna.duracion ? cuna.duracion.getSegundos() : 0,
        pathAudio: cuna.pathAudio,
        fechaInicio: (cuna as any).props.fechaInicioVigencia || null, // Accediendo a la propiedad interna a través de props
        fechaFin: cuna.fechaFinVigencia,
        estado: cuna.estado,
        tenantId: cuna.tenantId,
        subidoPor: cuna.subidoPorId
      };

      // Enviar a sistema específico
      const resultado = await this.sendToSystem(datosExportacion, sistema);

      if (resultado) {
        console.log(`Cuña ${cuna.codigo} exportada exitosamente a ${sistema}`);
        return true;
      } else {
        throw new Error(`Error al exportar cuña ${cuna.codigo} a ${sistema}`);
      }
    } catch (error) {
      console.error(`Error al exportar cuña ${cuna.codigo} a ${sistema}:`, error);
      throw error;
    }
  }

  /**
   * Exporta una mención a un sistema de emisión
   */
  async exportarAMencion(mencion: Mencion, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean> {
    try {
      console.log(`Exportando mención ${mencion.codigo} a ${sistema}...`);

      // Validar que la mención esté en estado apropiado para emisión
      if (mencion.estado !== 'en_aire' && mencion.estado !== 'aprobada') {
        throw new Error(`La mención ${mencion.codigo} no está en estado apta para emisión (${mencion.estado})`);
      }

      // Verificar que tenga audio generado si es necesario
      if (mencion.necesitaConversionAudio && !mencion.audioGeneradoId) {
        throw new Error(`La mención ${mencion.codigo} no tiene audio generado`);
      }

      // Preparar datos para exportación
      const datosExportacion = {
        id: mencion.id,
        codigo: mencion.codigo,
        nombre: mencion.nombre,
        tipo: 'mencion',
        anunciante: mencion.anuncianteId,
        contenidoTexto: mencion.contenidoTexto,
        duracion: mencion.duracionEstimada.getSegundos(),
        audioId: mencion.audioGeneradoId,
        necesitaConversion: mencion.necesitaConversionAudio,
        variablesPermitidas: (mencion as any).props.variablesPermitidas || [], // Accediendo a la propiedad interna a través de props
        fechaInicio: (mencion as any).props.fechaInicioVigencia || null, // Accediendo a la propiedad interna a través de props
        fechaFin: mencion.fechaFinVigencia,
        estado: mencion.estado,
        tenantId: mencion.tenantId,
        subidoPor: mencion.subidoPorId
      };

      // Enviar a sistema específico
      const resultado = await this.sendToSystem(datosExportacion, sistema);

      if (resultado) {
        console.log(`Mención ${mencion.codigo} exportada exitosamente a ${sistema}`);
        return true;
      } else {
        throw new Error(`Error al exportar mención ${mencion.codigo} a ${sistema}`);
      }
    } catch (error) {
      console.error(`Error al exportar mención ${mencion.codigo} a ${sistema}:`, error);
      throw error;
    }
  }

  /**
   * Exporta una presentación a un sistema de emisión
   */
  async exportarAPresentacion(presentacion: Presentacion, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean> {
    try {
      console.log(`Exportando presentación ${presentacion.codigo} a ${sistema}...`);

      // Validar que la presentación esté en estado apropiado para emisión
      if (presentacion.estado !== 'en_aire' && presentacion.estado !== 'aprobada') {
        throw new Error(`La presentación ${presentacion.codigo} no está en estado apta para emisión (${presentacion.estado})`);
      }

      // Verificar que tenga audio generado si es necesario
      if (presentacion.necesitaConversionAudio && !presentacion.audioGeneradoId) {
        throw new Error(`La presentación ${presentacion.codigo} no tiene audio generado`);
      }

      // Verificar asociación con vencimientos si es necesario
      if (presentacion.necesitaValidacionVencimientos && !presentacion.vencimientosAsociadoId) {
        throw new Error(`La presentación ${presentacion.codigo} no está asociada a un vencimientos`);
      }

      // Preparar datos para exportación
      const datosExportacion = {
        id: presentacion.id,
        codigo: presentacion.codigo,
        nombre: presentacion.nombre,
        tipo: 'presentacion',
        anunciante: presentacion.anuncianteId,
        programaRelacionado: presentacion.programaRelacionado,
        tipoPresentacion: presentacion.tipoPresentacion,
        contenidoTexto: presentacion.contenidoTexto,
        duracion: presentacion.duracionEstimada.getSegundos(),
        audioId: presentacion.audioGeneradoId,
        necesitaConversion: presentacion.necesitaConversionAudio,
        vencimientosAsociadoId: presentacion.vencimientosAsociadoId,
        necesitaValidacionVencimientos: presentacion.necesitaValidacionVencimientos,
        variablesPermitidas: (presentacion as any).props.variablesPermitidas || [], // Accediendo a la propiedad interna a través de props
        fechaInicio: (presentacion as any).props.fechaInicioVigencia || null, // Accediendo a la propiedad interna a través de props
        fechaFin: presentacion.fechaFinVigencia,
        estado: presentacion.estado,
        tenantId: presentacion.tenantId,
        subidoPor: presentacion.subidoPorId
      };

      // Enviar a sistema específico
      const resultado = await this.sendToSystem(datosExportacion, sistema);

      if (resultado) {
        console.log(`Presentación ${presentacion.codigo} exportada exitosamente a ${sistema}`);
        return true;
      } else {
        throw new Error(`Error al exportar presentación ${presentacion.codigo} a ${sistema}`);
      }
    } catch (error) {
      console.error(`Error al exportar presentación ${presentacion.codigo} a ${sistema}:`, error);
      throw error;
    }
  }

  /**
   * Exporta un cierre a un sistema de emisión
   */
  async exportarACierre(cierre: Cierre, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean> {
    try {
      console.log(`Exportando cierre ${cierre.codigo} a ${sistema}...`);

      // Validar que el cierre esté en estado apropiado para emisión
      if (cierre.estado !== 'en_aire' && cierre.estado !== 'aprobada') {
        throw new Error(`El cierre ${cierre.codigo} no está en estado apto para emisión (${cierre.estado})`);
      }

      // Verificar que tenga audio generado si es necesario
      if (cierre.necesitaConversionAudio && !cierre.audioGeneradoId) {
        throw new Error(`El cierre ${cierre.codigo} no tiene audio generado`);
      }

      // Verificar asociación con presentación si es necesario
      if (cierre.necesitaValidacionPresentacion && !cierre.presentacionAsociadaId) {
        throw new Error(`El cierre ${cierre.codigo} no está asociado a una presentación`);
      }

      // Preparar datos para exportación
      const datosExportacion = {
        id: cierre.id,
        codigo: cierre.codigo,
        nombre: cierre.nombre,
        tipo: 'cierre',
        anunciante: cierre.anuncianteId,
        programaRelacionado: cierre.programaRelacionado,
        tipoCierre: cierre.tipoCierre,
        contenidoTexto: cierre.contenidoTexto,
        duracion: cierre.duracionEstimada.getSegundos(),
        audioId: cierre.audioGeneradoId,
        necesitaConversion: cierre.necesitaConversionAudio,
        presentacionAsociadaId: cierre.presentacionAsociadaId,
        necesitaValidacionPresentacion: cierre.necesitaValidacionPresentacion,
        variablesPermitidas: (cierre as any).props.variablesPermitidas || [], // Accediendo a la propiedad interna a través de props
        fechaInicio: (cierre as any).props.fechaInicioVigencia || null, // Accediendo a la propiedad interna a través de props
        fechaFin: cierre.fechaFinVigencia,
        estado: cierre.estado,
        tenantId: cierre.tenantId,
        subidoPor: cierre.subidoPorId
      };

      // Enviar a sistema específico
      const resultado = await this.sendToSystem(datosExportacion, sistema);

      if (resultado) {
        console.log(`Cierre ${cierre.codigo} exportado exitosamente a ${sistema}`);
        return true;
      } else {
        throw new Error(`Error al exportar cierre ${cierre.codigo} a ${sistema}`);
      }
    } catch (error) {
      console.error(`Error al exportar cierre ${cierre.codigo} a ${sistema}:`, error);
      throw error;
    }
  }

  /**
   * Exporta un paquete de contenido a un sistema de emisión
   */
  async exportarPaqueteContenido(
    contenidos: (Cuna | Mencion | Presentacion | Cierre)[],
    sistema: 'wideorbit' | 'sara' | 'dalet'
  ): Promise<boolean> {
    try {
      console.log(`Exportando paquete de ${contenidos.length} elementos a ${sistema}...`);

      // Validar que todos los contenidos estén en estado apto para emisión
      const contenidosNoAptos = contenidos.filter(c => {
        const estado = 'estado' in c ? c.estado : 'borrador';
        return estado !== 'en_aire' && estado !== 'aprobada';
      });

      if (contenidosNoAptos.length > 0) {
        throw new Error(`${contenidosNoAptos.length} elementos no están en estado apto para emisión`);
      }

      // Agrupar por tipo para procesamiento específico
      const cunas = contenidos.filter(c => c instanceof Cuna) as Cuna[];
      const menciones = contenidos.filter(c => c instanceof Mencion) as Mencion[];
      const presentaciones = contenidos.filter(c => c instanceof Presentacion) as Presentacion[];
      const cierres = contenidos.filter(c => c instanceof Cierre) as Cierre[];

      // Exportar cada tipo
      const resultados = await Promise.all([
        ...cunas.map(c => this.exportarACuña(c, sistema)),
        ...menciones.map(m => this.exportarAMencion(m, sistema)),
        ...presentaciones.map(p => this.exportarAPresentacion(p, sistema)),
        ...cierres.map(c => this.exportarACierre(c, sistema))
      ]);

      // Verificar que todas las exportaciones hayan sido exitosas
      const todasExitosas = resultados.every(resultado => resultado === true);

      if (todasExitosas) {
        console.log(`Paquete de ${contenidos.length} elementos exportado exitosamente a ${sistema}`);
        return true;
      } else {
        throw new Error(`Algunas exportaciones del paquete fallaron`);
      }
    } catch (error) {
      console.error(`Error al exportar paquete de contenido a ${sistema}:`, error);
      throw error;
    }
  }

  /**
   * Envía datos al sistema de emisión específico
   */
  private async sendToSystem(datos: any, sistema: 'wideorbit' | 'sara' | 'dalet'): Promise<boolean> {
    try {
      let url = '';
      switch (sistema) {
        case 'wideorbit':
          url = this.wideOrbitUrl;
          break;
        case 'sara':
          url = this.saraUrl;
          break;
        case 'dalet':
          url = this.daletUrl;
          break;
      }

      // Simular envío a API real
      console.log(`Enviando datos a ${sistema} en ${url}:`, JSON.stringify(datos, null, 2));

      // Aquí iría la lógica real para enviar a la API correspondiente
      // const response = await fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(datos)
      // });

      // Simular éxito
      return true;
    } catch (error) {
      console.error(`Error al enviar datos a ${sistema}:`, error);
      return false;
    }
  }
}