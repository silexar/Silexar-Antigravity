'use client';

/**
 * ðŸŽ›ï¸ SILEXAR PULSE - CEO Admin Portal
 * Complete Control Center for CEO/Super Admin
 * 
 * @description Redesigned with proper Neumorphism design system (TIER 0):
 * - CEO Command Center (AI, Modules, Databases, Remote Control)
 * - Client Management (Wizard, License Management)
 * - System Configuration
 * 
 * @version 2025.4.2
 * @tier ENTERPRISE_GRADE
 * @design NEUMORPHISM_TIER_0
 */

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/security-initializer'
import { motion } from 'framer-motion'
import {
  Users, Crown, Activity, Globe, BarChart3, AlertTriangle,
  CheckCircle, Cpu, HardDrive, Brain, Building2, Plus,
  Calendar, DollarSign, Target, Bell, Shield, Settings,
  Database, Zap, TrendingUp, Clock, Server, FileText, X,
  Minus, Maximize2, Search, RefreshCw, Eye, Edit3, Trash2
} from 'lucide-react'

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// TOKENS NEUMORPHISM TIER 0 - VERSIÁ“N CORRECTA CON INLINE STYLES
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  accentHover: '#5572ee',
  text: '#69738c',
  textSub: '#9aa3b8',
}

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// COMPONENTES NEUMORPHISM TIER 0 - CON ESTILOS INLINE
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

function NeuCard({ children, className = '', style = {} }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: N.base,
        boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`,
        ...style
      }}
    >
      {children}
    </div>
  )
}

function NeuCardSmall({ children, className = '', style = {} }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: N.base,
        boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`,
        ...style
      }}
    >
      {children}
    </div>
  )
}

function NeuButton({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  className = '',
  icon: Icon,
  'aria-label': al
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  className?: string
  icon?: React.ElementType
  'aria-label'?: string
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: N.accent,
      color: '#fff',
      boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}`
    },
    secondary: {
      background: N.base,
      color: N.text,
      boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}`
    },
    danger: {
      background: N.base,
      color: N.accent,
      boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`
    },
    ghost: {
      background: 'transparent',
      color: N.textSub
    },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={al}
      className={`flex items-center gap-2 justify-center rounded-2xl font-bold text-sm transition-all duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={styles[variant]}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}

