/**
 * ⌨️ SILEXAR PULSE - Hook de Atajos de Teclado 2050
 * 
 * @description Sistema de atajos de teclado global para operaciones
 * rápidas: Undo, Redo, Guardar, Buscar, Play, Delete, etc.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface AtajoTeclado {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  descripcion: string;
  habilitado?: boolean;
}

interface UseAtajosTecladoOptions {
  habilitado?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onGuardar?: () => void;
  onBuscar?: () => void;
  onEliminar?: () => void;
  onDuplicar?: () => void;
  onSeleccionarTodo?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onNuevo?: () => void;
  onCerrar?: () => void;
  atajosPersonalizados?: AtajoTeclado[];
}

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useAtajosTeclado(options: UseAtajosTecladoOptions = {}) {
  const {
    habilitado = true,
    onUndo,
    onRedo,
    onGuardar,
    onBuscar,
    onEliminar,
    onDuplicar,
    onSeleccionarTodo,
    onPlay,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPause: _onPause,
    onNuevo,
    onCerrar,
    atajosPersonalizados = []
  } = options;

  // Estado para mostrar panel de ayuda
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _mostrandoAyudaRef = useRef(false);

  // Construir lista de atajos
  const atajos = useCallback((): AtajoTeclado[] => {
    const lista: AtajoTeclado[] = [];

    // Atajos estándar
    if (onUndo) {
      lista.push({
        key: 'z',
        ctrl: true,
        action: onUndo,
        descripcion: 'Deshacer última acción'
      });
    }

    if (onRedo) {
      lista.push({
        key: 'y',
        ctrl: true,
        action: onRedo,
        descripcion: 'Rehacer acción'
      });
      lista.push({
        key: 'z',
        ctrl: true,
        shift: true,
        action: onRedo,
        descripcion: 'Rehacer acción (alternativo)'
      });
    }

    if (onGuardar) {
      lista.push({
        key: 's',
        ctrl: true,
        action: onGuardar,
        descripcion: 'Guardar cambios'
      });
    }

    if (onBuscar) {
      lista.push({
        key: 'f',
        ctrl: true,
        action: onBuscar,
        descripcion: 'Abrir búsqueda'
      });
    }

    if (onEliminar) {
      lista.push({
        key: 'Delete',
        action: onEliminar,
        descripcion: 'Eliminar selección'
      });
      lista.push({
        key: 'Backspace',
        action: onEliminar,
        descripcion: 'Eliminar selección'
      });
    }

    if (onDuplicar) {
      lista.push({
        key: 'd',
        ctrl: true,
        action: onDuplicar,
        descripcion: 'Duplicar selección'
      });
    }

    if (onSeleccionarTodo) {
      lista.push({
        key: 'a',
        ctrl: true,
        action: onSeleccionarTodo,
        descripcion: 'Seleccionar todo'
      });
    }

    if (onPlay) {
      lista.push({
        key: ' ',
        action: onPlay,
        descripcion: 'Reproducir/Pausar'
      });
    }

    if (onNuevo) {
      lista.push({
        key: 'n',
        ctrl: true,
        action: onNuevo,
        descripcion: 'Nuevo elemento'
      });
    }

    if (onCerrar) {
      lista.push({
        key: 'Escape',
        action: onCerrar,
        descripcion: 'Cerrar diálogo/panel'
      });
    }

    // Agregar atajos personalizados
    return [...lista, ...atajosPersonalizados];
  }, [onUndo, onRedo, onGuardar, onBuscar, onEliminar, onDuplicar, onSeleccionarTodo, onPlay, onNuevo, onCerrar, atajosPersonalizados]);

  // Manejador de eventos
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!habilitado) return;

    // Ignorar si está en un input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Solo permitir Escape en inputs
      if (event.key !== 'Escape') return;
    }

    const atajosActuales = atajos();

    for (const atajo of atajosActuales) {
      if (atajo.habilitado === false) continue;

      const keyMatch = event.key.toLowerCase() === atajo.key.toLowerCase() || 
                       event.key === atajo.key;
      const ctrlMatch = atajo.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const shiftMatch = atajo.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = atajo.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        event.stopPropagation();
        atajo.action();
        break;
      }
    }
  }, [habilitado, atajos]);

  // Registrar evento
  useEffect(() => {
    if (habilitado) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [habilitado, handleKeyDown]);

  // Obtener texto del atajo
  const getAtajoTexto = (atajo: AtajoTeclado): string => {
    const partes: string[] = [];
    if (atajo.ctrl) partes.push('Ctrl');
    if (atajo.shift) partes.push('Shift');
    if (atajo.alt) partes.push('Alt');
    
    const keyName = atajo.key === ' ' ? 'Espacio' : atajo.key.toUpperCase();
    partes.push(keyName);
    
    return partes.join('+');
  };

  return {
    atajos: atajos(),
    getAtajoTexto
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE AYUDA DE ATAJOS
// ═══════════════════════════════════════════════════════════════

export const ATAJOS_OPERADOR: AtajoTeclado[] = [
  { key: 'z', ctrl: true, action: () => {}, descripcion: 'Deshacer última acción' },
  { key: 'y', ctrl: true, action: () => {}, descripcion: 'Rehacer acción' },
  { key: 's', ctrl: true, action: () => {}, descripcion: 'Guardar cambios' },
  { key: 'f', ctrl: true, action: () => {}, descripcion: 'Buscar cuña/campaña' },
  { key: 'd', ctrl: true, action: () => {}, descripcion: 'Duplicar selección' },
  { key: 'a', ctrl: true, action: () => {}, descripcion: 'Seleccionar todo' },
  { key: ' ', action: () => {}, descripcion: 'Reproducir/Pausar cuña' },
  { key: 'Delete', action: () => {}, descripcion: 'Eliminar selección' },
  { key: 'Escape', action: () => {}, descripcion: 'Cerrar diálogo' },
  { key: 'n', ctrl: true, action: () => {}, descripcion: 'Nueva campaña/cuña' },
  { key: 'Enter', action: () => {}, descripcion: 'Confirmar acción' },
  { key: 'ArrowUp', action: () => {}, descripcion: 'Mover arriba' },
  { key: 'ArrowDown', action: () => {}, descripcion: 'Mover abajo' },
];

export default useAtajosTeclado;
