/**
 * MÓDULO 1.2: ADMINISTRACIÓN CLIENTE - TIER 0 Fortune 10
 * 
 * @description Gestión de usuarios y roles con RBAC granular,
 * configuración de políticas de negocio y modo operativo
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - Client Administration Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Shield, 
  Settings, 
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crown,
  User,
  Briefcase,
  Clock,
  Activity,
  FileText,
  BarChart3,
  Zap,
  Bot,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

/**
 * Interfaces para Administración Cliente
 */
interface ClientUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  lastLogin?: string
  createdAt: string
  updatedAt: string
  department?: string
  position?: string
  phone?: string
  twoFactorEnabled: boolean
  loginAttempts: number
  sessionCount: number
}

interface UserRole {
  id: string
  name: string
  description: string
  level: number
  permissions: Permission[]
  isSystem: boolean
  color: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  actions: string[]
  conditions?: PermissionCondition[]
}

interface PermissionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | number | boolean
}

interface BusinessPolicy {
  id: string
  name: string
  description: string
  category: 'security' | 'workflow' | 'data' | 'compliance'
  enabled: boolean
  rules: PolicyRule[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface PolicyRule {
  id: string
  condition: string
  action: string
  parameters: Record<string, any>
  priority: number
}

interface OperationalMode {
  mode: 'copilot' | 'autonomous'
  description: string
  features: {
    autoApproval: boolean
    aiDecisions: boolean
    humanOverride: boolean
    auditLevel: 'basic' | 'detailed' | 'comprehensive'
  }
  thresholds: {
    maxAutoAmount: number
    riskTolerance: number
    confidenceLevel: number
  }
}

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure' | 'warning'
}

interface ClientAdminPanelProps {
  tenantId: string
  currentUser: ClientUser
}

/**
 * Panel de Administración Cliente
 */
export function ClientAdminPanel({ tenantId, currentUser }: ClientAdminPanelProps) {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<ClientUser[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [policies, setPolicies] = useState<BusinessPolicy[]>([])
  const [operationalMode, setOperationalMode] = useState<OperationalMode | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers()
    loadRoles()
    loadPermissions()
    loadPolicies()
    loadOperationalMode()
    loadAuditLogs()
  }, [tenantId])

  /**
   * Cargar usuarios del tenant
   */
  const loadUsers = async () => {
    const mockUsers: ClientUser[] = [
      {
        id: 'user_001',
        name: 'María González',
        email: 'maria.gonzalez@acme.com',
        avatar: '/avatars/maria.jpg',
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
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
        department: 'Administración',
        position: 'Gerente General',
        phone: '+56 9 8765 4321',
        twoFactorEnabled: true,
        loginAttempts: 0,
        sessionCount: 2
      },
      {
        id: 'user_002',
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@acme.com',
        role: {
          id: 'role_manager',
          name: 'Gerente',
          description: 'Gestión de equipos y reportes',
          level: 7,
          permissions: [],
          isSystem: false,
          color: 'blue'
        },
        permissions: [],
        status: 'active',
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        department: 'Ventas',
        position: 'Gerente Comercial',
        phone: '+56 9 7654 3210',
        twoFactorEnabled: false,
        loginAttempts: 0,
        sessionCount: 1
      },
      {
        id: 'user_003',
        name: 'Ana Silva',
        email: 'ana.silva@acme.com',
        role: {
          id: 'role_user',
          name: 'Usuario',
          description: 'Acceso básico al sistema',
          level: 3,
          permissions: [],
          isSystem: false,
          color: 'green'
        },
        permissions: [],
        status: 'pending',
        createdAt: '2025-02-05T00:00:00Z',
        updatedAt: new Date().toISOString(),
        department: 'Ventas',
        position: 'Ejecutiva Comercial',
        phone: '+56 9 6543 2109',
        twoFactorEnabled: false,
        loginAttempts: 0,
        sessionCount: 0
      }
    ]
    setUsers(mockUsers)
  }

  /**
   * Cargar roles disponibles
   */
  const loadRoles = async () => {
    const mockRoles: UserRole[] = [
      {
        id: 'role_admin',
        name: 'Administrador',
        description: 'Acceso completo al sistema con capacidades de configuración',
        level: 10,
        permissions: [],
        isSystem: false,
        color: 'red'
      },
      {
        id: 'role_manager',
        name: 'Gerente',
        description: 'Gestión de equipos, reportes y configuraciones limitadas',
        level: 7,
        permissions: [],
        isSystem: false,
        color: 'blue'
      },
      {
        id: 'role_supervisor',
        name: 'Supervisor',
        description: 'Supervisión de operaciones y equipos asignados',
        level: 5,
        permissions: [],
        isSystem: false,
        color: 'purple'
      },
      {
        id: 'role_user',
        name: 'Usuario',
        description: 'Acceso básico a funcionalidades operativas',
        level: 3,
        permissions: [],
        isSystem: false,
        color: 'green'
      },
      {
        id: 'role_viewer',
        name: 'Visualizador',
        description: 'Solo lectura de información y reportes',
        level: 1,
        permissions: [],
        isSystem: false,
        color: 'gray'
      }
    ]
    setRoles(mockRoles)
  }

