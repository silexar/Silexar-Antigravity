/**
 * ⌨️ SILEXAR PULSE - Keyboard Shortcuts Manager TIER 0
 * 
 * @description Sistema de atajos de teclado profesional para
 * power users con soporte para secuencias y personalización.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

/* eslint-disable react-refresh/only-export-components */
'use client';

import { useEffect, useCallback, useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  descripcion: string;
  categoria: 'navegacion' | 'acciones' | 'edicion' | 'sistema';
  accion: () => void;
  habilitado: boolean;
  global?: boolean;
}

export interface ShortcutSequence {
  id: string;
  secuencia: string[];
  descripcion: string;
  accion: () => void;
  timeout?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEFAULT DE ATAJOS
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _defaultShortcuts: Omit<KeyboardShortcut, 'accion'>[] = [
  // Navegación
  { id: 'nav-dashboard', keys: ['ctrl', 'd'], descripcion: 'Ir a Dashboard', categoria: 'navegacion', habilitado: true, global: true },
  { id: 'nav-pipeline', keys: ['ctrl', 'p'], descripcion: 'Ir a Pipeline', categoria: 'navegacion', habilitado: true, global: true },
  { id: 'nav-analytics', keys: ['ctrl', 'i'], descripcion: 'Ir a Analytics', categoria: 'navegacion', habilitado: true, global: true },
  { id: 'nav-workspace', keys: ['ctrl', 'w'], descripcion: 'Ir a Workspace', categoria: 'navegacion', habilitado: true, global: true },
  
  // Acciones
  { id: 'nuevo-contrato', keys: ['ctrl', 'n'], descripcion: 'Nuevo Contrato', categoria: 'acciones', habilitado: true, global: true },
  { id: 'buscar', keys: ['ctrl', 'f'], descripcion: 'Búsqueda Rápida', categoria: 'acciones', habilitado: true, global: true },
  { id: 'command-center', keys: ['ctrl', 'k'], descripcion: 'Abrir Command Center', categoria: 'acciones', habilitado: true, global: true },
  { id: 'guardar', keys: ['ctrl', 's'], descripcion: 'Guardar', categoria: 'acciones', habilitado: true },
  { id: 'aprobar', keys: ['ctrl', 'shift', 'a'], descripcion: 'Aprobar Contrato', categoria: 'acciones', habilitado: true },
  
  // Edición
  { id: 'deshacer', keys: ['ctrl', 'z'], descripcion: 'Deshacer', categoria: 'edicion', habilitado: true },
  { id: 'rehacer', keys: ['ctrl', 'shift', 'z'], descripcion: 'Rehacer', categoria: 'edicion', habilitado: true },
  { id: 'copiar', keys: ['ctrl', 'c'], descripcion: 'Copiar', categoria: 'edicion', habilitado: true },
  { id: 'pegar', keys: ['ctrl', 'v'], descripcion: 'Pegar', categoria: 'edicion', habilitado: true },
  
  // Sistema
  { id: 'ayuda', keys: ['?'], descripcion: 'Mostrar Ayuda', categoria: 'sistema', habilitado: true, global: true },
  { id: 'cerrar', keys: ['escape'], descripcion: 'Cerrar/Cancelar', categoria: 'sistema', habilitado: true },
  { id: 'refrescar', keys: ['ctrl', 'r'], descripcion: 'Refrescar Datos', categoria: 'sistema', habilitado: true },
];

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE ATAJOS
// ═══════════════════════════════════════════════════════════════

class KeyboardShortcutsManager {
  private static instance: KeyboardShortcutsManager;
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private sequences: Map<string, ShortcutSequence> = new Map();
  private sequenceBuffer: string[] = [];
  private sequenceTimeout: NodeJS.Timeout | null = null;
  private listeners: Set<(event: KeyboardEvent) => void> = new Set();

  private constructor() {
    this.setupGlobalListener();
  }

  static getInstance(): KeyboardShortcutsManager {
    if (!this.instance) {
      this.instance = new KeyboardShortcutsManager();
    }
    return this.instance;
  }

  private setupGlobalListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignorar si está en un input (excepto shortcuts globales)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Construir key pattern
    const keys: string[] = [];
    if (event.ctrlKey || event.metaKey) keys.push('ctrl');
    if (event.shiftKey) keys.push('shift');
    if (event.altKey) keys.push('alt');
    keys.push(event.key.toLowerCase());

    const keyPattern = keys.join('+');

    // Buscar shortcut que coincida
    for (const [, shortcut] of this.shortcuts) {
      if (!shortcut.habilitado) continue;
      if (isInput && !shortcut.global) continue;

      const shortcutPattern = shortcut.keys.join('+');
      if (keyPattern === shortcutPattern) {
        event.preventDefault();
        shortcut.accion();
        return;
      }
    }

    // Manejar secuencias (ej: g g para ir a inicio)
    this.handleSequence(event.key.toLowerCase());
  }

