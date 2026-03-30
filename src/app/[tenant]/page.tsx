 'use client'

/**
 * 🏢 SILEXAR PULSE - Dynamic Tenant Portal
 * Multi-tenant client access with Neuromorphic design
 * 
 * @description Dynamic route for client-specific portals
 * Validates tenant, checks license, and renders client dashboard
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  NeuromorphicCard, 
  NeuromorphicButton, 
  NeuromorphicStatus,
  NeuromorphicGrid
} from '@/components/ui/neuromorphic'
import {
  Building2,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  Clock,
  Zap,
  Bell,
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react'

// Demo tenant data - replace with API call
interface Tenant {
  id: string
  slug: string
  name: string
  logo?: string
  plan: 'starter' | 'professional' | 'enterprise' | 'enterprise_plus'
  status: 'active' | 'suspended' | 'expired'
  license: {
    expiresAt: Date
    daysRemaining: number
  }
  features: string[]
  users: {
    total: number
    active: number
  }
}

const demoTenants: Record<string, Tenant> = {
  'rdfmedia': {
    id: 'tenant_001',
    slug: 'rdfmedia',
    name: 'RDF Media',
    plan: 'enterprise',
    status: 'active',
    license: {
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      daysRemaining: 90
    },
    features: ['campaigns', 'analytics', 'ai_assistant', 'reports', 'api_access'],
    users: { total: 23, active: 18 }
  },
  'grupoprisachile': {
    id: 'tenant_002',
    slug: 'grupoprisachile',
    name: 'Grupo Prisa Chile',
    plan: 'enterprise_plus',
    status: 'active',
    license: {
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      daysRemaining: 180
    },
    features: ['campaigns', 'analytics', 'ai_assistant', 'reports', 'api_access', 'white_label', 'priority_support'],
    users: { total: 45, active: 38 }
  },
  'megamedia': {
    id: 'tenant_003',
    slug: 'megamedia',
    name: 'Mega Media',
    plan: 'professional',
    status: 'suspended',
    license: {
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      daysRemaining: -5
    },
    features: ['campaigns', 'analytics', 'reports'],
    users: { total: 67, active: 0 }
  }
}

export default function TenantPortal() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params?.tenant as string

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTenant = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const tenantData = demoTenants[tenantSlug.toLowerCase()]
    
    if (!tenantData) {
      setError('Organización no encontrada')
      setIsLoading(false)
      return
    }

    if (tenantData.status === 'expired' || tenantData.license.daysRemaining < 0) {
      setError('La licencia de esta organización ha expirado. Contacte a su administrador.')
      setIsLoading(false)
      return
    }

    if (tenantData.status === 'suspended') {
      setError('Esta organización está suspendida. Contacte a soporte.')
      setIsLoading(false)
      return
    }

    setTenant(tenantData)
    setIsLoading(false)
  }, [tenantSlug])

  useEffect(() => {
    loadTenant()
  }, [loadTenant])

  const getPlanBadgeColor = (plan: Tenant['plan']) => {
    switch (plan) {
      case 'enterprise_plus': return 'bg-gradient-to-r from-purple-600 to-pink-600'
      case 'enterprise': return 'bg-gradient-to-r from-blue-600 to-cyan-600'
      case 'professional': return 'bg-gradient-to-r from-green-600 to-emerald-600'
      default: return 'bg-slate-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando portal...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 flex items-center justify-center p-4">
        <NeuromorphicCard variant="embossed" className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <NeuromorphicButton variant="secondary" onClick={() => router.push('/login')}>
            Volver al Inicio
          </NeuromorphicButton>
        </NeuromorphicCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">{tenant.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPlanBadgeColor(tenant.plan)} text-white`}>
                  {tenant.plan.replace('_', ' ').toUpperCase()}
                </span>
                <NeuromorphicStatus status="online" size="sm" pulse />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* License warning if < 30 days */}
            {tenant.license.daysRemaining <= 30 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">
                  {tenant.license.daysRemaining} días de licencia
                </span>
              </div>
            )}

            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button 
              className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white transition-colors"
              onClick={() => router.push('/login')}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Bienvenido a {tenant.name}
          </h2>
          <p className="text-slate-400">
            Accede a todas las funcionalidades de tu plan {tenant.plan.replace('_', ' ')}
          </p>
        </div>

        {/* Quick stats */}
        <NeuromorphicGrid columns={4} gap="md" className="mb-8">
          <NeuromorphicCard variant="embossed" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Usuarios Activos</p>
                <p className="text-2xl font-bold text-white">{tenant.users.active}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">de {tenant.users.total} totales</p>
          </NeuromorphicCard>

          <NeuromorphicCard variant="embossed" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Campañas Activas</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">+3 esta semana</p>
          </NeuromorphicCard>

          <NeuromorphicCard variant="embossed" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Rendimiento</p>
                <p className="text-2xl font-bold text-white">98.5%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xs text-green-400 mt-2">↑ 2.3% vs anterior</p>
          </NeuromorphicCard>

          <NeuromorphicCard variant="embossed" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Días de Licencia</p>
                <p className={`text-2xl font-bold ${tenant.license.daysRemaining <= 30 ? 'text-yellow-400' : 'text-white'}`}>
                  {tenant.license.daysRemaining}
                </p>
              </div>
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Expira {tenant.license.expiresAt.toLocaleDateString()}
            </p>
          </NeuromorphicCard>
        </NeuromorphicGrid>

        {/* Navigation modules */}
        <h3 className="text-lg font-semibold text-white mb-4">Módulos Disponibles</h3>
        <NeuromorphicGrid columns={3} gap="md">
          {tenant.features.includes('campaigns') && (
            <NeuromorphicCard 
              variant="embossed" 
              className="p-6 cursor-pointer group hover:border-blue-500/30 transition-all"
              onClick={() => router.push(`/${tenantSlug}/campanas`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="text-white font-semibold mb-1">Campañas</h4>
              <p className="text-sm text-slate-400">Gestiona y monitorea tus campañas publicitarias</p>
            </NeuromorphicCard>
          )}

          {tenant.features.includes('analytics') && (
            <NeuromorphicCard 
              variant="embossed" 
              className="p-6 cursor-pointer group hover:border-purple-500/30 transition-all"
              onClick={() => router.push(`/${tenantSlug}/analytics`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <h4 className="text-white font-semibold mb-1">Analytics</h4>
              <p className="text-sm text-slate-400">Métricas avanzadas y reportes en tiempo real</p>
            </NeuromorphicCard>
          )}

          {tenant.features.includes('ai_assistant') && (
            <NeuromorphicCard 
              variant="embossed" 
              className="p-6 cursor-pointer group hover:border-green-500/30 transition-all"
              onClick={() => router.push(`/${tenantSlug}/ai-assistant`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-green-400 transition-colors" />
              </div>
              <h4 className="text-white font-semibold mb-1">Asistente IA</h4>
              <p className="text-sm text-slate-400">Optimización automática con inteligencia artificial</p>
            </NeuromorphicCard>
          )}

          <NeuromorphicCard 
            variant="embossed" 
            className="p-6 cursor-pointer group hover:border-orange-500/30 transition-all"
            onClick={() => router.push(`/${tenantSlug}/admin`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                <Settings className="w-6 h-6 text-orange-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
            </div>
            <h4 className="text-white font-semibold mb-1">Administración</h4>
            <p className="text-sm text-slate-400">Usuarios, permisos y configuración</p>
          </NeuromorphicCard>

          <NeuromorphicCard 
            variant="embossed" 
            className="p-6 cursor-pointer group hover:border-cyan-500/30 transition-all"
            onClick={() => router.push(`/${tenantSlug}/usuarios`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-600/30 transition-colors">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h4 className="text-white font-semibold mb-1">Usuarios</h4>
            <p className="text-sm text-slate-400">Gestiona el equipo de tu organización</p>
          </NeuromorphicCard>

          <NeuromorphicCard 
            variant="embossed" 
            className="p-6 cursor-pointer group hover:border-pink-500/30 transition-all"
            onClick={() => router.push(`/${tenantSlug}/dashboard`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center group-hover:bg-pink-600/30 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-pink-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </div>
            <h4 className="text-white font-semibold mb-1">Dashboard</h4>
            <p className="text-sm text-slate-400">Vista completa del rendimiento</p>
          </NeuromorphicCard>
        </NeuromorphicGrid>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Powered by Silexar Pulse Quantum • TIER 0 Enterprise</p>
        </div>
      </footer>
    </div>
  )
}