  /**
   * Cargar permisos disponibles
   */
  const loadPermissions = async () => {
    const mockPermissions: Permission[] = [
      {
        id: 'perm_crm_read',
        name: 'CRM - Lectura',
        description: 'Ver información de clientes y prospectos',
        category: 'CRM',
        resource: 'crm',
        actions: ['read']
      },
      {
        id: 'perm_crm_write',
        name: 'CRM - Escritura',
        description: 'Crear y editar información de clientes',
        category: 'CRM',
        resource: 'crm',
        actions: ['read', 'write']
      },
      {
        id: 'perm_campaigns_manage',
        name: 'Campañas - Gestión',
        description: 'Crear, editar y gestionar campañas publicitarias',
        category: 'Campañas',
        resource: 'campaigns',
        actions: ['read', 'write', 'delete']
      },
      {
        id: 'perm_reports_view',
        name: 'Reportes - Visualización',
        description: 'Acceso a reportes y analytics',
        category: 'Reportes',
        resource: 'reports',
        actions: ['read']
      },
      {
        id: 'perm_admin_users',
        name: 'Administración - Usuarios',
        description: 'Gestión completa de usuarios y roles',
        category: 'Administración',
        resource: 'users',
        actions: ['read', 'write', 'delete']
      }
    ]
    setPermissions(mockPermissions)
  }

  /**
   * Cargar políticas de negocio
   */
  const loadPolicies = async () => {
    const mockPolicies: BusinessPolicy[] = [
      {
        id: 'policy_001',
        name: 'Aprobación Automática de Contratos',
        description: 'Contratos menores a $50,000 se aprueban automáticamente',
        category: 'workflow',
        enabled: true,
        rules: [
          {
            id: 'rule_001',
            condition: 'contract.amount < 50000',
            action: 'auto_approve',
            parameters: { notify_manager: true },
            priority: 1
          }
        ],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'user_001'
      },
      {
        id: 'policy_002',
        name: 'Bloqueo por Intentos Fallidos',
        description: 'Bloquear cuenta después de 5 intentos fallidos de login',
        category: 'security',
        enabled: true,
        rules: [
          {
            id: 'rule_002',
            condition: 'login_attempts >= 5',
            action: 'block_account',
            parameters: { duration: 3600, notify_admin: true },
            priority: 1
          }
        ],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'user_001'
      }
    ]
    setPolicies(mockPolicies)
  }

  /**
   * Cargar modo operativo
   */
  const loadOperationalMode = async () => {
    const mockMode: OperationalMode = {
      mode: 'copilot',
      description: 'IA asiste en decisiones pero requiere aprobación humana',
      features: {
        autoApproval: false,
        aiDecisions: true,
        humanOverride: true,
        auditLevel: 'detailed'
      },
      thresholds: {
        maxAutoAmount: 10000,
        riskTolerance: 0.3,
        confidenceLevel: 0.85
      }
    }
    setOperationalMode(mockMode)
  }

