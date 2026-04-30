'use client';

import { useState, useEffect } from 'react';
import {
  LayoutGrid, Settings2,
} from 'lucide-react';

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const CONFIG_KEY = 'silexar_navigation_modules';

function getConfigCount(): { enabled: number; total: number } {
  const ALL = 30;
  if (typeof window === 'undefined') return { enabled: ALL, total: ALL };
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { enabled: parsed.length, total: ALL };
    }
  } catch { /* ignore */ }
  return { enabled: ALL, total: ALL };
}

interface NavigationConfigPanelProps {
  onOpenWindow?: () => void;
}

export function NavigationConfigPanel({ onOpenWindow }: NavigationConfigPanelProps) {
  const [count, setCount] = useState(getConfigCount());

  useEffect(() => {
    const onStorage = () => setCount(getConfigCount());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="rounded-2xl p-5" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`, border: '1px solid rgba(255,255,255,0.4)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
            <LayoutGrid className="w-5 h-5" style={{ color: N.accent }} />
          </div>
          <div>
            <h3 className="text-base font-black" style={{ color: N.text }}>Navegación de Módulos</h3>
            <p className="text-xs font-medium" style={{ color: N.textSub }}>
              {count.enabled} de {count.total} módulos activos
            </p>
          </div>
        </div>
        <button
          onClick={onOpenWindow}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
          style={{ background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Configurar
        </button>
      </div>
    </div>
  );
}
