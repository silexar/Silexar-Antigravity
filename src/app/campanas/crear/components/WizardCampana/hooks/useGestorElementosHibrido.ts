/**
 * 🎛️ SILEXAR PULSE - Hook Gestor de Elementos Híbrido 2050
 * 
 * @description Hook maestro para gestionar elementos programados
 * tanto FM como Digital con soporte para operaciones masivas,
 * undo/redo, y sincronización.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  ElementoProgramado,
  TipoContenido,
  MedioCampana,
  EstadoElemento,
  PrioridadElemento,
  FiltrosElementos,
  HistorialCambio,
  TipoAccion,
  ContenidoElemento,
  HorarioElemento,
  TargetingCompleto,
  ConfiguracionTracking
} from '../types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const MAX_HISTORIAL = 50;  // Máximo de acciones en historial para undo

// ═══════════════════════════════════════════════════════════════
// TIPOS DEL HOOK
// ═══════════════════════════════════════════════════════════════

export interface OpcionesGestorElementos {
  campanaId: string;
  elementosIniciales?: ElementoProgramado[];
  onCambio?: (elementos: ElementoProgramado[]) => void;
  onError?: (error: string) => void;
  autoGuardar?: boolean;
}

export interface NuevoElementoInput {
  medio: MedioCampana;
  tipo: TipoContenido;
  contenido: ContenidoElemento;
  horario: HorarioElemento;
  targeting?: TargetingCompleto;
  tracking?: ConfiguracionTracking;
  prioridad?: PrioridadElemento;
}

export interface ResultadoOperacion {
  exito: boolean;
  mensaje: string;
  elementosAfectados: string[];
}

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useGestorElementosHibrido(opciones: OpcionesGestorElementos) {
  const {
    campanaId,
    elementosIniciales = [],
    onCambio,
    onError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    autoGuardar = true
  } = opciones;

  // ═════════════════════════════════════════════════════════════
  // ESTADO
  // ═════════════════════════════════════════════════════════════

  const [elementos, setElementos] = useState<ElementoProgramado[]>(elementosIniciales);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [filtros, setFiltros] = useState<FiltrosElementos>({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Historial para undo/redo
  const [historial, setHistorial] = useState<HistorialCambio[]>([]);
  const [indiceHistorial, setIndiceHistorial] = useState(-1);
  
  // Ref para último ID generado
  const contadorId = useRef(0);

  // ═════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═════════════════════════════════════════════════════════════

  const generarId = useCallback((): string => {
    contadorId.current += 1;
    return `elem_${Date.now()}_${contadorId.current}`;
  }, []);

  const agregarAlHistorial = useCallback((
    elementoId: string,
    accion: TipoAccion,
    datosAntes?: Partial<ElementoProgramado>,
    datosDespues?: Partial<ElementoProgramado>,
    descripcion?: string
  ) => {
    const nuevoRegistro: HistorialCambio = {
      id: `hist_${Date.now()}`,
      elementoId,
      accion,
      usuarioId: 'usr_actual', // TODO: Obtener del contexto de auth
      usuarioNombre: 'Usuario Actual',
      timestamp: new Date().toISOString(),
      datosAntes,
      datosDespues,
      descripcion: descripcion || `${accion} elemento`,
      reversible: accion !== 'eliminar'
    };

    setHistorial(prev => {
      // Truncar historial si estamos en medio y hacemos nueva acción
      const historialTruncado = prev.slice(0, indiceHistorial + 1);
      const nuevoHistorial = [...historialTruncado, nuevoRegistro];
      
      // Mantener máximo de registros
      if (nuevoHistorial.length > MAX_HISTORIAL) {
        nuevoHistorial.shift();
      }
      
      return nuevoHistorial;
    });
    
    setIndiceHistorial(prev => Math.min(prev + 1, MAX_HISTORIAL - 1));
  }, [indiceHistorial]);

  const notificarCambio = useCallback((nuevosElementos: ElementoProgramado[]) => {
    if (onCambio) {
      onCambio(nuevosElementos);
    }
  }, [onCambio]);

  const manejarError = useCallback((mensaje: string) => {
    setError(mensaje);
    if (onError) {
      onError(mensaje);
    }
  }, [onError]);

  // ═════════════════════════════════════════════════════════════
  // OPERACIONES CRUD
  // ═════════════════════════════════════════════════════════════

  /** Agregar nuevo elemento */
  const agregarElemento = useCallback((input: NuevoElementoInput): ResultadoOperacion => {
    try {
      const nuevoElemento: ElementoProgramado = {
        id: generarId(),
        campanaId,
        medio: input.medio,
        tipo: input.tipo,
        contenido: input.contenido,
        horario: input.horario,
        targeting: input.targeting,
        tracking: input.tracking,
        prioridad: input.prioridad || 'normal',
        estado: 'borrador',
        bloqueado: false,
        creadoPor: 'usr_actual',
        creadoEn: new Date().toISOString(),
        version: 1
      };

      setElementos(prev => {
        const nuevos = [...prev, nuevoElemento];
        notificarCambio(nuevos);
        return nuevos;
      });

      agregarAlHistorial(
        nuevoElemento.id,
        'crear',
        undefined,
        nuevoElemento,
        `Creado ${input.tipo} ${input.medio}`
      );

      return {
        exito: true,
        mensaje: 'Elemento creado exitosamente',
        elementosAfectados: [nuevoElemento.id]
      };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear elemento';
      manejarError(mensaje);
      return {
        exito: false,
        mensaje,
        elementosAfectados: []
      };
    }
  }, [campanaId, generarId, agregarAlHistorial, notificarCambio, manejarError]);

  /** Editar elemento existente */
  const editarElemento = useCallback((
    elementoId: string,
    cambios: Partial<ElementoProgramado>
  ): ResultadoOperacion => {
    const elemento = elementos.find(e => e.id === elementoId);
    
    if (!elemento) {
      return {
        exito: false,
        mensaje: 'Elemento no encontrado',
        elementosAfectados: []
      };
    }

    if (elemento.bloqueado) {
      return {
        exito: false,
        mensaje: 'El elemento está bloqueado. Desbloquéelo primero.',
        elementosAfectados: []
      };
    }

    const elementoAntes = { ...elemento };
    const elementoActualizado: ElementoProgramado = {
      ...elemento,
      ...cambios,
      modificadoPor: 'usr_actual',
      modificadoEn: new Date().toISOString(),
      version: elemento.version + 1
    };

    setElementos(prev => {
      const nuevos = prev.map(e => e.id === elementoId ? elementoActualizado : e);
      notificarCambio(nuevos);
      return nuevos;
    });

    agregarAlHistorial(
      elementoId,
      'editar',
      elementoAntes,
      elementoActualizado,
      'Elemento editado'
    );

    return {
      exito: true,
      mensaje: 'Elemento actualizado',
      elementosAfectados: [elementoId]
    };
  }, [elementos, agregarAlHistorial, notificarCambio]);

  /** Eliminar elemento */
  const eliminarElemento = useCallback((elementoId: string): ResultadoOperacion => {
    const elemento = elementos.find(e => e.id === elementoId);
    
    if (!elemento) {
      return {
        exito: false,
        mensaje: 'Elemento no encontrado',
        elementosAfectados: []
      };
    }

    if (elemento.bloqueado) {
      return {
        exito: false,
        mensaje: 'No se puede eliminar un elemento bloqueado',
        elementosAfectados: []
      };
    }

    setElementos(prev => {
      const nuevos = prev.filter(e => e.id !== elementoId);
      notificarCambio(nuevos);
      return nuevos;
    });

    setSeleccionados(prev => {
      const nuevos = new Set(prev);
      nuevos.delete(elementoId);
      return nuevos;
    });

    agregarAlHistorial(
      elementoId,
      'eliminar',
      elemento,
      undefined,
      `Eliminado ${elemento.tipo}`
    );

    return {
      exito: true,
      mensaje: 'Elemento eliminado',
      elementosAfectados: [elementoId]
    };
  }, [elementos, agregarAlHistorial, notificarCambio]);

  /** Duplicar elemento */
  const duplicarElemento = useCallback((elementoId: string): ResultadoOperacion => {
    const elemento = elementos.find(e => e.id === elementoId);
    
    if (!elemento) {
      return {
        exito: false,
        mensaje: 'Elemento no encontrado',
        elementosAfectados: []
      };
    }

    const duplicado: ElementoProgramado = {
      ...elemento,
      id: generarId(),
      estado: 'borrador',
      bloqueado: false,
      bloqueadoPor: undefined,
      fechaBloqueo: undefined,
      motivoBloqueo: undefined,
      creadoPor: 'usr_actual',
      creadoEn: new Date().toISOString(),
      modificadoPor: undefined,
      modificadoEn: undefined,
      version: 1,
      metricas: undefined
    };

    setElementos(prev => {
      const nuevos = [...prev, duplicado];
      notificarCambio(nuevos);
      return nuevos;
    });

    agregarAlHistorial(
      duplicado.id,
      'duplicar',
      undefined,
      duplicado,
      `Duplicado de ${elemento.id}`
    );

    return {
      exito: true,
      mensaje: 'Elemento duplicado',
      elementosAfectados: [duplicado.id]
    };
  }, [elementos, generarId, agregarAlHistorial, notificarCambio]);

  // ═════════════════════════════════════════════════════════════
  // OPERACIONES DE ESTADO
  // ═════════════════════════════════════════════════════════════

  /** Bloquear elemento */
  const bloquearElemento = useCallback((
    elementoId: string,
    motivo?: string
  ): ResultadoOperacion => {
    return editarElemento(elementoId, {
      bloqueado: true,
      bloqueadoPor: 'usr_actual',
      fechaBloqueo: new Date().toISOString(),
      motivoBloqueo: motivo || 'Bloqueado por usuario'
    });
  }, [editarElemento]);

  /** Desbloquear elemento */
  const desbloquearElemento = useCallback((elementoId: string): ResultadoOperacion => {
    const elemento = elementos.find(e => e.id === elementoId);
    
    if (!elemento) {
      return {
        exito: false,
        mensaje: 'Elemento no encontrado',
        elementosAfectados: []
      };
    }

    // Forzar desbloqueo aunque esté bloqueado
    const elementoActualizado: ElementoProgramado = {
      ...elemento,
      bloqueado: false,
      bloqueadoPor: undefined,
      fechaBloqueo: undefined,
      motivoBloqueo: undefined,
      modificadoPor: 'usr_actual',
      modificadoEn: new Date().toISOString()
    };

    setElementos(prev => {
      const nuevos = prev.map(e => e.id === elementoId ? elementoActualizado : e);
      notificarCambio(nuevos);
      return nuevos;
    });

    agregarAlHistorial(elementoId, 'desbloquear', elemento, elementoActualizado);

    return {
      exito: true,
      mensaje: 'Elemento desbloqueado',
      elementosAfectados: [elementoId]
    };
  }, [elementos, agregarAlHistorial, notificarCambio]);

  /** Cambiar estado de elemento */
  const cambiarEstado = useCallback((
    elementoId: string,
    nuevoEstado: EstadoElemento
  ): ResultadoOperacion => {
    return editarElemento(elementoId, { estado: nuevoEstado });
  }, [editarElemento]);

  /** Pausar elemento */
  const pausarElemento = useCallback((elementoId: string): ResultadoOperacion => {
    return cambiarEstado(elementoId, 'pausado');
  }, [cambiarEstado]);

  /** Reactivar elemento */
  const reactivarElemento = useCallback((elementoId: string): ResultadoOperacion => {
    return cambiarEstado(elementoId, 'programado');
  }, [cambiarEstado]);

  // ═════════════════════════════════════════════════════════════
  // OPERACIONES MASIVAS
  // ═════════════════════════════════════════════════════════════

  /** Bloquear múltiples elementos */
  const bloquearSeleccionados = useCallback((motivo?: string): ResultadoOperacion => {
    if (seleccionados.size === 0) {
      return {
        exito: false,
        mensaje: 'No hay elementos seleccionados',
        elementosAfectados: []
      };
    }

    const afectados: string[] = [];
    const errores: string[] = [];

    seleccionados.forEach(id => {
      const resultado = bloquearElemento(id, motivo);
      if (resultado.exito) {
        afectados.push(id);
      } else {
        errores.push(`${id}: ${resultado.mensaje}`);
      }
    });

    return {
      exito: errores.length === 0,
      mensaje: errores.length > 0 
        ? `${afectados.length} bloqueados, ${errores.length} errores`
        : `${afectados.length} elementos bloqueados`,
      elementosAfectados: afectados
    };
  }, [seleccionados, bloquearElemento]);

  /** Desbloquear múltiples elementos */
  const desbloquearSeleccionados = useCallback((): ResultadoOperacion => {
    if (seleccionados.size === 0) {
      return {
        exito: false,
        mensaje: 'No hay elementos seleccionados',
        elementosAfectados: []
      };
    }

    const afectados: string[] = [];

    seleccionados.forEach(id => {
      const resultado = desbloquearElemento(id);
      if (resultado.exito) {
        afectados.push(id);
      }
    });

    return {
      exito: true,
      mensaje: `${afectados.length} elementos desbloqueados`,
      elementosAfectados: afectados
    };
  }, [seleccionados, desbloquearElemento]);

  /** Eliminar múltiples elementos */
  const eliminarSeleccionados = useCallback((): ResultadoOperacion => {
    if (seleccionados.size === 0) {
      return {
        exito: false,
        mensaje: 'No hay elementos seleccionados',
        elementosAfectados: []
      };
    }

    const afectados: string[] = [];
    const bloqueados: string[] = [];

    seleccionados.forEach(id => {
      const elemento = elementos.find(e => e.id === id);
      if (elemento?.bloqueado) {
        bloqueados.push(id);
      } else {
        const resultado = eliminarElemento(id);
        if (resultado.exito) {
          afectados.push(id);
        }
      }
    });

    setSeleccionados(new Set());

    return {
      exito: true,
      mensaje: bloqueados.length > 0
        ? `${afectados.length} eliminados, ${bloqueados.length} bloqueados omitidos`
        : `${afectados.length} elementos eliminados`,
      elementosAfectados: afectados
    };
  }, [seleccionados, elementos, eliminarElemento]);

  /** Duplicar múltiples elementos */
  const duplicarSeleccionados = useCallback((): ResultadoOperacion => {
    if (seleccionados.size === 0) {
      return {
        exito: false,
        mensaje: 'No hay elementos seleccionados',
        elementosAfectados: []
      };
    }

    const afectados: string[] = [];

    seleccionados.forEach(id => {
      const resultado = duplicarElemento(id);
      if (resultado.exito) {
        afectados.push(...resultado.elementosAfectados);
      }
    });

    return {
      exito: true,
      mensaje: `${afectados.length} elementos duplicados`,
      elementosAfectados: afectados
    };
  }, [seleccionados, duplicarElemento]);

  /** Cambiar estado masivo */
  const cambiarEstadoSeleccionados = useCallback((
    nuevoEstado: EstadoElemento
  ): ResultadoOperacion => {
    if (seleccionados.size === 0) {
      return {
        exito: false,
        mensaje: 'No hay elementos seleccionados',
        elementosAfectados: []
      };
    }

    const afectados: string[] = [];

    seleccionados.forEach(id => {
      const resultado = cambiarEstado(id, nuevoEstado);
      if (resultado.exito) {
        afectados.push(id);
      }
    });

    return {
      exito: true,
      mensaje: `${afectados.length} elementos actualizados a ${nuevoEstado}`,
      elementosAfectados: afectados
    };
  }, [seleccionados, cambiarEstado]);

  // ═════════════════════════════════════════════════════════════
  // SELECCIÓN
  // ═════════════════════════════════════════════════════════════

  /** Toggle selección de un elemento */
  const toggleSeleccion = useCallback((elementoId: string) => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(elementoId)) {
        nuevo.delete(elementoId);
      } else {
        nuevo.add(elementoId);
      }
      return nuevo;
    });
  }, []);

  /** Selección con Shift (rango) */
  const seleccionarRango = useCallback((
    elementoId: string,
    elementosFiltrados: ElementoProgramado[]
  ) => {
    if (seleccionados.size === 0) {
      toggleSeleccion(elementoId);
      return;
    }

    // Encontrar el último seleccionado
    const ultimoSeleccionado = Array.from(seleccionados).pop();
    const indiceUltimo = elementosFiltrados.findIndex(e => e.id === ultimoSeleccionado);
    const indiceActual = elementosFiltrados.findIndex(e => e.id === elementoId);

    if (indiceUltimo === -1 || indiceActual === -1) {
      toggleSeleccion(elementoId);
      return;
    }

    const inicio = Math.min(indiceUltimo, indiceActual);
    const fin = Math.max(indiceUltimo, indiceActual);

    const nuevosSeleccionados = new Set(seleccionados);
    for (let i = inicio; i <= fin; i++) {
      nuevosSeleccionados.add(elementosFiltrados[i].id);
    }

    setSeleccionados(nuevosSeleccionados);
  }, [seleccionados, toggleSeleccion]);

  /** Seleccionar todos los elementos filtrados */
  const seleccionarTodos = useCallback(() => {
    const ids = new Set(elementos.map(e => e.id));
    setSeleccionados(ids);
  }, [elementos]);

  /** Deseleccionar todos */
  const limpiarSeleccion = useCallback(() => {
    setSeleccionados(new Set());
  }, []);

  /** Invertir selección */
  const invertirSeleccion = useCallback(() => {
    const nuevos = new Set<string>();
    elementos.forEach(e => {
      if (!seleccionados.has(e.id)) {
        nuevos.add(e.id);
      }
    });
    setSeleccionados(nuevos);
  }, [elementos, seleccionados]);

  // ═════════════════════════════════════════════════════════════
  // UNDO / REDO
  // ═════════════════════════════════════════════════════════════

  const puedeDeshacer = indiceHistorial >= 0;
  const puedeRehacer = indiceHistorial < historial.length - 1;

  const deshacer = useCallback(() => {
    if (!puedeDeshacer) return;

    const registroActual = historial[indiceHistorial];
    
    if (registroActual.accion === 'crear' && registroActual.datosDespues) {
      // Deshacer creación = eliminar
      setElementos(prev => prev.filter(e => e.id !== registroActual.elementoId));
    } else if (registroActual.accion === 'eliminar' && registroActual.datosAntes) {
      // Deshacer eliminación = restaurar
      setElementos(prev => [...prev, registroActual.datosAntes as ElementoProgramado]);
    } else if (registroActual.datosAntes) {
      // Deshacer edición = restaurar datos anteriores
      setElementos(prev => prev.map(e => 
        e.id === registroActual.elementoId 
          ? { ...e, ...registroActual.datosAntes } 
          : e
      ));
    }

    setIndiceHistorial(prev => prev - 1);
  }, [puedeDeshacer, historial, indiceHistorial]);

  const rehacer = useCallback(() => {
    if (!puedeRehacer) return;

    const registroSiguiente = historial[indiceHistorial + 1];
    
    if (registroSiguiente.datosDespues) {
      if (registroSiguiente.accion === 'crear') {
        setElementos(prev => [...prev, registroSiguiente.datosDespues as ElementoProgramado]);
      } else if (registroSiguiente.accion === 'eliminar') {
        setElementos(prev => prev.filter(e => e.id !== registroSiguiente.elementoId));
      } else {
        setElementos(prev => prev.map(e => 
          e.id === registroSiguiente.elementoId 
            ? { ...e, ...registroSiguiente.datosDespues } 
            : e
        ));
      }
    }

    setIndiceHistorial(prev => prev + 1);
  }, [puedeRehacer, historial, indiceHistorial]);

  // ═════════════════════════════════════════════════════════════
  // FILTRADO
  // ═════════════════════════════════════════════════════════════

  const elementosFiltrados = useMemo(() => {
    let resultado = [...elementos];

    // Búsqueda de texto
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(e => {
        const contenidoStr = JSON.stringify(e.contenido).toLowerCase();
        return contenidoStr.includes(busqueda) || 
               e.tipo.toLowerCase().includes(busqueda);
      });
    }

    // Filtrar por medio
    if (filtros.medios && filtros.medios.length > 0) {
      const medios = filtros.medios;
      resultado = resultado.filter(e => medios.includes(e.medio));
    }

    // Filtrar por tipo
    if (filtros.tipos && filtros.tipos.length > 0) {
      const tipos = filtros.tipos;
      resultado = resultado.filter(e => tipos.includes(e.tipo));
    }

    // Filtrar por estado
    if (filtros.estados && filtros.estados.length > 0) {
      const estados = filtros.estados;
      resultado = resultado.filter(e => estados.includes(e.estado));
    }

    // Filtrar por prioridad
    if (filtros.prioridades && filtros.prioridades.length > 0) {
      const prioridades = filtros.prioridades;
      resultado = resultado.filter(e => prioridades.includes(e.prioridad));
    }

    // Filtrar por bloqueado
    if (filtros.bloqueado !== undefined) {
      resultado = resultado.filter(e => e.bloqueado === filtros.bloqueado);
    }

    return resultado;
  }, [elementos, filtros]);

  // ═════════════════════════════════════════════════════════════
  // ESTADÍSTICAS
  // ═════════════════════════════════════════════════════════════

  const estadisticas = useMemo(() => {
    const porMedio = {
      fm: elementos.filter(e => e.medio === 'fm').length,
      digital: elementos.filter(e => e.medio === 'digital').length,
      hibrido: elementos.filter(e => e.medio === 'hibrido').length
    };

    const porEstado = {
      borrador: elementos.filter(e => e.estado === 'borrador').length,
      programado: elementos.filter(e => e.estado === 'programado').length,
      activo: elementos.filter(e => e.estado === 'activo').length,
      pausado: elementos.filter(e => e.estado === 'pausado').length,
      completado: elementos.filter(e => e.estado === 'completado').length,
      bloqueado: elementos.filter(e => e.bloqueado).length
    };

    const porTipo: Record<string, number> = {};
    elementos.forEach(e => {
      porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
    });

    return {
      total: elementos.length,
      seleccionados: seleccionados.size,
      filtrados: elementosFiltrados.length,
      porMedio,
      porEstado,
      porTipo
    };
  }, [elementos, seleccionados, elementosFiltrados]);

  // ═════════════════════════════════════════════════════════════
  // RETORNO
  // ═════════════════════════════════════════════════════════════

  return {
    // Estado
    elementos: elementosFiltrados,
    elementosTodos: elementos,
    seleccionados,
    filtros,
    cargando,
    error,
    estadisticas,
    
    // CRUD
    agregarElemento,
    editarElemento,
    eliminarElemento,
    duplicarElemento,
    
    // Estado de elementos
    bloquearElemento,
    desbloquearElemento,
    cambiarEstado,
    pausarElemento,
    reactivarElemento,
    
    // Operaciones masivas
    bloquearSeleccionados,
    desbloquearSeleccionados,
    eliminarSeleccionados,
    duplicarSeleccionados,
    cambiarEstadoSeleccionados,
    
    // Selección
    toggleSeleccion,
    seleccionarRango,
    seleccionarTodos,
    limpiarSeleccion,
    invertirSeleccion,
    
    // Undo/Redo
    deshacer,
    rehacer,
    puedeDeshacer,
    puedeRehacer,
    historial,
    
    // Filtros
    setFiltros,
    
    // Control
    setCargando,
    limpiarError: () => setError(null)
  };
}

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type GestorElementosRetorno = ReturnType<typeof useGestorElementosHibrido>;
