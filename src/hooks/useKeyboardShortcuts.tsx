/**
 * ⌨️ SILEXAR PULSE - Keyboard Shortcuts Service TIER 0
 * 
 * Atajos de teclado para navegación rápida
 * y acciones frecuentes
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(customShortcuts?: Shortcut[]) {
  const router = useRouter();

  const defaultShortcuts: Shortcut[] = [
    // Navegación
    { key: 'n', ctrl: true, description: 'Nueva cuña', action: () => router.push('/cunas/nuevo') },
    { key: 'd', ctrl: true, description: 'Nuevo activo digital', action: () => router.push('/cunas/digital/nuevo') },
    { key: 'h', ctrl: true, description: 'Ir al inicio', action: () => router.push('/') },
    { key: 'c', ctrl: true, shift: true, description: 'Centro cuñas', action: () => router.push('/cunas') },
    { key: 'p', ctrl: true, shift: true, description: 'Centro digital', action: () => router.push('/cunas/digital') },
    
    // Búsqueda
    { key: 'k', ctrl: true, description: 'Buscar', action: () => {
      const searchInput = document.querySelector('input[type="text"][placeholder*="Buscar"]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }},
    
    // Acciones rápidas
    { key: 's', ctrl: true, description: 'Guardar', action: () => {
      const saveBtn = document.querySelector('button[type="submit"], button:contains("Guardar")') as HTMLButtonElement;
      if (saveBtn) saveBtn.click();
    }},
    
    // Escape para cerrar modales
    { key: 'Escape', description: 'Cerrar/Cancelar', action: () => {
      const closeBtn = document.querySelector('[data-close], .modal-close') as HTMLButtonElement;
      if (closeBtn) closeBtn.click();
    }}
  ];

  const allShortcuts = [...defaultShortcuts, ...(customShortcuts || [])];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignorar si está escribiendo en un input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Solo permitir Escape en inputs
      if (e.key !== 'Escape') return;
    }

    for (const shortcut of allShortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [allShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return allShortcuts;
}

// Componente para mostrar atajos disponibles
export function ShortcutsHelp({ shortcuts }: { shortcuts: Shortcut[] }) {
  return (
    <div className="fixed bottom-20 right-4 z-40 bg-white rounded-xl shadow-2xl p-4 max-w-sm border border-slate-200">
      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
        ⌨️ Atajos de Teclado
      </h4>
      <div className="space-y-2 text-sm">
        {shortcuts.slice(0, 8).map((s, i) => (
          <div key={`${s}-${i}`} className="flex items-center justify-between">
            <span className="text-slate-600">{s.description}</span>
            <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
              {s.ctrl && 'Ctrl+'}
              {s.shift && 'Shift+'}
              {s.alt && 'Alt+'}
              {s.key.toUpperCase()}
            </kbd>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">Presiona ? para ver todos</p>
    </div>
  );
}

export default useKeyboardShortcuts;
