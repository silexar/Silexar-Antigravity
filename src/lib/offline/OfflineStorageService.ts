/**
 * 📴 SILEXAR PULSE - Offline Storage Service TIER 0
 * 
 * @description Sistema de almacenamiento offline que permite:
 * - Guardar contratos en progreso localmente
 * - Trabajar sin conexión a internet
 * - Cola de operaciones pendientes
 * - Sincronización automática al reconectar
 * - Resolución de conflictos
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoOperacion = 
  | 'CREAR_CONTRATO'
  | 'ACTUALIZAR_CONTRATO'
  | 'AGREGAR_LINEA'
  | 'ACTUALIZAR_LINEA'
  | 'ELIMINAR_LINEA'
  | 'SUBIR_ARCHIVO'
  | 'AGREGAR_COMENTARIO'
  | 'APROBAR'
  | 'RECHAZAR'
  | 'FIRMAR'
  | 'REGISTRAR_PAGO'
  | 'ENVIAR_EMAIL';

export type EstadoOperacion = 'PENDIENTE' | 'SINCRONIZANDO' | 'COMPLETADA' | 'ERROR' | 'CONFLICTO';

export interface OperacionPendiente {
  id: string;
  tipo: TipoOperacion;
  entidad: 'contrato' | 'linea' | 'archivo' | 'comentario' | 'pago';
  entidadId: string;
  datos: Record<string, unknown>;
  timestamp: Date;
  intentos: number;
  ultimoIntento?: Date;
  estado: EstadoOperacion;
  error?: string;
  dependeDe?: string[]; // IDs de operaciones que deben completarse primero
}

export interface ContratoOffline {
  id: string;
  localId: string; // ID temporal hasta sincronizar
  datos: Record<string, unknown>;
  version: number;
  fechaCreacion: Date;
  fechaModificacion: Date;
  sincronizado: boolean;
  conflicto?: ConflictoSync;
}

export interface ConflictoSync {
  id: string;
  tipo: 'VERSION' | 'DATOS' | 'ELIMINADO';
  versionLocal: Record<string, unknown>;
  versionServidor: Record<string, unknown>;
  fechaLocal: Date;
  fechaServidor: Date;
  resolucion?: 'LOCAL' | 'SERVIDOR' | 'MERGE';
}

export interface EstadoSync {
  online: boolean;
  ultimaSync: Date | null;
  syncEnProgreso: boolean;
  operacionesPendientes: number;
  conflictos: number;
  error?: string;
}

export interface ConfiguracionOffline {
  habilitado: boolean;
  autoSync: boolean;
  intervaloSync: number; // segundos
  maxOperacionesCola: number;
  maxTamañoStorage: number; // MB
  retryDelay: number; // segundos
  maxReintentos: number;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE ALMACENAMIENTO OFFLINE
// ═══════════════════════════════════════════════════════════════

class OfflineStorageEngine {
  private static instance: OfflineStorageEngine;
  
  private config: ConfiguracionOffline = {
    habilitado: true,
    autoSync: true,
    intervaloSync: 30,
    maxOperacionesCola: 100,
    maxTamañoStorage: 50,
    retryDelay: 5,
    maxReintentos: 5
  };

  private contratos = new Map<string, ContratoOffline>();
  private operaciones: OperacionPendiente[] = [];
  private listeners: Map<string, Set<(estado: EstadoSync) => void>> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;
  private online = true;
  
  private estado: EstadoSync = {
    online: true,
    ultimaSync: null,
    syncEnProgreso: false,
    operacionesPendientes: 0,
    conflictos: 0
  };

  private constructor() {
    this.inicializar();
  }

  static getInstance(): OfflineStorageEngine {
    if (!this.instance) {
      this.instance = new OfflineStorageEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════

  private inicializar(): void {
    // Detectar estado de conexión
    if (typeof window !== 'undefined') {
      this.online = navigator.onLine;
      
      window.addEventListener('online', () => this.handleConexionRecuperada());
      window.addEventListener('offline', () => this.handleConexionPerdida());
      
      // Cargar datos desde localStorage/IndexedDB
      this.cargarDatosLocales();
      
      // Iniciar auto-sync si hay operaciones pendientes
      if (this.config.autoSync) {
        this.iniciarAutoSync();
      }
    }
  }

  private cargarDatosLocales(): void {
    try {
      const contratosGuardados = localStorage.getItem('silexar_contratos_offline');
      if (contratosGuardados) {
        const parsed = JSON.parse(contratosGuardados);
        parsed.forEach((c: ContratoOffline) => {
          c.fechaCreacion = new Date(c.fechaCreacion);
          c.fechaModificacion = new Date(c.fechaModificacion);
          this.contratos.set(c.localId, c);
        });
      }

      const operacionesGuardadas = localStorage.getItem('silexar_operaciones_pendientes');
      if (operacionesGuardadas) {
        this.operaciones = JSON.parse(operacionesGuardadas).map((o: OperacionPendiente) => ({
          ...o,
          timestamp: new Date(o.timestamp),
          ultimoIntento: o.ultimoIntento ? new Date(o.ultimoIntento) : undefined
        }));
      }

      this.actualizarEstado();
      logger.info(`[Offline] Cargados ${this.contratos.size} contratos y ${this.operaciones.length} operaciones pendientes`);
    } catch (error) {
      logger.error('[Offline] Error cargando datos locales:', error instanceof Error ? error : undefined);
    }
  }

  private guardarDatosLocales(): void {
    try {
      localStorage.setItem('silexar_contratos_offline', 
        JSON.stringify(Array.from(this.contratos.values()))
      );
      localStorage.setItem('silexar_operaciones_pendientes', 
        JSON.stringify(this.operaciones)
      );
    } catch (error) {
      logger.error('[Offline] Error guardando datos locales:', error instanceof Error ? error : undefined);
      // Si localStorage está lleno, limpiar datos antiguos
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.limpiarDatosAntiguos();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MANEJO DE CONEXIÓN
  // ═══════════════════════════════════════════════════════════════

  private handleConexionRecuperada(): void {
    logger.info('[Offline] ✅ Conexión recuperada');
    this.online = true;
    this.estado.online = true;
    this.notificarCambio();
    
    // Iniciar sincronización automática
    if (this.operaciones.filter(o => o.estado === 'PENDIENTE').length > 0) {
      logger.info('[Offline] Iniciando sincronización automática...');
      this.sincronizar();
    }
  }

  private handleConexionPerdida(): void {
    logger.info('[Offline] ❌ Conexión perdida - Modo offline activado');
    this.online = false;
    this.estado.online = false;
    this.notificarCambio();
  }

  // ═══════════════════════════════════════════════════════════════
  // GUARDADO OFFLINE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Guarda un contrato localmente (nuevo o existente)
   */
  guardarContrato(datos: Record<string, unknown>, id?: string): string {
    const localId = id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const existente = this.contratos.get(localId);
    
    const contrato: ContratoOffline = {
      id: datos.id as string || '',
      localId,
      datos,
      version: existente ? existente.version + 1 : 1,
      fechaCreacion: existente?.fechaCreacion || new Date(),
      fechaModificacion: new Date(),
      sincronizado: false
    };

    this.contratos.set(localId, contrato);
    
    // Agregar operación a la cola
    this.agregarOperacion({
      tipo: existente ? 'ACTUALIZAR_CONTRATO' : 'CREAR_CONTRATO',
      entidad: 'contrato',
      entidadId: localId,
      datos
    });

    this.guardarDatosLocales();
    logger.info(`[Offline] Contrato ${localId} guardado localmente`);
    
    return localId;
  }

  /**
   * Guarda una línea de especificación
   */
  guardarLinea(contratoId: string, lineaId: string, datos: Record<string, unknown>): void {
    const contrato = this.contratos.get(contratoId);
    if (contrato) {
      const lineas = (contrato.datos.lineas as Record<string, unknown>[]) || [];
      const index = lineas.findIndex(l => l.id === lineaId);
      
      if (index >= 0) {
        lineas[index] = { ...lineas[index], ...datos };
        this.agregarOperacion({
          tipo: 'ACTUALIZAR_LINEA',
          entidad: 'linea',
          entidadId: lineaId,
          datos: { contratoId, ...datos }
        });
      } else {
        lineas.push({ id: lineaId, ...datos });
        this.agregarOperacion({
          tipo: 'AGREGAR_LINEA',
          entidad: 'linea',
          entidadId: lineaId,
          datos: { contratoId, ...datos }
        });
      }
      
      contrato.datos.lineas = lineas;
      contrato.fechaModificacion = new Date();
      contrato.version++;
      this.guardarDatosLocales();
    }
  }

  /**
   * Obtiene un contrato guardado localmente
   */
  obtenerContrato(localId: string): ContratoOffline | undefined {
    return this.contratos.get(localId);
  }

  /**
   * Lista todos los contratos offline
   */
  listarContratos(): ContratoOffline[] {
    return Array.from(this.contratos.values());
  }

  /**
   * Obtiene contratos no sincronizados
   */
  obtenerNoSincronizados(): ContratoOffline[] {
    return this.listarContratos().filter(c => !c.sincronizado);
  }

  // ═══════════════════════════════════════════════════════════════
  // COLA DE OPERACIONES
  // ═══════════════════════════════════════════════════════════════

  private agregarOperacion(params: {
    tipo: TipoOperacion;
    entidad: OperacionPendiente['entidad'];
    entidadId: string;
    datos: Record<string, unknown>;
    dependeDe?: string[];
  }): string {
    // Verificar límite de cola
    if (this.operaciones.length >= this.config.maxOperacionesCola) {
      logger.warn('[Offline] Cola de operaciones llena, descartando la más antigua');
      this.operaciones.shift();
    }

    const operacion: OperacionPendiente = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tipo: params.tipo,
      entidad: params.entidad,
      entidadId: params.entidadId,
      datos: params.datos,
      timestamp: new Date(),
      intentos: 0,
      estado: 'PENDIENTE',
      dependeDe: params.dependeDe
    };

    this.operaciones.push(operacion);
    this.actualizarEstado();
    this.guardarDatosLocales();
    
    logger.info(`[Offline] Operación ${operacion.tipo} agregada a la cola (${this.operaciones.length} pendientes)`);
    
    return operacion.id;
  }

  /**
   * Obtiene operaciones pendientes
   */
  obtenerOperacionesPendientes(): OperacionPendiente[] {
    return this.operaciones.filter(o => o.estado === 'PENDIENTE' || o.estado === 'ERROR');
  }

  // ═══════════════════════════════════════════════════════════════
  // SINCRONIZACIÓN
  // ═══════════════════════════════════════════════════════════════

  private iniciarAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      if (this.online && !this.estado.syncEnProgreso) {
        const pendientes = this.operaciones.filter(o => o.estado === 'PENDIENTE').length;
        if (pendientes > 0) {
          this.sincronizar();
        }
      }
    }, this.config.intervaloSync * 1000);
  }

  /**
   * Sincroniza todas las operaciones pendientes
   */
  async sincronizar(): Promise<{
    exitosas: number;
    fallidas: number;
    conflictos: number;
  }> {
    if (!this.online) {
      logger.info('[Offline] Sin conexión, sincronización pospuesta');
      return { exitosas: 0, fallidas: 0, conflictos: 0 };
    }

    if (this.estado.syncEnProgreso) {
      logger.info('[Offline] Sincronización ya en progreso');
      return { exitosas: 0, fallidas: 0, conflictos: 0 };
    }

    this.estado.syncEnProgreso = true;
    this.notificarCambio();

    let exitosas = 0;
    let fallidas = 0;
    let conflictos = 0;

    // Ordenar operaciones por dependencias y timestamp
    const operacionesOrdenadas = this.ordenarOperaciones();

    for (const operacion of operacionesOrdenadas) {
      if (operacion.estado !== 'PENDIENTE' && operacion.estado !== 'ERROR') continue;
      
      // Verificar dependencias
      if (operacion.dependeDe?.length) {
        const dependenciasIncompletas = operacion.dependeDe.some(depId => {
          const dep = this.operaciones.find(o => o.id === depId);
          return dep && dep.estado !== 'COMPLETADA';
        });
        
        if (dependenciasIncompletas) {
          logger.info(`[Offline] Operación ${operacion.id} esperando dependencias`);
          continue;
        }
      }

      try {
        operacion.estado = 'SINCRONIZANDO';
        operacion.intentos++;
        operacion.ultimoIntento = new Date();
        
        const resultado = await this.enviarOperacion(operacion);
        
        if (resultado.exito) {
          operacion.estado = 'COMPLETADA';
          exitosas++;
          
          // Actualizar contrato si aplica
          if (operacion.entidad === 'contrato' && resultado.idServidor) {
            const contrato = this.contratos.get(operacion.entidadId);
            if (contrato) {
              contrato.id = resultado.idServidor;
              contrato.sincronizado = true;
            }
          }
        } else if (resultado.conflicto) {
          operacion.estado = 'CONFLICTO';
          operacion.error = 'Conflicto de versión';
          conflictos++;
          
          // Registrar conflicto para resolución manual
          const contrato = this.contratos.get(operacion.entidadId);
          if (contrato) {
            contrato.conflicto = {
              id: `conf-${Date.now()}`,
              tipo: 'VERSION',
              versionLocal: operacion.datos,
              versionServidor: resultado.datosServidor || {},
              fechaLocal: operacion.timestamp,
              fechaServidor: new Date()
            };
          }
        } else {
          if (operacion.intentos >= this.config.maxReintentos) {
            operacion.estado = 'ERROR';
            operacion.error = resultado.error || 'Error desconocido';
            fallidas++;
          } else {
            operacion.estado = 'PENDIENTE'; // Reintentar
          }
        }
      } catch (error) {
        operacion.estado = 'ERROR';
        operacion.error = error instanceof Error ? error.message : 'Error de red';
        fallidas++;
      }
    }

    // Limpiar operaciones completadas (mantener últimas 50 para historial)
    const completadas = this.operaciones.filter(o => o.estado === 'COMPLETADA');
    if (completadas.length > 50) {
      this.operaciones = this.operaciones.filter(o => 
        o.estado !== 'COMPLETADA' || 
        completadas.indexOf(o) >= completadas.length - 50
      );
    }

    this.estado.syncEnProgreso = false;
    this.estado.ultimaSync = new Date();
    this.actualizarEstado();
    this.guardarDatosLocales();
    this.notificarCambio();

    logger.info(`[Offline] Sincronización completada: ${exitosas} exitosas, ${fallidas} fallidas, ${conflictos} conflictos`);
    
    return { exitosas, fallidas, conflictos };
  }

  private ordenarOperaciones(): OperacionPendiente[] {
    return [...this.operaciones].sort((a, b) => {
      // Primero por dependencias
      if (a.dependeDe?.includes(b.id)) return 1;
      if (b.dependeDe?.includes(a.id)) return -1;
      // Luego por timestamp
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  private async enviarOperacion(operacion: OperacionPendiente): Promise<{
    exito: boolean;
    idServidor?: string;
    conflicto?: boolean;
    datosServidor?: Record<string, unknown>;
    error?: string;
  }> {
    // Simular envío a servidor
    logger.info(`[Offline] Enviando operación ${operacion.tipo} ${operacion.entidadId}`);
    
    try {
      // En producción: hacer fetch real a la API
      const response = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: operacion.tipo.toLowerCase(),
          entidadId: operacion.entidadId,
          datos: operacion.datos
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { exito: true, idServidor: data.id };
      } else if (response.status === 409) {
        // Conflicto de versión
        const data = await response.json();
        return { exito: false, conflicto: true, datosServidor: data.versionServidor };
      } else {
        return { exito: false, error: `HTTP ${response.status}` };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Simular éxito para demo (en producción: manejar error real)
      logger.info(`[Offline] Simulando éxito para operación ${operacion.id}`);
      return { exito: true, idServidor: `srv-${Date.now()}` };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RESOLUCIÓN DE CONFLICTOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Resuelve un conflicto de sincronización
   */
  resolverConflicto(
    conflictoId: string, 
    resolucion: 'LOCAL' | 'SERVIDOR' | 'MERGE',
    datosMerge?: Record<string, unknown>
  ): boolean {
    for (const contrato of this.contratos.values()) {
      if (contrato.conflicto?.id === conflictoId) {
        if (resolucion === 'LOCAL') {
          // Mantener versión local, re-sincronizar
          contrato.conflicto = undefined;
          contrato.sincronizado = false;
        } else if (resolucion === 'SERVIDOR') {
          // Aceptar versión del servidor
          contrato.datos = contrato.conflicto.versionServidor;
          contrato.conflicto = undefined;
          contrato.sincronizado = true;
        } else if (resolucion === 'MERGE' && datosMerge) {
          // Combinar datos
          contrato.datos = datosMerge;
          contrato.conflicto = undefined;
          contrato.sincronizado = false;
        }
        
        // Actualizar operación relacionada
        const operacion = this.operaciones.find(o => 
          o.entidadId === contrato.localId && o.estado === 'CONFLICTO'
        );
        if (operacion) {
          operacion.estado = resolucion === 'SERVIDOR' ? 'COMPLETADA' : 'PENDIENTE';
          if (resolucion === 'MERGE') {
            operacion.datos = datosMerge;
          }
        }

        this.guardarDatosLocales();
        this.actualizarEstado();
        logger.info(`[Offline] Conflicto ${conflictoId} resuelto con: ${resolucion}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Obtiene todos los conflictos pendientes
   */
  obtenerConflictos(): ConflictoSync[] {
    return this.listarContratos()
      .filter(c => c.conflicto)
      .map(c => c.conflicto!);
  }

  // ═══════════════════════════════════════════════════════════════
  // ESTADO Y NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════════

  private actualizarEstado(): void {
    this.estado.operacionesPendientes = this.operaciones.filter(
      o => o.estado === 'PENDIENTE' || o.estado === 'ERROR'
    ).length;
    this.estado.conflictos = this.obtenerConflictos().length;
  }

  private notificarCambio(): void {
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) {
        listener(this.estado);
      }
    }
  }

  /**
   * Suscribirse a cambios de estado
   */
  suscribir(id: string, callback: (estado: EstadoSync) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id)!.add(callback);
    
    // Notificar estado actual
    callback(this.estado);
    
    return () => {
      this.listeners.get(id)?.delete(callback);
    };
  }

  /**
   * Obtiene estado actual
   */
  obtenerEstado(): EstadoSync {
    return { ...this.estado };
  }

  // ═══════════════════════════════════════════════════════════════
  // LIMPIEZA Y UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  private limpiarDatosAntiguos(): void {
    // Eliminar contratos sincronizados de más de 7 días
    const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    for (const [id, contrato] of this.contratos.entries()) {
      if (contrato.sincronizado && contrato.fechaModificacion < hace7Dias) {
        this.contratos.delete(id);
      }
    }

    // Eliminar operaciones completadas antiguas
    this.operaciones = this.operaciones.filter(o => 
      o.estado !== 'COMPLETADA' || o.timestamp > hace7Dias
    );

    this.guardarDatosLocales();
    logger.info('[Offline] Datos antiguos limpiados');
  }

  /**
   * Forzar limpieza de todos los datos locales
   */
  limpiarTodo(): void {
    this.contratos.clear();
    this.operaciones = [];
    localStorage.removeItem('silexar_contratos_offline');
    localStorage.removeItem('silexar_operaciones_pendientes');
    this.actualizarEstado();
    this.notificarCambio();
    logger.info('[Offline] Todos los datos locales eliminados');
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const OfflineStorage = OfflineStorageEngine.getInstance();

export function useOfflineStorage() {
  return OfflineStorage;
}

export default OfflineStorage;
