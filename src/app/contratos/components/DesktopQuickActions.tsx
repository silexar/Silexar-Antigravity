/**
 * ⚡ DESKTOP: Quick Actions Command Palette
 * 
 * Barra de acciones rápidas tipo Spotlight/Command Palette.
 * Acceso rápido a: Smart Capture, nuevo contrato,
 * buscar cliente, clonar contrato.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, Sparkles, FileText, Copy, Phone,
  Building2, Zap, ArrowRight, Command,
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  categoria: string;
  onExecute: () => void;
}

interface DesktopQuickActionsProps {
  onSmartCapture: () => void;
  onNuevoContrato: () => void;
  onClonarContrato: () => void;
  onBuscarCliente: () => void;
}

export function DesktopQuickActions({
  onSmartCapture, onNuevoContrato, onClonarContrato, onBuscarCliente,
}: DesktopQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: QuickAction[] = [
    { id: 'capture', icon: <Sparkles className="w-4 h-4 text-violet-500" />, label: 'Smart Capture IA', shortcut: 'Ctrl+I', categoria: 'IA', onExecute: onSmartCapture },
    { id: 'nuevo', icon: <FileText className="w-4 h-4 text-indigo-500" />, label: 'Nuevo Contrato', shortcut: 'Ctrl+N', categoria: 'Contratos', onExecute: onNuevoContrato },
    { id: 'clonar', icon: <Copy className="w-4 h-4 text-blue-500" />, label: 'Clonar Contrato Anterior', categoria: 'Contratos', onExecute: onClonarContrato },
    { id: 'buscar', icon: <Building2 className="w-4 h-4 text-emerald-500" />, label: 'Buscar Cliente', shortcut: 'Ctrl+K', categoria: 'Clientes', onExecute: onBuscarCliente },
    { id: 'llamar', icon: <Phone className="w-4 h-4 text-cyan-500" />, label: 'Registrar Llamada', categoria: 'Actividad', onExecute: () => {} },
  ];

  const filtered = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [open]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm text-slate-500 transition group">
        <Search className="w-4 h-4" />
        <span>Acciones rápidas...</span>
        <kbd className="ml-4 px-2 py-0.5 bg-white rounded text-[10px] font-mono text-slate-400 border border-slate-200 group-hover:text-slate-600">
          Ctrl+K
        </kbd>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="neo-card rounded-2xl overflow-hidden">
          {/* SEARCH */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <Command className="w-5 h-5 text-indigo-500" />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Escribe un comando..."
              aria-label="Escribe un comando"
              className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400" />
            <kbd className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-400">ESC</kbd>
          </div>

          {/* ACCIONES */}
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-400">Sin resultados para &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="py-2">
                {filtered.map(a => (
                  <button key={a.id} onClick={() => { setOpen(false); a.onExecute(); }}
                    className="w-full px-5 py-3 flex items-center gap-3 hover:bg-indigo-50 transition text-left group">
                    {a.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{a.label}</p>
                      <p className="text-[10px] text-slate-400">{a.categoria}</p>
                    </div>
                    {a.shortcut && (
                      <kbd className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-400">{a.shortcut}</kbd>
                    )}
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Acciones rápidas</span>
            <span>↑↓ Navegar</span>
            <span>↵ Ejecutar</span>
          </div>
        </div>
      </div>
    </>
  );
}