function NeuInput({
  placeholder,
  value,
  onChange,
  icon: Icon,
  type = 'text'
}: {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  icon?: React.ElementType
  type?: string
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: N.textSub }}
        />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={placeholder}
        className="w-full py-3 rounded-2xl text-sm focus:outline-none transition-all"
        style={{
          background: N.base,
          boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`,
          color: N.text,
          paddingLeft: Icon ? '2.5rem' : '1rem',
          paddingRight: '1rem'
        }}
      />
    </div>
  )
}

function NeuSelect({
  value,
  onChange,
  options
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="py-3 px-4 rounded-2xl text-sm focus:outline-none cursor-pointer"
      style={{
        background: N.base,
        boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`,
        color: N.text
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function StatusBadge({ status, label }: { status: 'success' | 'warning' | 'danger' | 'info'; label: string }) {
  // NEUMORPHISM TIER 0: UNICO color permitido para estados = #6888ff (accent)
  // NO usar verde, rojo, amarillo según el skill
  const c = { color: N.accent, bgColor: `${N.accent}18` }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{
        background: c.bgColor,
        color: c.color,
        boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`
      }}
    >
      {label}
    </span>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = N.accent
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}) {
  return (
    <NeuCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: N.textSub }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: N.text }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: N.textSub }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-semibold`}
              style={{
                color: trend !== 'neutral' ? N.accent : N.textSub
              }}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingUp className="w-3 h-3 rotate-180" />}
              {trend !== 'neutral' ? '+2.5%' : '0%'}
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-2xl"
          style={{
            backgroundColor: `${color}15`,
            boxShadow: `inset 2px 2px 4px ${color}20, inset -2px -2px 4px white`
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </NeuCard>
  )
}

function NeuTabs({ tabs, activeTab, onChange }: {
  tabs: { id: string; label: string; icon?: React.ElementType }[]
  activeTab: string
  onChange: (id: string) => void
}) {
  return (
    <div
      className="flex flex-wrap gap-2 p-2 rounded-2xl"
      style={{
        background: N.base,
        boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold"
            style={isActive ? {
              background: N.accent,
              color: '#fff',
              boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
            } : {
              color: N.textSub
            }}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function FloatingWindow({
  title,
  children,
  onClose,
  onMinimize,
  onMaximize,
  initialX = 100,
  initialY = 100,
  width = 800,
  height = 600,
  icon: Icon,
  badgeCount
}: FloatingWindowProps) {
  const dragRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [isMinimized, setIsMinimized] = useState(false)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragging.current = true
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
      }
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handleMinimize = () => setIsMinimized(!isMinimized)

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed z-50"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: isMinimized ? 300 : width,
        height: isMinimized ? 'auto' : height,
      }}
    >
      <div
        className="rounded-3xl overflow-hidden flex flex-col h-full"
        style={{
          background: N.base,
          boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}`,
          borderTop: '1px solid rgba(255,255,255,0.4)',
          borderLeft: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        {/* Header */}
        <div
          onMouseDown={onMouseDown}
          className="flex items-center justify-between px-5 py-4 border-b cursor-grab active:cursor-grabbing"
          style={{ borderColor: `${N.dark}40` }}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className="p-2 rounded-xl"
                style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
              >
                <Icon className="w-5 h-5" style={{ color: N.accent }} />
              </div>
            )}
            <div>
              <h3 className="text-base font-black" style={{ color: N.text }}>{title}</h3>
              {badgeCount !== undefined && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `${N.accent}20`, color: N.accent }}
                >
                  {badgeCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* OS Window Controls - NEUMORPHISM TIER 0: Solo color #6888ff */}
            <button
              onClick={handleMinimize}
              className="w-3.5 h-3.5 rounded-full transition-all hover:opacity-80"
              style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-1px -1px 3px ${N.light}` }}
              aria-label="Minimizar"
            >
              {isMinimized && <Minus className="w-2 h-2 mx-auto" style={{ color: N.accent }} />}
            </button>
            <button
              onClick={onMaximize}
              className="w-3.5 h-3.5 rounded-full transition-all hover:opacity-80"
              style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-1px -1px 3px ${N.light}` }}
              aria-label="Maximizar"
            />
            <button
              onClick={onClose}
              className="w-3.5 h-3.5 rounded-full transition-all hover:opacity-80"
              style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-1px -1px 3px ${N.light}` }}
              aria-label="Cerrar"
            />
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <div className="flex-1 overflow-auto p-5">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// TIPOS
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

interface SystemOverview {
  health: 'healthy' | 'warning' | 'critical'
  uptime: number
  totalTenants: number
  activeTenants: number
  totalUsers: number
  activeUsers: number
  totalTemplates: number
  activeTemplates: number
  systemLoad: { cpu: number; memory: number; disk: number; network: number }
  securityStatus: { failedLogins: number; suspiciousActivity: number; lastSecurityScan: string; vulnerabilities: number }
}

interface UserInfo {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'Administrador' | 'Gerente' | 'Usuario'
  tenantId?: string
  permissions: string[]
  avatar?: string
}

interface FloatingWindowProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  initialX?: number
  initialY?: number
  width?: number
  height?: number
  icon?: React.ElementType
  badgeCount?: number
}

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// LAZY LOADING
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

