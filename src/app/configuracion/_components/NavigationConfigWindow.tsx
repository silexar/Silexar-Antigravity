'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid, CheckSquare, Square, Save, X,
  BarChart3, FileText, Megaphone, Radio,
  Building2, TrendingUp, CreditCard, Clock, Upload,
  Users, Briefcase, Globe, Shield, Settings,
  Calendar, PieChart, Target, Sparkles, Zap,
  Monitor, FolderOpen, Package, Compass, Receipt,
  Home, DollarSign,
} from 'lucide-react';
import { FloatingWindow } from '@/components/floating-window';

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const ALL_MODULES = [
  { label: 'Dashboard',           id: 'dashboard',           path: '/dashboard',            icon: BarChart3 },
  { label: 'Dashboard Ejecutivo', id: 'dashboard-ejecutivo', path: '/dashboard-ejecutivo',  icon: PieChart },
  { label: 'Anunciantes',         id: 'anunciantes',         path: '/anunciantes',          icon: Building2 },
  { label: 'Contratos',           id: 'contratos',           path: '/contratos',            icon: FileText },
  { label: 'Campañas',            id: 'campanas',            path: '/campanas',             icon: Megaphone },
  { label: 'Cuñas',               id: 'cunas',               path: '/cunas',                icon: Radio },
  { label: 'Tandas',              id: 'tandas',              path: '/tandas',               icon: Clock },
  { label: 'Exportar Pauta',      id: 'exportar-pauta',      path: '/exportar-pauta',       icon: Upload },
  { label: 'Facturación',         id: 'facturacion',         path: '/facturacion',          icon: CreditCard },
  { label: 'Vencimientos',        id: 'vencimientos',        path: '/vencimientos',         icon: Calendar },
  { label: 'Menciones',           id: 'menciones',           path: '/menciones',            icon: TrendingUp },
  { label: 'Agencias Creativas',  id: 'agencias-creativas',  path: '/agencias-creativas',   icon: Sparkles },
  { label: 'Agencias Medios',     id: 'agencias-medios',     path: '/agencias-medios',      icon: Globe },
  { label: 'Cotizador',           id: 'cotizador',           path: '/cotizador',            icon: DollarSign },
  { label: 'CRM',                 id: 'crm',                 path: '/crm',                  icon: Users },
  { label: 'Propuestas',          id: 'propuestas',          path: '/propuestas',           icon: Briefcase },
  { label: 'Evidencia',           id: 'evidencia',           path: '/evidencia',            icon: FolderOpen },
  { label: 'Inventario',          id: 'inventario',          path: '/inventario',           icon: Package },
  { label: 'Emisoras',            id: 'emisoras',            path: '/emisoras',             icon: Monitor },
  { label: 'Vendedores',          id: 'vendedores',          path: '/vendedores',           icon: Users },
  { label: 'Equipos Ventas',      id: 'equipos-ventas',      path: '/equipos-ventas',       icon: Target },
  { label: 'Centro Mando',        id: 'centro-mando-digital',path: '/centro-mando-digital', icon: Compass },
  { label: 'Conciliación',        id: 'conciliacion',        path: '/conciliacion',         icon: Receipt },
  { label: 'Configuración',       id: 'configuracion',       path: '/configuracion',        icon: Settings },
  { label: 'Usuarios',            id: 'usuarios',             path: '/usuarios',             icon: Shield },
  { label: 'Analytics',           id: 'analytics',           path: '/analytics',            icon: PieChart },
  { label: 'Cierre Mensual',      id: 'cierre-mensual',      path: '/cierre-mensual',       icon: Calendar },
  { label: 'Cortex',              id: 'cortex',              path: '/cortex',               icon: Zap },
  { label: 'AI Assistant',        id: 'ai-assistant',        path: '/ai-assistant',         icon: Sparkles },
  { label: 'Portal Cliente',      id: 'portal-cliente',      path: '/portal-cliente',       icon: Home },
];

const CONFIG_KEY = 'silexar_navigation_modules';

