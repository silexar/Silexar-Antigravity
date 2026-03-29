/**
 * ⚡ SILEXAR PULSE - Quick Actions Service TIER 0
 * 
 * @description Servicio de acciones rápidas personalizables por usuario.
 * Permite crear atajos, favoritos, y acciones batch para máxima productividad.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoAccionRapida = 
  | 'CREAR_CONTRATO'
  | 'CLONAR_CONTRATO'
  | 'APROBAR_CONTRATO'
  | 'RECHAZAR_CONTRATO'
  | 'ENVIAR_EMAIL'
  | 'GENERAR_PDF'
  | 'AGREGAR_NOTA'
  | 'SUBIR_DOCUMENTO'
  | 'VER_HISTORIAL'
  | 'EXPORTAR'
  | 'BUSCAR_CONTRATO'
  | 'IR_A_DASHBOARD'
  | 'IR_A_PIPELINE'
  | 'IR_A_REPORTES'
  | 'CUSTOM';

export interface AccionRapida {
  id: string;
  tipo: TipoAccionRapida;
  nombre: string;
  descripcion?: string;
  icono: string;
  shortcut?: string; // "Ctrl+N"
  url?: string;
  ejecutarFn?: string; // Nombre de función a ejecutar
  params?: Record<string, unknown>;
  orden: number;
  visible: boolean;
  frecuenciaUso: number;
}

export interface ContratoFavorito {
  id: string;
  contratoId: string;
  numeroContrato: string;
  clienteNombre: string;
  estado: string;
  valorTotal: number;
  fechaAgregado: Date;
  notas?: string;
  etiquetas: string[];
  orden: number;
}

export interface PlantillaContrato {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  datos: {
    tipoContrato?: string;
    terminosPago?: string;
    diasCredito?: number;
    descuentoDefault?: number;
    clausulasIncluidas?: string[];
    lineaPredefinida?: {
      medio: string;
      unidades: number;
    }[];
  };
  creadorId: string;
  creadorNombre: string;
  compartida: boolean;
  vecesUsada: number;
  fechaCreacion: Date;
}

export interface BusquedaReciente {
  id: string;
  query: string;
  filtros?: Record<string, unknown>;
  resultados: number;
  fechaBusqueda: Date;
}

export interface MetricasProductividad {
  usuarioId: string;
  periodo: 'dia' | 'semana' | 'mes';
  fechaInicio: Date;
  fechaFin: Date;
  
  // Contratos
  contratosCreados: number;
  contratosAprobados: number;
  contratosRechazados: number;
  contratosCerrados: number;
  
  // Valores
  valorTotalGestionado: number;
  valorPromedioContrato: number;
  ticketMasAlto: number;
  
  // Tiempos
  tiempoPromedioCreacion: number; // minutos
  tiempoPromedioAprobacion: number;
  tiempoPorEtapa: Record<string, number>;
  
  // Eficiencia
  tasaAprobacion: number; // %
  tasaConversion: number;
  contratosEnPrimeraAprobacion: number; // % que se aprueba a la primera
  
  // Comparativo
  rankingEquipo: number;
  variacionVsSemanaAnterior: number; // %
}

// ═══════════════════════════════════════════════════════════════
// ACCIONES RÁPIDAS DEFAULT
// ═══════════════════════════════════════════════════════════════

const ACCIONES_DEFAULT: AccionRapida[] = [
  {
    id: 'ar-001',
    tipo: 'CREAR_CONTRATO',
    nombre: 'Nuevo contrato',
    descripcion: 'Crear un contrato desde cero',
    icono: 'plus',
    shortcut: 'Ctrl+N',
    url: '/contratos/nuevo',
    orden: 1,
    visible: true,
    frecuenciaUso: 0
  },
  {
    id: 'ar-002',
    tipo: 'BUSCAR_CONTRATO',
    nombre: 'Buscar contrato',
    descripcion: 'Búsqueda rápida de contratos',
    icono: 'search',
    shortcut: 'Ctrl+K',
    orden: 2,
    visible: true,
    frecuenciaUso: 0
  },
  {
    id: 'ar-003',
    tipo: 'IR_A_DASHBOARD',
    nombre: 'Dashboard',
    descripcion: 'Ver mi dashboard personal',
    icono: 'layout-dashboard',
    shortcut: 'Ctrl+D',
    url: '/contratos/mi-dashboard',
    orden: 3,
    visible: true,
    frecuenciaUso: 0
  },
  {
    id: 'ar-004',
    tipo: 'IR_A_PIPELINE',
    nombre: 'Pipeline',
    descripcion: 'Ver pipeline de contratos',
    icono: 'kanban',
    shortcut: 'Ctrl+P',
    url: '/contratos/pipeline',
    orden: 4,
    visible: true,
    frecuenciaUso: 0
  },
  {
    id: 'ar-005',
    tipo: 'EXPORTAR',
    nombre: 'Exportar contratos',
    descripcion: 'Exportar a Excel/PDF',
    icono: 'download',
    shortcut: 'Ctrl+E',
    orden: 5,
    visible: true,
    frecuenciaUso: 0
  }
];

// ═══════════════════════════════════════════════════════════════
// MOTOR DE PRODUCTIVIDAD
// ═══════════════════════════════════════════════════════════════

class ProductivityEngine {
  private static instance: ProductivityEngine;
  private accionesRapidas: Map<string, AccionRapida[]> = new Map();
  private favoritos: Map<string, ContratoFavorito[]> = new Map();
  private plantillas: Map<string, PlantillaContrato[]> = new Map();
  private busquedasRecientes: Map<string, BusquedaReciente[]> = new Map();
  private metricas: Map<string, MetricasProductividad[]> = new Map();

  private constructor() {
    this.inicializarDemoData();
  }

  static getInstance(): ProductivityEngine {
    if (!this.instance) {
      this.instance = new ProductivityEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCIONES RÁPIDAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene acciones rápidas del usuario
   */
  getAccionesRapidas(usuarioId: string): AccionRapida[] {
    return this.accionesRapidas.get(usuarioId) || [...ACCIONES_DEFAULT];
  }

  /**
   * Agrega acción rápida personalizada
   */
  agregarAccionRapida(usuarioId: string, accion: Omit<AccionRapida, 'id' | 'frecuenciaUso'>): AccionRapida {
    const acciones = this.getAccionesRapidas(usuarioId);
    const nueva: AccionRapida = {
      ...accion,
      id: `ar-custom-${Date.now()}`,
      frecuenciaUso: 0
    };
    acciones.push(nueva);
    this.accionesRapidas.set(usuarioId, acciones);
    return nueva;
  }

  /**
   * Incrementa uso de acción (para aprendizaje)
   */
  registrarUsoAccion(usuarioId: string, accionId: string): void {
    const acciones = this.getAccionesRapidas(usuarioId);
    const accion = acciones.find(a => a.id === accionId);
    if (accion) {
      accion.frecuenciaUso++;
      this.accionesRapidas.set(usuarioId, acciones);
    }
  }

  /**
   * Obtiene acciones más usadas
   */
  getAccionesFrecuentes(usuarioId: string, limit = 5): AccionRapida[] {
    return this.getAccionesRapidas(usuarioId)
      .sort((a, b) => b.frecuenciaUso - a.frecuenciaUso)
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════
  // FAVORITOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene contratos favoritos
   */
  getFavoritos(usuarioId: string): ContratoFavorito[] {
    return this.favoritos.get(usuarioId) || [];
  }

  /**
   * Agrega contrato a favoritos
   */
  agregarFavorito(
    usuarioId: string, 
    contrato: { id: string; numero: string; cliente: string; estado: string; valor: number }
  ): ContratoFavorito {
    const favs = this.getFavoritos(usuarioId);
    
    // Verificar si ya existe
    if (favs.some(f => f.contratoId === contrato.id)) {
      throw new Error('Contrato ya está en favoritos');
    }

    const nuevo: ContratoFavorito = {
      id: `fav-${Date.now()}`,
      contratoId: contrato.id,
      numeroContrato: contrato.numero,
      clienteNombre: contrato.cliente,
      estado: contrato.estado,
      valorTotal: contrato.valor,
      fechaAgregado: new Date(),
      etiquetas: [],
      orden: favs.length + 1
    };

    favs.push(nuevo);
    this.favoritos.set(usuarioId, favs);
    return nuevo;
  }

  /**
   * Elimina de favoritos
   */
  eliminarFavorito(usuarioId: string, favoritoId: string): boolean {
    const favs = this.getFavoritos(usuarioId);
    const filtered = favs.filter(f => f.id !== favoritoId);
    this.favoritos.set(usuarioId, filtered);
    return filtered.length < favs.length;
  }

  /**
   * Agrega etiqueta a favorito
   */
  etiquetarFavorito(usuarioId: string, favoritoId: string, etiqueta: string): void {
    const favs = this.getFavoritos(usuarioId);
    const fav = favs.find(f => f.id === favoritoId);
    if (fav && !fav.etiquetas.includes(etiqueta)) {
      fav.etiquetas.push(etiqueta);
      this.favoritos.set(usuarioId, favs);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PLANTILLAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene plantillas disponibles
   */
  getPlantillas(usuarioId: string): PlantillaContrato[] {
    const propias = this.plantillas.get(usuarioId) || [];
    const compartidas = Array.from(this.plantillas.values())
      .flat()
      .filter(p => p.compartida && p.creadorId !== usuarioId);
    return [...propias, ...compartidas];
  }

  /**
   * Crea plantilla desde contrato existente
   */
  crearPlantillaDesdeContrato(
    usuarioId: string,
    usuarioNombre: string,
    nombre: string,
    descripcion: string,
    datosContrato: PlantillaContrato['datos'],
    compartida = false
  ): PlantillaContrato {
    const plantillas = this.plantillas.get(usuarioId) || [];
    
    const nueva: PlantillaContrato = {
      id: `tpl-${Date.now()}`,
      nombre,
      descripcion,
      categoria: 'PERSONALIZADA',
      datos: datosContrato,
      creadorId: usuarioId,
      creadorNombre: usuarioNombre,
      compartida,
      vecesUsada: 0,
      fechaCreacion: new Date()
    };

    plantillas.push(nueva);
    this.plantillas.set(usuarioId, plantillas);
    return nueva;
  }

  /**
   * Usa una plantilla (incrementa contador)
   */
  usarPlantilla(plantillaId: string): PlantillaContrato | null {
    for (const [userId, plantillas] of this.plantillas.entries()) {
      const plantilla = plantillas.find(p => p.id === plantillaId);
      if (plantilla) {
        plantilla.vecesUsada++;
        this.plantillas.set(userId, plantillas);
        return plantilla;
      }
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // BÚSQUEDAS RECIENTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Registra búsqueda
   */
  registrarBusqueda(
    usuarioId: string,
    query: string,
    filtros?: Record<string, unknown>,
    resultados = 0
  ): void {
    const busquedas = this.busquedasRecientes.get(usuarioId) || [];
    
    // Evitar duplicados consecutivos
    if (busquedas[0]?.query === query) return;

    busquedas.unshift({
      id: `search-${Date.now()}`,
      query,
      filtros,
      resultados,
      fechaBusqueda: new Date()
    });

    // Mantener solo las últimas 20
    if (busquedas.length > 20) {
      busquedas.pop();
    }

    this.busquedasRecientes.set(usuarioId, busquedas);
  }

  /**
   * Obtiene búsquedas recientes
   */
  getBusquedasRecientes(usuarioId: string, limit = 10): BusquedaReciente[] {
    return (this.busquedasRecientes.get(usuarioId) || []).slice(0, limit);
  }

  /**
   * Limpia historial de búsquedas
   */
  limpiarBusquedas(usuarioId: string): void {
    this.busquedasRecientes.set(usuarioId, []);
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTRICAS DE PRODUCTIVIDAD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene métricas del usuario
   */
  getMetricas(usuarioId: string, periodo: 'dia' | 'semana' | 'mes' = 'semana'): MetricasProductividad {
    const metricas = this.metricas.get(usuarioId);
    return metricas?.find(m => m.periodo === periodo) || this.generarMetricasMock(usuarioId, periodo);
  }

  /**
   * Calcula ranking del usuario vs equipo
   */
  getRankingEquipo(usuarioId: string): {
    posicion: number;
    total: number;
    top: { nombre: string; valor: number }[];
  } {
    // En producción: calcular vs base de datos
    return {
      posicion: 2,
      total: 15,
      top: [
        { nombre: 'María López', valor: 45 },
        { nombre: 'Carlos Mendoza', valor: 38 },
        { nombre: 'Ana García', valor: 35 }
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // OPERACIONES BATCH
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ejecuta operación en múltiples contratos
   */
  async ejecutarBatch(
    contratoIds: string[],
    operacion: 'aprobar' | 'rechazar' | 'exportar' | 'enviarEmail' | 'cambiarEstado',
    params?: Record<string, unknown>
  ): Promise<{
    exitosos: string[];
    fallidos: { id: string; error: string }[];
    tiempoTotal: number;
  }> {
    const inicio = Date.now();
    const exitosos: string[] = [];
    const fallidos: { id: string; error: string }[] = [];

    for (const id of contratoIds) {
      try {
        // Simular operación
        await new Promise(resolve => setTimeout(resolve, 100));
        exitosos.push(id);
      } catch (error) {
        fallidos.push({ id, error: String(error) });
      }
    }

    return {
      exitosos,
      fallidos,
      tiempoTotal: Date.now() - inicio
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  private generarMetricasMock(usuarioId: string, periodo: 'dia' | 'semana' | 'mes'): MetricasProductividad {
    const ahora = new Date();
    let fechaInicio: Date;
    
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'semana':
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return {
      usuarioId,
      periodo,
      fechaInicio,
      fechaFin: ahora,
      contratosCreados: periodo === 'dia' ? 3 : periodo === 'semana' ? 12 : 45,
      contratosAprobados: periodo === 'dia' ? 2 : periodo === 'semana' ? 8 : 35,
      contratosRechazados: periodo === 'dia' ? 0 : periodo === 'semana' ? 1 : 4,
      contratosCerrados: periodo === 'dia' ? 1 : periodo === 'semana' ? 5 : 20,
      valorTotalGestionado: periodo === 'dia' ? 150000000 : periodo === 'semana' ? 850000000 : 3500000000,
      valorPromedioContrato: 75000000,
      ticketMasAlto: 250000000,
      tiempoPromedioCreacion: 25,
      tiempoPromedioAprobacion: 180,
      tiempoPorEtapa: {
        'BORRADOR': 45,
        'REVISION_INTERNA': 120,
        'APROBACION': 240,
        'FIRMA': 480
      },
      tasaAprobacion: 92,
      tasaConversion: 78,
      contratosEnPrimeraAprobacion: 85,
      rankingEquipo: 2,
      variacionVsSemanaAnterior: 15
    };
  }

  private inicializarDemoData(): void {
    const userId = 'user-demo';
    
    // Acciones rápidas personalizadas
    this.accionesRapidas.set(userId, [
      ...ACCIONES_DEFAULT,
      {
        id: 'ar-custom-1',
        tipo: 'CUSTOM',
        nombre: 'Reporte semanal',
        descripcion: 'Ver mi reporte semanal',
        icono: 'chart-bar',
        shortcut: 'Ctrl+R',
        url: '/contratos/reportes/semanal',
        orden: 6,
        visible: true,
        frecuenciaUso: 15
      }
    ]);

    // Favoritos
    this.favoritos.set(userId, [
      {
        id: 'fav-001',
        contratoId: 'ctr-001',
        numeroContrato: 'CTR-2025-001',
        clienteNombre: 'Banco Chile',
        estado: 'ACTIVO',
        valorTotal: 80000000,
        fechaAgregado: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        etiquetas: ['estratégico', 'Q1'],
        orden: 1
      },
      {
        id: 'fav-002',
        contratoId: 'ctr-002',
        numeroContrato: 'CTR-2025-002',
        clienteNombre: 'Falabella',
        estado: 'EN_APROBACION',
        valorTotal: 120000000,
        fechaAgregado: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        etiquetas: ['urgente'],
        orden: 2
      }
    ]);

    // Plantillas
    this.plantillas.set(userId, [
      {
        id: 'tpl-001',
        nombre: 'Contrato Retail Standard',
        descripcion: 'Plantilla para clientes retail con términos estándar',
        categoria: 'RETAIL',
        datos: {
          tipoContrato: 'NUEVO',
          terminosPago: 'CREDITO',
          diasCredito: 30,
          descuentoDefault: 15,
          clausulasIncluidas: ['EXCLUSIVIDAD', 'RENOVACION_AUTOMATICA']
        },
        creadorId: userId,
        creadorNombre: 'Carlos Mendoza',
        compartida: true,
        vecesUsada: 23,
        fechaCreacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Búsquedas recientes
    this.busquedasRecientes.set(userId, [
      { id: 's-1', query: 'Banco Chile', fechaBusqueda: new Date(), resultados: 5 },
      { id: 's-2', query: 'contratos pendientes firma', fechaBusqueda: new Date(Date.now() - 3600000), resultados: 12 }
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const Productivity = ProductivityEngine.getInstance();

export function useProductivity() {
  return Productivity;
}
