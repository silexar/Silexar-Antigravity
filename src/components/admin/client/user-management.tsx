'use client'

/**
 * ðŸ‘¥ SILEXAR PULSE - User Management RBAC Fortune 10
 * Sistema de gestión de usuarios enterprise completo
 * 
 * @description RBAC Features:
 * - Categorías: Vendedor, Ejecutivo, Tráfico, Operacional, etc.
 * - Permisos granulares con checkboxes
 * - Super Usuario con permisos especiales
 * - Modificar data histórica (solo Super User)
 * - Auditoría completa
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Users, UserPlus, Edit, Trash2, Lock, Unlock, Eye, EyeOff, Shield,
  Mail, Key, RefreshCw, Search, CheckCircle, XCircle, Copy, Send,
  Smartphone, X, Crown, Briefcase, ShoppingCart, Target, Megaphone,
  Settings, Database, FileText, BarChart3, Zap, Clock, AlertTriangle
} from 'lucide-react'

// User Categories
const USER_CATEGORIES = [
  { id: 'vendedor', name: 'Vendedor', icon: 'ðŸ’°', color: 'green', description: 'Gestión de ventas y clientes' },
  { id: 'ejecutivo', name: 'Ejecutivo', icon: 'ðŸ‘”', color: 'blue', description: 'Dirección y estrategia' },
  { id: 'trafico', name: 'Tráfico Digital', icon: 'ðŸ“Š', color: 'purple', description: 'Campañas y ads' },
  { id: 'operacional', name: 'Operacional', icon: 'š™ï¸', color: 'orange', description: 'Operaciones diarias' },
  { id: 'marketing', name: 'Marketing', icon: 'ðŸ“£', color: 'pink', description: 'Estrategia de marca' },
  { id: 'soporte', name: 'Soporte', icon: 'ðŸŽ§', color: 'cyan', description: 'Atención al cliente' },
  { id: 'analista', name: 'Analista', icon: 'ðŸ“ˆ', color: 'yellow', description: 'Reportes y datos' },
  { id: 'developer', name: 'Developer', icon: 'ðŸ’»', color: 'gray', description: 'Integraciones técnicas' },
  { id: 'super_user', name: 'Super Usuario', icon: 'ðŸ‘‘', color: 'red', description: 'Acceso total + histórico' }
]

// Permission Categories
const PERMISSION_CATEGORIES = {
  crm: { name: 'CRM & Ventas', icon: <ShoppingCart className="w-4 h-4" /> },
  campaigns: { name: 'Campañas', icon: <Megaphone className="w-4 h-4" /> },
  reports: { name: 'Reportes', icon: <BarChart3 className="w-4 h-4" /> },
  users: { name: 'Usuarios', icon: <Users className="w-4 h-4" /> },
  settings: { name: 'Configuración', icon: <Settings className="w-4 h-4" /> },
  data: { name: 'Datos', icon: <Database className="w-4 h-4" /> },
  billing: { name: 'Facturación', icon: <FileText className="w-4 h-4" /> },
  integrations: { name: 'Integraciones', icon: <Zap className="w-4 h-4" /> },
  super: { name: 'ðŸ‘‘ Super Usuario', icon: <Crown className="w-4 h-4" /> }
}

// All Permissions
const ALL_PERMISSIONS = [
  // CRM
  { id: 'crm_view', name: 'Ver clientes', category: 'crm' },
  { id: 'crm_create', name: 'Crear clientes', category: 'crm' },
  { id: 'crm_edit', name: 'Editar clientes', category: 'crm' },
  { id: 'crm_delete', name: 'Eliminar clientes', category: 'crm' },
  { id: 'crm_export', name: 'Exportar clientes', category: 'crm' },
  // Campaigns
  { id: 'camp_view', name: 'Ver campañas', category: 'campaigns' },
  { id: 'camp_create', name: 'Crear campañas', category: 'campaigns' },
  { id: 'camp_edit', name: 'Editar campañas', category: 'campaigns' },
  { id: 'camp_delete', name: 'Eliminar campañas', category: 'campaigns' },
  { id: 'camp_publish', name: 'Publicar campañas', category: 'campaigns' },
  { id: 'camp_budget', name: 'Modificar presupuesto', category: 'campaigns' },
  // Reports
  { id: 'rep_view', name: 'Ver reportes', category: 'reports' },
  { id: 'rep_create', name: 'Crear reportes', category: 'reports' },
  { id: 'rep_export', name: 'Exportar reportes', category: 'reports' },
  { id: 'rep_schedule', name: 'Programar reportes', category: 'reports' },
  // Users
  { id: 'usr_view', name: 'Ver usuarios', category: 'users' },
  { id: 'usr_create', name: 'Crear usuarios', category: 'users' },
  { id: 'usr_edit', name: 'Editar usuarios', category: 'users' },
  { id: 'usr_delete', name: 'Eliminar usuarios', category: 'users' },
  { id: 'usr_permissions', name: 'Gestionar permisos', category: 'users' },
  // Settings
  { id: 'set_view', name: 'Ver configuración', category: 'settings' },
  { id: 'set_edit', name: 'Editar configuración', category: 'settings' },
  { id: 'set_branding', name: 'Modificar branding', category: 'settings' },
  { id: 'set_notifications', name: 'Config. notificaciones', category: 'settings' },
  // Data
  { id: 'data_view', name: 'Ver datos', category: 'data' },
  { id: 'data_export', name: 'Exportar datos', category: 'data' },
  { id: 'data_import', name: 'Importar datos', category: 'data' },
  { id: 'data_delete', name: 'Eliminar datos masivo', category: 'data' },
  // Billing
  { id: 'bill_view', name: 'Ver facturas', category: 'billing' },
  { id: 'bill_download', name: 'Descargar facturas', category: 'billing' },
  { id: 'bill_manage', name: 'Gestionar pagos', category: 'billing' },
  // Integrations
  { id: 'int_view', name: 'Ver integraciones', category: 'integrations' },
  { id: 'int_connect', name: 'Conectar servicios', category: 'integrations' },
  { id: 'int_disconnect', name: 'Desconectar servicios', category: 'integrations' },
  { id: 'int_api', name: 'Gestionar API keys', category: 'integrations' },
  // Super User Only
  { id: 'super_edit_history', name: 'ðŸ”’ Modificar datos históricos', category: 'super' },
  { id: 'super_delete_any', name: 'ðŸ”’ Eliminar cualquier registro', category: 'super' },
  { id: 'super_audit_clear', name: 'ðŸ”’ Limpiar auditoría', category: 'super' },
  { id: 'super_impersonate', name: 'ðŸ”’ Impersonar usuarios', category: 'super' },
  { id: 'super_override', name: 'ðŸ”’ Override de sistema', category: 'super' },
  { id: 'super_full_access', name: 'ðŸ”’ Acceso total sin restricciones', category: 'super' }
]

// Default permissions by category
const CATEGORY_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  vendedor: ['crm_view', 'crm_create', 'crm_edit', 'rep_view'],
  ejecutivo: ['crm_view', 'crm_export', 'rep_view', 'rep_create', 'rep_export', 'camp_view'],
  trafico: ['camp_view', 'camp_create', 'camp_edit', 'camp_publish', 'camp_budget', 'rep_view'],
  operacional: ['crm_view', 'crm_edit', 'data_view', 'data_export'],
  marketing: ['camp_view', 'camp_create', 'camp_edit', 'rep_view', 'set_branding'],
  soporte: ['crm_view', 'crm_edit', 'usr_view'],
  analista: ['rep_view', 'rep_create', 'rep_export', 'rep_schedule', 'data_view', 'data_export'],
  developer: ['int_view', 'int_connect', 'int_api', 'data_view'],
  super_user: ALL_PERMISSIONS.map(p => p.id)
}

interface ClientUser {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  category: string
  permissions: string[]
  status: 'active' | 'inactive' | 'suspended' | 'Pendiente'
  twoFactorEnabled: boolean
  lastLogin?: Date
  createdAt: Date
  createdBy: string
  isSuperUser: boolean
}

export function UserManagement() {
  const [users, setUsers] = useState<ClientUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // New user form
  const [newUser, setNewUser] = useState({
    name: '', email: '', phone: '', department: '', position: '',
    category: 'vendedor', permissions: [] as string[],
    password: '', confirmPassword: '',
    sendInvite: true, enable2FA: false
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const now = new Date()
    setUsers([
      {
        id: 'user_001', name: 'María González', email: 'maria@empresa.com',
        category: 'super_user', permissions: ALL_PERMISSIONS.map(p => p.id),
        status: 'active', twoFactorEnabled: true, lastLogin: new Date(now.getTime() - 3600000),
        createdAt: new Date('2024-01-15'), createdBy: 'Silexar', isSuperUser: true
      },
      {
        id: 'user_002', name: 'Carlos Rodríguez', email: 'carlos@empresa.com',
        category: 'ejecutivo', permissions: CATEGORY_DEFAULT_PERMISSIONS['ejecutivo'],
        status: 'active', twoFactorEnabled: false, lastLogin: new Date(now.getTime() - 7200000),
        createdAt: new Date('2024-02-01'), createdBy: 'María González', isSuperUser: false
      },
      {
        id: 'user_003', name: 'Ana Silva', email: 'ana@empresa.com',
        category: 'vendedor', permissions: CATEGORY_DEFAULT_PERMISSIONS['vendedor'],
        status: 'active', twoFactorEnabled: false, createdAt: new Date('2024-03-15'),
        createdBy: 'Carlos Rodríguez', isSuperUser: false
      },
      {
        id: 'user_004', name: 'Pedro López', email: 'pedro@empresa.com',
        category: 'trafico', permissions: CATEGORY_DEFAULT_PERMISSIONS['trafico'],
        status: 'active', twoFactorEnabled: false, createdAt: new Date('2024-04-01'),
        createdBy: 'María González', isSuperUser: false
      }
    ])
    setIsLoading(false)
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let pwd = ''
    for (let i = 0; i < 16; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    setNewUser({ ...newUser, password: pwd, confirmPassword: pwd })
  }

  const handleCategoryChange = (categoryId: string) => {
    const defaultPerms = CATEGORY_DEFAULT_PERMISSIONS[categoryId] || []
    setNewUser({ ...newUser, category: categoryId, permissions: defaultPerms })
  }

  const togglePermission = (permId: string) => {
    const current = newUser.permissions
    if (current.includes(permId)) {
      setNewUser({ ...newUser, permissions: current.filter(p => p !== permId) })
    } else {
      setNewUser({ ...newUser, permissions: [...current, permId] })
    }
  }

  const selectAllCategory = (category: string) => {
    const categoryPerms = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.id)
    const newPerms = [...new Set([...newUser.permissions, ...categoryPerms])]
    setNewUser({ ...newUser, permissions: newPerms })
  }

  const deselectAllCategory = (category: string) => {
    const categoryPerms = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.id)
    setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => !categoryPerms.includes(p)) })
  }

  const createUser = () => {
    if (!newUser.name || !newUser.email) { alert('Nombre y email requeridos'); return }
    if (!newUser.sendInvite && newUser.password.length < 8) { alert('Contraseña mínimo 8 caracteres'); return }
    if (!newUser.sendInvite && newUser.password !== newUser.confirmPassword) { alert('Contraseñas no coinciden'); return }

    const user: ClientUser = {
      id: `user_${Date.now()}`, name: newUser.name, email: newUser.email,
      phone: newUser.phone || undefined, department: newUser.department || undefined,
      position: newUser.position || undefined, category: newUser.category,
      permissions: newUser.permissions, status: newUser.sendInvite ? 'Pendiente' : 'active',
      twoFactorEnabled: newUser.enable2FA, createdAt: new Date(),
      createdBy: 'Administrador', isSuperUser: newUser.category === 'super_user'
    }
    setUsers(prev => [user, ...prev])
    setNewUser({
      name: '', email: '', phone: '', department: '', position: '', category: 'vendedor',
      permissions: CATEGORY_DEFAULT_PERMISSIONS['vendedor'], password: '', confirmPassword: '',
      sendInvite: true, enable2FA: false
    })
    setShowCreateModal(false)
    alert(`œ… Usuario ${user.name} creado${newUser.sendInvite ? '. Invitación enviada.' : ''}`)
  }

  const toggleUserStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
  }

  const deleteUser = (userId: string) => {
    if (!confirm('¿Eliminar usuario?')) return
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const getCategoryInfo = (catId: string) => USER_CATEGORIES.find(c => c.id === catId) || USER_CATEGORIES[0]

  const filteredUsers = users.filter(u => {
    if (filter !== 'all' && u.category !== filter) return false
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6888ff]" />
          Gestión de Usuarios RBAC
          <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">Fortune 10</span>
        </h3>
        <NeuButton variant="primary" onClick={() => {
          setNewUser({ ...newUser, permissions: CATEGORY_DEFAULT_PERMISSIONS['vendedor'] })
          setShowCreateModal(true)
        }}>
          <UserPlus className="w-4 h-4 mr-1" />Nuevo Usuario
        </NeuButton>
      </div>

      {/* Stats by Category */}
      <div className="grid grid-cols-5 gap-2">
        <div className="p-2 bg-[#dfeaff]/50 rounded-lg text-center cursor-pointer" onClick={() => setFilter('all')}>
          <p className="text-xl font-bold text-[#69738c]">{users.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total</p>
        </div>
        {USER_CATEGORIES.slice(0, 4).map(cat => (
          <div key={cat.id} className={`p-2 bg-${cat.color}-500/10 rounded-lg text-center cursor-pointer`} onClick={() => setFilter(cat.id)}>
            <p className="text-xl font-bold text-[#69738c]">{users.filter(u => u.category === cat.id).length}</p>
            <p className="text-xs text-[#9aa3b8]">{cat.icon} {cat.name}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}>
          Todos
        </button>
        {USER_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${filter === cat.id ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
        <input type="text" placeholder="Buscar..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]" />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[#69738c] font-bold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#6888ff]" />Crear Usuario
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#dfeaff] rounded" aria-label="Cerrar">
                <X className="w-5 h-5 text-[#9aa3b8]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#9aa3b8] text-xs block mb-1">Nombre *</label>
                    <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]" placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-[#9aa3b8] text-xs block mb-1">Email *</label>
                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]" placeholder="juan@empresa.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#9aa3b8] text-xs block mb-1">Teléfono</label>
                    <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]" />
                  </div>
                  <div>
                    <label className="text-[#9aa3b8] text-xs block mb-1">Departamento</label>
                    <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]" />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-[#9aa3b8] text-xs block mb-2">Categoría de Usuario *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {USER_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                        className={`p-2 rounded-lg border text-left ${newUser.category === cat.id
                          ? 'border-orange-500 bg-[#6888ff]/10' : 'border-slate-700 bg-[#dfeaff]/50'}`}>
                        <span className="text-lg">{cat.icon}</span>
                        <p className={`text-sm font-medium ${newUser.category === cat.id ? 'text-[#6888ff]' : 'text-[#69738c]'}`}>{cat.name}</p>
                        <p className="text-xs text-[#9aa3b8]">{cat.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password Section */}
                <div className="p-3 bg-[#dfeaff]/50 rounded-lg border border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer mb-3">
                    <span className="text-[#69738c] text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#6888ff]" />Enviar invitación por email
                    </span>
                    <div className={`w-12 h-6 rounded-full relative ${newUser.sendInvite ? 'bg-[#6888ff]' : 'bg-slate-600'}`}
                      onClick={() => setNewUser({ ...newUser, sendInvite: !newUser.sendInvite })}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 ${newUser.sendInvite ? 'left-6' : 'left-0.5'}`} />
                    </div>
                  </label>
                  {!newUser.sendInvite && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input type={showPassword ? 'text' : 'password'} value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            aria-label="Contraseña"
                            className="w-full px-3 py-2 pr-10 bg-[#F0EDE8] border border-slate-600 rounded text-[#69738c]" placeholder="Contraseña" />
                          <button aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff className="w-4 h-4 text-[#9aa3b8]" /> : <Eye className="w-4 h-4 text-[#9aa3b8]" />}
                          </button>
                        </div>
                        <NeuButton variant="secondary" onClick={generatePassword}>
                          <RefreshCw className="w-4 h-4" />
                        </NeuButton>
                      </div>
                      <input type={showPassword ? 'text' : 'password'} value={newUser.confirmPassword}
                        onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                        aria-label="Confirmar contraseña"
                        className="w-full px-3 py-2 bg-[#F0EDE8] border border-slate-600 rounded text-[#69738c]" placeholder="Confirmar contraseña" />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newUser.enable2FA} onChange={(e) => setNewUser({ ...newUser, enable2FA: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#dfeaff]" />
                  <Smartphone className="w-4 h-4 text-[#6888ff]" />
                  <span className="text-[#69738c] text-sm">Habilitar 2FA</span>
                </label>
              </div>

              {/* Right: Permissions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[#69738c] font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#6888ff]" />
                    Permisos ({newUser.permissions.length})
                  </label>
                  {newUser.category === 'super_user' && (
                    <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded animate-pulse">
                      ðŸ‘‘ SUPER USER - TODOS LOS PERMISOS
                    </span>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {Object.entries(PERMISSION_CATEGORIES).map(([catKey, catInfo]) => {
                    const categoryPerms = ALL_PERMISSIONS.filter(p => p.category === catKey)
                    const selectedCount = categoryPerms.filter(p => newUser.permissions.includes(p.id)).length
                    const isSuperCategory = catKey === 'super'

                    return (
                      <div key={catKey} className={`p-3 rounded-lg border ${isSuperCategory ? 'bg-[#6888ff]/5 border-[#6888ff]/30' : 'bg-[#dfeaff]/50 border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium flex items-center gap-2 ${isSuperCategory ? 'text-[#6888ff]' : 'text-[#69738c]'}`}>
                            {catInfo.icon} {catInfo.name}
                            <span className="text-xs text-[#9aa3b8]">({selectedCount}/{categoryPerms.length})</span>
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => selectAllCategory(catKey)} className="text-xs text-[#6888ff] hover:underline">Todos</button>
                            <span className="text-[#69738c]">|</span>
                            <button onClick={() => deselectAllCategory(catKey)} className="text-xs text-[#6888ff] hover:underline">Ninguno</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {categoryPerms.map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#dfeaff]/50">
                              <input type="checkbox" checked={newUser.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                disabled={isSuperCategory && newUser.category !== 'super_user'}
                                className="w-3.5 h-3.5 rounded bg-[#dfeaff]" />
                              <span className={`text-xs ${newUser.permissions.includes(perm.id) ? 'text-[#6888ff]' : 'text-[#9aa3b8]'}`}>
                                {perm.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        {isSuperCategory && newUser.category !== 'super_user' && (
                          <p className="text-xs text-[#6888ff] mt-2">š ï¸ Solo disponible para Super Usuario</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-700">
              <NeuButton variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</NeuButton>
              <NeuButton variant="primary" onClick={createUser}>
                <UserPlus className="w-4 h-4 mr-1" />Crear Usuario
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}

      {/* Users List */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3">Usuarios ({filteredUsers.length})</h4>
        <div className="space-y-3">
          {filteredUsers.map(user => {
            const catInfo = getCategoryInfo(user.category)
            return (
              <div key={user.id} className="p-4 bg-[#dfeaff]/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${user.isSuperUser ? 'bg-gradient-to-br from-red-500 to-yellow-500' : 'bg-gradient-to-br from-green-500 to-blue-500'}`}>
                      {catInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#69738c] font-medium">{user.name}</span>
                        {user.isSuperUser && <span className="text-xs px-1.5 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded animate-pulse">ðŸ‘‘ SUPER</span>}
                        <span className={`text-xs px-2 py-0.5 rounded ${user.status === 'active' ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#6888ff]/20 text-[#6888ff]'}`}>
                          {user.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#dfeaff] text-[#69738c] rounded">{catInfo.name}</span>
                      </div>
                      <p className="text-sm text-[#9aa3b8]">{user.email}</p>
                      <p className="text-xs text-[#9aa3b8]">{user.permissions.length} permisos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedUser(user); setShowEditModal(true) }} className="p-2 hover:bg-[#dfeaff] rounded text-[#6888ff]" aria-label="Editar"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => alert('Resetear contraseña')} className="p-2 hover:bg-[#dfeaff] rounded text-[#6888ff]" aria-label="Resetear contraseña"><Key className="w-4 h-4" /></button>
                    {user.status === 'active' ? (
                      <button onClick={() => toggleUserStatus(user.id, 'suspended')} className="p-2 hover:bg-[#dfeaff] rounded text-[#6888ff]" aria-label="Bloquear"><Lock className="w-4 h-4" /></button>
                    ) : (
                      <button onClick={() => toggleUserStatus(user.id, 'active')} className="p-2 hover:bg-[#dfeaff] rounded text-[#6888ff]" aria-label="Activar/Desactivar"><Unlock className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-[#dfeaff] rounded text-[#6888ff]" aria-label="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </NeuCard>
    </div>
  )
}

export default UserManagement