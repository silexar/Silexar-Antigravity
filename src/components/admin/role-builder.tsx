'use client'

/**
 * 🎭 SILEXAR PULSE - Role Builder
 * Constructor visual de roles y permisos
 * 
 * @description Role Management:
 * - Creador visual de roles
 * - Matriz de permisos
 * - Herencia de roles
 * - Access control
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Shield,
  Plus,
  Check,
  X,
  Users,
  Lock,
  Save
} from 'lucide-react'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  usersCount: number
  isSystem: boolean
}

export function RoleBuilder() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions] = useState<Permission[]>([
    { id: 'campaigns.read', name: 'Ver Campañas', description: 'Ver listado y detalles', category: 'Campañas' },
    { id: 'campaigns.write', name: 'Editar Campañas', description: 'Crear y editar', category: 'Campañas' },
    { id: 'campaigns.delete', name: 'Eliminar Campañas', description: 'Eliminar campañas', category: 'Campañas' },
    { id: 'users.read', name: 'Ver Usuarios', description: 'Ver listado de usuarios', category: 'Usuarios' },
    { id: 'users.write', name: 'Gestionar Usuarios', description: 'Crear, editar usuarios', category: 'Usuarios' },
    { id: 'users.delete', name: 'Eliminar Usuarios', description: 'Eliminar usuarios', category: 'Usuarios' },
    { id: 'reports.read', name: 'Ver Reportes', description: 'Acceso a reportes', category: 'Reportes' },
    { id: 'reports.export', name: 'Exportar Reportes', description: 'Exportar datos', category: 'Reportes' },
    { id: 'settings.read', name: 'Ver Configuración', description: 'Ver settings', category: 'Sistema' },
    { id: 'settings.write', name: 'Editar Configuración', description: 'Modificar settings', category: 'Sistema' },
    { id: 'billing.read', name: 'Ver Facturación', description: 'Ver facturas', category: 'Facturación' },
    { id: 'billing.write', name: 'Gestionar Facturación', description: 'Gestionar pagos', category: 'Facturación' }
  ])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadRoles = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setRoles([
      {
        id: 'role_admin',
        name: 'Administrador',
        description: 'Acceso completo al sistema',
        permissions: permissions.map(p => p.id),
        usersCount: 5,
        isSystem: true
      },
      {
        id: 'role_editor',
        name: 'Editor',
        description: 'Gestión de campañas y contenido',
        permissions: ['campaigns.read', 'campaigns.write', 'users.read', 'reports.read', 'reports.export'],
        usersCount: 23,
        isSystem: true
      },
      {
        id: 'role_viewer',
        name: 'Viewer',
        description: 'Solo lectura',
        permissions: ['campaigns.read', 'users.read', 'reports.read'],
        usersCount: 45,
        isSystem: true
      },
      {
        id: 'role_billing',
        name: 'Billing Manager',
        description: 'Gestión de facturación',
        permissions: ['billing.read', 'billing.write', 'reports.read', 'reports.export'],
        usersCount: 3,
        isSystem: false
      }
    ])

    setIsLoading(false)
  }

  const categories = [...new Set(permissions.map(p => p.category))]

  const togglePermission = (permissionId: string) => {
    if (!selectedRole || selectedRole.isSystem) return
    
    setSelectedRole(prev => {
      if (!prev) return null
      const hasPermission = prev.permissions.includes(permissionId)
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }
    })
  }

  const saveRole = () => {
    if (!selectedRole) return
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? selectedRole : r))
    alert('Rol guardado exitosamente')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Role Builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          Role Builder
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nuevo Rol
        </NeuromorphicButton>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Roles List */}
        <div className="space-y-3">
          <h4 className="text-slate-400 text-sm">Roles ({roles.length})</h4>
          {roles.map(role => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedRole?.id === role.id
                  ? 'bg-orange-500/20 border border-orange-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium">{role.name}</span>
                {role.isSystem && (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 mb-2">{role.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {role.permissions.length} permisos
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {role.usersCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="col-span-2">
          {selectedRole ? (
            <NeuromorphicCard variant="embossed" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">
                  Permisos: {selectedRole.name}
                  {selectedRole.isSystem && (
                    <span className="text-xs ml-2 px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                      Sistema (solo lectura)
                    </span>
                  )}
                </h4>
                {!selectedRole.isSystem && (
                  <NeuromorphicButton variant="primary" size="sm" onClick={saveRole}>
                    <Save className="w-4 h-4 mr-1" />
                    Guardar
                  </NeuromorphicButton>
                )}
              </div>

              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category}>
                    <h5 className="text-sm text-slate-400 mb-2">{category}</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {permissions.filter(p => p.category === category).map(permission => {
                        const hasPermission = selectedRole.permissions.includes(permission.id)
                        return (
                          <div
                            key={permission.id}
                            onClick={() => togglePermission(permission.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              hasPermission
                                ? 'bg-green-500/20 border border-green-500/30'
                                : 'bg-slate-800/50 border border-slate-700'
                            } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-60' : 'hover:border-slate-600'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white">{permission.name}</span>
                              {hasPermission ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <X className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{permission.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Selecciona un rol para ver sus permisos
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoleBuilder
