'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid, BarChart3, FileText, Megaphone, Radio,
  Building2, TrendingUp, CreditCard, Clock, Upload,
  Users, Briefcase, Globe, Shield, Settings,
  Calendar, PieChart, Target, Sparkles, Zap,
  Monitor, FolderOpen, Package, Compass, Receipt,
  Home, DollarSign,
} from 'lucide-react';

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

export const ALL_MODULES = [
  { label: 'Dashboard',           path: '/dashboard',            icon: BarChart3,     id: 'dashboard' },
  { label: 'Dashboard Ejecutivo', path: '/dashboard-ejecutivo',  icon: PieChart,      id: 'dashboard-ejecutivo' },
  { label: 'Anunciantes',         path: '/anunciantes',          icon: Building2,     id: 'anunciantes' },
  { label: 'Contratos',           path: '/contratos',            icon: FileText,      id: 'contratos' },
  { label: 'Campañas',            path: '/campanas',             icon: Megaphone,     id: 'campanas' },
  { label: 'Cuñas',               path: '/cunas',                icon: Radio,         id: 'cunas' },
  { label: 'Tandas',              path: '/tandas',               icon: Clock,         id: 'tandas' },
  { label: 'Exportar Pauta',      path: '/exportar-pauta',       icon: Upload,        id: 'exportar-pauta' },
  { label: 'Facturación',         path: '/facturacion',          icon: CreditCard,    id: 'facturacion' },
  { label: 'Vencimientos',        path: '/vencimientos',         icon: Calendar,      id: 'vencimientos' },
  { label: 'Menciones',           path: '/menciones',            icon: TrendingUp,    id: 'menciones' },
  { label: 'Agencias Creativas',  path: '/agencias-creativas',   icon: Sparkles,      id: 'agencias-creativas' },
  { label: 'Agencias Medios',     path: '/agencias-medios',      icon: Globe,         id: 'agencias-medios' },
  { label: 'Cotizador',           path: '/cotizador',            icon: DollarSign,    id: 'cotizador' },
  { label: 'CRM',                 path: '/crm',                  icon: Users,         id: 'crm' },
  { label: 'Propuestas',          path: '/propuestas',           icon: Briefcase,     id: 'propuestas' },
  { label: 'Evidencia',           path: '/evidencia',            icon: FolderOpen,    id: 'evidencia' },
  { label: 'Inventario',          path: '/inventario',           icon: Package,       id: 'inventario' },
  { label: 'Emisoras',            path: '/emisoras',             icon: Monitor,       id: 'emisoras' },
  { label: 'Vendedores',          path: '/vendedores',           icon: Users,         id: 'vendedores' },
  { label: 'Equipos Ventas',      path: '/equipos-ventas',       icon: Target,        id: 'equipos-ventas' },
  { label: 'Centro Mando',        path: '/centro-mando-digital', icon: Compass,       id: 'centro-mando-digital' },
  { label: 'Conciliación',        path: '/conciliacion',         icon: Receipt,       id: 'conciliacion' },
  { label: 'Configuración',       path: '/configuracion',        icon: Settings,      id: 'configuracion' },
  { label: 'Usuarios',            path: '/usuarios',             icon: Shield,        id: 'usuarios' },
  { label: 'Analytics',           path: '/analytics',            icon: PieChart,      id: 'analytics' },
  { label: 'Cierre Mensual',      path: '/cierre-mensual',       icon: Calendar,      id: 'cierre-mensual' },
  { label: 'Cortex',              path: '/cortex',               icon: Zap,           id: 'cortex' },
  { label: 'AI Assistant',        path: '/ai-assistant',         icon: Sparkles,      id: 'ai-assistant' },
  { label: 'Portal Cliente',      path: '/portal-cliente',       icon: Home,          id: 'portal-cliente' },
];

const CONFIG_KEY = 'silexar_navigation_modules';

export function getNavigationConfig(): string[] {
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

export function setNavigationConfig(moduleIds: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(moduleIds));
}

export function ModuleNavMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [enabledIds, setEnabledIds] = useState<string[]>([]);

  useEffect(() => {
    setEnabledIds(getNavigationConfig());
  }, []);

  const modules = ALL_MODULES.filter(m => enabledIds.includes(m.id));
  const currentModule = modules.find(m => pathname?.startsWith(m.path)) ?? null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2.5 rounded-xl transition-all hover:scale-105"
        style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}
        title="Menú de módulos"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-2 z-50 rounded-2xl p-3 w-56 max-h-[70vh] overflow-y-auto neu-scrollbar space-y-1"
            style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-4px -4px 12px ${N.light}` }}
          >
            {modules.map(item => {
              const isActive = pathname?.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => { setOpen(false); router.push(item.path); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-[#6888ff]/10"
                  style={{ color: isActive ? N.accent : N.text }}
                >
                  <item.icon className="w-4 h-4" style={{ color: isActive ? N.accent : N.textSub }} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
