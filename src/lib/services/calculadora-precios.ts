/**
 * 📊 SILEXAR PULSE - Calculadora de Precios Avanzada
 * 
 * @description Motor de cálculo de precios con múltiples factores:
 * - Temporada (alta/baja/normal)
 * - Horario (prime/rotativo/madrugada)
 * - Volumen
 * - Descuentos cliente
 * - Bonificaciones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ProductoTarifa {
  id: string;
  nombre: string;
  precioBase: number;
  unidad: 'segundo' | 'mencion' | 'dia' | 'impresion';
  duracionPorDefecto?: number;
}

export interface FactorPrecio {
  tipo: string;
  nombre: string;
  factor: number;
  aplicable: boolean;
}

export interface DescuentoAplicable {
  tipo: 'cliente' | 'volumen' | 'pago' | 'compromiso' | 'especial';
  nombre: string;
  porcentaje: number;
  condicion?: string;
}

export interface CalculoPrecio {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioBase: number;
  factoresAplicados: FactorPrecio[];
  precioConFactores: number;
  subtotal: number;
  descuentosAplicados: { nombre: string; porcentaje: number; monto: number }[];
  totalDescuentos: number;
  netoLinea: number;
}

export interface ResumenCalculo {
  lineas: CalculoPrecio[];
  subtotalBruto: number;
  totalDescuentos: number;
  netoTotal: number;
  iva: number;
  total: number;
  ahorroTotal: number;
  factoresGlobales: string[];
}

// ═══════════════════════════════════════════════════════════════
// TARIFARIO BASE
// ═══════════════════════════════════════════════════════════════

const TARIFARIO: ProductoTarifa[] = [
  { id: 'spot-30', nombre: 'Spot 30 segundos', precioBase: 45000, unidad: 'segundo', duracionPorDefecto: 30 },
  { id: 'spot-20', nombre: 'Spot 20 segundos', precioBase: 35000, unidad: 'segundo', duracionPorDefecto: 20 },
  { id: 'spot-15', nombre: 'Spot 15 segundos', precioBase: 28000, unidad: 'segundo', duracionPorDefecto: 15 },
  { id: 'spot-10', nombre: 'Spot 10 segundos', precioBase: 20000, unidad: 'segundo', duracionPorDefecto: 10 },
  { id: 'mencion', nombre: 'Mención en vivo', precioBase: 35000, unidad: 'mencion' },
  { id: 'patrocinio-bloque', nombre: 'Patrocinio de bloque', precioBase: 250000, unidad: 'dia' },
  { id: 'patrocinio-programa', nombre: 'Patrocinio de programa', precioBase: 500000, unidad: 'dia' },
  { id: 'banner-web', nombre: 'Banner web', precioBase: 15000, unidad: 'impresion' },
  { id: 'podcast', nombre: 'Mención en podcast', precioBase: 75000, unidad: 'mencion' }
];

const FACTORES_TEMPORADA: Record<string, number> = {
  alta: 1.5,      // Dic, Ene, Feb, Mar (verano + navidad)
  normal: 1.0,    // Abr, May, Sep, Oct, Nov
  baja: 0.8       // Jun, Jul, Ago (invierno)
};

const FACTORES_HORARIO: Record<string, number> = {
  prime: 1.5,         // 18:00 - 21:00
  estelar: 1.3,       // 21:00 - 00:00
  manana: 1.2,        // 06:00 - 10:00
  mediodia: 1.1,      // 10:00 - 14:00
  tarde: 1.0,         // 14:00 - 18:00
  rotativo: 1.0,      // Cualquier horario
  madrugada: 0.5      // 00:00 - 06:00
};

const DESCUENTOS_VOLUMEN: { desde: number; hasta: number; pct: number }[] = [
  { desde: 100000000, hasta: Infinity, pct: 15 },
  { desde: 50000000, hasta: 100000000, pct: 10 },
  { desde: 20000000, hasta: 50000000, pct: 5 },
  { desde: 10000000, hasta: 20000000, pct: 3 },
  { desde: 0, hasta: 10000000, pct: 0 }
];

const DESCUENTOS_COMPROMISO: Record<string, number> = {
  anual: 18,
  semestral: 12,
  trimestral: 8,
  mensual: 0
};

const DESCUENTOS_PAGO: Record<string, number> = {
  contado: 5,
  '15dias': 3,
  '30dias': 0,
  '45dias': 0,
  '60dias': -2  // Recargo
};

// ═══════════════════════════════════════════════════════════════
// CALCULADORA
// ═══════════════════════════════════════════════════════════════

export class CalculadoraPrecios {

  /**
   * Determina la temporada según el mes
   */
  static obtenerTemporada(fecha: Date): 'alta' | 'normal' | 'baja' {
    const mes = fecha.getMonth() + 1;
    if ([12, 1, 2, 3].includes(mes)) return 'alta';
    if ([6, 7, 8].includes(mes)) return 'baja';
    return 'normal';
  }

  /**
   * Obtiene producto del tarifario
   */
  static obtenerProducto(productoId: string): ProductoTarifa | undefined {
    return TARIFARIO.find(p => p.id === productoId);
  }

  /**
   * Lista todos los productos disponibles
   */
  static listarProductos(): ProductoTarifa[] {
    return [...TARIFARIO];
  }

  /**
   * Calcula precio de una línea
   */
  static calcularLinea(params: {
    productoId: string;
    cantidad: number;
    fecha: Date;
    horario?: string;
    descuentosCliente?: DescuentoAplicable[];
  }): CalculoPrecio | null {
    
    const producto = this.obtenerProducto(params.productoId);
    if (!producto) return null;
    
    const factoresAplicados: FactorPrecio[] = [];
    let precioConFactores = producto.precioBase;
    
    // Factor temporada
    const temporada = this.obtenerTemporada(params.fecha);
    const factorTemp = FACTORES_TEMPORADA[temporada];
    if (factorTemp !== 1) {
      factoresAplicados.push({
        tipo: 'temporada',
        nombre: `Temporada ${temporada}`,
        factor: factorTemp,
        aplicable: true
      });
      precioConFactores = Math.round(producto.precioBase * factorTemp);
    }
    
    // Factor horario
    const horario = params.horario || 'rotativo';
    const factorHor = FACTORES_HORARIO[horario] || 1;
    if (factorHor !== 1) {
      factoresAplicados.push({
        tipo: 'horario',
        nombre: `Horario ${horario}`,
        factor: factorHor,
        aplicable: true
      });
      precioConFactores = Math.round(precioConFactores * factorHor);
    }
    
    const subtotal = precioConFactores * params.cantidad;
    
    // Aplicar descuentos del cliente
    const descuentosAplicados: { nombre: string; porcentaje: number; monto: number }[] = [];
    let totalDescuentos = 0;
    
    if (params.descuentosCliente) {
      for (const desc of params.descuentosCliente) {
        const monto = Math.round(subtotal * (desc.porcentaje / 100));
        descuentosAplicados.push({
          nombre: desc.nombre,
          porcentaje: desc.porcentaje,
          monto
        });
        totalDescuentos += monto;
      }
    }
    
    return {
      productoId: params.productoId,
      productoNombre: producto.nombre,
      cantidad: params.cantidad,
      precioBase: producto.precioBase,
      factoresAplicados,
      precioConFactores,
      subtotal,
      descuentosAplicados,
      totalDescuentos,
      netoLinea: subtotal - totalDescuentos
    };
  }

  /**
   * Calcula cotización completa
   */
  static calcularCotizacion(params: {
    lineas: { productoId: string; cantidad: number; horario?: string }[];
    fecha: Date;
    clienteId?: string;
    descuentosCliente?: DescuentoAplicable[];
    tipoCompromiso?: string;
    tipoPago?: string;
  }): ResumenCalculo {
    
    const lineasCalculadas: CalculoPrecio[] = [];
    let subtotalBruto = 0;
    
    // Calcular cada línea
    for (const linea of params.lineas) {
      const calculo = this.calcularLinea({
        productoId: linea.productoId,
        cantidad: linea.cantidad,
        fecha: params.fecha,
        horario: linea.horario,
        descuentosCliente: params.descuentosCliente
      });
      
      if (calculo) {
        lineasCalculadas.push(calculo);
        subtotalBruto += calculo.subtotal;
      }
    }
    
    // Descuento por volumen
    let descuentoVolumen = 0;
    const rangoVolumen = DESCUENTOS_VOLUMEN.find(r => subtotalBruto >= r.desde && subtotalBruto < r.hasta);
    if (rangoVolumen && rangoVolumen.pct > 0) {
      descuentoVolumen = Math.round(subtotalBruto * (rangoVolumen.pct / 100));
    }
    
    // Descuento por compromiso
    let descuentoCompromiso = 0;
    if (params.tipoCompromiso && DESCUENTOS_COMPROMISO[params.tipoCompromiso]) {
      descuentoCompromiso = Math.round(subtotalBruto * (DESCUENTOS_COMPROMISO[params.tipoCompromiso] / 100));
    }
    
    // Descuento por pago
    let descuentoPago = 0;
    if (params.tipoPago && DESCUENTOS_PAGO[params.tipoPago]) {
      descuentoPago = Math.round(subtotalBruto * (DESCUENTOS_PAGO[params.tipoPago] / 100));
    }
    
    const totalDescuentosLineas = lineasCalculadas.reduce((sum, l) => sum + l.totalDescuentos, 0);
    const totalDescuentos = totalDescuentosLineas + descuentoVolumen + descuentoCompromiso + descuentoPago;
    
    // Máximo 25% descuento
    const descuentoMaximo = Math.round(subtotalBruto * 0.25);
    const descuentoFinal = Math.min(totalDescuentos, descuentoMaximo);
    
    const netoTotal = subtotalBruto - descuentoFinal;
    const iva = Math.round(netoTotal * 0.19);
    const total = netoTotal + iva;
    
    const factoresGlobales: string[] = [];
    if (rangoVolumen && rangoVolumen.pct > 0) {
      factoresGlobales.push(`Descuento volumen ${rangoVolumen.pct}%`);
    }
    if (descuentoCompromiso > 0) {
      factoresGlobales.push(`Descuento ${params.tipoCompromiso}: ${DESCUENTOS_COMPROMISO[params.tipoCompromiso!]}%`);
    }
    if (descuentoPago !== 0) {
      factoresGlobales.push(`${descuentoPago > 0 ? 'Descuento' : 'Recargo'} pago: ${Math.abs(DESCUENTOS_PAGO[params.tipoPago!])}%`);
    }
    
    return {
      lineas: lineasCalculadas,
      subtotalBruto,
      totalDescuentos: descuentoFinal,
      netoTotal,
      iva,
      total,
      ahorroTotal: descuentoFinal,
      factoresGlobales
    };
  }

  /**
   * Simula diferentes escenarios para comparar
   */
  static simularEscenarios(params: {
    lineas: { productoId: string; cantidad: number; horario?: string }[];
    fecha: Date;
    clienteId?: string;
  }): { nombre: string; total: number; ahorro: number; detalle: string }[] {
    
    const base = this.calcularCotizacion({ lineas: params.lineas, fecha: params.fecha });
    
    const fechaInvierno = new Date('2025-07-15');
    
    const escenarios = [
      { nombre: 'Actual', total: base.total, ahorro: 0, detalle: 'Sin cambios' },
      { nombre: 'Temporada baja', total: this.calcularCotizacion({ ...params, fecha: fechaInvierno }).total, ahorro: 0, detalle: 'Junio - Agosto' },
      { nombre: 'Con compromiso trimestral', total: this.calcularCotizacion({ ...params, tipoCompromiso: 'trimestral' }).total, ahorro: 0, detalle: '8% descuento' },
      { nombre: 'Con pago contado', total: this.calcularCotizacion({ ...params, tipoPago: 'contado' }).total, ahorro: 0, detalle: '5% descuento' },
      { nombre: 'Cantidad +20%', total: this.calcularCotizacion({ lineas: params.lineas.map(l => ({ ...l, cantidad: Math.round(l.cantidad * 1.2) })), fecha: params.fecha }).total, ahorro: 0, detalle: 'Mayor volumen' }
    ];
    
    // Calcular ahorro vs base
    return escenarios.map(e => ({
      ...e,
      ahorro: base.total - e.total
    }));
  }
}

export default CalculadoraPrecios;
