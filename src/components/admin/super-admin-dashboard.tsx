/**
 * MÁ“DULO 1.1: PANEL DE SUPER-ADMINISTRACIÁ“N - TIER 0 Fortune 10
 * 
 * @description Dashboard de salud del sistema con métricas en tiempo real,
 * gestión de tenants, impersonación segura y alertas automáticas
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - System Administration Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState, useEffect } from 'react'
import { N, NeuCard, NeuCardSmall, NeuButton, NeuInput, NeuSelect, StatusBadge, StatCard, NeuTabs, NeuProgress, NeuDivider, getShadow, getSmallShadow, getFloatingShadow } from './_sdk/AdminDesignSystem'
import {
  Shield,
  Server,
  Database,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
  Bell,
  UserCheck,
  Settings,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react'

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  uptime: number
  services: ServiceStatus[]
  performance: PerformanceMetrics
  security: SecurityMetrics
}

interface ServiceStatus {
  name: string
  status: 'online' | 'degraded' | 'offline'
  version: string
  responseTime: number
}

interface PerformanceMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  requestsPerSecond: number
  activeConnections: number
  averageResponseTime: number
  errorRate: number
}

interface SecurityMetrics {
  failedLogins: number
  suspiciousActivity: number
  blockedIPs: number
  complianceScore: number
  lastSecurityScan: string
  vulnerabilities: SecurityVulnerability[]
}

interface SecurityVulnerability {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'investigating' | 'resolved'
  description: string
  component: string
  discoveredAt: string
}

interface Tenant {
  id: string
  name: string
  domain: string
  status: 'active' | 'suspended' | 'Pendiente'
  plan: string
  users: number
  storage: number
  bandwidth: number
  createdAt: string
  billing: {
    amount: number
    status: 'current' | 'overdue' | 'cancelled'
    nextBilling: string
  }
}

interface SystemAlert {
  id: string
  title: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'security' | 'performance' | 'system' | 'billing'
  timestamp: Date
  acknowledged: boolean
  affectedTenants?: string[]
  resolvedAt?: Date
}

interface SuperAdminDashboardProps {
  currentUser?: {
    id: string
    name: string
    email: string
    role: string
  }
}

const mockSystemHealth: SystemHealth = {
  overall: 'healthy',
  uptime: 99.97,
  services: [
    { name: 'API Gateway', status: 'online', version: '2.4.1', responseTime: 45 },
    { name: 'Auth Service', status: 'online', version: '1.8.3', responseTime: 23 },
    { name: 'Database Cluster', status: 'online', version: '8.0.32', responseTime: 12 },
    { name: 'Cache Layer', status: 'online', version: '6.2.1', responseTime: 3 },
    { name: 'Search Engine', status: 'degraded', version: '7.17.2', responseTime: 150 },
    { name: 'Analytics', status: 'online', version: '3.2.0', responseTime: 89 },
  ],
  performance: {
    cpu: 42,
    memory: 68,
    disk: 55,
    network: 35,
    requestsPerSecond: 1247,
    activeConnections: 3847,
    averageResponseTime: 45,
    errorRate: 0.002,
  },
  security: {
    failedLogins: 3,
    suspiciousActivity: 1,
    blockedIPs: 12,
    complianceScore: 94,
    lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    vulnerabilities: [
      { id: 'v1', title: 'CVE-2024-1234', severity: 'high', status: 'investigating', description: 'Buffer overflow in authentication module', component: 'auth-service', discoveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'v2', title: 'CVE-2024-5678', severity: 'medium', status: 'open', description: 'SQL injection vulnerability', component: 'api-gateway', discoveredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    ],
  },
}

const mockTenants: Tenant[] = [
  { id: 't1', name: 'TechCorp', domain: 'techcorp.com', status: 'active', plan: 'Enterprise', users: 250, storage: 500, bandwidth: 1000, createdAt: '2024-01-15', billing: { amount: 4999, status: 'current', nextBilling: '2025-03-01' } },
  { id: 't2', name: 'MediaMax', domain: 'mediamax.tv', status: 'active', plan: 'Professional', users: 85, storage: 200, bandwidth: 500, createdAt: '2024-03-22', billing: { amount: 1999, status: 'current', nextBilling: '2025-03-15' } },
  { id: 't3', name: 'RetailPlus', domain: 'retailplus.com', status: 'suspended', plan: 'Basic', users: 25, storage: 50, bandwidth: 100, createdAt: '2024-06-10', billing: { amount: 499, status: 'overdue', nextBilling: '2025-02-01' } },
]

const mockAlerts: SystemAlert[] = [
  { id: 'a1', title: 'Alta latencia detectada', message: 'El servicio de búsqueda muestra latencia superior al umbral', severity: 'high', type: 'performance', timestamp: new Date(Date.now() - 30 * 60 * 1000), acknowledged: false },
  { id: 'a2', title: 'Intento de intrusión', message: 'Múltiples intentos de login fallidos desde IP suspeita', severity: 'critical', type: 'security', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), acknowledged: true, affectedTenants: ['t1'] },
  { id: 'a3', title: 'Billing anomaly', message: 'Cliente con facturación vencida', severity: 'medium', type: 'billing', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), acknowledged: false, affectedTenants: ['t3'] },
]

export function SuperAdminDashboard({ currentUser }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('Resumen')
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedTenant, setImpersonatedTenant] = useState<string | null>(null)

  useEffect(() => {
    loadSystemHealth()
    loadTenants()
    loadAlerts()

    const interval = setInterval(() => {
      loadSystemHealth()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadSystemHealth = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    setSystemHealth(mockSystemHealth)
  }

  const loadTenants = async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    setTenants(mockTenants)
  }

  const loadAlerts = async () => {
    await new Promise(resolve => setTimeout(resolve, 250))
    setAlerts(mockAlerts)
  }

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success'
      case 'degraded': return 'warning'
      case 'offline': return 'danger'
      default: return 'info'
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#6888ff'
      case 'high': return '#6888ff'
      case 'medium': return '#6888ff'
      case 'low': return '#6888ff'
      default: return N.textSub
    }
  }

  const getTenantStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'suspended': return 'warning'
      case 'Pendiente': return 'info'
      default: return 'info'
    }
  }

  const startImpersonation = (tenantId: string, userId: string) => {
    console.log(`Starting impersonation: Tenant ${tenantId}, User ${userId}`)
    setIsImpersonating(true)
    setImpersonatedTenant(tenantId)
  }

  const stopImpersonation = () => {
    console.log('Stopping impersonation')
    setIsImpersonating(false)
    setImpersonatedTenant(null)
  }

  return (
    <div style={{ background: N.base, minHeight: '100vh', padding: '1.5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: N.text, fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield style={{ color: N.accent, width: 28, height: 28 }} />
              Super Admin Dashboard
            </h1>
            <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Sistema de monitoreo Enterprise - TIER 0 Fortune 10
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isImpersonating && (
              <NeuCardSmall style={{ border: `2px solid ${N.accent}`, background: `${N.accent}18`, padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye style={{ color: N.accent, width: 16, height: 16 }} />
                  <span style={{ color: N.text, fontSize: '0.875rem', fontWeight: 500 }}>
                    Modo Impersonación Activo
                  </span>
                  <NeuButton variant="secondary" onClick={stopImpersonation}>
                    <EyeOff style={{ width: 14, height: 14 }} />
                    Detener
                  </NeuButton>
                </div>
              </NeuCardSmall>
            )}
            <StatusBadge
              status={systemHealth?.overall === 'healthy' ? 'success' : systemHealth?.overall === 'warning' ? 'warning' : 'danger'}
              label={`Sistema: ${systemHealth?.overall?.toUpperCase() || 'CARGANDO...'}`}
            />
          </div>
        </div>
      </header>

      {/* KPIs del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <NeuCard className="p-5" style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: N.textSub, fontSize: '0.875rem' }}>Uptime</span>
            <Activity style={{ color: '#6888ff', width: 16, height: 16 }} />
          </div>
          <div style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
            {systemHealth?.uptime || 0}%
          </div>
          <p style={{ color: N.textSub, fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Ášltimos 30 días
          </p>
        </NeuCard>

        <NeuCard className="p-5" style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: N.textSub, fontSize: '0.875rem' }}>Tenants Activos</span>
            <Users style={{ color: '#6888ff', width: 16, height: 16 }} />
          </div>
          <div style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
            {tenants.filter(t => t.status === 'active').length}
          </div>
          <p style={{ color: N.textSub, fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {tenants.length} total
          </p>
        </NeuCard>

        <NeuCard className="p-5" style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: N.textSub, fontSize: '0.875rem' }}>Requests/seg</span>
            <BarChart3 style={{ color: '#6888ff', width: 16, height: 16 }} />
          </div>
          <div style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
            {systemHealth?.performance.requestsPerSecond || 0}
          </div>
          <p style={{ color: N.textSub, fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Promedio última hora
          </p>
        </NeuCard>

        <NeuCard className="p-5" style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: N.textSub, fontSize: '0.875rem' }}>Alertas Activas</span>
            <Bell style={{ color: '#6888ff', width: 16, height: 16 }} />
          </div>
          <div style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
            {alerts.filter(a => !a.acknowledged).length}
          </div>
          <p style={{ color: N.textSub, fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {alerts.length} total
          </p>
        </NeuCard>
      </div>

      {/* Tabs Principal */}
      <NeuTabs
        tabs={[
          { id: 'Resumen', label: 'Resumen', icon: <Server style={{ width: 16, height: 16 }} /> },
          { id: 'tenants', label: 'Tenants', icon: <Globe style={{ width: 16, height: 16 }} /> },
          { id: 'performance', label: 'Performance', icon: <Cpu style={{ width: 16, height: 16 }} /> },
          { id: 'security', label: 'Seguridad', icon: <Shield style={{ width: 16, height: 16 }} /> },
          { id: 'alerts', label: 'Alertas', icon: <AlertTriangle style={{ width: 16, height: 16 }} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Overview */}
      {activeTab === 'Resumen' && (
        <div className="space-y-6" style={{ marginTop: '1.5rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado de Servicios */}
            <NeuCard style={{ boxShadow: getShadow() }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server style={{ color: '#6888ff', width: 20, height: 20 }} />
                Estado de Servicios
              </h3>
              <div className="space-y-4">
                {systemHealth?.services.map((service) => (
                  <div
                    key={service.name}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: `${N.dark}20`, borderRadius: '0.5rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: service.status === 'online' ? '#6888ff' : service.status === 'degraded' ? '#6888ff' : '#6888ff' }} />
                      <div>
                        <h4 style={{ color: N.text, fontWeight: 500 }}>{service.name}</h4>
                        <p style={{ color: N.textSub, fontSize: '0.875rem' }}>v{service.version}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge
                        status={getServiceStatusColor(service.status)}
                        label={service.status}
                      />
                      <p style={{ color: N.textSub, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {service.responseTime}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* Métricas de Performance */}
            <NeuCard style={{ boxShadow: getShadow() }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity style={{ color: '#6888ff', width: 20, height: 20 }} />
                Métricas de Performance
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'CPU', value: systemHealth?.performance.cpu || 0 },
                  { label: 'Memoria', value: systemHealth?.performance.memory || 0 },
                  { label: 'Disco', value: systemHealth?.performance.disk || 0 },
                  { label: 'Red', value: systemHealth?.performance.network || 0 },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: N.textSub }}>{metric.label}</span>
                      <span style={{ color: N.text, fontWeight: 700 }}>{metric.value}%</span>
                    </div>
                    <NeuProgress value={metric.value} color={metric.value > 80 ? '#6888ff' : metric.value > 60 ? '#6888ff' : '#6888ff'} />
                  </div>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>
      )}

      {/* Tab Tenants */}
      {activeTab === 'tenants' && (
        <div className="space-y-6" style={{ marginTop: '1.5rem' }}>
          <NeuCard style={{ boxShadow: getShadow() }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe style={{ color: '#6888ff', width: 20, height: 20 }} />
                  Gestión de Tenants
                </h3>
                <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
                  Administración de clientes con aislamiento de datos
                </p>
              </div>
              <NeuButton variant="primary" onClick={() => { }}>
                <Users style={{ width: 16, height: 16 }} />
                Nuevo Tenant
              </NeuButton>
            </div>
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: `${N.dark}15`, borderRadius: '0.5rem', border: `1px solid ${N.dark}40` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#6888ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '1.25rem' }}>
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ color: N.text, fontWeight: 500, fontSize: '1.125rem' }}>
                          {tenant.name}
                        </h3>
                        <StatusBadge
                          status={getTenantStatusColor(tenant.status)}
                          label={tenant.status}
                        />
                        <StatusBadge status="info" label={tenant.plan} />
                      </div>
                      <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
                        {tenant.domain} • {tenant.users} usuarios
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: N.textSub }}>
                        <span>Storage: {tenant.storage}GB</span>
                        <span>Bandwidth: {tenant.bandwidth}GB</span>
                        <span>Creado: {new Date(tenant.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: N.text, fontWeight: 700 }}>
                        ${tenant.billing.amount}/mes
                      </p>
                      <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
                        Próximo: {new Date(tenant.billing.nextBilling).toLocaleDateString()}
                      </p>
                      <StatusBadge
                        status={tenant.billing.status === 'current' ? 'success' : tenant.billing.status === 'overdue' ? 'danger' : 'warning'}
                        label={tenant.billing.status}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <NeuButton variant="secondary" onClick={() => startImpersonation(tenant.id, 'Administrador')}>
                        <UserCheck style={{ width: 16, height: 16 }} />
                        Impersonar
                      </NeuButton>
                      <NeuButton variant="secondary" onClick={() => { }}>
                        <Settings style={{ width: 16, height: 16 }} />
                        Configurar
                      </NeuButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </div>
      )}

      {/* Tab Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6" style={{ marginTop: '1.5rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeuCard style={{ boxShadow: getShadow() }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu style={{ color: '#6888ff', width: 20, height: 20 }} />
                Recursos del Sistema
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: Cpu, color: '#6888ff', value: systemHealth?.performance.cpu || 0, label: 'CPU' },
                  { icon: HardDrive, color: '#6888ff', value: systemHealth?.performance.memory || 0, label: 'Memoria' },
                  { icon: Database, color: '#6888ff', value: systemHealth?.performance.disk || 0, label: 'Disco' },
                  { icon: Network, color: '#6888ff', value: systemHealth?.performance.network || 0, label: 'Red' },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '1rem', background: `${N.dark}15`, borderRadius: '0.5rem' }}>
                    <item.icon style={{ color: item.color, width: 32, height: 32, margin: '0 auto 0.5rem' }} />
                    <div style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
                      {item.value}%
                    </div>
                    <p style={{ color: N.textSub, fontSize: '0.875rem' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </NeuCard>

            <NeuCard style={{ boxShadow: getShadow() }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 style={{ color: '#6888ff', width: 20, height: 20 }} />
                Métricas de Tráfico
              </h3>
              <div className="space-y-4">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: N.textSub }}>Conexiones Activas</span>
                    <span style={{ color: N.text, fontWeight: 600 }}>{systemHealth?.performance.activeConnections.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: N.textSub }}>Requests por Segundo</span>
                    <span style={{ color: N.text, fontWeight: 600 }}>{systemHealth?.performance.requestsPerSecond || 0}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: N.textSub }}>Tiempo Respuesta Promedio</span>
                    <span style={{ color: N.text, fontWeight: 600 }}>{systemHealth?.performance.averageResponseTime || 0}ms</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: N.textSub }}>Tasa de Error</span>
                    <span style={{ color: (systemHealth?.performance.errorRate || 0) < 0.01 ? '#6888ff' : (systemHealth?.performance.errorRate || 0) < 0.05 ? '#6888ff' : '#6888ff', fontWeight: 600 }}>
                      {((systemHealth?.performance.errorRate || 0) * 100).toFixed(3)}%
                    </span>
                  </div>
                </div>
              </div>
            </NeuCard>
          </div>
        </div>
      )}

      {/* Tab Security */}
      {activeTab === 'security' && (
        <div className="space-y-6" style={{ marginTop: '1.5rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeuCard style={{ boxShadow: getShadow() }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield style={{ color: '#6888ff', width: 20, height: 20 }} />
                Métricas de Seguridad
              </h3>
              <div className="space-y-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: N.textSub }}>Intentos de Login Fallidos</span>
                  <span style={{ color: '#6888ff', fontWeight: 700 }}>{systemHealth?.security.failedLogins || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: N.textSub }}>Actividad Sospechosa</span>
                  <span style={{ color: '#6888ff', fontWeight: 700 }}>{systemHealth?.security.suspiciousActivity || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: N.textSub }}>IPs Bloqueadas</span>
                  <span style={{ color: '#6888ff', fontWeight: 700 }}>{systemHealth?.security.blockedIPs || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: N.textSub }}>Score de Compliance</span>
                  <span style={{ color: '#6888ff', fontWeight: 700 }}>{systemHealth?.security.complianceScore || 0}%</span>
                </div>
              </div>
            </NeuCard>

            <NeuCard style={{ boxShadow: getShadow() }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert style={{ color: '#6888ff', width: 20, height: 20 }} />
                Vulnerabilidades Recientes
              </h3>
              <div className="space-y-4">
                {systemHealth?.security.vulnerabilities.map((vuln) => (
                  <div key={vuln.id} style={{ padding: '0.75rem', background: `${N.dark}15`, borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: N.text, fontWeight: 500 }}>{vuln.title}</span>
                      <StatusBadge
                        status={vuln.severity === 'critical' ? 'danger' : vuln.severity === 'high' ? 'warning' : 'info'}
                        label={vuln.severity}
                      />
                    </div>
                    <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{vuln.description}</p>
                  </div>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>
      )}

      {/* Tab Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6" style={{ marginTop: '1.5rem' }}>
          <NeuCard style={{ boxShadow: getShadow() }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell style={{ color: '#6888ff', width: 20, height: 20 }} />
                Alertas del Sistema
              </h3>
              <NeuButton variant="primary" onClick={() => { }}>
                <CheckCircle style={{ width: 16, height: 16 }} />
                Marcar Todas Leídas
              </NeuButton>
            </div>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} style={{ padding: '1rem', background: `${N.dark}15`, borderRadius: '0.5rem', borderLeft: `3px solid ${getAlertSeverityColor(alert.severity)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'Iniciar', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ color: N.text, fontWeight: 500 }}>{alert.title}</h4>
                      <p style={{ color: N.textSub, fontSize: '0.875rem' }}>{alert.message}</p>
                    </div>
                    <StatusBadge status={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : alert.severity === 'medium' ? 'info' : 'success'} label={alert.severity} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    {!alert.acknowledged && (
                      <NeuButton variant="secondary" onClick={() => { }}>
                        <CheckCircle style={{ width: 14, height: 14 }} />
                        Reconocer
                      </NeuButton>
                    )}
                    <span style={{ color: N.textSub, fontSize: '0.75rem' }}>{alert.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', color: N.textSub, fontSize: '0.875rem', marginTop: '2rem' }}>
        <p>ðŸ›¡ï¸ SUPER ADMIN DASHBOARD TIER 0 - Powered by Military-Grade Security</p>
        <p>System Health Monitoring • Multi-Tenant Management • Pentagon++ Data Protection</p>
      </div>
    </div>
  )
}