  private handleSequence(key: string): void {
    this.sequenceBuffer.push(key);

    // Reset timeout
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }

    // Verificar secuencias
    const bufferStr = this.sequenceBuffer.join(' ');
    for (const [, sequence] of this.sequences) {
      const sequenceStr = sequence.secuencia.join(' ');
      if (bufferStr === sequenceStr) {
        sequence.accion();
        this.sequenceBuffer = [];
        return;
      }
    }

    // Limpiar buffer después de timeout
    this.sequenceTimeout = setTimeout(() => {
      this.sequenceBuffer = [];
    }, 1000);
  }

  /**
   * Registra un atajo de teclado
   */
  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  /**
   * Registra múltiples atajos
   */
  registerAll(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(s => this.register(s));
  }

  /**
   * Registra una secuencia de teclas
   */
  registerSequence(sequence: ShortcutSequence): void {
    this.sequences.set(sequence.id, sequence);
  }

  /**
   * Desregistra un atajo
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  /**
   * Habilita/deshabilita un atajo
   */
  toggle(id: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.habilitado = enabled;
    }
  }

  /**
   * Obtiene todos los atajos
   */
  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Obtiene atajos por categoría
   */
  getByCategory(categoria: KeyboardShortcut['categoria']): KeyboardShortcut[] {
    return this.getAll().filter(s => s.categoria === categoria);
  }

  /**
   * Obtiene la descripción de las teclas formateada
   */
  formatKeys(keys: string[]): string {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
    
    return keys.map(key => {
      switch (key) {
        case 'ctrl': return isMac ? '⌘' : 'Ctrl';
        case 'shift': return '⇧';
        case 'alt': return isMac ? '⌥' : 'Alt';
        case 'escape': return 'Esc';
        case 'enter': return '↵';
        case 'arrowup': return '↑';
        case 'arrowdown': return '↓';
        case 'arrowleft': return '←';
        case 'arrowright': return '→';
        default: return key.toUpperCase();
      }
    }).join(' + ');
  }
}

export const KeyboardShortcuts = KeyboardShortcutsManager.getInstance();

// ═══════════════════════════════════════════════════════════════
// HOOK PARA COMPONENTES
// ═══════════════════════════════════════════════════════════════

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    shortcuts.forEach(s => KeyboardShortcuts.register(s));
    
    return () => {
      shortcuts.forEach(s => KeyboardShortcuts.unregister(s.id));
    };
  }, [shortcuts]);

  return KeyboardShortcuts;
}

/**
 * Hook para registrar un solo atajo
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options?: { enabled?: boolean; global?: boolean }
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (options?.enabled === false) return;

    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    if (isInput && !options?.global) return;

    const pressedKeys: string[] = [];
    if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl');
    if (event.shiftKey) pressedKeys.push('shift');
    if (event.altKey) pressedKeys.push('alt');
    pressedKeys.push(event.key.toLowerCase());

    const matches = keys.every(k => pressedKeys.includes(k.toLowerCase()));
    if (matches && pressedKeys.length === keys.length) {
      event.preventDefault();
      callback();
    }
  }, [keys, callback, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook para mostrar el panel de ayuda de atajos
 */
export function useShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcut(['?'], () => setIsOpen(true), { global: true });
  useKeyboardShortcut(['escape'], () => setIsOpen(false), { global: true });

  return { isOpen, setIsOpen };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE AYUDA DE ATAJOS
// ═══════════════════════════════════════════════════════════════

export function ShortcutsHelpPanel({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const shortcuts = KeyboardShortcuts.getAll();
  const categorias = ['navegacion', 'acciones', 'edicion', 'sistema'] as const;

  const getCategoriaLabel = (cat: typeof categorias[number]) => {
    switch (cat) {
      case 'navegacion': return '🧭 Navegación';
      case 'acciones': return '⚡ Acciones';
      case 'edicion': return '✏️ Edición';
      case 'sistema': return '⚙️ Sistema';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#F0EDE8]/60 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">⌨️ Atajos de Teclado</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-[#888780]"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {categorias.map(cat => {
            const catShortcuts = shortcuts.filter(s => s.categoria === cat);
            if (catShortcuts.length === 0) return null;
            
            return (
              <div key={cat} className="mb-6">
                <h3 className="font-bold text-slate-600 mb-3">{getCategoriaLabel(cat)}</h3>
                <div className="space-y-2">
                  {catShortcuts.map(shortcut => (
                    <div 
                      key={shortcut.id}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50"
                    >
                      <span className="text-slate-700">{shortcut.descripcion}</span>
                      <kbd className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-mono text-slate-600 shadow-sm">
                        {KeyboardShortcuts.formatKeys(shortcut.keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center text-sm text-[#888780]">
          Presiona <kbd className="px-2 py-0.5 bg-white rounded shadow-sm font-mono">?</kbd> para mostrar este panel
        </div>
      </div>
    </div>
  );
}
