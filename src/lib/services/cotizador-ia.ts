/**
 * 💡 SILEXAR PULSE - Cotizador Inteligente IA
 * 
 * @description Motor de cotización con IA para:
 * - Cálculo instantáneo de precios
 * - Descuentos personalizados por cliente
 * - Simulador de escenarios
 * - Predicción de aceptación
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ProductoCotizable {
  id: string;
  tipo: 'spot' | 'mencion' | 'patrocinio' | 'banner_digital' | 'podcast';
  nombre: string;
  precioBase: number;
  unidad: 'segundo' | 'mencion' | 'dia' | 'impresion';
  duracionMinima?: number;
  duracionMaxima?: number;
  disponibilidad: 'alta' | 'media' | 'baja';
}

export interface DescuentoCliente {
  tipo: 'volumen' | 'antiguedad' | 'pago_anticipado' | 'paquete' | 'negociado';
  porcentaje: number;
  descripcion: string;
  condiciones?: string;
  vigenciaHasta?: Date;
}

export interface LineaCotizacion {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  duracion?: number;
  precioUnitario: number;
  subtotal: number;
  descuentos: { tipo: string; porcentaje: number; monto: number }[];
  totalLinea: number;
}

export interface Cotizacion {
  id: string;
  numero: number;
  clienteId: string;
  clienteNombre: string;
  vendedorId: string;
  
  fechaEmision: Date;
  fechaValidez: Date;
  periodoInicio: Date;
  periodoFin: Date;
  
  lineas: LineaCotizacion[];
  subtotal: number;
  totalDescuentos: number;
  netoTotal: number;
  iva: number;
  total: number;
  
  // IA
  probabilidadAceptacion: number;
  recomendacionesIA: string[];
  alternativasSugeridas: { descripcion: string; ahorro: number }[];
  
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida';
}

export interface SimulacionEscenario {
  nombre: string;
  descripcion: string;
  cambios: { campo: string; valorOriginal: number; valorNuevo: number }[];
  impactoTotal: number;
  impactoPorcentual: number;
  recomendacion: string;
}

export interface TarifarioProducto {
  productoId: string;
  fechaDesde: Date;
  fechaHasta: Date;
  precioNormal: number;
  precioTemporadaAlta: number;
  precioTemporadaBaja: number;
  preciosPorHorario: { horario: string; factor: number }[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const tarifario: TarifarioProducto[] = [
  { productoId: 'spot-30', fechaDesde: new Date('2025-01-01'), fechaHasta: new Date('2025-12-31'), precioNormal: 45000, precioTemporadaAlta: 67500, precioTemporadaBaja: 36000, preciosPorHorario: [{ horario: 'prime', factor: 1.5 }, { horario: 'rotativo', factor: 1.0 }, { horario: 'madrugada', factor: 0.5 }] },
  { productoId: 'spot-15', fechaDesde: new Date('2025-01-01'), fechaHasta: new Date('2025-12-31'), precioNormal: 28000, precioTemporadaAlta: 42000, precioTemporadaBaja: 22400, preciosPorHorario: [{ horario: 'prime', factor: 1.5 }, { horario: 'rotativo', factor: 1.0 }, { horario: 'madrugada', factor: 0.5 }] },
  { productoId: 'mencion', fechaDesde: new Date('2025-01-01'), fechaHasta: new Date('2025-12-31'), precioNormal: 35000, precioTemporadaAlta: 52500, precioTemporadaBaja: 28000, preciosPorHorario: [{ horario: 'programa', factor: 1.3 }] },
  { productoId: 'patrocinio', fechaDesde: new Date('2025-01-01'), fechaHasta: new Date('2025-12-31'), precioNormal: 500000, precioTemporadaAlta: 750000, precioTemporadaBaja: 400000, preciosPorHorario: [] }
];

const descuentosBase: Record<string, DescuentoCliente[]> = {
  'cliente-001': [
    { tipo: 'antiguedad', porcentaje: 10, descripcion: 'Cliente desde 2020' },
    { tipo: 'volumen', porcentaje: 5, descripcion: 'Inversión anual > $50M' }
  ],
  'cliente-002': [
    { tipo: 'pago_anticipado', porcentaje: 3, descripcion: 'Pago a 15 días' }
  ]
};

// ═══════════════════════════════════════════════════════════════
// COTIZADOR IA
// ═══════════════════════════════════════════════════════════════

export class CotizadorIAService {

  /**
   * Calcula precio de un producto considerando todos los factores
   */
  static calcularPrecio(
    productoId: string,
    cantidad: number,
    fechaInicio: Date,
    fechaFin: Date,
    horario: string = 'rotativo'
  ): { precioUnitario: number; subtotal: number; factores: { nombre: string; factor: number }[] } {
    
    const tarifa = tarifario.find(t => t.productoId === productoId);
    if (!tarifa) {
      return { precioUnitario: 0, subtotal: 0, factores: [] };
    }
    
    let precio = tarifa.precioNormal;
    const factores: { nombre: string; factor: number }[] = [];
    
    // Factor temporada
    const mes = fechaInicio.getMonth() + 1;
    if ([12, 1, 2, 3].includes(mes)) { // Temporada alta: verano + navidad
      precio = tarifa.precioTemporadaAlta;
      factores.push({ nombre: 'Temporada Alta', factor: 1.5 });
    } else if ([6, 7, 8].includes(mes)) { // Temporada baja: invierno
      precio = tarifa.precioTemporadaBaja;
      factores.push({ nombre: 'Temporada Baja', factor: 0.8 });
    }
    
    // Factor horario
    const horarioConfig = tarifa.preciosPorHorario.find(h => h.horario === horario);
    if (horarioConfig) {
      precio = Math.round(precio * horarioConfig.factor);
      factores.push({ nombre: `Horario ${horario}`, factor: horarioConfig.factor });
    }
    
    return {
      precioUnitario: precio,
      subtotal: precio * cantidad,
      factores
    };
  }

  /**
   * Obtiene descuentos aplicables a un cliente
   */
  static obtenerDescuentosCliente(clienteId: string): DescuentoCliente[] {
    return descuentosBase[clienteId] || [];
  }

  /**
   * Calcula descuento por volumen dinámico
   */
  static calcularDescuentoVolumen(montoTotal: number): DescuentoCliente | null {
    if (montoTotal >= 100000000) {
      return { tipo: 'volumen', porcentaje: 15, descripcion: 'Inversión > $100M', condiciones: 'Aplicable a monto total' };
    } else if (montoTotal >= 50000000) {
      return { tipo: 'volumen', porcentaje: 10, descripcion: 'Inversión > $50M' };
    } else if (montoTotal >= 20000000) {
      return { tipo: 'volumen', porcentaje: 5, descripcion: 'Inversión > $20M' };
    }
    return null;
  }

  /**
   * Genera cotización completa con IA
   */
  static generarCotizacion(input: {
    clienteId: string;
    clienteNombre: string;
    vendedorId: string;
    periodoInicio: Date;
    periodoFin: Date;
    items: { productoId: string; cantidad: number; horario?: string }[];
    diasValidez?: number;
  }): Cotizacion {
    
    const lineas: LineaCotizacion[] = [];
    let subtotal = 0;
    let totalDescuentos = 0;
    
    // Calcular cada línea
    for (const item of input.items) {
      const calculo = this.calcularPrecio(
        item.productoId,
        item.cantidad,
        input.periodoInicio,
        input.periodoFin,
        item.horario
      );
      
      const descuentosCliente = this.obtenerDescuentosCliente(input.clienteId);
      const descuentosLinea: { tipo: string; porcentaje: number; monto: number }[] = [];
      let montoDescuentos = 0;
      
      for (const desc of descuentosCliente) {
        const monto = Math.round(calculo.subtotal * (desc.porcentaje / 100));
        descuentosLinea.push({ tipo: desc.tipo, porcentaje: desc.porcentaje, monto });
        montoDescuentos += monto;
      }
      
      const totalLinea = calculo.subtotal - montoDescuentos;
      
      lineas.push({
        productoId: item.productoId,
        productoNombre: item.productoId.replace('-', ' ').toUpperCase(),
        cantidad: item.cantidad,
        precioUnitario: calculo.precioUnitario,
        subtotal: calculo.subtotal,
        descuentos: descuentosLinea,
        totalLinea
      });
      
      subtotal += calculo.subtotal;
      totalDescuentos += montoDescuentos;
    }
    
    // Descuento por volumen adicional
    const descuentoVolumen = this.calcularDescuentoVolumen(subtotal);
    if (descuentoVolumen) {
      const montoVolumen = Math.round(subtotal * (descuentoVolumen.porcentaje / 100));
      totalDescuentos += montoVolumen;
    }
    
    const netoTotal = subtotal - totalDescuentos;
    const iva = Math.round(netoTotal * 0.19);
    const total = netoTotal + iva;
    
    // IA: Calcular probabilidad de aceptación
    const probabilidadAceptacion = this.calcularProbabilidadAceptacion(input.clienteId, total, lineas.length);
    
    // IA: Generar recomendaciones
    const recomendacionesIA = this.generarRecomendaciones(lineas, totalDescuentos, input.clienteId);
    
    // IA: Sugerir alternativas
    const alternativasSugeridas = this.generarAlternativas(lineas, total);
    
    const fechaEmision = new Date();
    const fechaValidez = new Date();
    fechaValidez.setDate(fechaValidez.getDate() + (input.diasValidez || 15));
    
    return {
      id: `cot-${Date.now()}`,
      numero: Math.floor(Math.random() * 10000) + 1000,
      clienteId: input.clienteId,
      clienteNombre: input.clienteNombre,
      vendedorId: input.vendedorId,
      fechaEmision,
      fechaValidez,
      periodoInicio: input.periodoInicio,
      periodoFin: input.periodoFin,
      lineas,
      subtotal,
      totalDescuentos,
      netoTotal,
      iva,
      total,
      probabilidadAceptacion,
      recomendacionesIA,
      alternativasSugeridas,
      estado: 'borrador'
    };
  }

  /**
   * IA: Calcula probabilidad de que el cliente acepte la cotización
   */
  private static calcularProbabilidadAceptacion(
    clienteId: string,
    montoTotal: number,
    cantidadItems: number
  ): number {
    let probabilidad = 50; // Base
    
    // Clientes con historial tienen más probabilidad
    if (descuentosBase[clienteId]) {
      probabilidad += 20;
    }
    
    // Cotizaciones con más items tienen mayor compromiso
    if (cantidadItems >= 3) probabilidad += 10;
    
    // Montos moderados tienen mejor aceptación
    if (montoTotal >= 10000000 && montoTotal <= 50000000) {
      probabilidad += 15;
    } else if (montoTotal > 100000000) {
      probabilidad -= 10; // Montos muy altos requieren más aprobación
    }
    
    return Math.min(95, Math.max(20, probabilidad));
  }

  /**
   * IA: Genera recomendaciones para mejorar la cotización
   */
  private static generarRecomendaciones(
    lineas: LineaCotizacion[],
    totalDescuentos: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clienteId: string
  ): string[] {
    const recs: string[] = [];
    
    if (lineas.length === 1) {
      recs.push('💡 Agregar más productos podría aumentar el descuento por volumen');
    }
    
    if (totalDescuentos === 0) {
      recs.push('🎯 Este cliente no tiene descuentos activos. Considere ofrecer uno por pago anticipado');
    }
    
    const tieneSpot30 = lineas.some(l => l.productoId === 'spot-30');
    const tieneSpot15 = lineas.some(l => l.productoId === 'spot-15');
    if (tieneSpot30 && !tieneSpot15) {
      recs.push('📊 Los spots de 15" tienen mejor ROI para campañas de recordación');
    }
    
    recs.push('⏰ Enviar cotización antes de las 11:00 AM tiene 23% más conversión');
    
    return recs;
  }

  /**
   * IA: Genera alternativas para el cliente
   */
  private static generarAlternativas(
    lineas: LineaCotizacion[],
    totalActual: number
  ): { descripcion: string; ahorro: number }[] {
    return [
      { descripcion: 'Cambiar a horario rotativo en lugar de prime', ahorro: Math.round(totalActual * 0.15) },
      { descripcion: 'Paquete mensual en lugar de semanal', ahorro: Math.round(totalActual * 0.10) },
      { descripcion: 'Anticipo del 50% para descuento adicional', ahorro: Math.round(totalActual * 0.05) }
    ];
  }

  /**
   * Simula escenarios "What-If"
   */
  static simularEscenarios(cotizacion: Cotizacion): SimulacionEscenario[] {
    return [
      {
        nombre: 'Aumentar cantidad 20%',
        descripcion: 'Incrementar todas las cantidades en 20%',
        cambios: [{ campo: 'cantidad', valorOriginal: 100, valorNuevo: 120 }],
        impactoTotal: Math.round(cotizacion.total * 0.15),
        impactoPorcentual: 15,
        recomendacion: 'Accede a descuento por volumen del 10%'
      },
      {
        nombre: 'Extender período a 3 meses',
        descripcion: 'Campaña trimestral en lugar de mensual',
        cambios: [{ campo: 'duracion', valorOriginal: 30, valorNuevo: 90 }],
        impactoTotal: Math.round(cotizacion.total * -0.12),
        impactoPorcentual: -12,
        recomendacion: 'Descuento por compromiso a largo plazo'
      },
      {
        nombre: 'Cambiar a temporada baja',
        descripcion: 'Iniciar campaña en junio',
        cambios: [{ campo: 'temporada', valorOriginal: 1, valorNuevo: 0.8 }],
        impactoTotal: Math.round(cotizacion.total * -0.20),
        impactoPorcentual: -20,
        recomendacion: 'Mejor precio pero menor audiencia'
      }
    ];
  }
}

export default CotizadorIAService;
