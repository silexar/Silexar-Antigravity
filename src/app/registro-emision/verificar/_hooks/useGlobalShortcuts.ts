/**
 * ⌨️ HOOK: useGlobalShortcuts
 * 
 * Gestiona atajos de teclado globales para eficiencia operativa.
 * 
 * @tier TIER_0_EFFICIENCY
 */

import { useEffect } from 'react';

interface ShortcutActions {
  onNewVerification?: () => void;
  onExport?: () => void;
  onOpenAI?: () => void;
  onCancel?: () => void;
}

export function useGlobalShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+V: Nueva Verificación
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        actions.onNewVerification?.();
        return;
      }

      // Ctrl+Shift+E: Exportar
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        actions.onExport?.();
        return;
      }

      // Ctrl+K: AI Command Bar (ya existente en AICommandBar)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        actions.onOpenAI?.();
        return;
      }

      // Esc: Cancelar
      if (e.key === 'Escape') {
        actions.onCancel?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