function getConfig(): string[] {
  if (typeof window === 'undefined') return ALL_MODULES.map(m => m.id);
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return ALL_MODULES.map(m => m.id);
}

function setConfig(moduleIds: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(moduleIds));
}

function broadcastChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('storage'));
}

interface NavigationConfigWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationConfigWindow({ isOpen, onClose }: NavigationConfigWindowProps) {
  const [enabled, setEnabled] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnabled(getConfig());
      setSaved(false);
      setHasChanges(false);
    }
  }, [isOpen]);

  const toggle = useCallback((id: string) => {
    setEnabled(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return next;
    });
    setSaved(false);
    setHasChanges(true);
  }, []);

  const selectAll = useCallback(() => {
    setEnabled(ALL_MODULES.map(m => m.id));
    setSaved(false);
    setHasChanges(true);
  }, []);

  const selectNone = useCallback(() => {
    setEnabled([]);
    setSaved(false);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    setConfig(enabled);
    setSaved(true);
    setHasChanges(false);
    broadcastChange();
    setTimeout(() => onClose(), 600);
  }, [enabled, onClose]);

  const handleClose = useCallback(() => {
    if (hasChanges && !saved) {
      if (!confirm('Tienes cambios sin guardar. ¿Cerrar de todos modos?')) return;
    }
    onClose();
  }, [hasChanges, saved, onClose]);

  const handleVentana = useCallback(() => {
    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    window.open(
      '/configuracion/navegacion?popup=1',
      '_blank',
      `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
    );
  }, []);

  return (
    <FloatingWindow
      isOpen={isOpen}
      onClose={handleClose}
      title="Configurar Navegación"
      titleIcon={<LayoutGrid className="w-4 h-4" />}
      badge={{ text: `${enabled.length} / ${ALL_MODULES.length}`, color: N.accent }}
      defaultWidth={720}
      defaultHeight={580}
      minWidth={440}
      minHeight={360}
      showVentanaButton={true}
      onVentanaClick={handleVentana}
      zIndex={70}
    >
      <div className="flex flex-col h-full p-4" style={{ background: N.base }}>
        <style>{`
          .neu-nav-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
          .neu-nav-scroll::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
          .neu-nav-scroll::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
          .neu-nav-scroll::-webkit-scrollbar-thumb:hover { background: #6888ff; }
          .neu-nav-scroll::-webkit-scrollbar-corner { background: #dfeaff; }
        `}</style>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
            >
              Todos
            </button>
            <button
              onClick={selectNone}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
            >
              Ninguno
            </button>
          </div>
          {saved && (
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${N.accent}15`, color: N.accent }}>
              Guardado correctamente
            </span>
          )}
        </div>

        {/* Grid de módulos */}
        <div className="flex-1 overflow-y-auto neu-nav-scroll min-h-0">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2 pb-2">
            {ALL_MODULES.map(mod => {
              const isOn = enabled.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => toggle(mod.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: N.base,
                    boxShadow: isOn
                      ? `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`
                      : `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`,
                  }}
                  title={mod.label}
                >
                  {isOn ? (
                    <CheckSquare className="w-4 h-4 shrink-0" style={{ color: N.accent }} />
                  ) : (
                    <Square className="w-4 h-4 shrink-0" style={{ color: N.textSub }} />
                  )}
                  <mod.icon className="w-3.5 h-3.5 shrink-0" style={{ color: isOn ? N.accent : N.textSub }} />
                  <span className="text-[11px] font-bold truncate" style={{ color: isOn ? N.accent : N.text }}>
                    {mod.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t shrink-0" style={{ borderColor: `${N.dark}40` }}>
          <p className="text-xs font-medium" style={{ color: N.textSub }}>
            {enabled.length} de {ALL_MODULES.length} módulos activos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`, color: N.text }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: N.accent, color: '#fff', boxShadow: `3px 3px 6px ${N.dark},-2px -2px 4px ${N.light}` }}
            >
              <Save className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </FloatingWindow>
  );
}