  /**
   * Cargar logs de auditoría
   */
  const loadAuditLogs = async () => {
    const mockLogs: AuditLog[] = [
      {
        id: 'log_001',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        userId: 'user_001',
        userName: 'María González',
        action: 'user.create',
        resource: 'users',
        details: { targetUser: 'ana.silva@acme.com', role: 'Usuario' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        result: 'success'
      },
      {
        id: 'log_002',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'user_002',
        userName: 'Carlos Rodríguez',
        action: 'policy.update',
        resource: 'policies',
        details: { policyId: 'policy_001', changes: ['enabled: true'] },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        result: 'success'
      }
    ]
    setAuditLogs(mockLogs)
  }

  /**
   * Obtener color por estado de usuario
   */
  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500 text-green-400'
      case 'inactive': return 'border-gray-500 text-gray-400'
      case 'suspended': return 'border-red-500 text-red-400'
      case 'pending': return 'border-yellow-500 text-yellow-400'
      default: return 'border-gray-500 text-gray-400'
    }
  }

  /**
   * Obtener color por nivel de rol
   */
  const getRoleColor = (level: number) => {
    if (level >= 9) return 'text-red-400 border-red-400'
    if (level >= 7) return 'text-blue-400 border-blue-400'
    if (level >= 5) return 'text-purple-400 border-purple-400'
    if (level >= 3) return 'text-green-400 border-green-400'
    return 'text-gray-400 border-gray-400'
  }

  /**
   * Cambiar modo operativo
   */
  const toggleOperationalMode = () => {
    if (operationalMode) {
      const newMode: OperationalMode = {
        ...operationalMode,
        mode: operationalMode.mode === 'copilot' ? 'autonomous' : 'copilot',
        description: operationalMode.mode === 'copilot' 
          ? 'IA toma decisiones automáticamente dentro de parámetros definidos'
          : 'IA asiste en decisiones pero requiere aprobación humana'
      }
      setOperationalMode(newMode)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ⚙️ Administración Cliente
          </h2>
          <p className="text-slate-300">
            Gestión de usuarios, roles y políticas de negocio
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Tenant: {tenantId}
          </Badge>
          <Badge 
            variant="outline" 
            className={operationalMode?.mode === 'autonomous' ? 'text-orange-400 border-orange-400' : 'text-green-400 border-green-400'}
          >
            Modo: {operationalMode?.mode.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* KPIs de Administración */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-slate-400">
              {users.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Roles Configurados</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {roles.length}
            </div>
            <p className="text-xs text-slate-400">
              {permissions.length} permisos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Políticas Activas</CardTitle>
            <FileText className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {policies.filter(p => p.enabled).length}
            </div>
            <p className="text-xs text-slate-400">
              {policies.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.reduce((sum, u) => sum + u.sessionCount, 0)}
            </div>
            <p className="text-xs text-slate-400">
              Conexiones actuales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger value="users" className="data-[state=active]:bg-green-600">
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="policies" className="data-[state=active]:bg-purple-600">
            <FileText className="h-4 w-4 mr-2" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="mode" className="data-[state=active]:bg-orange-600">
            <Bot className="h-4 w-4 mr-2" />
            Modo IA
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-red-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Auditoría
          </TabsTrigger>
        </TabsList>

        {/* Tab Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    Gestión de Usuarios
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Control de acceso con RBAC granular
                  </CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {user.name.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium text-lg">
                            {user.name}
                          </h3>
                          <Badge 
                            variant="outline"
                            className={getUserStatusColor(user.status)}
                          >
                            {user.status}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={getRoleColor(user.role.level)}
                          >
                            {user.role.name}
                          </Badge>
                          {user.twoFactorEnabled && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              2FA
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {user.email} • {user.department} • {user.position}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                          {user.lastLogin && (
                            <span>
                              Último acceso: {new Date(user.lastLogin).toLocaleString()}
                            </span>
                          )}
                          <span>Sesiones: {user.sessionCount}</span>
                          {user.loginAttempts > 0 && (
                            <span className="text-yellow-400">
                              Intentos fallidos: {user.loginAttempts}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`${user.status === 'active' ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'} hover:bg-opacity-10`}
                      >
                        {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Roles */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Roles del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div 
                      key={role.id}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{role.name}</h4>
                          <Badge 
                            variant="outline"
                            className={getRoleColor(role.level)}
                          >
                            Nivel {role.level}
                          </Badge>
                          {role.isSystem && (
                            <Badge variant="outline" className="border-red-400 text-red-400">
                              Sistema
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!role.isSystem && (
                            <Button size="sm" variant="outline" className="border-red-500 text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        {role.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">
                          {users.filter(u => u.role.id === role.id).length} usuarios asignados
                        </span>
                        <Button size="sm" variant="outline">
                          Ver Permisos
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-400" />
                  Permisos Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div 
                      key={permission.id}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">
                          {permission.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {permission.category}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">
                        {permission.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {permission.actions.map((action) => (
                          <Badge key={action} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Políticas */}
        <TabsContent value="policies" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Políticas de Negocio
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Automatización de procesos y reglas de negocio
                  </CardDescription>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Nueva Política
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div 
                    key={policy.id}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{policy.name}</h4>
                        <Badge 
                          variant="outline"
                          className={
                            policy.category === 'security' ? 'border-red-400 text-red-400' :
                            policy.category === 'workflow' ? 'border-blue-400 text-blue-400' :
                            policy.category === 'data' ? 'border-green-400 text-green-400' :
                            'border-yellow-400 text-yellow-400'
                          }
                        >
                          {policy.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={policy.enabled}
                          onCheckedChange={() => {
                            const updatedPolicies = policies.map(p => 
                              p.id === policy.id ? { ...p, enabled: !p.enabled } : p
                            )
                            setPolicies(updatedPolicies)
                          }}
                        />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      {policy.description}
                    </p>
                    <div className="space-y-2">
                      {policy.rules.map((rule) => (
                        <div key={rule.id} className="p-2 bg-slate-800/50 rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">
                              Si: <code className="text-blue-400">{rule.condition}</code>
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Prioridad: {rule.priority}
                            </Badge>
                          </div>
                          <span className="text-slate-300">
                            Entonces: <code className="text-green-400">{rule.action}</code>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>
                        Creado: {new Date(policy.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Actualizado: {new Date(policy.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Modo IA */}
        <TabsContent value="mode" className="space-y-6">
          {operationalMode && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-orange-400" />
                  Modo Operativo IA
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configuración del nivel de autonomía del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selector de Modo */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        Modo Actual: {operationalMode.mode === 'copilot' ? 'Copiloto' : 'Autónomo'}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {operationalMode.description}
                      </p>
                    </div>
                    <Switch 
                      checked={operationalMode.mode === 'autonomous'}
                      onCheckedChange={toggleOperationalMode}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${
                      operationalMode.mode === 'copilot' ? 'border-green-500 bg-green-500/10' : 'border-slate-600'
                    }`}>
                      <h5 className="text-white font-medium mb-2">🤝 Modo Copiloto</h5>
                      <ul className="text-slate-400 text-sm space-y-1">
                        <li>• IA asiste en decisiones</li>
                        <li>• Requiere aprobación humana</li>
                        <li>• Control total del usuario</li>
                        <li>• Auditoría detallada</li>
                      </ul>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${
                      operationalMode.mode === 'autonomous' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-600'
                    }`}>
                      <h5 className="text-white font-medium mb-2">🤖 Modo Autónomo</h5>
                      <ul className="text-slate-400 text-sm space-y-1">
                        <li>• IA toma decisiones automáticas</li>
                        <li>• Dentro de parámetros definidos</li>
                        <li>• Override humano disponible</li>
                        <li>• Auditoría completa</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Configuración de Características */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Características</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-300">Aprobación Automática</Label>
                        <Switch 
                          checked={operationalMode.features.autoApproval}
                          onCheckedChange={(checked) => {
                            setOperationalMode({
                              ...operationalMode,
                              features: { ...operationalMode.features, autoApproval: checked }
                            })
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-300">Decisiones IA</Label>
                        <Switch 
                          checked={operationalMode.features.aiDecisions}
                          onCheckedChange={(checked) => {
                            setOperationalMode({
                              ...operationalMode,
                              features: { ...operationalMode.features, aiDecisions: checked }
                            })
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-300">Override Humano</Label>
                        <Switch 
                          checked={operationalMode.features.humanOverride}
                          onCheckedChange={(checked) => {
                            setOperationalMode({
                              ...operationalMode,
                              features: { ...operationalMode.features, humanOverride: checked }
                            })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Nivel de Auditoría</Label>
                        <Select 
                          value={operationalMode.features.auditLevel}
                          onValueChange={(value: 'basic' | 'detailed' | 'comprehensive') => {
                            setOperationalMode({
                              ...operationalMode,
                              features: { ...operationalMode.features, auditLevel: value }
                            })
                          }}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="detailed">Detallado</SelectItem>
                            <SelectItem value="comprehensive">Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Umbrales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Monto Máximo Auto ($)</Label>
                        <Input 
                          type="number"
                          value={operationalMode.thresholds.maxAutoAmount}
                          onChange={(e) => {
                            setOperationalMode({
                              ...operationalMode,
                              thresholds: { 
                                ...operationalMode.thresholds, 
                                maxAutoAmount: parseInt(e.target.value) || 0 
                              }
                            })
                          }}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Tolerancia al Riesgo</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={operationalMode.thresholds.riskTolerance}
                          onChange={(e) => {
                            setOperationalMode({
                              ...operationalMode,
                              thresholds: { 
                                ...operationalMode.thresholds, 
                                riskTolerance: parseFloat(e.target.value) || 0 
                              }
                            })
                          }}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Nivel de Confianza</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={operationalMode.thresholds.confidenceLevel}
                          onChange={(e) => {
                            setOperationalMode({
                              ...operationalMode,
                              thresholds: { 
                                ...operationalMode.thresholds, 
                                confidenceLevel: parseFloat(e.target.value) || 0 
                              }
                            })
                          }}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Auditoría */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-400" />
                Logs de Auditoría
              </CardTitle>
              <CardDescription className="text-slate-400">
                Registro completo de acciones y decisiones automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={
                            log.result === 'success' ? 'border-green-400 text-green-400' :
                            log.result === 'warning' ? 'border-yellow-400 text-yellow-400' :
                            'border-red-400 text-red-400'
                          }
                        >
                          {log.result === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                           log.result === 'warning' ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                           <XCircle className="h-3 w-3 mr-1" />}
                          {log.result}
                        </Badge>
                        <span className="text-slate-400 text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {log.userName}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {log.ipAddress} • Recurso: {log.resource}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}