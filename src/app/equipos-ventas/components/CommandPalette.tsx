/**
 * COMPONENT: COMMAND PALETTE — Global Search (Ctrl+K / Cmd+K)
 * 
 * @description Búsqueda global instantánea estilo Linear/Notion.
 * Permite navegar rápidamente a cualquier deal, contacto, sección,
 * o acción del sistema. Soporta keyboard navigation completa.
 * 
 * Features:
 *   → Atajos de teclado: Ctrl+K/Cmd+K para abrir, Esc para cerrar
 *   → Búsqueda fuzzy por nombre, tipo, sección
 *   → Categorías: Deals, Contactos, Secciones, Acciones
 *   → Selección con flechas ↑↓ y Enter
 *   → Resultados con iconos, shortcuts, y badges
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Users, Target, BarChart3,
  Calendar, DollarSign, Brain, Trophy, Shield,
  Phone, Mail, PieChart, TrendingUp,
  FileText, Settings, Command, CornerDownLeft
} from 'lucide-react';

/* ─── SEARCH ITEMS ────────────────────────────────────────────── */

interface SearchItem {
  id: string;
  label: string;
  category: 'deal' | 'contact' | 'section' | 'action';
  description: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: string;
  badgeColor?: string;
}

const SEARCH_INDEX: SearchItem[] = [
  // Deals
  { id: 'deal-1', label: 'TechCorp SA', category: 'deal', description: '$50K • Propuesta • 60% prob', icon: Target, badge: '🟢', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { id: 'deal-2', label: 'Retail Giant', category: 'deal', description: '$120K • Negociación • 80% prob', icon: Target, badge: '🟡', badgeColor: 'bg-amber-100 text-amber-700' },
  { id: 'deal-3', label: 'Startup Inc', category: 'deal', description: '$15K • Cerrado Won', icon: Target, badge: '✅', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { id: 'deal-4', label: 'HealthTech Labs', category: 'deal', description: '$35K • Discovery', icon: Target, badge: '🔵' },
  { id: 'deal-5', label: 'FinanzasPlus', category: 'deal', description: '$80K • Prospecto nuevo', icon: Target, badge: '🆕' },
  
  // Contacts
  { id: 'c-1', label: 'María González', category: 'contact', description: 'VP Tecnología — TechCorp SA', icon: Users },
  { id: 'c-2', label: 'Carlos Herrera', category: 'contact', description: 'Director Comercial — Retail Giant', icon: Users },
  { id: 'c-3', label: 'Laura Vega', category: 'contact', description: 'CEO — FinanzasPlus', icon: Users },
  { id: 'c-4', label: 'Pedro Ramírez', category: 'contact', description: 'CTO — HealthTech Labs', icon: Users },

  // Sections
  { id: 'sec-home', label: 'Morning Brief', category: 'section', description: 'Resumen IA del día', icon: Brain, shortcut: 'G H' },
  { id: 'sec-pipeline', label: 'Pipeline / Deals', category: 'section', description: 'Mis oportunidades activas', icon: Target, shortcut: 'G P' },
  { id: 'sec-kanban', label: 'Pipeline Kanban', category: 'section', description: 'Vista tablero visual', icon: BarChart3, shortcut: 'G K' },
  { id: 'sec-activity', label: 'Actividad Diaria', category: 'section', description: 'Tracker de llamadas, emails, reuniones', icon: TrendingUp, shortcut: 'G A' },
  { id: 'sec-agenda', label: 'Agenda de Hoy', category: 'section', description: 'Reuniones y eventos', icon: Calendar, shortcut: 'G C' },
  { id: 'sec-comisiones', label: 'Comisiones', category: 'section', description: 'Calculator de comisiones', icon: DollarSign, shortcut: 'G $' },
  { id: 'sec-forecast', label: 'Forecast Colaborativo', category: 'section', description: 'Proyecciones de ventas', icon: PieChart },
  { id: 'sec-coaching', label: 'Coaching & Desarrollo', category: 'section', description: 'Skills y plan de desarrollo', icon: Brain },
  { id: 'sec-leaderboard', label: 'Leaderboard', category: 'section', description: 'Ranking de equipo', icon: Trophy },
  { id: 'sec-security', label: 'Seguridad & RBAC', category: 'section', description: 'Permisos y control', icon: Shield },
  
  // Actions
  { id: 'act-new-deal', label: 'Crear nuevo deal', category: 'action', description: 'Registrar una oportunidad', icon: FileText, shortcut: 'N D' },
  { id: 'act-new-team', label: 'Crear equipo', category: 'action', description: 'Wizard de creación', icon: Users, shortcut: 'N T' },
  { id: 'act-log-call', label: 'Registrar llamada', category: 'action', description: 'Log de actividad', icon: Phone, shortcut: 'L C' },
  { id: 'act-log-email', label: 'Registrar email', category: 'action', description: 'Log de actividad', icon: Mail, shortcut: 'L E' },
  { id: 'act-export', label: 'Exportar datos CSV', category: 'action', description: 'Descargar reporte', icon: FileText, shortcut: 'E X' },
  { id: 'act-dark-mode', label: 'Toggle Dark Mode', category: 'action', description: 'Cambiar tema', icon: Settings, shortcut: 'T D' },
];

const CATEGORY_LABELS: Record<string, string> = {
  deal: '📦 Deals',
  contact: '👤 Contactos',
  section: '📍 Secciones',
  action: '⚡ Acciones',
};

/* ─── COMPONENT ───────────────────────────────────────────── */

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: SearchItem) => void;
}

export const CommandPalette = ({ isOpen, onClose, onSelect }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter results
  const filtered = query.trim()
    ? SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.includes(query.toLowerCase())
      )
    : SEARCH_INDEX;

  // Group by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  const flatResults = Object.values(grouped).flat();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      onSelect?.(flatResults[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [flatResults, selectedIndex, onSelect, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let globalIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-white dark:bg-[#F0EDE8] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 fade-in duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar deals, contactos, secciones, acciones..."
            aria-label="Buscar"
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none"
          />
          <kbd className="hidden md:flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {flatResults.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Search size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">Sin resultados para &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Intenta con otro término</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {/* Category Header */}
                <p className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {CATEGORY_LABELS[category] || category}
                </p>
                {items.map((item) => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => { onSelect?.(item); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-orange-50 dark:bg-orange-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <item.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{item.description}</p>
                      </div>
                      {item.badge && (
                        <span className="text-xs">{item.badge}</span>
                      )}
                      {item.shortcut && (
                        <kbd className="hidden md:inline text-[10px] text-slate-300 dark:text-slate-600 font-mono bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && <CornerDownLeft size={12} className="text-orange-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-2.5 flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">↑↓ navegar</span>
          <span className="flex items-center gap-1"><CornerDownLeft size={9} /> seleccionar</span>
          <span className="flex items-center gap-1">esc cerrar</span>
          <span className="ml-auto flex items-center gap-1">
            <Command size={9} /> Silexar Pulse
          </span>
        </div>
      </div>
    </div>
  );
};

export type { SearchItem };
