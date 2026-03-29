/**
 * 📊 SILEXAR PULSE - Servicio Cierre Mensual
 * 
 * @description Lógica de negocio para pre-cierre, validación y cierre mensual
 * de ventas y facturación
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EstadoCierre = 'abierto' | 'pre_cierre' | 'validando' | 'cerrado' | 'reabierto';

export interface ErrorValidacion {
  codigo: string;
  tipo: 'error' | 'advertencia';
  entidad: 'campana' | 'contrato' | 'factura' | 'cliente';
  entidadId: string;
  mensaje: string;
  detalles?: Record<string, unknown>;
}

export interface ResumenPeriodo {
  periodo: string;
  anio: number;
  mes: number;
  estado: EstadoCierre;
  
  // Ventas
  ventasBrutas: number;
  descuentos: number;
  ventasNetas: number;
  comisiones: number;
  
  // Facturación
  totalFacturado: number;
  pendienteFacturar: number;
  cantidadFacturas: number;
  
  // Campañas
  campanasVendidas: number;
  campanasBonificadas: number;
  campanasSinValor: number;
  
  // Validación
  errores: ErrorValidacion[];
  advertencias: ErrorValidacion[];
  puedePreCerrar: boolean;
  puedeCerrar: boolean;
}

export interface CampanaValidacion {
  id: string;
  codigo: string;
  nombre: string;
  anuncianteNombre: string;
  valorNeto: number;
  esBonificada: boolean;
  esAsistenciaTecnica: boolean;
  esBeneficencia: boolean;
  tieneValor: boolean;
  errores: string[];
}

export interface ResultadoPreCierre {
  exito: boolean;
  periodo: string;
  campanasValidadas: number;
  campanasConError: number;
  contratosValidados: number;
  facturasGenerables: number;
  errores: ErrorValidacion[];
  advertencias: ErrorValidacion[];
}

export interface ResultadoCierre {
  exito: boolean;
  periodo: string;
  mensaje: string;
  resumen: ResumenPeriodo;
  fechaCierre: Date;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockCampanas: CampanaValidacion[] = [
  { id: 'cam-001', codigo: 'CAM-2025-001', nombre: 'Campaña Navidad', anuncianteNombre: 'Empresa ABC', valorNeto: 15000000, esBonificada: false, esAsistenciaTecnica: false, esBeneficencia: false, tieneValor: true, errores: [] },
  { id: 'cam-002', codigo: 'CAM-2025-002', nombre: 'Campaña Verano', anuncianteNombre: 'Servicios XYZ', valorNeto: 8500000, esBonificada: false, esAsistenciaTecnica: false, esBeneficencia: false, tieneValor: true, errores: [] },
  { id: 'cam-003', codigo: 'CAM-2025-003', nombre: 'Apoyo Social', anuncianteNombre: 'Fundación Ayuda', valorNeto: 0, esBonificada: false, esAsistenciaTecnica: false, esBeneficencia: true, tieneValor: false, errores: [] },
  { id: 'cam-004', codigo: 'CAM-2025-004', nombre: 'Promoción Q1', anuncianteNombre: 'Comercial DEF', valorNeto: 0, esBonificada: false, esAsistenciaTecnica: false, esBeneficencia: false, tieneValor: false, errores: ['Campaña sin valor asignado'] },
  { id: 'cam-005', codigo: 'CAM-2025-005', nombre: 'Capacitación Técnica', anuncianteNombre: 'Tech Solutions', valorNeto: 0, esBonificada: false, esAsistenciaTecnica: true, esBeneficencia: false, tieneValor: false, errores: [] }
];

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

export class CierreMensualService {

  /**
   * Obtiene resumen del período actual o específico
   */
  static async obtenerResumen(tenantId: string, anio?: number, mes?: number): Promise<ResumenPeriodo> {
    const ahora = new Date();
    const periodoAnio = anio || ahora.getFullYear();
    const periodoMes = mes || ahora.getMonth() + 1;
    const periodo = `${periodoAnio}-${periodoMes.toString().padStart(2, '0')}`;
    
    // Calcular totales (mock)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _campanasValidas = mockCampanas.filter(c => c.tieneValor || c.esBonificada || c.esBeneficencia || c.esAsistenciaTecnica);
    const campanasConError = mockCampanas.filter(c => c.errores.length > 0);
    
    const errores: ErrorValidacion[] = campanasConError.map(c => ({
      codigo: 'CAMP_SIN_VALOR',
      tipo: 'error' as const,
      entidad: 'campana' as const,
      entidadId: c.id,
      mensaje: `Campaña ${c.codigo} sin valor asignado`,
      detalles: { campana: c.nombre, cliente: c.anuncianteNombre }
    }));
    
    return {
      periodo,
      anio: periodoAnio,
      mes: periodoMes,
      estado: 'abierto',
      
      ventasBrutas: 25000000,
      descuentos: 1500000,
      ventasNetas: 23500000,
      comisiones: 1175000,
      
      totalFacturado: 18000000,
      pendienteFacturar: 5500000,
      cantidadFacturas: 12,
      
      campanasVendidas: mockCampanas.filter(c => c.tieneValor).length,
      campanasBonificadas: mockCampanas.filter(c => c.esBonificada || c.esAsistenciaTecnica || c.esBeneficencia).length,
      campanasSinValor: campanasConError.length,
      
      errores,
      advertencias: [],
      puedePreCerrar: errores.length === 0,
      puedeCerrar: false
    };
  }

  /**
   * Valida campañas para el cierre
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async validarCampanas(_tenantId: string, _periodo: string): Promise<CampanaValidacion[]> {
    // Validar cada campaña
    const validadas = mockCampanas.map(c => {
      const errores: string[] = [];
      
      // Regla: campaña debe tener valor EXCEPTO si es bonificada, asistencia técnica o beneficencia
      if (!c.tieneValor && !c.esBonificada && !c.esAsistenciaTecnica && !c.esBeneficencia) {
        errores.push('Campaña sin valor asignado. Debe tener monto o marcarse como bonificada/beneficencia.');
      }
      
      return { ...c, errores };
    });
    
    return validadas;
  }

  /**
   * Ejecuta el pre-cierre del período
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async ejecutarPreCierre(tenantId: string, anio: number, mes: number, _usuarioId: string): Promise<ResultadoPreCierre> {
    const periodo = `${anio}-${mes.toString().padStart(2, '0')}`;
    
    // 1. Validar campañas
    const campanas = await this.validarCampanas(tenantId, periodo);
    const campanasConError = campanas.filter(c => c.errores.length > 0);
    
    const errores: ErrorValidacion[] = campanasConError.map(c => ({
      codigo: 'CAMP_SIN_VALOR',
      tipo: 'error' as const,
      entidad: 'campana' as const,
      entidadId: c.id,
      mensaje: c.errores[0],
      detalles: { campana: c.nombre, codigo: c.codigo }
    }));
    
    // 2. Verificar si puede pre-cerrar
    const exito = errores.length === 0;
    
    return {
      exito,
      periodo,
      campanasValidadas: campanas.length - campanasConError.length,
      campanasConError: campanasConError.length,
      contratosValidados: 8,
      facturasGenerables: 5,
      errores,
      advertencias: []
    };
  }

  /**
   * Ejecuta el cierre definitivo del período
   */
  static async ejecutarCierre(tenantId: string, anio: number, mes: number, usuarioId: string): Promise<ResultadoCierre> {
    const periodo = `${anio}-${mes.toString().padStart(2, '0')}`;
    
    // Verificar pre-cierre
    const preCierre = await this.ejecutarPreCierre(tenantId, anio, mes, usuarioId);
    
    if (!preCierre.exito) {
      return {
        exito: false,
        periodo,
        mensaje: `No se puede cerrar: ${preCierre.errores.length} errores pendientes`,
        resumen: await this.obtenerResumen(tenantId, anio, mes),
        fechaCierre: new Date()
      };
    }
    
    // Ejecutar cierre
    const resumen = await this.obtenerResumen(tenantId, anio, mes);
    resumen.estado = 'cerrado';
    resumen.puedeCerrar = false;
    
    return {
      exito: true,
      periodo,
      mensaje: 'Período cerrado exitosamente',
      resumen,
      fechaCierre: new Date()
    };
  }

  /**
   * Reabre un período cerrado (requiere permisos especiales)
   */
  static async reabrirPeriodo(tenantId: string, anio: number, mes: number, usuarioId: string, motivo: string): Promise<{ exito: boolean; mensaje: string }> {
    if (!motivo || motivo.length < 10) {
      return { exito: false, mensaje: 'Debe proporcionar un motivo válido para la reapertura (mínimo 10 caracteres)' };
    }
    
    return {
      exito: true,
      mensaje: `Período ${anio}-${mes.toString().padStart(2, '0')} reabierto. Motivo: ${motivo}`
    };
  }

  /**
   * Obtiene historial de acciones del período
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async obtenerHistorial(_tenantId: string, _periodoId: string): Promise<{
    accion: string;
    fecha: Date;
    usuario: string;
    detalles: string;
  }[]> {
    return [
      { accion: 'Período creado', fecha: new Date('2025-12-01'), usuario: 'Sistema', detalles: 'Apertura automática' },
      { accion: 'Pre-cierre ejecutado', fecha: new Date('2025-12-15'), usuario: 'Carlos Mendoza', detalles: '15 campañas validadas' },
      { accion: 'Cierre inicial fallido', fecha: new Date('2025-12-16'), usuario: 'Carlos Mendoza', detalles: '1 campaña sin valor' }
    ];
  }

  /**
   * Genera reporte de cierre en formato exportable
   */
  static async generarReporteCierre(tenantId: string, anio: number, mes: number): Promise<{
    periodo: string;
    generadoEn: Date;
    datos: ResumenPeriodo;
    detalleVentas: { cliente: string; monto: number; campanas: number }[];
    detalleFacturacion: { numero: number; cliente: string; monto: number; estado: string }[];
  }> {
    const resumen = await this.obtenerResumen(tenantId, anio, mes);
    
    return {
      periodo: `${anio}-${mes.toString().padStart(2, '0')}`,
      generadoEn: new Date(),
      datos: resumen,
      detalleVentas: [
        { cliente: 'Empresa ABC', monto: 15000000, campanas: 3 },
        { cliente: 'Servicios XYZ', monto: 8500000, campanas: 2 }
      ],
      detalleFacturacion: [
        { numero: 45678, cliente: 'Empresa ABC', monto: 15000000, estado: 'Emitida' },
        { numero: 45679, cliente: 'Servicios XYZ', monto: 8500000, estado: 'Pendiente' }
      ]
    };
  }
}

export default CierreMensualService;
