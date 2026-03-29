'use client'

/**
 * 👥 SILEXAR PULSE - User Management RBAC Fortune 10
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
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Users, UserPlus, Edit, Trash2, Lock, Unlock, Eye, EyeOff, Shield,
  Mail, Key, RefreshCw, Search, CheckCircle, XCircle, Copy, Send,
  Smartphone, X, Crown, Briefcase, ShoppingCart, Target, Megaphone,
  Settings, Database, FileText, BarChart3, Zap, Clock, AlertTriangle
} from 'lucide-react'

// User Categories
const USER_CATEGORIES = [
  { id: 'vendedor', name: 'Vendedor', icon: '💰', color: 'green', description: 'Gestión de ventas y clientes' },
  { id: 'ejecutivo', name: 'Ejecutivo', icon: '👔', color: 'blue', description: 'Dirección y estrategia' },
  { id: 'trafico', name: 'Tráfico Digital', icon: '📊', color: 'purple', description: 'Campañas y ads' },
  { id: 'operacional', name: 'Operacional', icon: '⚙️', color: 'orange', description: 'Operaciones diarias' },
  { id: 'marketing', name: 'Marketing', icon: '📣', color: 'pink', description: 'Estrategia de marca' },
  { id: 'soporte', name: 'Soporte', icon: '🎧', color: 'cyan', description: 'Atención al cliente' },
  { id: 'analista', name: 'Analista', icon: '📈', color: 'yellow', description: 'Reportes y datos' },
  { id: 'developer', name: 'Developer', icon: '💻', color: 'gray', description: 'Integraciones técnicas' },
  { id: 'super_user', name: 'Super Usuario', icon: '👑', color: 'red', description: 'Acceso total + histórico' }
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
  super: { name: '👑 Super Usuario', icon: <Crown className="w-4 h-4" /> }
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
  { id: 'super_edit_history', name: '🔒 Modificar datos históricos', category: 'super' },
  { id: 'super_delete_any', name: '🔒 Eliminar cualquier registro', category: 'super' },
  { id: 'super_audit_clear', name: '🔒 Limpiar auditoría', category: 'super' },
  { id: 'super_impersonate', name: '🔒 Impersonar usuarios', category: 'super' },
  { id: 'super_override', name: '🔒 Override de sistema', category: 'super' },
  { id: 'super_full_access', name: '🔒 Acceso total sin restricciones', category: 'super' }
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
  status: 'active' | 'inactive' | 'suspended' | 'pending'
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
      permissions: newUser.permissions, status: newUser.sendInvite ? 'pending' : 'active',
      twoFactorEnabled: newUser.enable2FA, createdAt: new Date(),
      createdBy: 'Admin', isSuperUser: newUser.category === 'super_user'
    }
    setUsers(prev => [user, ...prev])
    setNewUser({ name: '', email: '', phone: '', department: '', position: '', category: 'vendedor',
      permissions: CATEGORY_DEFAULT_PERMISSIONS['vendedor'], password: '', confirmPassword: '',
      sendInvite: true, enable2FA: false })
    setShowCreateModal(false)
    alert(`✅ Usuario ${user.name} creado${newUser.sendInvite ? '. Invitación enviada.' : ''}`)
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
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Gestión de Usuarios RBAC
          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Fortune 10</span>
        </h3>
        <NeuromorphicButton variant="primary" size="sm" onClick={() => {
          setNewUser({ ...newUser, permissions: CATEGORY_DEFAULT_PERMISSIONS['vendedor'] })
          setShowCreateModal(true)
        }}>
          <UserPlus className="w-4 h-4 mr-1" />Nuevo Usuario
        </NeuromorphicButton>
      </div>

      {/* Stats by Category */}
      <div className="grid grid-cols-5 gap-2">
        <div className="p-2 bg-slate-800/50 rounded-lg text-center cursor-pointer" onClick={() => setFilter('all')}>
          <p className="text-xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        {USER_CATEGORIES.slice(0, 4).map(cat => (
          <div key={cat.id} className={`p-2 bg-${cat.color}-500/10 rounded-lg text-center cursor-pointer`} onClick={() => setFilter(cat.id)}>
            <p className="text-xl font-bold text-white">{users.filter(u => u.category === cat.id).length}</p>
            <p className="text-xs text-slate-400">{cat.icon} {cat.name}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
          Todos
        </button>
        {USER_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${filter === cat.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NeuromorphicCard variant="glow" className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-400" />Crear Usuario
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-700 rounded" aria-label="Cerrar">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1">Nombre *</label>
                    <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1">Email *</label>
                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" placeholder="juan@empresa.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1">Teléfono</label>
                    <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1">Departamento</label>
                    <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-slate-400 text-xs block mb-2">Categoría de Usuario *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {USER_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                        className={`p-2 rounded-lg border text-left ${newUser.category === cat.id 
                          ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                        <span className="text-lg">{cat.icon}</span>
                        <p className={`text-sm font-medium ${newUser.category === cat.id ? 'text-orange-400' : 'text-white'}`}>{cat.name}</p>
                        <p className="text-xs text-slate-500">{cat.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password Section */}
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer mb-3">
                    <span className="text-white text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />Enviar invitación por email
                    </span>
                    <div className={`w-12 h-6 rounded-full relative ${newUser.sendInvite ? 'bg-blue-500' : 'bg-slate-600'}`}
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
                            className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-600 rounded text-white" placeholder="Contraseña" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                          </button>
                        </div>
                        <NeuromorphicButton variant="secondary" size="sm" onClick={generatePassword}>
                          <RefreshCw className="w-4 h-4" />
                        </NeuromorphicButton>
                      </div>
                      <input type={showPassword ? 'text' : 'password'} value={newUser.confirmPassword}
                        onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white" placeholder="Confirmar contraseña" />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newUser.enable2FA} onChange={(e) => setNewUser({ ...newUser, enable2FA: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-700" />
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">Habilitar 2FA</span>
                </label>
              </div>

              {/* Right: Permissions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Permisos ({newUser.permissions.length})
                  </label>
                  {newUser.category === 'super_user' && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">
                      👑 SUPER USER - TODOS LOS PERMISOS
                    </span>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {Object.entries(PERMISSION_CATEGORIES).map(([catKey, catInfo]) => {
                    const categoryPerms = ALL_PERMISSIONS.filter(p => p.category === catKey)
                    const selectedCount = categoryPerms.filter(p => newUser.permissions.includes(p.id)).length
                    const isSuperCategory = catKey === 'super'
                    
                    return (
                      <div key={catKey} className={`p-3 rounded-lg border ${isSuperCategory ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium flex items-center gap-2 ${isSuperCategory ? 'text-red-400' : 'text-white'}`}>
                            {catInfo.icon} {catInfo.name}
                            <span className="text-xs text-slate-500">({selectedCount}/{categoryPerms.length})</span>
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => selectAllCategory(catKey)} className="text-xs text-blue-400 hover:underline">Todos</button>
                            <span className="text-slate-600">|</span>
                            <button onClick={() => deselectAllCategory(catKey)} className="text-xs text-red-400 hover:underline">Ninguno</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {categoryPerms.map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-700/50">
                              <input type="checkbox" checked={newUser.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                disabled={isSuperCategory && newUser.category !== 'super_user'}
                                className="w-3.5 h-3.5 rounded bg-slate-700" />
                              <span className={`text-xs ${newUser.permissions.includes(perm.id) ? 'text-green-400' : 'text-slate-400'}`}>
                                {perm.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        {isSuperCategory && newUser.category !== 'super_user' && (
                          <p className="text-xs text-red-400 mt-2">⚠️ Solo disponible para Super Usuario</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-700">
              <NeuromorphicButton variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancelar</NeuromorphicButton>
              <NeuromorphicButton variant="primary" size="sm" onClick={createUser}>
                <UserPlus className="w-4 h-4 mr-1" />Crear Usuario
              </NeuromorphicButton>
            </div>
          </NeuromorphicCard>
        </div>
      )}

      {/* Users List */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">Usuarios ({filteredUsers.length})</h4>
        <div className="space-y-3">
          {filteredUsers.map(user => {
            const catInfo = getCategoryInfo(user.category)
            return (
              <div key={user.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${user.isSuperUser ? 'bg-gradient-to-br from-red-500 to-yellow-500' : 'bg-gradient-to-br from-green-500 to-blue-500'}`}>
                      {catInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{user.name}</span>
                        {user.isSuperUser && <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">👑 SUPER</span>}
                        <span className={`text-xs px-2 py-0.5 rounded ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">{catInfo.name}</span>
                      </div>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.permissions.length} permisos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedUser(user); setShowEditModal(true) }} className="p-2 hover:bg-slate-700 rounded text-blue-400" aria-label="Editar"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => alert('Resetear contraseña')} className="p-2 hover:bg-slate-700 rounded text-yellow-400" aria-label="Resetear contraseña"><Key className="w-4 h-4" /></button>
                    {user.status === 'active' ? (
                      <button onClick={() => toggleUserStatus(user.id, 'suspended')} className="p-2 hover:bg-slate-700 rounded text-orange-400" aria-label="Bloquear"><Lock className="w-4 h-4" /></button>
                    ) : (
                      <button onClick={() => toggleUserStatus(user.id, 'active')} className="p-2 hover:bg-slate-700 rounded text-green-400" aria-label="Activar/Desactivar"><Unlock className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-slate-700 rounded text-red-400" aria-label="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default UserManagement
