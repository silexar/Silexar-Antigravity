'use client'

/**
 * /dashboard — Silexar Pulse TIER 0
 * Paleta oficial: base #dfeaff | acento #6888ff | texto #69738c
 * Toolbar horizontal tipo MediaSales — sin scroll infinito
 */

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Activity, Database, Shield, Zap, TrendingUp, Users,
  FileText, Radio, Building2, BarChart3, RefreshCw,
  Clock, ArrowUpRight, Mic2, CreditCard, UserCheck,
  LayoutDashboard, Settings, LogOut, Bell, Search,
  ChevronDown, Briefcase, Film, Tv2, Layers, CheckCircle,
  AlertTriangle, Calculator, Contact, GitMerge, Palette,
  Package, Globe, Home, CalendarClock, Timer, Sparkles,
  Cpu, Monitor, BarChart2, PlayCircle, UserCog,
  Target, Wrench, BrainCircuit, Link2, DatabaseZap,
  Receipt, UsersRound, Building, Megaphone, Workflow,
  LineChart, TrendingDown, AlertCircle, Settings2,
} from 'lucide-react'
import { useAuth } from '@/components/security-initializer'
import apiClient from '@/lib/api/client'

// ─── Types ───────────────────────────────────────────────────
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  environment: string
  uptime: number
  timestamp: string
  checks: Record<string, { status: string; latencyMs?: number }>
}
interface DashboardMetrics {
  campanas: { total: number; activas: number; valorTotal: number }
  contratos: { total: number; activos: number }
  anunciantes: { total: number; activos: number }
  emisoras: { total: number }
  facturas: { total: number; pendiente: number }
  vendedores: { total: number }
}

// ─── Design Tokens ───────────────────────────────────────────
const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
}

// ─── Shadows ─────────────────────────────────────────────────
const S = {
  raised: `shadow-[8px_8px_16px_${N.dark},-8px_-8px_16px_${N.light}]`,
  sm: `shadow-[4px_4px_8px_${N.dark},-4px_-4px_8px_${N.light}]`,
  inset: `shadow-[inset_4px_4px_8px_${N.dark},inset_-4px_-4px_8px_${N.light}]`,
  insetSm: `shadow-[inset_2px_2px_5px_${N.dark},inset_-2px_-2px_5px_${N.light}]`,
}

// ─── Roles Ejecutivos ────────────────────────────────────────
const EXECUTIVE_ROLES = [
  'ejecutivo_ventas',
  'gerente_comercial',
  'director_ventas',
  'SUPER_CEO',
  'admin',
  'ejecutivo de ventas',
  'gerente comercial',
  'director de ventas',
]

// ─── Navegación Jerárquica ───────────────────────────────────
interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  badge?: string
}
interface NavGroup {
  label: string
  items: NavItem[]
}

// Módulos Fijos (siempre visibles en toolbar) - SOLO DASHBOARD
const FIXED_MODULES: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
]

