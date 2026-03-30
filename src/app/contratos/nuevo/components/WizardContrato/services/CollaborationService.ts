/**
 * 👥 SILEXAR PULSE - Real-Time Collaboration Service TIER 0
 * 
 * @description Sistema de colaboración en tiempo real para contratos.
 * Permite a múltiples usuarios editar, comentar y revisar simultáneamente.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoActividad = 
  | 'viewing'
  | 'editing'
  | 'commenting'
  | 'approving'
  | 'idle';

export interface UsuarioConectado {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  color: string;
  actividad: TipoActividad;
  seccionActual?: string;
  cursorPosicion?: { x: number; y: number };
  ultimaActividad: Date;
  sesionId: string;
}

export interface Comentario {
  id: string;
  contratoId: string;
  seccion: string;
  campoId?: string;
  texto: string;
  autorId: string;
  autorNombre: string;
  autorAvatar?: string;
  fechaCreacion: Date;
  editado: boolean;
  fechaEdicion?: Date;
  resuelto: boolean;
  resueltoPor?: string;
  respuestaAId?: string; // Thread
  reacciones: { emoji: string; usuarioId: string }[];
  menciones: string[];
}

export interface CambioEnTiempoReal {
  id: string;
  contratoId: string;
  campo: string;
  valorAnterior: unknown;
  valorNuevo: unknown;
  usuarioId: string;
  usuarioNombre: string;
  timestamp: Date;
  aplicado: boolean;
}

export interface SesionColaborativa {
  id: string;
  contratoId: string;
  usuariosConectados: UsuarioConectado[];
  cambiosPendientes: CambioEnTiempoReal[];
  comentariosActivos: Comentario[];
  iniciadaEn: Date;
  ultimaActividad: Date;
}

// ═══════════════════════════════════════════════════════════════
// COLORES PARA USUARIOS
// ═══════════════════════════════════════════════════════════════

const COLORES_USUARIO = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#84cc16', // lime
];

// ═══════════════════════════════════════════════════════════════
// MOTOR DE COLABORACIÓN
// ═══════════════════════════════════════════════════════════════

class CollaborationEngine {
  private static instance: CollaborationEngine;
  private sesiones: Map<string, SesionColaborativa> = new Map();
  private listeners: Map<string, ((event: CollaborationEvent) => void)[]> = new Map();
  private wsConnection: WebSocket | null = null;
  private usuarioActual: UsuarioConectado | null = null;

  private constructor() {
    this.inicializarDemoData();
  }

  static getInstance(): CollaborationEngine {
    if (!this.instance) {
      this.instance = new CollaborationEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONEXIÓN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Conecta a una sesión de contrato
   */
  conectar(contratoId: string, usuario: { id: string; nombre: string; email: string }): SesionColaborativa {
    let sesion = this.sesiones.get(contratoId);
    
    if (!sesion) {
      sesion = {
        id: `ses-${Date.now()}`,
        contratoId,
        usuariosConectados: [],
        cambiosPendientes: [],
        comentariosActivos: [],
        iniciadaEn: new Date(),
        ultimaActividad: new Date()
      };
      this.sesiones.set(contratoId, sesion);
    }

    // Verificar si ya está conectado
    const yaConectado = sesion.usuariosConectados.find(u => u.id === usuario.id);
    if (!yaConectado) {
      const nuevoUsuario: UsuarioConectado = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        color: COLORES_USUARIO[sesion.usuariosConectados.length % COLORES_USUARIO.length],
        actividad: 'viewing',
        ultimaActividad: new Date(),
        sesionId: sesion.id
      };
      
      sesion.usuariosConectados.push(nuevoUsuario);
      this.usuarioActual = nuevoUsuario;
      
      this.emitirEvento(contratoId, {
        tipo: 'usuario_conectado',
        usuario: nuevoUsuario,
        timestamp: new Date()
      });
    }

    return sesion;
  }

  /**
   * Desconecta de la sesión
   */
  desconectar(contratoId: string, usuarioId: string): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    const usuario = sesion.usuariosConectados.find(u => u.id === usuarioId);
    if (usuario) {
      sesion.usuariosConectados = sesion.usuariosConectados.filter(u => u.id !== usuarioId);
      
      this.emitirEvento(contratoId, {
        tipo: 'usuario_desconectado',
        usuario,
        timestamp: new Date()
      });

      // Limpiar sesión si no hay usuarios
      if (sesion.usuariosConectados.length === 0) {
        this.sesiones.delete(contratoId);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRESENCIA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene usuarios conectados
   */
  getUsuariosConectados(contratoId: string): UsuarioConectado[] {
    return this.sesiones.get(contratoId)?.usuariosConectados || [];
  }

  /**
   * Actualiza actividad del usuario
   */
  actualizarActividad(contratoId: string, usuarioId: string, actividad: TipoActividad, seccion?: string): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    const usuario = sesion.usuariosConectados.find(u => u.id === usuarioId);
    if (usuario) {
      usuario.actividad = actividad;
      usuario.seccionActual = seccion;
      usuario.ultimaActividad = new Date();
      
      this.emitirEvento(contratoId, {
        tipo: 'actividad_actualizada',
        usuario,
        timestamp: new Date()
      });
    }
  }

  /**
   * Actualiza posición del cursor
   */
  actualizarCursor(contratoId: string, usuarioId: string, posicion: { x: number; y: number }): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    const usuario = sesion.usuariosConectados.find(u => u.id === usuarioId);
    if (usuario) {
      usuario.cursorPosicion = posicion;
      
      this.emitirEvento(contratoId, {
        tipo: 'cursor_movido',
        usuario,
        timestamp: new Date()
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CAMBIOS EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════════

  /**
   * Registra un cambio
   */
  registrarCambio(
    contratoId: string,
    campo: string,
    valorAnterior: unknown,
    valorNuevo: unknown,
    usuarioId: string,
    usuarioNombre: string
  ): CambioEnTiempoReal {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) throw new Error('Sesión no encontrada');

    const cambio: CambioEnTiempoReal = {
      id: `cambio-${Date.now()}`,
      contratoId,
      campo,
      valorAnterior,
      valorNuevo,
      usuarioId,
      usuarioNombre,
      timestamp: new Date(),
      aplicado: false
    };

    sesion.cambiosPendientes.push(cambio);
    
    this.emitirEvento(contratoId, {
      tipo: 'campo_modificado',
      cambio,
      timestamp: new Date()
    });

    return cambio;
  }

  /**
   * Aplica un cambio
   */
  aplicarCambio(contratoId: string, cambioId: string): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    const cambio = sesion.cambiosPendientes.find(c => c.id === cambioId);
    if (cambio) {
      cambio.aplicado = true;
      
      this.emitirEvento(contratoId, {
        tipo: 'cambio_aplicado',
        cambio,
        timestamp: new Date()
      });
    }
  }

  /**
   * Rechaza un cambio
   */
  rechazarCambio(contratoId: string, cambioId: string): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    sesion.cambiosPendientes = sesion.cambiosPendientes.filter(c => c.id !== cambioId);
    
    this.emitirEvento(contratoId, {
      tipo: 'cambio_rechazado',
      cambioId,
      timestamp: new Date()
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // COMENTARIOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Agrega comentario
   */
  agregarComentario(
    contratoId: string,
    seccion: string,
    texto: string,
    autor: { id: string; nombre: string },
    campoId?: string,
    respuestaAId?: string
  ): Comentario {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) throw new Error('Sesión no encontrada');

    // Detectar menciones (@usuario)
    const menciones = texto.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];

    const comentario: Comentario = {
      id: `com-${Date.now()}`,
      contratoId,
      seccion,
      campoId,
      texto,
      autorId: autor.id,
      autorNombre: autor.nombre,
      fechaCreacion: new Date(),
      editado: false,
      resuelto: false,
      respuestaAId,
      reacciones: [],
      menciones
    };

    sesion.comentariosActivos.push(comentario);
    
    this.emitirEvento(contratoId, {
      tipo: 'comentario_agregado',
      comentario,
      timestamp: new Date()
    });

    return comentario;
  }

  /**
   * Obtiene comentarios de una sección
   */
  getComentarios(contratoId: string, seccion?: string): Comentario[] {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return [];

    if (seccion) {
      return sesion.comentariosActivos.filter(c => c.seccion === seccion);
    }
    return sesion.comentariosActivos;
  }

  /**
   * Resuelve un comentario
   */
  resolverComentario(contratoId: string, comentarioId: string, resueltoPor: string): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    const comentario = sesion.comentariosActivos.find(c => c.id === comentarioId);
    if (comentario) {
      comentario.resuelto = true;
      comentario.resueltoPor = resueltoPor;
      
      this.emitirEvento(contratoId, {
        tipo: 'comentario_resuelto',
        comentario,
        timestamp: new Date()
      });
    }
  }

  /**
   * Agrega reacción a comentario
   */
  agregarReaccion(contratoId: string, comentarioId: string, emoji: string, usuarioId: string): void {
    const sesion = this.sesiones.get(contratoId);
    if (!sesion) return;

    const comentario = sesion.comentariosActivos.find(c => c.id === comentarioId);
    if (comentario) {
      // Toggle reacción
      const existente = comentario.reacciones.findIndex(
        r => r.emoji === emoji && r.usuarioId === usuarioId
      );
      
      if (existente >= 0) {
        comentario.reacciones.splice(existente, 1);
      } else {
        comentario.reacciones.push({ emoji, usuarioId });
      }
      
      this.emitirEvento(contratoId, {
        tipo: 'reaccion_agregada',
        comentario,
        timestamp: new Date()
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENTOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Suscribe a eventos de un contrato
   */
  suscribir(contratoId: string, callback: (event: CollaborationEvent) => void): () => void {
    const listeners = this.listeners.get(contratoId) || [];
    listeners.push(callback);
    this.listeners.set(contratoId, listeners);

    // Devolver función para desuscribir
    return () => {
      const current = this.listeners.get(contratoId) || [];
      this.listeners.set(contratoId, current.filter(cb => cb !== callback));
    };
  }

  private emitirEvento(contratoId: string, evento: CollaborationEvent): void {
    const listeners = this.listeners.get(contratoId) || [];
    listeners.forEach(callback => callback(evento));
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  private inicializarDemoData(): void {
    // Crear sesión de demo con usuarios simulados
    const demoSesion: SesionColaborativa = {
      id: 'ses-demo',
      contratoId: 'ctr-demo',
      usuariosConectados: [
        {
          id: 'user-1',
          nombre: 'Ana García',
          email: 'ana@silexar.cl',
          color: COLORES_USUARIO[1],
          actividad: 'editing',
          seccionActual: 'terminos',
          ultimaActividad: new Date(),
          sesionId: 'ses-demo'
        },
        {
          id: 'user-2',
          nombre: 'Roberto Silva',
          email: 'roberto@silexar.cl',
          color: COLORES_USUARIO[2],
          actividad: 'commenting',
          seccionActual: 'lineas',
          ultimaActividad: new Date(Date.now() - 120000),
          sesionId: 'ses-demo'
        }
      ],
      cambiosPendientes: [],
      comentariosActivos: [
        {
          id: 'com-1',
          contratoId: 'ctr-demo',
          seccion: 'terminos',
          texto: 'El descuento parece alto para este cliente. @Carlos ¿puedes revisar el historial?',
          autorId: 'user-1',
          autorNombre: 'Ana García',
          fechaCreacion: new Date(Date.now() - 300000),
          editado: false,
          resuelto: false,
          reacciones: [{ emoji: '👀', usuarioId: 'user-2' }],
          menciones: ['Carlos']
        }
      ],
      iniciadaEn: new Date(Date.now() - 600000),
      ultimaActividad: new Date()
    };

    this.sesiones.set('ctr-demo', demoSesion);
  }
}

// ═══════════════════════════════════════════════════════════════
// TIPOS DE EVENTOS
// ═══════════════════════════════════════════════════════════════

export interface CollaborationEvent {
  tipo: 
    | 'usuario_conectado'
    | 'usuario_desconectado'
    | 'actividad_actualizada'
    | 'cursor_movido'
    | 'campo_modificado'
    | 'cambio_aplicado'
    | 'cambio_rechazado'
    | 'comentario_agregado'
    | 'comentario_resuelto'
    | 'reaccion_agregada';
  usuario?: UsuarioConectado;
  cambio?: CambioEnTiempoReal;
  comentario?: Comentario;
  cambioId?: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const Collaboration = CollaborationEngine.getInstance();

export function useCollaboration(contratoId: string) {
  return {
    engine: Collaboration,
    conectar: (usuario: { id: string; nombre: string; email: string }) => 
      Collaboration.conectar(contratoId, usuario),
    desconectar: (usuarioId: string) => 
      Collaboration.desconectar(contratoId, usuarioId),
    getUsuarios: () => 
      Collaboration.getUsuariosConectados(contratoId),
    agregarComentario: (seccion: string, texto: string, autor: { id: string; nombre: string }) =>
      Collaboration.agregarComentario(contratoId, seccion, texto, autor),
    getComentarios: (seccion?: string) =>
      Collaboration.getComentarios(contratoId, seccion),
    suscribir: (callback: (event: CollaborationEvent) => void) =>
      Collaboration.suscribir(contratoId, callback)
  };
}
