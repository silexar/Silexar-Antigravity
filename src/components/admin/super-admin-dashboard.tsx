/**
 * MÓDULO 1.1: PANEL DE SUPER-ADMINISTRACIÓN - TIER 0 Fortune 10
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Shield, 
  Server, 
  Database, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Eye,
  UserCheck,
  Settings,
  BarChart3,
  Zap,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Bell,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

/**
 * Interfaces para Super Administración
 */
interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  uptime: number
  lastUpdate: string
  services: ServiceStatus[]
  performance: PerformanceMetrics
  security: SecurityMetrics
}

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'degraded'
  responseTime: number
  lastCheck: string
  version: string
  dependencies: string[]
}

interface PerformanceMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  activeConnections: number
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
}

interface SecurityMetrics {
  failedLogins: number
  suspiciousActivity: number
  blockedIPs: number
  lastSecurityScan: string
  vulnerabilities: SecurityVulnerability[]
  complianceScore: number
}

interface SecurityVulnerability {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  component: string
  discoveredAt: string
  status: 'open' | 'investigating' | 'resolved'
}

interface Tenant {
  id: string
  name: string
  domain: string
  plan: 'starter' | 'professional' | 'enterprise' | 'custom'
  status: 'active' | 'suspended' | 'trial' | 'expired'
  users: number
  storage: number
  bandwidth: number
  createdAt: string
  lastActivity: string
  billing: {
    amount: number
    currency: string
    nextBilling: string
    status: 'current' | 'overdue' | 'cancelled'
  }
  features: string[]
  limits: {
    users: number
    storage: number
    apiCalls: number
  }
}

interface SystemAlert {
  id: string
  type: 'security' | 'performance' | 'system' | 'billing'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  timestamp: string
  acknowledged: boolean
  resolvedAt?: string
  affectedTenants?: string[]
}

interface SuperAdminDashboardProps {
  currentUser: {
    id: string
    name: string
    email: string
    role: 'super_admin'
    permissions: string[]
  }
}

/**
 * Panel de Super Administración
 */