// API Routes por módulo - organizadas horizontalmente
const API_ROUTES_GROUP: NavGroup[] = [
  {
    label: 'API Auth',
    items: [
      { label: 'auth', icon: Shield, href: '/api/auth', badge: 'POST/GET' },
      { label: 'security', icon: Shield, href: '/api/security', badge: 'POST' },
      { label: 'permisos', icon: Shield, href: '/api/permisos', badge: 'GET' },
      { label: 'roles', icon: Shield, href: '/api/roles', badge: 'GET' },
      { label: 'sso', icon: Shield, href: '/api/sso', badge: 'POST' },
      { label: 'encryption', icon: Shield, href: '/api/encryption', badge: 'POST' },
    ],
  },
  {
    label: 'API Gestión Comercial',
    items: [
      { label: 'anunciantes', icon: Building, href: '/api/anunciantes', badge: 'CRUD' },
      { label: 'agencias-creativas', icon: Briefcase, href: '/api/agencias-creativas', badge: 'CRUD' },
      { label: 'agencias-medios', icon: Target, href: '/api/agencias-medios', badge: 'CRUD' },
      { label: 'campanas', icon: Megaphone, href: '/api/campanas', badge: 'CRUD' },
      { label: 'contratos', icon: FileText, href: '/api/contratos', badge: 'CRUD' },
      { label: 'crm', icon: UsersRound, href: '/api/crm', badge: 'CRUD' },
      { label: 'equipos-ventas', icon: Users, href: '/api/equipos-ventas', badge: 'CRUD' },
      { label: 'vendedores', icon: UserCheck, href: '/api/vendedores', badge: 'CRUD' },
      { label: 'prospeccion', icon: Search, href: '/api/prospeccion-inteligencia', badge: 'AI' },
    ],
  },
  {
    label: 'API Operaciones',
    items: [
      { label: 'tandas', icon: Timer, href: '/api/tandas', badge: 'CRUD' },
      { label: 'emisoras', icon: Radio, href: '/api/emisoras', badge: 'CRUD' },
      { label: 'creatividades', icon: Palette, href: '/api/creatividades', badge: 'CRUD' },
      { label: 'menciones', icon: Mic2, href: '/api/menciones', badge: 'CRUD' },
      { label: 'cunas', icon: Film, href: '/api/cunas', badge: 'CRUD' },
      { label: 'paquetes', icon: Package, href: '/api/paquetes', badge: 'CRUD' },
      { label: 'conciliacion', icon: GitMerge, href: '/api/conciliacion', badge: 'POST' },
      { label: 'registro-emision', icon: Tv2, href: '/api/registro-emision', badge: 'CRUD' },
      { label: 'exportar-pauta', icon: Link2, href: '/api/exportar-pauta', badge: 'POST' },
      { label: 'inventario', icon: Package, href: '/api/inventario', badge: 'CRUD' },
      { label: 'sistemas-playout', icon: PlayCircle, href: '/api/sistemas-playout', badge: 'CRUD' },
    ],
  },
  {
    label: 'API Finanzas',
    items: [
      { label: 'facturacion', icon: CreditCard, href: '/api/facturacion', badge: 'CRUD' },
      { label: 'cierre-mensual', icon: Calculator, href: '/api/cierre-mensual', badge: 'POST' },
      { label: 'vendedores', icon: TrendingUp, href: '/api/vendedores', badge: 'GET' },
      { label: 'informes', icon: LineChart, href: '/api/informes', badge: 'CRUD' },
    ],
  },
  {
    label: 'API Digital & IA',
    items: [
      { label: 'digital', icon: Globe, href: '/api/digital', badge: 'CRUD' },
      { label: 'rrss', icon: Globe, href: '/api/rrss', badge: 'CRUD' },
      { label: 'ai', icon: Cpu, href: '/api/ai', badge: 'AI' },
      { label: 'asistente-ia', icon: Sparkles, href: '/api/asistente-ia', badge: 'AI' },
      { label: 'cortex', icon: BrainCircuit, href: '/api/cortex', badge: 'AI' },
      { label: 'prediccion-demanda', icon: TrendingDown, href: '/api/prediccion-demanda', badge: 'AI' },
      { label: 'automatizaciones', icon: Workflow, href: '/api/automatizaciones', badge: 'CRUD' },
      { label: 'automatizacion-movil', icon: Timer, href: '/api/automatizacion-movil', badge: 'POST' },
    ],
  },
  {
    label: 'API Infraestructura',
    items: [
      { label: 'dashboard', icon: BarChart2, href: '/api/dashboard', badge: 'GET' },
      { label: 'monitoring', icon: Activity, href: '/api/monitoring', badge: 'GET' },
      { label: 'health', icon: CheckCircle, href: '/api/health', badge: 'GET' },
      { label: 'backup', icon: DatabaseZap, href: '/api/backup', badge: 'POST' },
      { label: 'feature-flags', icon: Settings2, href: '/api/feature-flags', badge: 'CRUD' },
      { label: 'providers', icon: Database, href: '/api/providers', badge: 'CRUD' },
      { label: 'tenants', icon: Building, href: '/api/tenants', badge: 'CRUD' },
      { label: 'mobile', icon: Monitor, href: '/api/mobile', badge: 'POST' },
    ],
  },
]

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Ejecutivos',
    items: [
      { label: 'Equipo de Ventas', icon: Users, href: '/equipos-ventas' },
      { label: 'Vendedores', icon: UserCheck, href: '/vendedores' },
      { label: 'Dashboard Ejecutivo', icon: BarChart2, href: '/dashboard-ejecutivo' },
      { label: 'Command Center', icon: Activity, href: '/command-center' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Configuración', icon: Settings, href: '/configuracion' },
      { label: 'Emisoras', icon: Radio, href: '/emisoras' },
      { label: 'Cuñas', icon: Mic2, href: '/cunas' },
      { label: 'Registro Emisión', icon: Tv2, href: '/registro-emision' },
      { label: 'Paquetes', icon: Package, href: '/paquetes' },
      { label: 'Pauta Broadcast', icon: Radio, href: '/pauta-broadcast' },
      { label: 'Creatividades', icon: Palette, href: '/creatividades' },
      { label: 'Agencias de Medios', icon: Target, href: '/agencias-medios' },
      { label: 'Agencias Creativas', icon: Briefcase, href: '/agencias-creativas' },
      { label: 'Materiales', icon: Film, href: '/materiales' },
      { label: 'Inventario', icon: Package, href: '/inventario' },
      { label: 'Tandas', icon: Timer, href: '/tandas' },
      { label: 'Sistemas Playout', icon: PlayCircle, href: '/sistemas-playout' },
      { label: 'Propiedades', icon: Home, href: '/propiedades' },
      { label: 'Vencimientos', icon: CalendarClock, href: '/vencimientos' },
      { label: 'Campañas', icon: Target, href: '/campanas' },
      { label: 'Contratos', icon: FileText, href: '/contratos' },
      { label: 'Anunciantes', icon: Building2, href: '/anunciantes' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Facturación', icon: CreditCard, href: '/facturacion' },
      { label: 'Conciliación', icon: GitMerge, href: '/conciliacion' },
      { label: 'Cierre Mensual', icon: Calculator, href: '/cierre-mensual' },
      { label: 'Informes', icon: LineChart, href: '/informes' },
    ],
  },
  {
    label: 'Digital',
    items: [
      { label: 'RRSS', icon: Globe, href: '/rrss' },
      { label: 'Ecosistema Digital', icon: Monitor, href: '/ecosistema-digital' },
      { label: 'Centro Mando Digital', icon: Monitor, href: '/centro-mando-digital' },
      { label: 'Automatización Móvil', icon: Timer, href: '/automatizacion-movil' },
      { label: 'Plataformas Digitales', icon: Globe, href: '/plataformas-digitales' },
      { label: 'Portal Cliente', icon: Building, href: '/portal-cliente' },
      { label: 'Pauta Broadcast', icon: Radio, href: '/pauta-broadcast' },
      { label: 'Automatizaciones', icon: Workflow, href: '/automatizaciones' },
    ],
  },
  {
    label: 'Inteligencia',
    items: [
      { label: 'Cortex', icon: Cpu, href: '/cortex' },
      { label: 'Inteligencia de Negocios', icon: TrendingUp, href: '/inteligencia-negocios' },
      { label: 'Predicción Demanda', icon: BarChart2, href: '/prediccion-demanda' },
      { label: 'Prospección', icon: Search, href: '/prospeccion-inteligencia' },
      { label: 'Asistente IA (WIL)', icon: Sparkles, href: '/ai-assistant' },
      { label: 'AI Dashboard', icon: BrainCircuit, href: '/ai-dashboard' },
      { label: 'AI UX', icon: Sparkles, href: '/ai-ux' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Admin', icon: UserCog, href: '/admin' },
      { label: 'Super Admin', icon: Shield, href: '/super-admin' },
      { label: 'Admin Cliente', icon: UserCog, href: '/admin-cliente' },
      { label: 'Usuarios', icon: UsersRound, href: '/usuarios' },
      { label: 'Security', icon: Shield, href: '/security' },
      { label: 'Monitoring', icon: Activity, href: '/monitoring' },
    ],
  },
  {
    label: 'CRM & Ventas',
    items: [
      { label: 'CRM', icon: UsersRound, href: '/crm' },
      { label: 'Cotizador', icon: Calculator, href: '/cotizador' },
      { label: 'Propuestas', icon: Layers, href: '/propuestas' },
      { label: 'ERP Integration', icon: Link2, href: '/erp-integration' },
      { label: 'Evidencia', icon: FileText, href: '/evidencia' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', icon: LineChart, href: '/analytics' },
      { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
      { label: 'Dashboard Ejecutivo', icon: BarChart2, href: '/dashboard-ejecutivo' },
    ],
  },
]

const EXECUTIVE_ONLY: NavItem =
  { label: 'Dashboard Ejecutivo', icon: BarChart2, href: '/dashboard-ejecutivo' }

// ─── Metric Card ─────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color, href, loading }: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; color: string; href?: string; loading?: boolean
}) {
  const router = useRouter()
  if (loading) return (
    <div className="p-5 rounded-3xl animate-pulse" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}>
      <div className="w-10 h-10 rounded-2xl mb-4" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
      <div className="h-7 w-12 rounded-lg mb-2" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }} />
      <div className="h-3 w-20 rounded-lg" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }} />
    </div>
  )
  return (
    <button onClick={() => href && router.push(href)}
      className="group p-5 rounded-3xl text-left w-full transition-all duration-300 cursor-pointer"
      style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-2xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: N.accent }} />
      </div>
      <div className="text-2xl font-black mb-1" style={{ color: N.text }}>{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: N.textSub }}>{sub}</div>}
    </button>
  )
}

