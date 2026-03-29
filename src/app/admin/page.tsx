'use client'

/**
 * 🎛️ SILEXAR PULSE - CEO Admin Portal
 * Complete Control Center for CEO/Super Admin
 * 
 * @description Enhanced admin portal with:
 * - CEO Command Center (AI, Modules, Databases, Remote Control)
 * - Client Management (Wizard, License Management)
 * - System Configuration
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard'
import { ClientAdminPanel } from '@/components/admin/client-admin-panel'
import { ExportConfiguration } from '@/components/admin/export-configuration'
import { CEOCommandCenter } from '@/components/admin/ceo-command-center'
import { ClientWizard } from '@/components/admin/client-wizard'
import { LicenseManager } from '@/components/admin/license-manager'
import { ExecutiveDashboard } from '@/components/admin/executive-dashboard'
import { CommercialCRM } from '@/components/admin/commercial-crm'
import { AlertCenter } from '@/components/admin/alert-center'
import { SecurityPanel } from '@/components/admin/security-panel'
import { 
  Users, 
  Crown,
  Activity,
  Globe,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Brain,
  Building2,
  Plus,
  Calendar,
  DollarSign,
  Target,
  Bell,
  Lock
} from 'lucide-react'

interface SystemOverview {
  health: 'healthy' | 'warning' | 'critical'
  uptime: number
  totalTenants: number
  activeTenants: number
  totalUsers: number
  activeUsers: number
  totalTemplates: number
  activeTemplates: number
  systemLoad: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  securityStatus: {
    failedLogins: number
    suspiciousActivity: number
    lastSecurityScan: string
    vulnerabilities: number
  }
}

interface UserInfo {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'manager' | 'user'
  tenantId?: string
  permissions: string[]
  avatar?: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('command-center')
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<string>('tenant_001')
  const [showClientWizard, setShowClientWizard] = useState(false)

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
      systemLoad: {
        cpu: 68,
        memory: 72,
        disk: 45,
        network: 23
      },
      securityStatus: {
        failedLogins: 23,
        suspiciousActivity: 5,
        lastSecurityScan: new Date(Date.now() - 3600000).toISOString(),
        vulnerabilities: 1
      }
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

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400 border-green-400'
      case 'warning': return 'text-yellow-400 border-yellow-400'
      case 'critical': return 'text-red-400 border-red-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  if (!systemOverview || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando Centro de Control CEO...</p>
        </div>
      </div>
    )
  }

  // Client Wizard Modal
  if (showClientWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <ClientWizard 
          onComplete={(client) => {
            
            setShowClientWizard(false)
          }}
          onCancel={() => setShowClientWizard(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Principal */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎛️ Centro de Control CEO
            </h1>
            <p className="text-slate-300">
              Control total del sistema Silexar Pulse - TIER 0 Supremacy
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge 
              variant="outline" 
              className={getHealthColor(systemOverview.health)}
            >
              Sistema: {systemOverview.health.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              🔐 SUPER CEO
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemOverview.uptime}%</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Tenants</CardTitle>
              <Globe className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemOverview.activeTenants}</div>
              <p className="text-xs text-slate-400">{systemOverview.totalTenants} total</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemOverview.activeUsers}</div>
              <p className="text-xs text-slate-400">{systemOverview.totalUsers} total</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">CPU</CardTitle>
              <Cpu className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemOverview.systemLoad.cpu}%</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Memoria</CardTitle>
              <HardDrive className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemOverview.systemLoad.memory}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Ejecutivo
            </TabsTrigger>
            <TabsTrigger value="command-center" className="data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Comando
            </TabsTrigger>
            <TabsTrigger value="crm" className="data-[state=active]:bg-blue-600">
              <Target className="h-4 w-4 mr-2" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-cyan-600">
              <Building2 className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="licenses" className="data-[state=active]:bg-green-600">
              <Calendar className="h-4 w-4 mr-2" />
              Licencias
            </TabsTrigger>
            <TabsTrigger value="super-admin" className="data-[state=active]:bg-red-600">
              <Crown className="h-4 w-4 mr-2" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="client-admin" className="data-[state=active]:bg-orange-600">
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-orange-600">
              <Bell className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-red-600">
              <Lock className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Executive Dashboard Tab */}
          <TabsContent value="dashboard">
            <ExecutiveDashboard />
          </TabsContent>

          {/* CEO Command Center Tab */}
          <TabsContent value="command-center">
            <CEOCommandCenter />
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm">
            <CommercialCRM />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Gestión de Clientes</h2>
                <p className="text-slate-400">Crear y administrar clientes del sistema</p>
              </div>
              <Button 
                onClick={() => setShowClientWizard(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Cliente
              </Button>
            </div>

            {/* Client Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{systemOverview.activeTenants}</p>
                      <p className="text-sm text-slate-400">Clientes Activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-600/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">3</p>
                      <p className="text-sm text-slate-400">Licencias por Expirar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">$12.5M</p>
                      <p className="text-sm text-slate-400">Ingresos Mensuales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Clients Quick View */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Clientes Recientes</CardTitle>
                <CardDescription className="text-slate-400">
                  Últimos clientes creados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'RDF Media', plan: 'Enterprise', status: 'active', date: '2025-01-15' },
                    { name: 'Grupo Prisa Chile', plan: 'Enterprise+', status: 'active', date: '2025-01-10' },
                    { name: 'Mega Media', plan: 'Professional', status: 'expiring', date: '2024-12-20' },
                  ].map((client, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          <p className="text-xs text-slate-400">{client.plan} • Creado {client.date}</p>
                        </div>
                      </div>
                      <Badge variant={client.status === 'active' ? 'default' : 'destructive'} className={client.status === 'active' ? 'bg-green-600' : ''}>
                        {client.status === 'active' ? 'Activo' : 'Por Expirar'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses">
            <LicenseManager />
          </TabsContent>

          {/* Super Admin Tab */}
          <TabsContent value="super-admin">
            <SuperAdminDashboard 
              currentUser={{
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: 'super_admin',
                permissions: currentUser.permissions
              }}
            />
          </TabsContent>

          {/* Client Admin Tab */}
          <TabsContent value="client-admin">
            <ClientAdminPanel 
              tenantId={selectedTenant}
              currentUser={{
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: {
                  id: 'role_admin',
                  name: 'Administrador',
                  description: 'Acceso completo al sistema',
                  level: 10,
                  permissions: [],
                  isSystem: false,
                  color: 'red'
                },
                permissions: [],
                status: 'active',
                lastLogin: new Date().toISOString(),
                createdAt: '2024-01-15T00:00:00Z',
                updatedAt: new Date().toISOString(),
                department: 'Administración',
                position: 'CEO',
                twoFactorEnabled: true,
                loginAttempts: 0,
                sessionCount: 1
              }}
            />
          </TabsContent>

          {/* Export Configuration Tab */}
          <TabsContent value="export-config">
            <ExportConfiguration tenantId={selectedTenant} />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertCenter />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <SecurityPanel />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm pt-6 border-t border-slate-700">
          <p>🎛️ SILEXAR PULSE QUANTUM - CEO CONTROL CENTER - TIER 0 SUPREMACY</p>
          <p>Pentagon++ Security • AI-Powered • 2030-Ready Architecture</p>
        </div>
      </div>
    </div>
  )
}