export function SuperAdminDashboard({ currentUser }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null)

  // Cargar datos del sistema
  useEffect(() => {
    loadSystemHealth()
    loadTenants()
    loadAlerts()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadSystemHealth()
      loadAlerts()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  /**
   * Cargar métricas de salud del sistema
   */
  const loadSystemHealth = async () => {
    // Simulación de datos de salud del sistema
    const mockHealth: SystemHealth = {
      overall: 'healthy',
      uptime: 99.97,
      lastUpdate: new Date().toISOString(),
      services: [
        {
          name: 'API Gateway',
          status: 'online',
          responseTime: 45,
          lastCheck: new Date().toISOString(),
          version: '2.1.0',
          dependencies: ['Database', 'Redis', 'Auth Service']
        },
        {
          name: 'Cortex Engine',
          status: 'online',
          responseTime: 120,
          lastCheck: new Date().toISOString(),
          version: '3.0.1',
          dependencies: ['ML Models', 'Vector DB', 'GPU Cluster']
        },
        {
          name: 'Database Cluster',
          status: 'online',
          responseTime: 15,
          lastCheck: new Date().toISOString(),
          version: '14.2',
          dependencies: ['Storage', 'Backup Service']
        },
        {
          name: 'File Storage',
          status: 'degraded',
          responseTime: 200,
          lastCheck: new Date().toISOString(),
          version: '1.8.3',
          dependencies: ['CDN', 'Backup Storage']
        }
      ],
      performance: {
        cpu: 68,
        memory: 72,
        disk: 45,
        network: 23,
        activeConnections: 1247,
        requestsPerSecond: 850,
        averageResponseTime: 89,
        errorRate: 0.02
      },
      security: {
        failedLogins: 23,
        suspiciousActivity: 5,
        blockedIPs: 12,
        lastSecurityScan: new Date(Date.now() - 3600000).toISOString(),
        vulnerabilities: [
          {
            id: 'vuln_001',
            severity: 'medium',
            description: 'Outdated dependency in authentication module',
            component: 'Auth Service',
            discoveredAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'investigating'
          }
        ],
        complianceScore: 94
      }
    }
    setSystemHealth(mockHealth)
  }

  /**
   * Cargar lista de tenants
   */
  const loadTenants = async () => {
    const mockTenants: Tenant[] = [
      {
        id: 'tenant_001',
        name: 'Acme Corporation',
        domain: 'acme.silexar.com',
        plan: 'enterprise',
        status: 'active',
        users: 45,
        storage: 2.3,
        bandwidth: 15.7,
        createdAt: '2024-01-15T00:00:00Z',
        lastActivity: new Date().toISOString(),
        billing: {
          amount: 2500,
          currency: 'USD',
          nextBilling: '2025-03-01T00:00:00Z',
          status: 'current'
        },
        features: ['Advanced Analytics', 'Custom Branding', 'API Access', 'Priority Support'],
        limits: {
          users: 100,
          storage: 10,
          apiCalls: 100000
        }
      },
      {
        id: 'tenant_002',
        name: 'StartupXYZ',
        domain: 'startup.silexar.com',
        plan: 'professional',
        status: 'trial',
        users: 8,
        storage: 0.5,
        bandwidth: 2.1,
        createdAt: '2025-01-20T00:00:00Z',
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        billing: {
          amount: 0,
          currency: 'USD',
          nextBilling: '2025-02-20T00:00:00Z',
          status: 'current'
        },
        features: ['Basic Analytics', 'Standard Support'],
        limits: {
          users: 25,
          storage: 2,
          apiCalls: 10000
        }
      }
    ]
    setTenants(mockTenants)
  }

  /**
   * Cargar alertas del sistema
   */
  const loadAlerts = async () => {
    const mockAlerts: SystemAlert[] = [
      {
        id: 'alert_001',
        type: 'performance',
        severity: 'warning',
        title: 'High Memory Usage Detected',
        description: 'Memory usage has exceeded 70% for the past 15 minutes',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        acknowledged: false,
        affectedTenants: ['tenant_001']
      },
      {
        id: 'alert_002',
        type: 'security',
        severity: 'info',
        title: 'Security Scan Completed',
        description: 'Weekly security scan completed successfully with 1 medium vulnerability found',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: true,
        resolvedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]
    setAlerts(mockAlerts)
  }

  /**
   * Obtener color por estado de servicio
   */
  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 border-green-400'
      case 'degraded': return 'text-yellow-400 border-yellow-400'
      case 'offline': return 'text-red-400 border-red-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  /**
   * Obtener color por severidad de alerta
   */
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400'
      case 'error': return 'border-red-400 bg-red-400/10 text-red-300'
      case 'warning': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'info': return 'border-blue-500 bg-blue-500/10 text-blue-400'
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  /**
   * Obtener color por estado de tenant
   */
  const getTenantStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500 text-green-400'
      case 'trial': return 'border-blue-500 text-blue-400'
      case 'suspended': return 'border-red-500 text-red-400'
      case 'expired': return 'border-gray-500 text-gray-400'
      default: return 'border-gray-500 text-gray-400'
    }
  }

  /**
   * Iniciar impersonación de usuario
   */
  const startImpersonation = (tenantId: string, userId: string) => {
    setIsImpersonating(true)
    setImpersonatedUser(`${tenantId}:${userId}`)
    // Aquí se implementaría la lógica real de impersonación
  }

  /**
   * Detener impersonación
   */
  const stopImpersonation = () => {
    setIsImpersonating(false)
    setImpersonatedUser(null)
  }

  if (!systemHealth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Cargando métricas del sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header con estado de impersonación */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🛡️ Super Admin Dashboard
            </h1>
            <p className="text-slate-300">
              Control total del sistema con métricas en tiempo real
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isImpersonating && (
              <Alert className="border-yellow-500 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-yellow-400">Modo Impersonación Activo</AlertTitle>
                <AlertDescription className="text-yellow-300">
                  Usuario: {impersonatedUser}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-2 border-yellow-500 text-yellow-400"
                    onClick={stopImpersonation}
                  >
                    Detener
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <Badge 
              variant="outline" 
              className={`${systemHealth.overall === 'healthy' ? 'text-green-400 border-green-400' : 
                          systemHealth.overall === 'warning' ? 'text-yellow-400 border-yellow-400' : 
                          'text-red-400 border-red-400'}`}
            >
              Sistema: {systemHealth.overall.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* KPIs del Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {systemHealth.uptime}%
              </div>
              <p className="text-xs text-slate-400">
                Últimos 30 días
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Tenants Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tenants.filter(t => t.status === 'active').length}
              </div>
              <p className="text-xs text-slate-400">
                {tenants.length} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Requests/seg</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {systemHealth.performance.requestsPerSecond}
              </div>
              <p className="text-xs text-slate-400">
                Promedio última hora
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Alertas Activas</CardTitle>
              <Bell className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {alerts.filter(a => !a.acknowledged).length}
              </div>
              <p className="text-xs text-slate-400">
                {alerts.length} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <Server className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-blue-600">
              <Globe className="h-4 w-4 mr-2" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-green-600">
              <Cpu className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-red-600">
              <Shield className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-orange-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
          </TabsList>

          {/* Tab Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado de Servicios */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="h-5 w-5 text-purple-400" />
                    Estado de Servicios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemHealth.services.map((service) => (
                      <div 
                        key={service.name}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            service.status === 'online' ? 'bg-green-400' :
                            service.status === 'degraded' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`} />
                          <div>
                            <h4 className="text-white font-medium">{service.name}</h4>
                            <p className="text-slate-400 text-sm">v{service.version}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            className={getServiceStatusColor(service.status)}
                          >
                            {service.status}
                          </Badge>
                          <p className="text-slate-400 text-xs mt-1">
                            {service.responseTime}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Performance */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Métricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300">CPU</span>
                        <span className="text-white font-bold">{systemHealth.performance.cpu}%</span>
                      </div>
                      <Progress value={systemHealth.performance.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300">Memoria</span>
                        <span className="text-white font-bold">{systemHealth.performance.memory}%</span>
                      </div>
                      <Progress value={systemHealth.performance.memory} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300">Disco</span>
                        <span className="text-white font-bold">{systemHealth.performance.disk}%</span>
                      </div>
                      <Progress value={systemHealth.performance.disk} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300">Red</span>
                        <span className="text-white font-bold">{systemHealth.performance.network}%</span>
                      </div>
                      <Progress value={systemHealth.performance.network} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Tenants */}
          <TabsContent value="tenants" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      Gestión de Tenants
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Administración de clientes con aislamiento de datos
                    </CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Users className="h-4 w-4 mr-2" />
                    Nuevo Tenant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div 
                      key={tenant.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {tenant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium text-lg">
                              {tenant.name}
                            </h3>
                            <Badge 
                              variant="outline"
                              className={getTenantStatusColor(tenant.status)}
                            >
                              {tenant.status}
                            </Badge>
                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                              {tenant.plan}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {tenant.domain} • {tenant.users} usuarios
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                            <span>Storage: {tenant.storage}GB</span>
                            <span>Bandwidth: {tenant.bandwidth}GB</span>
                            <span>Creado: {new Date(tenant.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-white font-bold">
                            ${tenant.billing.amount}/mes
                          </p>
                          <p className="text-slate-400 text-sm">
                            Próximo: {new Date(tenant.billing.nextBilling).toLocaleDateString()}
                          </p>
                          <Badge 
                            variant="outline"
                            className={
                              tenant.billing.status === 'current' ? 'border-green-500 text-green-400' :
                              tenant.billing.status === 'overdue' ? 'border-red-500 text-red-400' :
                              'border-gray-500 text-gray-400'
                            }
                          >
                            {tenant.billing.status}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => startImpersonation(tenant.id, 'admin')}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Impersonar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-slate-500 text-slate-400 hover:bg-slate-500/10"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-green-400" />
                    Recursos del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <Cpu className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {systemHealth.performance.cpu}%
                      </div>
                      <p className="text-slate-400 text-sm">CPU</p>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <HardDrive className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {systemHealth.performance.memory}%
                      </div>
                      <p className="text-slate-400 text-sm">Memoria</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <Database className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {systemHealth.performance.disk}%
                      </div>
                      <p className="text-slate-400 text-sm">Disco</p>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <Network className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {systemHealth.performance.network}%
                      </div>
                      <p className="text-slate-400 text-sm">Red</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Métricas de Tráfico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Conexiones Activas</span>
                    <span className="text-white font-bold">
                      {systemHealth.performance.activeConnections.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Requests por Segundo</span>
                    <span className="text-white font-bold">
                      {systemHealth.performance.requestsPerSecond}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tiempo Respuesta Promedio</span>
                    <span className="text-white font-bold">
                      {systemHealth.performance.averageResponseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tasa de Error</span>
                    <span className={`font-bold ${
                      systemHealth.performance.errorRate < 0.01 ? 'text-green-400' :
                      systemHealth.performance.errorRate < 0.05 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {(systemHealth.performance.errorRate * 100).toFixed(3)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Seguridad */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Métricas de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Intentos de Login Fallidos</span>
                    <span className="text-red-400 font-bold">
                      {systemHealth.security.failedLogins}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Actividad Sospechosa</span>
                    <span className="text-yellow-400 font-bold">
                      {systemHealth.security.suspiciousActivity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IPs Bloqueadas</span>
                    <span className="text-orange-400 font-bold">
                      {systemHealth.security.blockedIPs}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Score de Compliance</span>
                    <span className="text-green-400 font-bold">
                      {systemHealth.security.complianceScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Último Escaneo</span>
                    <span className="text-slate-300 text-sm">
                      {new Date(systemHealth.security.lastSecurityScan).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    Vulnerabilidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemHealth.security.vulnerabilities.map((vuln) => (
                      <div 
                        key={vuln.id}
                        className={`p-3 rounded-lg border ${
                          vuln.severity === 'critical' ? 'border-red-500 bg-red-500/10' :
                          vuln.severity === 'high' ? 'border-orange-500 bg-orange-500/10' :
                          vuln.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                          'border-blue-500 bg-blue-500/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="outline"
                            className={
                              vuln.severity === 'critical' ? 'border-red-400 text-red-400' :
                              vuln.severity === 'high' ? 'border-orange-400 text-orange-400' :
                              vuln.severity === 'medium' ? 'border-yellow-400 text-yellow-400' :
                              'border-blue-400 text-blue-400'
                            }
                          >
                            {vuln.severity}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={
                              vuln.status === 'resolved' ? 'border-green-400 text-green-400' :
                              vuln.status === 'investigating' ? 'border-yellow-400 text-yellow-400' :
                              'border-red-400 text-red-400'
                            }
                          >
                            {vuln.status}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium mb-1">
                          {vuln.description}
                        </p>
                        <p className="text-slate-400 text-xs">
                          Componente: {vuln.component} • Descubierto: {new Date(vuln.discoveredAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Alertas */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-400" />
                      Alertas del Sistema
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Notificaciones automáticas y anomalías detectadas
                    </CardDescription>
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Todas Leídas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)} ${
                        !alert.acknowledged ? 'ring-2 ring-orange-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              alert.type === 'security' ? 'border-red-400 text-red-400' :
                              alert.type === 'performance' ? 'border-yellow-400 text-yellow-400' :
                              alert.type === 'system' ? 'border-blue-400 text-blue-400' :
                              'border-green-400 text-green-400'
                            }
                          >
                            {alert.type}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={getAlertSeverityColor(alert.severity)}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {!alert.acknowledged && (
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Reconocer
                            </Button>
                          )}
                        </div>
                      </div>
                      <h4 className="text-white font-medium mb-2">
                        {alert.title}
                      </h4>
                      <p className="text-slate-300 text-sm mb-2">
                        {alert.description}
                      </p>
                      {alert.affectedTenants && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">Tenants afectados:</span>
                          {alert.affectedTenants.map((tenantId) => (
                            <Badge key={tenantId} variant="outline" className="text-xs">
                              {tenants.find(t => t.id === tenantId)?.name || tenantId}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {alert.resolvedAt && (
                        <p className="text-green-400 text-xs mt-2">
                          ✅ Resuelto: {new Date(alert.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>
            🛡️ SUPER ADMIN DASHBOARD TIER 0 - Powered by Military-Grade Security
          </p>
          <p>
            System Health Monitoring • Multi-Tenant Management • Pentagon++ Data Protection
          </p>
        </div>
      </div>
    </div>
  )
}