// ─── Quick Link ───────────────────────────────────────────────
function QuickLink({ label, icon: Icon, href, desc, color }: {
  label: string; icon: React.ElementType; href: string; desc: string; color: string
}) {
  const router = useRouter()
  return (
    <button onClick={() => router.push(href)}
      className="group flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all duration-300"
      style={{ background: N.base, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}
    >
      <div className="p-2.5 rounded-xl flex-shrink-0 transition-all" style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: N.text }}>{label}</p>
        <p className="text-xs truncate" style={{ color: N.textSub }}>{desc}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: N.accent }} />
    </button>
  )
}

// ─── Status Dot ───────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const ok = status === 'healthy'
  const warn = status === 'degraded' || status === 'not_configured'
  const color = ok ? N.accent : warn ? N.textSub : N.textSub
  const label = ok ? 'OK' : warn ? 'Degradado' : 'Error'
  const dotOpacity = ok ? '1' : warn ? '0.7' : '0.5'
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color, opacity: dotOpacity, boxShadow: `0 0 6px ${color}88` }} />
      {label}
    </span>
  )
}

// ─── Dropdown API Routes (con subcategorías) ──────────────────
function ApiDropdown({ isOpen, onToggle }: {
  isOpen: boolean
  onToggle: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen, onToggle])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
        style={{
          background: N.base,
          boxShadow: isOpen
            ? `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`
            : `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`,
          color: isOpen ? N.accent : N.text,
        }}
      >
        <Link2 className="w-3.5 h-3.5" />
        API Routes
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 rounded-2xl overflow-hidden"
          style={{ background: N.base, boxShadow: `8px 8px 20px ${N.dark},-4px -4px 12px ${N.light}` }}
        >
          <div className="p-3 space-y-3 max-h-[450px] overflow-y-auto w-[600px]">
            {API_ROUTES_GROUP.map(group => (
              <div key={group.label}>
                <div className="text-[10px] font-black uppercase tracking-wider mb-2 px-2" style={{ color: N.accent }}>
                  {group.label}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {group.items.map(item => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.href}
                        onClick={() => { window.open(item.href, '_blank'); onToggle() }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                        style={{
                          background: N.base,
                          boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`,
                          color: N.textSub,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
                            ; (e.currentTarget as HTMLElement).style.color = N.text
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`
                            ; (e.currentTarget as HTMLElement).style.color = N.textSub
                        }}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1 py-0.5 rounded font-bold ml-auto"
                            style={{ background: `${N.accent}20`, color: N.accent }}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dropdown Grupo ───────────────────────────────────────────
function GroupDropdown({ group, isOpen, onToggle, showBadge }: {
  group: NavGroup
  isOpen: boolean
  onToggle: () => void
  showBadge?: boolean
}) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen, onToggle])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
        style={{
          background: N.base,
          boxShadow: isOpen
            ? `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`
            : `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`,
          color: isOpen ? N.accent : N.text,
        }}
      >
        {group.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 rounded-2xl overflow-hidden min-w-[240px]"
          style={{ background: N.base, boxShadow: `8px 8px 20px ${N.dark},-4px -4px 12px ${N.light}` }}
        >
          <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); onToggle() }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: N.base,
                    boxShadow: `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`,
                    color: N.textSub,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
                      ; (e.currentTarget as HTMLElement).style.color = N.text
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`
                      ; (e.currentTarget as HTMLElement).style.color = N.textSub
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {showBadge && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                      style={{ background: `${N.accent}20`, color: N.accent }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isExecutive = EXECUTIVE_ROLES.includes(user?.category?.toLowerCase() ?? '')

  const { data: health, isLoading: hLoad, refetch: rHealth, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: async () => {
      const r = await apiClient.get<SystemHealth>('/api/health')
      if (!r.data) throw new Error()
      return r.data
    },
    staleTime: 60_000, refetchInterval: 60_000,
  })

  const { data: metrics, isLoading: mLoad, refetch: rMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      try {
        const r = await apiClient.get<DashboardMetrics>('/api/dashboard/metrics')
        if (r.data && Object.keys(r.data).length > 0) return r.data
      } catch (e) {
        console.log('API metrics fetch failed, using local/mock fallback for TIER 0');
      }
      const ls = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('silexar_anunciantes') || '[]') : [];
      return {
        campanas: { total: 2, activas: 1, valorTotal: 7500000 },
        contratos: { total: 2, activos: 1 },
        anunciantes: { total: ls.length > 0 ? ls.length : 1, activos: ls.filter((a: any) => a.activo !== false).length || 1 },
        emisoras: { total: 5 },
        facturas: { total: 2, pendiente: 1 },
        vendedores: { total: 3 }
      }
    },
    staleTime: 60_000, refetchInterval: 60_000,
  })

  const loading = hLoad || mLoad
  const systemOk = health?.status === 'healthy'
  const lastRefresh = new Date(dataUpdatedAt || Date.now())
  const load = () => { rHealth(); rMetrics() }

  // Cerrar menú usuario al click fuera
  useEffect(() => {
    if (!showUserMenu) return
    const handle = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showUserMenu])

  // Filtro de búsqueda global
  const allNavItems = [
    ...FIXED_MODULES,
    ...(isExecutive ? [EXECUTIVE_ONLY] : []),
    ...NAV_GROUPS.flatMap(g => g.items),
  ]
  const filteredSearch = search.trim()
    ? allNavItems.filter(m => m.label.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div className="min-h-screen flex flex-col" style={{ background: N.base }}>

      {/* ══ TOOLBAR SUPERIOR ═══════════════════════════════════ */}
      <header className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ background: N.base }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
            <Zap className="w-5 h-5" style={{ color: N.accent }} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-black leading-none" style={{ color: N.text }}>Silexar Pulse</p>
            <p className="text-[10px] font-medium" style={{ color: N.textSub }}>Enterprise v2040</p>
          </div>
        </div>

        {/* Módulos Fijos */}
        <div className="hidden lg:flex items-center gap-2">
          {FIXED_MODULES.map(({ label, icon: Icon, href }) => {
            const active = href === '/dashboard'
            return (
              <button key={href} onClick={() => router.push(href)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={active
                  ? { background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.accent }
                  : { background: N.base, boxShadow: `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`, color: N.textSub }
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
                      ; (e.currentTarget as HTMLElement).style.color = N.text
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`
                      ; (e.currentTarget as HTMLElement).style.color = N.textSub
                  }
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Dashboard Ejecutivo (condicional) */}
        {isExecutive && (
          <button onClick={() => router.push(EXECUTIVE_ONLY.href)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{ background: N.base, boxShadow: `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`, color: N.textSub }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
                ; (e.currentTarget as HTMLElement).style.color = N.text
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`
                ; (e.currentTarget as HTMLElement).style.color = N.textSub
            }}
          >
            <BarChart2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{EXECUTIVE_ONLY.label}</span>
          </button>
        )}

        {/* Separator */}
        <div className="h-6 w-px" style={{ background: N.dark }} />

        {/* API Routes Button with submenu */}
        <div className="hidden xl:flex items-center gap-2">
          <ApiDropdown
            isOpen={openGroup === 'API Routes'}
            onToggle={() => setOpenGroup(openGroup === 'API Routes' ? null : 'API Routes')}
          />
        </div>

        {/* Grupos desplegables */}
        <div className="hidden xl:flex items-center gap-2">
          {NAV_GROUPS.map(group => (
            <GroupDropdown
              key={group.label}
              group={group}
              isOpen={openGroup === group.label}
              onToggle={() => setOpenGroup(openGroup === group.label ? null : group.label)}
            />
          ))}
        </div>

        <div className="flex-1" />

        {/* Buscador Global */}
        <div className="relative w-48 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
          <input
            placeholder="Buscar módulo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none transition-all"
            style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}
          />
          {/* Resultados de búsqueda */}
          {search.trim() && (
            <div
              className="absolute top-full right-0 mt-2 z-50 rounded-2xl overflow-hidden w-64"
              style={{ background: N.base, boxShadow: `8px 8px 20px ${N.dark},-4px -4px 12px ${N.light}` }}
            >
              <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                {filteredSearch.length === 0 && (
                  <p className="text-xs text-center py-3" style={{ color: N.textSub }}>Sin resultados</p>
                )}
                {filteredSearch.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); setSearch('') }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: N.base,
                        boxShadow: `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`,
                        color: N.textSub,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
                          ; (e.currentTarget as HTMLElement).style.color = N.text
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`
                          ; (e.currentTarget as HTMLElement).style.color = N.textSub
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <button className="p-2.5 rounded-xl transition-all hidden sm:flex"
          style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
        >
          <Bell className="w-4 h-4" />
        </button>

        <button onClick={load} disabled={loading}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.text }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Actualizar</span>
        </button>

        {/* Usuario */}
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
            style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: N.accent, color: '#fff' }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[11px] font-bold leading-tight" style={{ color: N.text }}>{user?.name || 'Admin'}</p>
              <p className="text-[10px] leading-tight" style={{ color: N.textSub }}>{user?.category || 'SUPER_CEO'}</p>
            </div>
          </button>

          {showUserMenu && (
            <div
              className="absolute top-full right-0 mt-2 z-50 rounded-2xl overflow-hidden w-48"
              style={{ background: N.base, boxShadow: `8px 8px 20px ${N.dark},-4px -4px 12px ${N.light}` }}
            >
              <div className="p-2 space-y-1">
                <button onClick={() => { router.push('/configuracion'); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: N.base, boxShadow: `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`, color: N.textSub }}
                >
                  <Settings className="w-3.5 h-3.5" /> Configuración
                </button>
                <button onClick={() => { logout(); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: N.base, boxShadow: `2px 2px 5px ${N.dark},-2px -2px 5px ${N.light}`, color: N.textSub }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ══ MAIN ═══════════════════════════════════════════════ */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Welcome Hero */}
          <div className="p-6 rounded-3xl relative overflow-hidden" style={{ background: N.accent }}>
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 70%)' }} />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">Sistema Operativo</p>
                <h2 className="text-white text-3xl font-black tracking-tight">Panel de Control · Silexar Pulse</h2>
                <p className="text-white/80 text-sm mt-1">
                  Bienvenido, {user?.name || 'Admin'} · {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · Plataforma Enterprise TIER 0
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    {systemOk ? <CheckCircle className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-white/70" />}
                    <span className="text-white text-xs font-bold">{systemOk ? 'Sistema Operativo' : 'Sistema Degradado'}</span>
                  </div>
                  <p className="text-white/70 text-xs">v{health?.version ?? '2040.5.0'} · {health?.environment ?? 'development'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: N.textSub }}>
              Métricas del Sistema
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard icon={BarChart3} label="Campañas" color={N.accent} value={metrics?.campanas?.total ?? '—'} sub={metrics?.campanas?.activas ? `${metrics.campanas.activas} activas` : undefined} href="/campanas" loading={mLoad} />
              <MetricCard icon={FileText} label="Contratos" color={N.accent} value={metrics?.contratos?.total ?? '—'} sub={metrics?.contratos?.activos ? `${metrics.contratos.activos} activos` : undefined} href="/contratos" loading={mLoad} />
              <MetricCard icon={Building2} label="Anunciantes" color={N.accent} value={metrics?.anunciantes?.total ?? '—'} sub={metrics?.anunciantes?.activos ? `${metrics.anunciantes.activos} activos` : undefined} href="/anunciantes" loading={mLoad} />
              <MetricCard icon={Radio} label="Emisoras" color={N.accent} value={metrics?.emisoras?.total ?? '—'} href="/emisoras" loading={mLoad} />
              <MetricCard icon={TrendingUp} label="Facturación" color={N.accent} value={metrics?.facturas?.total ?? '—'} sub={metrics?.facturas?.pendiente ? `${metrics.facturas.pendiente} pend.` : undefined} href="/facturacion" loading={mLoad} />
              <MetricCard icon={Users} label="Vendedores" color={N.accent} value={metrics?.vendedores?.total ?? '—'} href="/vendedores" loading={mLoad} />
            </div>
          </div>

          {/* System Status + Quick Access */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* System Health */}
            <div className="lg:col-span-2 p-5 rounded-3xl" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.textSub }}>
                  <Activity className="w-4 h-4" />Estado del Sistema
                </h3>
                {health && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${N.accent}15`, color: N.accent }}>
                    {systemOk ? '● Operativo' : '● Degradado'}
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {hLoad
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
                  ))
                  : health
                    ? Object.entries(health.checks).map(([key, check]) => (
                      <div key={key} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: N.base, boxShadow: `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}` }}>
                        <div className="flex items-center gap-2">
                          {key === 'database' && <Database className="w-3.5 h-3.5" style={{ color: N.textSub }} />}
                          {key === 'environment' && <Shield className="w-3.5 h-3.5" style={{ color: N.textSub }} />}
                          {!['database', 'environment'].includes(key) && <Activity className="w-3.5 h-3.5" style={{ color: N.textSub }} />}
                          <span className="text-xs font-semibold capitalize" style={{ color: N.text }}>{key}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusDot status={check.status} />
                          {check.latencyMs !== undefined && <span className="text-xs" style={{ color: N.textSub }}>{check.latencyMs}ms</span>}
                        </div>
                      </div>
                    ))
                    : <p className="text-center text-sm py-4" style={{ color: N.textSub }}>Sin datos</p>
                }
              </div>
              {health && (
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/60 text-xs" style={{ color: N.textSub }}>
                  <Clock className="w-3.5 h-3.5" />
                  {lastRefresh.toLocaleTimeString()}
                  {health.uptime && <> · Uptime: {Math.floor(health.uptime / 3600)}h</>}
                </div>
              )}
            </div>

            {/* Quick Access */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: N.textSub }}>Acceso Rápido a Módulos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickLink label="Cuñas" icon={Mic2} href="/cunas" desc="Producción y gestión de cuñas" color={N.accent} />
                <QuickLink label="Agencias Creativas" icon={Briefcase} href="/agencias-creativas" desc="Agencias y comisiones" color={N.accent} />
                <QuickLink label="Reg. de Emisión" icon={Tv2} href="/registro-emision" desc="Verificación de pauta en aire" color={N.accent} />
                <QuickLink label="Propuestas" icon={Layers} href="/propuestas" desc="Propuestas comerciales" color={N.accent} />
                <QuickLink label="Materiales" icon={Film} href="/materiales" desc="Biblioteca de materiales" color={N.accent} />
                <QuickLink label="Vendedores" icon={UserCheck} href="/vendedores" desc="Performance y objetivos de ventas" color={N.accent} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-6">
            <p className="text-xs font-medium" style={{ color: N.textSub }}>
              Silexar Pulse v{health?.version ?? '2040.5.0'} · {health?.environment ?? 'development'} · Enterprise Platform TIER 0
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
