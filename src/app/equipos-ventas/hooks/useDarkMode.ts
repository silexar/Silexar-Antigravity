/**
 * HOOK: useDarkMode — Dark Mode con localStorage
 * 
 * @description Hook para toggle de dark mode que persiste la
 * preferencia del usuario en localStorage y aplica la clase
 * 'dark' al wrapper del módulo.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('silexar-dark-mode');
      if (saved === 'true') {
        setIsDark(true);
      } else if (saved === null) {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      }
    } catch { /* SSR safe */ }
  }, []);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('silexar-dark-mode', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
