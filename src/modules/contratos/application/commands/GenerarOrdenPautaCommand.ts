/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Command: GenerarOrdenPautaCommand
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

import { SistemaEmision } from '../../domain/entities/OrdenPauta';

export interface MaterialCreativoProps {
  id: string;
  nombre: string;
  tipo: 'audio' | 'video' | 'imagen' | 'texto';
  duracion?: number; // en segundos
  formato: string;
  url: string;
  fechaCreacion: Date;
  aprobado: boolean;
  metadatos?: Record<string, unknown>;
}

export interface GenerarOrdenPautaCommandProps {
  contratoId: string;
  productosIds: string[];
  sistemasDestino: SistemaEmision[];
  fechaInicioDeseada?: Date;
  prioridad?: number;
  observaciones?: string;
  validarMaterialCreativo?: boolean;
  envioAutomatico?: boolean;
  usuarioSolicitante: string;
}

export class GenerarOrdenPautaCommand {
  constructor(public readonly props: GenerarOrdenPautaCommandProps) {}
}

export class GenerarOrdenPautaCommandHandler {
  private static readonly SISTEMAS_PRIORITARIOS = [
    SistemaEmision.WIDEORBIT,
    SistemaEmision.SARA,
    SistemaEmision.DALET
  ];

  private static readonly TIMEOUT_VALIDACION_MS = 30000;
  private static readonly MAX_REINTENTOS = 3;