const AdminPanelSkeleton = () => (
  <div
    className="rounded-3xl h-64 animate-pulse"
    style={{
      background: N.base,
      boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`
    }}
  />
)

const SuperAdminDashboard = dynamic(() => import('@/components/admin/super-admin-dashboard').then(m => ({ default: m.SuperAdminDashboard })), { loading: AdminPanelSkeleton, ssr: false })
const ClientAdminPanel = dynamic(() => import('@/components/admin/client-admin-panel').then(m => ({ default: m.ClientAdminPanel })), { loading: AdminPanelSkeleton, ssr: false })
const ExportConfiguration = dynamic(() => import('@/components/admin/export-configuration').then(m => ({ default: m.ExportConfiguration })), { loading: AdminPanelSkeleton, ssr: false })
const CEOCommandCenter = dynamic(() => import('@/components/admin/ceo-command-center').then(m => ({ default: m.CEOCommandCenter })), { loading: AdminPanelSkeleton, ssr: false })
const ClientWizard = dynamic(() => import('@/components/admin/client-wizard').then(m => ({ default: m.ClientWizard })), { loading: AdminPanelSkeleton, ssr: false })
const LicenseManager = dynamic(() => import('@/components/admin/license-manager').then(m => ({ default: m.LicenseManager })), { loading: AdminPanelSkeleton, ssr: false })
const ExecutiveDashboard = dynamic(() => import('@/components/admin/executive-dashboard').then(m => ({ default: m.ExecutiveDashboard })), { loading: AdminPanelSkeleton, ssr: false })
const CommercialCRM = dynamic(() => import('@/components/admin/commercial-crm').then(m => ({ default: m.CommercialCRM })), { loading: AdminPanelSkeleton, ssr: false })
const AlertCenter = dynamic(() => import('@/components/admin/alert-center').then(m => ({ default: m.AlertCenter })), { loading: AdminPanelSkeleton, ssr: false })
const SecurityPanel = dynamic(() => import('@/components/admin/security-panel').then(m => ({ default: m.SecurityPanel })), { loading: AdminPanelSkeleton, ssr: false })

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// PAGINA PRINCIPAL
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

export default function AdminPage() {
  const { user, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState('command-center')
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<string>('tenant_001')
  const [showClientWizard, setShowClientWizard] = useState(false)
  const [showDetailWindow, setShowDetailWindow] = useState(false)

  useEffect(() => {
    loadSystemOverview()
    loadCurrentUser()
  }, [])

  const loadSystemOverview = async () => {
    const mockOverview: SystemOverview = {
      health: 'healthy',
      uptime: 99.97,
      totalTenants: 15,
      activeTenants: 12,
      totalUsers: 247,
      activeUsers: 89,
      totalTemplates: 28,
      activeTemplates: 22,
      systemLoad: { cpu: 68, memory: 72, disk: 45, network: 23 },
      securityStatus: { failedLogins: 23, suspiciousActivity: 5, lastSecurityScan: new Date(Date.now() - 3600000).toISOString(), vulnerabilities: 1 }
    }
    setSystemOverview(mockOverview)
  }

  const loadCurrentUser = async () => {
    const mockUser: UserInfo = {
      id: 'user_super_001',
      name: 'CEO Silexar',
      email: 'ceo@silexar.com',
      role: 'super_admin',
      permissions: ['*'],
      avatar: '/avatars/admin.jpg'
    }
    setCurrentUser(mockUser)
  }

  const getHealthVariant = (health: string): 'success' | 'warning' | 'danger' => {
    switch (health) {
      case 'healthy': return 'success'
      case 'warning': return 'warning'
      case 'critical': return 'danger'
      default: return 'warning'
    }
  }

  const getHealthLabel = (health: string): string => {
    switch (health) {
      case 'healthy': return 'Saludable'
      case 'warning': return 'warning'
      case 'critical': return 'Crítico'
      default: return 'Desconocido'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: N.base }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: N.base,
              boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`
            }}
          >
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: N.accent, borderTopColor: 'transparent' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: N.textSub }}>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?callbackUrl=/admin'
    }
    return null
  }

  const tabs = [
    { id: 'command-center', label: 'Centro de Comando', icon: Crown },
    { id: 'system', label: 'Sistema', icon: Server },
    { id: 'clients', label: 'Clientes', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'reports', label: 'Informes', icon: BarChart3 },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  const tenants = [
    { id: 'tenant_001', name: 'Silexar Principal' },
    { id: 'tenant_002', name: 'Radio Central' },
    { id: 'tenant_003', name: 'MediaCorp' },
  ]

  return (
    <div
      className="min-h-screen"
      style={{ background: N.base }}
    >
      <style>{`
        .neu-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .neu-scrollbar::-webkit-scrollbar-track { background: rgba(104, 136, 255, 0.05); border-radius: 10px; margin: 4px; }
        .neu-scrollbar::-webkit-scrollbar-thumb { background: rgba(104, 136, 255, 0.25); border-radius: 10px; }
        .neu-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(104, 136, 255, 0.5); }
      `}</style>

      {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
          HEADER
      ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
      <header
        className="sticky top-0 z-40 px-6 py-4 border-b"
        style={{ background: N.base, borderColor: `${N.dark}30`, boxShadow: `0 4px 12px ${N.dark}20` }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: N.base, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}
            >
              <Crown className="w-6 h-6" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: N.text }}>
                PANEL DE ADMINISTRACIÓN
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tenant Selector */}
            <NeuSelect
              value={selectedTenant}
              onChange={setSelectedTenant}
              options={tenants.map(t => ({ value: t.id, label: t.name }))}
            />

            {/* System Health */}
            {systemOverview && (
              <StatusBadge
                status={getHealthVariant(systemOverview.health)}
                label={getHealthLabel(systemOverview.health)}
              />
            )}

            {/* User Avatar */}
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#69738c] font-bold"
              style={{ background: N.accent, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
          MAIN CONTENT
      ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Tabs Navigation */}
        <NeuTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            COMMAND CENTER
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'command-center' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <NeuCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${N.accent}15`, boxShadow: `inset 4px 4px 8px ${N.dark}30,inset -4px -4px 8px ${N.light}` }}
                >
                  <Crown className="w-8 h-8" style={{ color: N.accent }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black" style={{ color: N.text }}>
                    Bienvenido, {currentUser?.name || 'Administrador'}
                  </h2>
                  <p className="text-sm" style={{ color: N.textSub }}>
                    Panel de Control Central €” Sistema Operativo de Gestión Enterprise
                  </p>
                </div>
              </div>

              {/* Quick Stats — NEUMORPHIC ELEVATED CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: systemOverview?.totalTenants || 0, label: 'Clientes Totales', icon: <Building2 className="w-5 h-5" /> },
                  { value: systemOverview?.activeTenants || 0, label: 'Clientes Activos', icon: <CheckCircle className="w-5 h-5" /> },
                  { value: systemOverview?.totalUsers || 0, label: 'Usuarios Totales', icon: <Users className="w-5 h-5" /> },
                  { value: `${systemOverview?.uptime || 0}%`, label: 'Uptime del Sistema', icon: <Activity className="w-5 h-5" /> }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl text-center"
                    style={{ background: N.base, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{
                        background: N.base,
                        boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`,
                        color: N.accent
                      }}
                    >
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-black" style={{ color: N.accent }}>{stat.value}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: N.textSub }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* CEO Command Center Components */}
            <CEOCommandCenter />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            SYSTEM TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="CPU"
                value={`${systemOverview?.systemLoad.cpu || 0}%`}
                subtitle="Uso del procesador"
                icon={Cpu}
                trend={systemOverview?.systemLoad.cpu && systemOverview.systemLoad.cpu > 80 ? 'up' : 'neutral'}
                color={N.accent}
              />
              <StatCard
                title="Memoria"
                value={`${systemOverview?.systemLoad.memory || 0}%`}
                subtitle="RAM utilizada"
                icon={HardDrive}
                trend={systemOverview?.systemLoad.memory && systemOverview.systemLoad.memory > 80 ? 'up' : 'neutral'}
                color={N.accent}
              />
              <StatCard
                title="Disco"
                value={`${systemOverview?.systemLoad.disk || 0}%`}
                subtitle="Almacenamiento"
                icon={Database}
                color={N.accent}
              />
              <StatCard
                title="Red"
                value={`${systemOverview?.systemLoad.network || 0}%`}
                subtitle="Ancho de banda"
                icon={Globe}
                color={N.accent}
              />
            </div>

            {/* System Health */}
            <NeuCard className="p-6">
              <h3 className="text-lg font-black mb-4" style={{ color: N.text }}>Estado del Sistema</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: N.textSub }}>Salud General</span>
                  <StatusBadge status={getHealthVariant(systemOverview?.health || 'warning')} label={getHealthLabel(systemOverview?.health || 'warning')} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: N.textSub }}>Uptime</span>
                  <span className="text-sm font-bold" style={{ color: N.text }}>{systemOverview?.uptime || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: N.textSub }}>Plantillas Activas</span>
                  <span className="text-sm font-bold" style={{ color: N.text }}>{systemOverview?.activeTemplates || 0} / {systemOverview?.totalTemplates || 0}</span>
                </div>
              </div>
            </NeuCard>

            <SuperAdminDashboard />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            CLIENTS TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Client Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Clientes"
                value={systemOverview?.totalTenants || 0}
                subtitle="En el sistema"
                icon={Building2}
                color={N.accent}
              />
              <StatCard
                title="Clientes Activos"
                value={systemOverview?.activeTenants || 0}
                subtitle="Operando actualmente"
                icon={CheckCircle}
                trend="up"
                color={N.accent}
              />
              <StatCard
                title="Clientes Inactivos"
                value={(systemOverview?.totalTenants || 0) - (systemOverview?.activeTenants || 0)}
                subtitle="Requieren atención"
                icon={AlertTriangle}
                trend="down"
                color={N.accent}
              />
            </div>

            {/* Client Actions */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black" style={{ color: N.text }}>Gestión de Clientes</h3>
                <NeuButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowClientWizard(true)}
                >
                  Nuevo Cliente
                </NeuButton>
              </div>
              <ClientAdminPanel tenantId={user?.tenantId || 'system'} currentUser={{ id: user?.id || 'unknown', name: user?.name || 'Unknown', email: user?.email || '', role: { id: 'role_001', name: 'Usuario', description: 'Usuario', level: 1, permissions: [], isSystem: false, color: '#6888ff' }, status: 'active', lastLogin: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), permissions: [], twoFactorEnabled: false, loginAttempts: 0, sessionCount: 1 }} />
            </NeuCard>
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            USERS TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Usuarios"
                value={systemOverview?.totalUsers || 0}
                icon={Users}
                color={N.accent}
              />
              <StatCard
                title="Usuarios Activos"
                value={systemOverview?.activeUsers || 0}
                subtitle="Conectados ahora"
                icon={Activity}
                trend="up"
                color={N.accent}
              />
              <StatCard
                title="Sesiones"
                value={systemOverview?.activeUsers || 0}
                icon={Clock}
                color={N.accent}
              />
              <StatCard
                title="Permisos"
                value="256"
                icon={Shield}
                color={N.accent}
              />
            </div>

            <ExecutiveDashboard />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            SECURITY TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Logins Fallidos"
                value={systemOverview?.securityStatus.failedLogins || 0}
                icon={AlertTriangle}
                color={N.accent}
              />
              <StatCard
                title="Actividad Sospechosa"
                value={systemOverview?.securityStatus.suspiciousActivity || 0}
                icon={Shield}
                color={N.accent}
              />
              <StatCard
                title="Vulnerabilidades"
                value={systemOverview?.securityStatus.vulnerabilities || 0}
                icon={AlertTriangle}
                color={N.accent}
              />
              <StatCard
                title="Ášltimo Scan"
                value="Hace 1h"
                icon={Clock}
                color={N.accent}
              />
            </div>

            <SecurityPanel />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            REPORTS TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <NeuCard className="p-6">
              <h3 className="text-lg font-black mb-4" style={{ color: N.text }}>Centro de Informes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NeuCardSmall className="p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform" style={{ padding: '1.5rem' }}>
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" style={{ color: N.accent }} />
                  <p className="font-bold text-sm" style={{ color: N.text }}>Informe Ejecutivo</p>
                  <p className="text-xs mt-1" style={{ color: N.textSub }}>Resumen del negocio</p>
                </NeuCardSmall>
                <NeuCardSmall className="p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform" style={{ padding: '1.5rem' }}>
                  <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: N.accent }} />
                  <p className="font-bold text-sm" style={{ color: N.text }}>Informe Financiero</p>
                  <p className="text-xs mt-1" style={{ color: N.textSub }}>Ingresos y costos</p>
                </NeuCardSmall>
                <NeuCardSmall className="p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform" style={{ padding: '1.5rem' }}>
                  <Target className="w-8 h-8 mx-auto mb-2" style={{ color: N.accent }} />
                  <p className="font-bold text-sm" style={{ color: N.text }}>Informe de Ventas</p>
                  <p className="text-xs mt-1" style={{ color: N.textSub }}>Rendimiento comercial</p>
                </NeuCardSmall>
              </div>
            </NeuCard>
            <ExportConfiguration tenantId={user?.tenantId || 'system'} />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            ALERTS TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <AlertCenter />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            SETTINGS TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <NeuCard className="p-6">
              <h3 className="text-lg font-black mb-4" style={{ color: N.text }}>Configuración General</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: N.text }}>Notificaciones por Email</p>
                    <p className="text-xs" style={{ color: N.textSub }}>Recibir alertas al correo electrónico</p>
                  </div>
                  <NeuButton variant="secondary" icon={Bell}>Configurar</NeuButton>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: N.text }}>Integraciones</p>
                    <p className="text-xs" style={{ color: N.textSub }}>Conectar con servicios externos</p>
                  </div>
                  <NeuButton variant="secondary" icon={Settings}>Gestionar</NeuButton>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: N.text }}>Respaldos</p>
                    <p className="text-xs" style={{ color: N.textSub }}>Configurar backup automático</p>
                  </div>
                  <NeuButton variant="secondary" icon={Database}>Programar</NeuButton>
                </div>
              </div>
            </NeuCard>
            <LicenseManager />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            SUPER ADMIN TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'super-admin' && (
          <div className="space-y-6">
            <SuperAdminDashboard />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            CLIENT ADMIN TAB
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        {activeTab === 'client-admin' && (
          <div className="space-y-6">
            <ClientAdminPanel tenantId={user?.tenantId || 'system'} currentUser={{ id: user?.id || 'unknown', name: user?.name || 'Unknown', email: user?.email || '', role: { id: 'role_001', name: 'Usuario', description: 'Usuario', level: 1, permissions: [], isSystem: false, color: '#6888ff' }, status: 'active', lastLogin: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), permissions: [], twoFactorEnabled: false, loginAttempts: 0, sessionCount: 1 }} />
          </div>
        )}

        {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
            FOOTER
        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
        <div className="text-center pt-6 border-t" style={{ borderColor: `${N.dark}30` }} />
      </main>

      {/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
          FLOATING WINDOW - Client Wizard
      ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• */}
      {showClientWizard && (
        <FloatingWindow
          title="Crear Nuevo Cliente"
          onClose={() => setShowClientWizard(false)}
          onMinimize={() => setShowClientWizard(false)}
          initialX={150}
          initialY={100}
          width={700}
          height={500}
          icon={Building2}
        >
          <ClientWizard
            onComplete={() => setShowClientWizard(false)}
            onCancel={() => setShowClientWizard(false)}
          />
        </FloatingWindow>
      )}
    </div>
  )
}