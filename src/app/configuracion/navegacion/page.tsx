'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LayoutGrid, CheckSquare, Square, Save, ArrowLeft, X,
  BarChart3, FileText, Megaphone, Radio,
  Building2, TrendingUp, CreditCard, Clock, Upload,
  Users, Briefcase, Globe, Shield, Settings,
  Calendar, PieChart, Target, Sparkles, Zap,
  Monitor, FolderOpen, Package, Compass, Receipt,
  Home, DollarSign, Maximize2,
} from 'lucide-react';
import { ModuleNavMenu } from '@/components/module-nav-menu';

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
  { label: 'Usuarios',            id: 'usuarios',            path: '/usuarios',             icon: Shield },
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

export default function NavegacionConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPopup = searchParams.get('popup') === '1';

  const [enabled, setEnabled] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEnabled(getConfig());
  }, []);

  const toggle = (id: string) => {
    setEnabled(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const handleSave = () => {
    setConfig(enabled);
    setSaved(true);
    setTimeout(() => {
      if (isPopup && window.opener) {
        window.close();
      } else {
        router.push('/configuracion');
      }
    }, 800);
  };

  const selectAll = () => setEnabled(ALL_MODULES.map(m => m.id));
  const selectNone = () => setEnabled([]);

  const openWindow = () => {
    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    window.open(
      '/configuracion/navegacion?popup=1',
      '_blank',
      `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: N.base }}>
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
        ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
        ::-webkit-scrollbar-corner { background: #dfeaff; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => isPopup ? window.close() : router.push('/configuracion')}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}
          >
            {isPopup ? <X className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          <ModuleNavMenu />
          <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2" style={{ color: N.text }}>
            <LayoutGrid className="w-5 h-5" style={{ color: N.accent }} />
            Configurar Navegación
          </h1>
        </div>

        {!isPopup && (
          <button
            onClick={openWindow}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}
            title="Abrir en ventana nueva"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ventana</span>
          </button>
        )}
      </div>

      {/* Contador + Acciones */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold" style={{ color: N.textSub }}>
          {enabled.length} de {ALL_MODULES.length} módulos activos
        </p>
        <div className="flex gap-2">
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
      </div>

      {/* Grid fluido de módulos */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
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

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: `${N.dark}40` }}>
        {saved ? (
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${N.accent}15`, color: N.accent }}>
            Guardado correctamente
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => isPopup ? window.close() : router.push('/configuracion')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
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
  );
}