  async handle(command: GenerarOrdenPautaCommand): Promise<{
    success: boolean;
    ordenesGeneradas: Array<{
      ordenId: string;
      sistema: SistemaEmision;
      estado: string;
      especificaciones: unknown[];
    }>;
    materialesValidados: MaterialCreativoProps[];
    errores: string[];
    advertencias: string[];
  }> {
    const resultado = {
      success: false,
      ordenesGeneradas: [] as unknown[],
      materialesValidados: [] as MaterialCreativoProps[],
      errores: [] as string[],
      advertencias: [] as string[]
    };

    try {
      // 1. Validar contrato y productos
      const datosContrato = await this.validarContratoYProductos(
        command.props.contratoId,
        command.props.productosIds
      );

      // 2. Validar material creativo si es requerido
      if (command.props.validarMaterialCreativo !== false) {
        resultado.materialesValidados = await this.validarMaterialCreativo(
          command.props.productosIds
        );
      }

      // 3. Generar especificaciones para cada producto
      const especificacionesPorProducto = await this.generarEspecificacionesPorProducto(
        command.props.productosIds,
        datosContrato
      );

      // 4. Crear órdenes para cada sistema de destino
      for (const sistema of command.props.sistemasDestino) {
        try {
          const orden = await this.crearOrdenParaSistema(
            sistema,
            especificacionesPorProducto,
            command.props,
            datosContrato
          );

          resultado.ordenesGeneradas.push(orden);

          // 5. Envío automático si está habilitado
          if (command.props.envioAutomatico !== false) {
            await this.enviarOrdenAutomaticamente(orden.ordenId, sistema);
          }

        } catch (error) {
          const errorMsg = `Error generando orden para ${sistema}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          resultado.errores.push(errorMsg);
        }
      }

      // 6. Validar que al menos una orden se generó exitosamente
      resultado.success = resultado.ordenesGeneradas.length > 0;

      // 7. Generar advertencias si es necesario
      if (resultado.ordenesGeneradas.length < command.props.sistemasDestino.length) {
        resultado.advertencias.push('No se pudieron generar órdenes para todos los sistemas solicitados');
      }

      return resultado;

    } catch (error) {
      resultado.errores.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return resultado;
    }
  }

  private async validarContratoYProductos(
    contratoId: string,
    productosIds: string[]
  ): Promise<unknown> {
    // Simular validación de contrato
    const contrato = await this.obtenerContrato(contratoId);
    
    if (!contrato) {
      throw new Error('Contrato no encontrado');
    }

    if (contrato.estado !== 'aprobado') {
      throw new Error('El contrato debe estar aprobado para generar órdenes de pauta');
    }

    // Validar productos
    const productos = await this.obtenerProductos(productosIds);
    
    if (productos.length !== productosIds.length) {
      throw new Error('Algunos productos no fueron encontrados');
    }

    // Validar que los productos pertenezcan al contrato
    const productosDelContrato = productos.filter(p => p.contratoId === contratoId);
    if (productosDelContrato.length !== productos.length) {
      throw new Error('Todos los productos deben pertenecer al contrato especificado');
    }

    return {
      contrato,
      productos: productosDelContrato
    };
  }

  private async validarMaterialCreativo(productosIds: string[]): Promise<MaterialCreativoProps[]> {
    const materialesValidados: MaterialCreativoProps[] = [];
    const errores: string[] = [];

    for (const productoId of productosIds) {
      try {
        const materiales = await this.obtenerMaterialesCreativos(productoId);
        
        for (const material of materiales) {
          const validacion = await this.validarMaterialEspecifico(material);
          
          if (validacion.valido) {
            materialesValidados.push(material);
          } else {
            errores.push(`Material ${material.nombre}: ${validacion.errores.join(', ')}`);
          }
        }
      } catch (error) {
        errores.push(`Error validando materiales del producto ${productoId}`);
      }
    }

    if (errores.length > 0) {
      throw new Error(`Errores en validación de material creativo: ${errores.join('; ')}`);
    }

    return materialesValidados;
  }

  private async generarEspecificacionesPorProducto(
    productosIds: string[],
    datosContrato: { contrato: unknown; productos: Array<{ id: string; contratoId: string; nombre: string; categoria: { tipo: string }; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }> }
  ): Promise<Record<string, unknown[]>> {
    const especificacionesPorProducto: Record<string, unknown[]> = {};

    for (const productoId of productosIds) {
      const producto = datosContrato.productos.find((p: unknown) => p.id === productoId);
      
      if (!producto) {
        throw new Error(`Producto ${productoId} no encontrado en el contrato`);
      }

      // Generar especificaciones según el tipo de producto
      const especificaciones = await this.generarEspecificacionesSegunTipo(producto);
      especificacionesPorProducto[productoId] = especificaciones;
    }

    return especificacionesPorProducto;
  }

  private async generarEspecificacionesSegunTipo(producto: { id: string; nombre: string; categoria: { tipo: string }; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }): Promise<unknown[]> {
    const especificaciones: unknown[] = [];

    switch (producto.categoria.tipo) {
      case 'radio':
        especificaciones.push(...await this.generarEspecificacionesRadio(producto));
        break;
      
      case 'television':
        especificaciones.push(...await this.generarEspecificacionesTV(producto));
        break;
      
      case 'digital':
        especificaciones.push(...await this.generarEspecificacionesDigital(producto));
        break;
      
      case 'streaming':
        especificaciones.push(...await this.generarEspecificacionesStreaming(producto));
        break;
      
      default:
        especificaciones.push(...await this.generarEspecificacionesGenericas(producto));
    }

    return especificaciones;
  }

  private async crearOrdenParaSistema(
    sistema: SistemaEmision,
    especificacionesPorProducto: Record<string, unknown[]>,
    commandProps: GenerarOrdenPautaCommandProps,
    datosContrato: { contrato: { montoTotal: number; [key: string]: unknown }; productos: unknown[] }
  ): Promise<unknown> {
    const ordenId = this.generarIdOrden();
    
    // Consolidar todas las especificaciones
    const todasEspecificaciones: unknown[] = [];
    for (const especificaciones of Object.values(especificacionesPorProducto)) {
      todasEspecificaciones.push(...especificaciones);
    }

    // Adaptar especificaciones según el sistema de destino
    const especificacionesAdaptadas = await this.adaptarEspecificacionesParaSistema(
      todasEspecificaciones,
      sistema
    );

    // Crear la orden
    const orden = {
      ordenId,
      sistema,
      contratoId: commandProps.contratoId,
      productosIds: commandProps.productosIds,
      especificaciones: especificacionesAdaptadas,
      estado: 'generada',
      fechaCreacion: new Date(),
      fechaInicioDeseada: commandProps.fechaInicioDeseada || new Date(),
      prioridad: commandProps.prioridad || 5,
      observaciones: commandProps.observaciones,
      usuarioSolicitante: commandProps.usuarioSolicitante,
      metadatos: {
        sistemaDestino: sistema,
        totalEspecificaciones: especificacionesAdaptadas.length,
        valorTotalContrato: datosContrato.contrato.montoTotal
      }
    };

    // Guardar orden en el sistema
    await this.guardarOrden(orden);

    return orden;
  }

  private async enviarOrdenAutomaticamente(ordenId: string, sistema: SistemaEmision): Promise<void> {
    let intentos = 0;
    let enviado = false;

    while (intentos < GenerarOrdenPautaCommandHandler.MAX_REINTENTOS && !enviado) {
      try {
        intentos++;
        
        // Simular envío con retry y backoff exponencial
        const delay = Math.pow(2, intentos - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await this.enviarASistemaExterno(ordenId, sistema);
        enviado = true;
        
        // Actualizar estado de la orden
        await this.actualizarEstadoOrden(ordenId, 'enviada');
        
      } catch (error) {
        if (intentos >= GenerarOrdenPautaCommandHandler.MAX_REINTENTOS) {
          // Marcar como error después de todos los intentos
          await this.actualizarEstadoOrden(ordenId, 'error_envio');
          throw new Error(`Error enviando orden después de ${intentos} intentos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }
  }

  private async adaptarEspecificacionesParaSistema(
    especificaciones: unknown[],
    sistema: SistemaEmision
  ): Promise<unknown[]> {
    const especificacionesAdaptadas: unknown[] = [];

    for (const spec of especificaciones) {
      let especAdaptada = { ...spec };

      // Adaptaciones específicas por sistema
      switch (sistema) {
        case SistemaEmision.WIDEORBIT:
          especAdaptada = await this.adaptarParaWideOrbit(spec);
          break;
        
        case SistemaEmision.SARA:
          especAdaptada = await this.adaptarParaSara(spec);
          break;
        
        case SistemaEmision.DALET:
          especAdaptada = await this.adaptarParaDalet(spec);
          break;
        
        default:
          // Formato genérico
          especAdaptada = await this.adaptarFormatoGenerico(spec);
      }

      especificacionesAdaptadas.push(especAdaptada);
    }

    return especificacionesAdaptadas;
  }

  // Métodos de generación de especificaciones por tipo
  private async generarEspecificacionesRadio(producto: { id: string; nombre: string; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }): Promise<unknown[]> {
    return [{
      tipo: 'spot_radio',
      duracion: 30,
      frecuenciaDiaria: Math.ceil(producto.cantidad / 30), // Distribuir en 30 días
      horarios: ['07:00-09:00', '12:00-14:00', '17:00-19:00'],
      fechaInicio: producto.fechaInicio,
      fechaFin: producto.fechaFin,
      materialCreativo: `spot_${producto.id}.mp3`,
      valorUnitario: producto.precioUnitario,
      observaciones: `Producto: ${producto.nombre}`
    }];
  }

  private async generarEspecificacionesTV(producto: { id: string; nombre: string; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }): Promise<unknown[]> {
    return [{
      tipo: 'spot_tv',
      duracion: 20,
      frecuenciaDiaria: Math.ceil(producto.cantidad / 30),
      horarios: ['20:00-23:00'],
      fechaInicio: producto.fechaInicio,
      fechaFin: producto.fechaFin,
      materialCreativo: `spot_${producto.id}.mp4`,
      valorUnitario: producto.precioUnitario,
      observaciones: `Producto: ${producto.nombre}`
    }];
  }

  private async generarEspecificacionesDigital(producto: { id: string; nombre: string; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }): Promise<unknown[]> {
    return [{
      tipo: 'banner_digital',
      duracion: 0,
      impresiones: producto.cantidad,
      horarios: ['00:00-23:59'],
      fechaInicio: producto.fechaInicio,
      fechaFin: producto.fechaFin,
      materialCreativo: `banner_${producto.id}.jpg`,
      valorUnitario: producto.precioUnitario,
      observaciones: `Producto: ${producto.nombre}`
    }];
  }

  private async generarEspecificacionesStreaming(producto: { id: string; nombre: string; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }): Promise<unknown[]> {
    return [{
      tipo: 'video_streaming',
      duracion: 15,
      frecuenciaDiaria: Math.ceil(producto.cantidad / 30),
      horarios: ['19:00-23:00'],
      fechaInicio: producto.fechaInicio,
      fechaFin: producto.fechaFin,
      materialCreativo: `video_${producto.id}.mp4`,
      valorUnitario: producto.precioUnitario,
      observaciones: `Producto: ${producto.nombre}`
    }];
  }

  private async generarEspecificacionesGenericas(producto: { id: string; nombre: string; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }): Promise<unknown[]> {
    return [{
      tipo: 'generico',
      duracion: 30,
      frecuenciaDiaria: 5,
      horarios: ['09:00-18:00'],
      fechaInicio: producto.fechaInicio,
      fechaFin: producto.fechaFin,
      materialCreativo: `material_${producto.id}`,
      valorUnitario: producto.precioUnitario,
      observaciones: `Producto: ${producto.nombre}`
    }];
  }

  // Métodos de adaptación por sistema
  private async adaptarParaWideOrbit(especificacion: unknown): Promise<unknown> {
    return {
      ...especificacion,
      formato_wideorbit: {
        cart_number: `CART_${Date.now()}`,
        category: especificacion.tipo.toUpperCase(),
        length: especificacion.duracion,
        start_date: especificacion.fechaInicio,
        end_date: especificacion.fechaFin
      }
    };
  }

  private async adaptarParaSara(especificacion: unknown): Promise<unknown> {
    return {
      ...especificacion,
      formato_sara: {
        id_material: `MAT_${Date.now()}`,
        tipo_contenido: especificacion.tipo,
        duracion_segundos: especificacion.duracion,
        fecha_inicio: especificacion.fechaInicio,
        fecha_termino: especificacion.fechaFin
      }
    };
  }

  private async adaptarParaDalet(especificacion: unknown): Promise<unknown> {
    return {
      ...especificacion,
      formato_dalet: {
        media_id: `MEDIA_${Date.now()}`,
        content_type: especificacion.tipo,
        duration: especificacion.duracion,
        start_time: especificacion.fechaInicio,
        end_time: especificacion.fechaFin
      }
    };
  }

  private async adaptarFormatoGenerico(especificacion: unknown): Promise<unknown> {
    return {
      ...especificacion,
      formato_generico: {
        id: `GEN_${Date.now()}`,
        tipo: especificacion.tipo,
        duracion: especificacion.duracion,
        inicio: especificacion.fechaInicio,
        fin: especificacion.fechaFin
      }
    };
  }

  // Métodos de utilidad y simulación
  private async obtenerContrato(contratoId: string): Promise<unknown> {
    // Simular obtención de contrato
    return {
      id: contratoId,
      estado: 'aprobado',
      montoTotal: 500000,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
  }

  private async obtenerProductos(productosIds: string[]): Promise<Array<{ id: string; contratoId: string; nombre: string; categoria: { tipo: string }; cantidad: number; precioUnitario: number; fechaInicio: Date; fechaFin: Date }>> {
    // Simular obtención de productos
    return productosIds.map(id => ({
      id,
      contratoId: 'contrato_123',
      nombre: `Producto ${id}`,
      categoria: { tipo: 'radio' },
      cantidad: 100,
      precioUnitario: 1000,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }));
  }

  private async obtenerMaterialesCreativos(productoId: string): Promise<MaterialCreativoProps[]> {
    // Simular obtención de materiales creativos
    return [{
      id: `material_${productoId}`,
      nombre: `Material para producto ${productoId}`,
      tipo: 'audio',
      duracion: 30,
      formato: 'mp3',
      url: `https://storage.example.com/material_${productoId}.mp3`,
      fechaCreacion: new Date(),
      aprobado: true
    }];
  }

  private async validarMaterialEspecifico(material: MaterialCreativoProps): Promise<{
    valido: boolean;
    errores: string[];
  }> {
    const errores: string[] = [];

    if (!material.aprobado) {
      errores.push('Material no aprobado');
    }

    if (material.tipo === 'audio' && (!material.duracion || material.duracion <= 0)) {
      errores.push('Material de audio debe tener duración válida');
    }

    // Simular validación de URL
    if (!material.url || !material.url.startsWith('http')) {
      errores.push('URL del material inválida');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  private async guardarOrden(orden: unknown): Promise<void> {
    // Simular guardado en base de datos
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async enviarASistemaExterno(ordenId: string, sistema: SistemaEmision): Promise<void> {
    // Simular envío a sistema externo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular posibles errores
    if (Math.random() < 0.1) { // 10% probabilidad de error
      throw new Error(`Error de conectividad con ${sistema}`);
    }
  }

  private async actualizarEstadoOrden(ordenId: string, nuevoEstado: string): Promise<void> {
    // Simular actualización de estado
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private generarIdOrden(): string {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const secuencia = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `OP${año}${mes}${dia}${secuencia}`;
  }
}