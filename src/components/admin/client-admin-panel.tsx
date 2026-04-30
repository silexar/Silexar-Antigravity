/**
 * MÁ“DULO 1.2: ADMINISTRACIÁ“N CLIENTE - TIER 0 Fortune 10
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
import { NeuCard, NeuButton, NeuTabs, StatusBadge } from './_sdk/AdminDesignSystem'
import { getShadow } from './_sdk/AdminDesignSystem'
import { N } from './_sdk/AdminDesignSystem'
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
  status: 'active' | 'inactive' | 'suspended' | 'Pendiente'
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
        status: 'Pendiente',
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
        actions: ['read', 'write', 'Eliminar']
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
        actions: ['read', 'write', 'Eliminar']
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
      case 'active': return { border: '#6888ff', text: '#4ade80' }
      case 'inactive': return { border: '#6b7280', text: '#9ca3af' }
      case 'suspended': return { border: '#6888ff', text: '#f87171' }
      case 'Pendiente': return { border: '#6888ff', text: '#facc15' }
      default: return { border: '#6b7280', text: '#9ca3af' }
    }
  }

  /**
   * Obtener color por nivel de rol
   */
  const getRoleColor = (level: number) => {
    if (level >= 9) return { border: '#6888ff', text: '#f87171' }
    if (level >= 7) return { border: '#6888ff', text: '#60a5fa' }
    if (level >= 5) return { border: '#6888ff', text: '#c084fc' }
    if (level >= 3) return { border: '#6888ff', text: '#4ade80' }
    return { border: '#6b7280', text: '#9ca3af' }
  }

  /**
   * Obtener badge status
   */
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
      active: 'success',
      inactive: 'neutral',
      suspended: 'danger',
      pending: 'warning'
    }
    return statusMap[status] || 'neutral'
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

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: <Users style={{ width: 16, height: 16 }} /> },
    { id: 'roles', label: 'Roles', icon: <Shield style={{ width: 16, height: 16 }} /> },
    { id: 'policies', label: 'Políticas', icon: <FileText style={{ width: 16, height: 16 }} /> },
    { id: 'mode', label: 'Modo IA', icon: <Bot style={{ width: 16, height: 16 }} /> },
    { id: 'audit', label: 'Auditoría', icon: <BarChart3 style={{ width: 16, height: 16 }} /> }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text, marginBottom: '0.5rem' }}>
            🏢 Administración Cliente
          </h2>
          <p style={{ color: N.textSub }}>
            Gestión de usuarios, roles y políticas de negocio
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status="info" label={`Tenant: ${tenantId}`} />
          <StatusBadge
            status={operationalMode?.mode === 'autonomous' ? 'warning' : 'success'}
            label={`Modo: ${operationalMode?.mode.toUpperCase()}`}
          />
        </div>
      </div>

      {/* KPIs de Administración */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Usuarios Activos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>
                {users.filter(u => u.status === 'active').length}
              </p>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>{users.length} total</p>
            </div>
            <Users style={{ width: '1.5rem', height: '1.5rem', color: '#4ade80' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Roles Configurados</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{roles.length}</p>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>{permissions.length} permisos</p>
            </div>
            <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#60a5fa' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Políticas Activas</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>
                {policies.filter(p => p.enabled).length}
              </p>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>{policies.length} total</p>
            </div>
            <FileText style={{ width: '1.5rem', height: '1.5rem', color: '#c084fc' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Sesiones Activas</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>
                {users.reduce((sum, u) => sum + u.sessionCount, 0)}
              </p>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>Conexiones actuales</p>
            </div>
            <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#fb923c' }} />
          </div>
        </NeuCard>
      </div>

      {/* Tabs Principal */}
      <NeuTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Usuarios */}
      {activeTab === 'users' && (
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users style={{ color: '#4ade80', width: 20, height: 20 }} />
                  Gestión de Usuarios
                </h3>
                <p style={{ fontSize: '0.875rem', color: N.textSub }}>Control de acceso con RBAC granular</p>
              </div>
              <NeuButton variant="primary" onClick={() => { }}>
                <UserPlus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Nuevo Usuario
              </NeuButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {users.map((user) => {
                const statusColor = getUserStatusColor(user.status)
                const roleColor = getRoleColor(user.role.level)
                return (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'rgba(30,41,59,0.3)',
                      borderRadius: '0.5rem',
                      border: `1px solid ${N.dark}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        background: '#6888ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600
                      }}>
                        {user.name.split(' ').map(n => n.charAt(0)).join('')}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ color: N.text, fontWeight: 500, fontSize: '1.125rem' }}>{user.name}</h3>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: `1px solid ${statusColor.border}`,
                            color: statusColor.text
                          }}>
                            {user.status}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: `1px solid ${roleColor.border}`,
                            color: roleColor.text
                          }}>
                            {user.role.name}
                          </span>
                          {user.twoFactorEnabled && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              border: '1px solid #6888ff',
                              color: '#60a5fa'
                            }}>
                              2FA
                            </span>
                          )}
                        </div>
                        <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
                          {user.email} • {user.department} • {user.position}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: N.textSub }}>
                          {user.lastLogin && (
                            <span>Ášltimo acceso: {new Date(user.lastLogin).toLocaleString()}</span>
                          )}
                          <span>Sesiones: {user.sessionCount}</span>
                          {user.loginAttempts > 0 && (
                            <span style={{ color: '#facc15' }}>Intentos fallidos: {user.loginAttempts}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <NeuButton variant="secondary" onClick={() => setSelectedUser(user)}>
                        <Eye style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                        Ver
                      </NeuButton>
                      <NeuButton variant="secondary">
                        <Edit style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                        Editar
                      </NeuButton>
                      <NeuButton variant="secondary">
                        {user.status === 'active' ? <Lock style={{ width: '1rem', height: '1rem' }} /> : <Unlock style={{ width: '1rem', height: '1rem' }} />}
                      </NeuButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </NeuCard>
      )}

      {/* Tab Roles */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <NeuCard style={{ boxShadow: getShadow() }}>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Shield style={{ color: '#60a5fa', width: 20, height: 20 }} />
                Roles del Sistema
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {roles.map((role) => {
                  const roleColor = getRoleColor(role.level)
                  return (
                    <div
                      key={role.id}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(30,41,59,0.3)',
                        borderRadius: '0.5rem',
                        border: `1px solid ${N.dark}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ color: N.text, fontWeight: 500 }}>{role.name}</h4>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: `1px solid ${roleColor.border}`,
                            color: roleColor.text
                          }}>
                            Nivel {role.level}
                          </span>
                          {role.isSystem && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              border: '1px solid #6888ff',
                              color: '#f87171'
                            }}>
                              Sistema
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <NeuButton variant="secondary">
                            <Edit style={{ width: '1rem', height: '1rem' }} />
                          </NeuButton>
                          {!role.isSystem && (
                            <NeuButton variant="secondary">
                              <Trash2 style={{ width: '1rem', height: '1rem' }} />
                            </NeuButton>
                          )}
                        </div>
                      </div>
                      <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{role.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: N.textSub, fontSize: '0.75rem' }}>
                          {users.filter(u => u.role.id === role.id).length} usuarios asignados
                        </span>
                        <NeuButton variant="secondary">Ver Permisos</NeuButton>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </NeuCard>

          <NeuCard style={{ boxShadow: getShadow() }}>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <UserCheck style={{ color: '#4ade80', width: 20, height: 20 }} />
                Permisos Disponibles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(30,41,59,0.3)',
                      borderRadius: '0.5rem',
                      border: `1px solid ${N.dark}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: N.text, fontWeight: 500, fontSize: '0.875rem' }}>{permission.name}</h4>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        background: `${N.dark}50`,
                        color: N.textSub
                      }}>
                        {permission.category}
                      </span>
                    </div>
                    <p style={{ color: N.textSub, fontSize: '0.75rem', marginBottom: '0.5rem' }}>{permission.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {permission.actions.map((action) => (
                        <span key={action} style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: `${N.dark}50`,
                          color: N.textSub
                        }}>
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeuCard>
        </div>
      )}

      {/* Tab Políticas */}
      {activeTab === 'policies' && (
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText style={{ color: '#c084fc', width: 20, height: 20 }} />
                  Políticas de Negocio
                </h3>
                <p style={{ fontSize: '0.875rem', color: N.textSub }}>Automatización de procesos y reglas de negocio</p>
              </div>
              <NeuButton variant="primary" onClick={() => { }}>
                <Settings style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Nueva Política
              </NeuButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {policies.map((policy) => {
                const categoryColors = {
                  security: { border: '#6888ff', text: '#f87171' },
                  workflow: { border: '#6888ff', text: '#60a5fa' },
                  data: { border: '#6888ff', text: '#4ade80' },
                  compliance: { border: '#6888ff', text: '#facc15' }
                }
                const catColor = categoryColors[policy.category]
                return (
                  <div
                    key={policy.id}
                    style={{
                      padding: '1rem',
                      background: 'rgba(30,41,59,0.3)',
                      borderRadius: '0.5rem',
                      border: `1px solid ${N.dark}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ color: N.text, fontWeight: 500 }}>{policy.name}</h4>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: `1px solid ${catColor.border}`,
                          color: catColor.text
                        }}>
                          {policy.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            const updatedPolicies = policies.map(p =>
                              p.id === policy.id ? { ...p, enabled: !p.enabled } : p
                            )
                            setPolicies(updatedPolicies)
                          }}
                          style={{
                            width: '2.5rem',
                            height: '1.5rem',
                            borderRadius: '0.75rem',
                            background: policy.enabled ? '#6888ff' : N.dark,
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: '0.125rem',
                            left: policy.enabled ? '1.25rem' : '0.125rem',
                            transition: 'left 0.2s'
                          }} />
                        </button>
                        <NeuButton variant="secondary">
                          <Edit style={{ width: '1rem', height: '1rem' }} />
                        </NeuButton>
                      </div>
                    </div>
                    <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{policy.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {policy.rules.map((rule) => (
                        <div key={rule.id} style={{
                          padding: '0.5rem',
                          background: 'rgba(30,41,59,0.5)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: N.text }}>
                              Si: <code style={{ color: '#60a5fa' }}>{rule.condition}</code>
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              background: `${N.dark}50`,
                              color: N.textSub
                            }}>
                              Prioridad: {rule.priority}
                            </span>
                          </div>
                          <span style={{ color: N.text }}>
                            Entonces: <code style={{ color: '#4ade80' }}>{rule.action}</code>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: N.textSub }}>
                      <span>Creado: {new Date(policy.createdAt).toLocaleDateString()}</span>
                      <span>Actualizado: {new Date(policy.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </NeuCard>
      )}

      {/* Tab Modo IA */}
      {activeTab === 'mode' && operationalMode && (
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Bot style={{ color: '#fb923c', width: 20, height: 20 }} />
              Modo Operativo IA
            </h3>
            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>
              Configuración del nivel de autonomía del sistema
            </p>

            {/* Selector de Modo */}
            <div style={{
              padding: '1rem',
              background: 'rgba(30,41,59,0.3)',
              borderRadius: '0.5rem',
              border: `1px solid ${N.dark}`,
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ color: N.text, fontWeight: 500, marginBottom: '0.25rem' }}>
                    Modo Actual: {operationalMode.mode === 'copilot' ? 'Copiloto' : 'Autónomo'}
                  </h4>
                  <p style={{ color: N.textSub, fontSize: '0.875rem' }}>{operationalMode.description}</p>
                </div>
                <button
                  onClick={toggleOperationalMode}
                  style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '0.75rem',
                    background: operationalMode.mode === 'autonomous' ? '#fb923c' : '#6888ff',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '0.125rem',
                    left: operationalMode.mode === 'autonomous' ? '1.625rem' : '0.125rem',
                    transition: 'left 0.2s'
                  }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${operationalMode.mode === 'copilot' ? '#6888ff' : N.dark}`,
                  background: operationalMode.mode === 'copilot' ? 'rgba(34,197,94,0.1)' : 'transparent'
                }}>
                  <h5 style={{ color: N.text, fontWeight: 500, marginBottom: '0.5rem' }}>ðŸ¤ Modo Copiloto</h5>
                  <ul style={{ color: N.textSub, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li>• IA asiste en decisiones</li>
                    <li>• Requiere aprobación humana</li>
                    <li>• Control total del usuario</li>
                    <li>• Auditoría detallada</li>
                  </ul>
                </div>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${operationalMode.mode === 'autonomous' ? '#fb923c' : N.dark}`,
                  background: operationalMode.mode === 'autonomous' ? 'rgba(251,146,60,0.1)' : 'transparent'
                }}>
                  <h5 style={{ color: N.text, fontWeight: 500, marginBottom: '0.5rem' }}>ðŸ¤– Modo Autónomo</h5>
                  <ul style={{ color: N.textSub, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li>• IA toma decisiones automáticas</li>
                    <li>• Dentro de parámetros definidos</li>
                    <li>• Override humano disponible</li>
                    <li>• Auditoría completa</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Configuración de Características */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div style={{
                padding: '1rem',
                background: 'rgba(30,41,59,0.3)',
                borderRadius: '0.5rem',
                border: `1px solid ${N.dark}`
              }}>
                <h4 style={{ color: N.text, fontWeight: 500, marginBottom: '1rem' }}>Características</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: N.textSub }}>Aprobación Automática</span>
                    <button
                      onClick={() => setOperationalMode({ ...operationalMode, features: { ...operationalMode.features, autoApproval: !operationalMode.features.autoApproval } })}
                      style={{
                        width: '2.5rem',
                        height: '1.5rem',
                        borderRadius: '0.75rem',
                        background: operationalMode.features.autoApproval ? '#6888ff' : N.dark,
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '0.125rem',
                        left: operationalMode.features.autoApproval ? '1.25rem' : '0.125rem',
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: N.textSub }}>Decisiones IA</span>
                    <button
                      onClick={() => setOperationalMode({ ...operationalMode, features: { ...operationalMode.features, aiDecisions: !operationalMode.features.aiDecisions } })}
                      style={{
                        width: '2.5rem',
                        height: '1.5rem',
                        borderRadius: '0.75rem',
                        background: operationalMode.features.aiDecisions ? '#6888ff' : N.dark,
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '0.125rem',
                        left: operationalMode.features.aiDecisions ? '1.25rem' : '0.125rem',
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: N.textSub }}>Override Humano</span>
                    <button
                      onClick={() => setOperationalMode({ ...operationalMode, features: { ...operationalMode.features, humanOverride: !operationalMode.features.humanOverride } })}
                      style={{
                        width: '2.5rem',
                        height: '1.5rem',
                        borderRadius: '0.75rem',
                        background: operationalMode.features.humanOverride ? '#6888ff' : N.dark,
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '0.125rem',
                        left: operationalMode.features.humanOverride ? '1.25rem' : '0.125rem',
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: N.textSub }}>Nivel de Auditoría</span>
                    <select
                      value={operationalMode.features.auditLevel}
                      onChange={(e) => setOperationalMode({ ...operationalMode, features: { ...operationalMode.features, auditLevel: e.target.value as 'basic' | 'detailed' | 'comprehensive' } })}
                      style={{
                        padding: '0.5rem',
                        background: N.base,
                        border: `1px solid ${N.dark}`,
                        borderRadius: '0.5rem',
                        color: N.text
                      }}
                    >
                      <option value="basic">Básico</option>
                      <option value="detailed">Detallado</option>
                      <option value="comprehensive">Completo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(30,41,59,0.3)',
                borderRadius: '0.5rem',
                border: `1px solid ${N.dark}`
              }}>
                <h4 style={{ color: N.text, fontWeight: 500, marginBottom: '1rem' }}>Umbrales</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: N.textSub }}>Monto Máximo Auto ($)</span>
                    <input
                      type="number"
                      value={operationalMode.thresholds.maxAutoAmount}
                      onChange={(e) => setOperationalMode({ ...operationalMode, thresholds: { ...operationalMode.thresholds, maxAutoAmount: parseInt(e.target.value) || 0 } })}
                      style={{
                        padding: '0.5rem',
                        background: N.base,
                        border: `1px solid ${N.dark}`,
                        borderRadius: '0.5rem',
                        color: N.text
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: N.textSub }}>Tolerancia al Riesgo</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={operationalMode.thresholds.riskTolerance}
                      onChange={(e) => setOperationalMode({ ...operationalMode, thresholds: { ...operationalMode.thresholds, riskTolerance: parseFloat(e.target.value) || 0 } })}
                      style={{
                        padding: '0.5rem',
                        background: N.base,
                        border: `1px solid ${N.dark}`,
                        borderRadius: '0.5rem',
                        color: N.text
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: N.textSub }}>Nivel de Confianza</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={operationalMode.thresholds.confidenceLevel}
                      onChange={(e) => setOperationalMode({ ...operationalMode, thresholds: { ...operationalMode.thresholds, confidenceLevel: parseFloat(e.target.value) || 0 } })}
                      style={{
                        padding: '0.5rem',
                        background: N.base,
                        border: `1px solid ${N.dark}`,
                        borderRadius: '0.5rem',
                        color: N.text
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NeuCard>
      )}

      {/* Tab Auditoría */}
      {activeTab === 'audit' && (
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <BarChart3 style={{ color: '#f87171', width: 20, height: 20 }} />
              Logs de Auditoría
            </h3>
            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>
              Registro completo de acciones y decisiones automáticas
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.map((log) => {
                const resultColors = {
                  success: { border: '#6888ff', text: '#4ade80' },
                  warning: { border: '#6888ff', text: '#facc15' },
                  failure: { border: '#6888ff', text: '#f87171' }
                }
                const resColor = resultColors[log.result]
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(30,41,59,0.3)',
                      borderRadius: '0.5rem',
                      border: `1px solid ${N.dark}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: `1px solid ${resColor.border}`,
                          color: resColor.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {log.result === 'success' ? <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} /> :
                            log.result === 'warning' ? <AlertTriangle style={{ width: '0.75rem', height: '0.75rem' }} /> :
                              <XCircle style={{ width: '0.75rem', height: '0.75rem' }} />}
                          {log.result}
                        </span>
                        <span style={{ color: N.textSub, fontSize: '0.875rem' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        background: `${N.dark}50`,
                        color: N.textSub
                      }}>
                        {log.action}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: N.text, fontWeight: 500, fontSize: '0.875rem' }}>{log.userName}</p>
                        <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{log.ipAddress} • Recurso: {log.resource}</p>
                      </div>
                      <NeuButton variant="secondary">
                        <Eye style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                        Detalles
                      </NeuButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  )
}
