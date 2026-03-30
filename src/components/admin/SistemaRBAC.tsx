/**
 * 🔒 Sistema RBAC - Control de Acceso Basado en Roles Enterprise 2050
 *
 * Sistema de permisos granular con:
 * - Definición de roles (Traffic Manager, Ejecutivo, Programador, Cliente)
 * - Permisos por módulo y acción
 * - Hook usePermisos para verificación
 * - Componente ProtectedRoute para rutas
 * - HOC withPermission para componentes
 *
 * @enterprise TIER0 Fortune 10
 * @security Neuromorphic Level
 */

/* eslint-disable react-refresh/only-export-components */
'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, ShieldCheck, ShieldX, User, Lock,
  Unlock, Eye, Settings
} from 'lucide-react'

// ==================== TIPOS DE ROLES ====================

export type RolUsuario =
  | 'traffic_manager_senior'
  | 'ejecutivo_comercial'
  | 'programador'
  | 'cliente_portal'
  | 'admin'
  | 'viewer'

export type ModuloCampana =
  | 'campanas'
  | 'programacion'
  | 'tarifas'
  | 'facturacion'
  | 'materiales'
  | 'confirmaciones'
  | 'reportes'
  | 'configuracion'

export type AccionPermiso =
  | 'ver'
  | 'crear'
  | 'editar'
  | 'eliminar'
  | 'aprobar'
  | 'exportar'
  | 'enviar'

// ==================== DEFINICIÓN DE PERMISOS ====================

interface PermisoModulo {
  modulo: ModuloCampana
  acciones: AccionPermiso[]
}

interface DefinicionRol {
  id: RolUsuario
  nombre: string
  descripcion: string
  icono: React.ReactNode
  color: string
  permisos: PermisoModulo[]
}

const ROLES_DEFINIDOS: DefinicionRol[] = [
  {
    id: 'traffic_manager_senior',
    nombre: 'Traffic Manager Senior',
    descripcion: 'Gestión completa de campañas y programación',
    icono: <ShieldCheck className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-700',
    permisos: [
      { modulo: 'campanas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar'] },
      { modulo: 'programacion', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar'] },
      { modulo: 'tarifas', acciones: ['ver', 'editar'] },
      { modulo: 'facturacion', acciones: ['ver', 'crear', 'editar'] },
      { modulo: 'materiales', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
      { modulo: 'confirmaciones', acciones: ['ver', 'crear', 'enviar'] },
      { modulo: 'reportes', acciones: ['ver', 'exportar'] },
      { modulo: 'configuracion', acciones: ['ver', 'editar'] }
    ]
  },
  {
    id: 'ejecutivo_comercial',
    nombre: 'Ejecutivo Comercial',
    descripcion: 'Gestión comercial y confirmaciones',
    icono: <User className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-700',
    permisos: [
      { modulo: 'campanas', acciones: ['ver', 'crear', 'editar'] },
      { modulo: 'programacion', acciones: ['ver'] }, // Solo ver, no modificar técnica
      { modulo: 'tarifas', acciones: ['ver', 'editar'] },
      { modulo: 'facturacion', acciones: ['ver', 'crear'] },
      { modulo: 'materiales', acciones: ['ver'] },
      { modulo: 'confirmaciones', acciones: ['ver', 'crear', 'enviar'] },
      { modulo: 'reportes', acciones: ['ver', 'exportar'] }
    ]
  },
  {
    id: 'programador',
    nombre: 'Programador',
    descripcion: 'Programación técnica y materiales',
    icono: <Settings className="h-5 w-5" />,
    color: 'bg-green-100 text-green-700',
    permisos: [
      { modulo: 'campanas', acciones: ['ver'] },
      { modulo: 'programacion', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
      { modulo: 'materiales', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
      { modulo: 'confirmaciones', acciones: ['ver'] },
      { modulo: 'reportes', acciones: ['ver'] }
    ]
  },
  {
    id: 'cliente_portal',
    nombre: 'Cliente Portal',
    descripcion: 'Vista de campañas propias',
    icono: <Eye className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-700',
    permisos: [
      { modulo: 'campanas', acciones: ['ver'] }, // Solo sus campañas
      { modulo: 'confirmaciones', acciones: ['ver'] },
      { modulo: 'reportes', acciones: ['ver', 'exportar'] }
    ]
  },
  {
    id: 'admin',
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    icono: <Shield className="h-5 w-5" />,
    color: 'bg-red-100 text-red-700',
    permisos: [
      { modulo: 'campanas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar'] },
      { modulo: 'programacion', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar'] },
      { modulo: 'tarifas', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
      { modulo: 'facturacion', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar'] },
      { modulo: 'materiales', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
      { modulo: 'confirmaciones', acciones: ['ver', 'crear', 'editar', 'eliminar', 'enviar'] },
      { modulo: 'reportes', acciones: ['ver', 'crear', 'exportar'] },
      { modulo: 'configuracion', acciones: ['ver', 'crear', 'editar', 'eliminar'] }
    ]
  }
]

// ==================== CONTEXTO DE PERMISOS ====================

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  clienteId?: string // Para cliente_portal
}

interface PermisosContextType {
  usuario: Usuario | null
  setUsuario: (usuario: Usuario | null) => void
  tienePermiso: (modulo: ModuloCampana, accion: AccionPermiso) => boolean
  tieneRol: (rol: RolUsuario) => boolean
  esAdmin: boolean
  getRolInfo: () => DefinicionRol | undefined
}

const PermisosContext = createContext<PermisosContextType | undefined>(undefined)

// ==================== PROVIDER ====================

interface PermisosProviderProps {
  children: ReactNode
  usuarioInicial?: Usuario
}

export function PermisosProvider({ children, usuarioInicial }: PermisosProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(usuarioInicial || {
    id: 'usr_001',
    nombre: 'Ana García',
    email: 'ana.garcia@silexar.com',
    rol: 'traffic_manager_senior'
  })

  const getRolInfo = useCallback(() => {
    if (!usuario) return undefined
    return ROLES_DEFINIDOS.find(r => r.id === usuario.rol)
  }, [usuario])

  const tienePermiso = useCallback((modulo: ModuloCampana, accion: AccionPermiso): boolean => {
    if (!usuario) return false
    const rolInfo = ROLES_DEFINIDOS.find(r => r.id === usuario.rol)
    if (!rolInfo) return false

    const permisoModulo = rolInfo.permisos.find(p => p.modulo === modulo)
    if (!permisoModulo) return false

    return permisoModulo.acciones.includes(accion)
  }, [usuario])

  const tieneRol = useCallback((rol: RolUsuario): boolean => {
    return usuario?.rol === rol
  }, [usuario])

  const esAdmin = useMemo(() => usuario?.rol === 'admin', [usuario])

  const value: PermisosContextType = {
    usuario,
    setUsuario,
    tienePermiso,
    tieneRol,
    esAdmin,
    getRolInfo
  }

  return (
    <PermisosContext.Provider value={value}>
      {children}
    </PermisosContext.Provider>
  )
}

// ==================== HOOK usePermisos ====================

export function usePermisos() {
  const context = useContext(PermisosContext)
  if (!context) {
    throw new Error('usePermisos debe usarse dentro de PermisosProvider')
  }
  return context
}

// ==================== COMPONENTE ProtectedRoute ====================

interface ProtectedRouteProps {
  children: ReactNode
  modulo: ModuloCampana
  accion: AccionPermiso
  fallback?: ReactNode
}

export function ProtectedRoute({ children, modulo, accion, fallback }: ProtectedRouteProps) {
  const { tienePermiso, usuario } = usePermisos()

  if (!usuario) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Sesión Requerida</h3>
          <p className="text-yellow-600 text-sm mt-2">Inicie sesión para acceder</p>
        </CardContent>
      </Card>
    )
  }

  if (!tienePermiso(modulo, accion)) {
    if (fallback) return <>{fallback}</>
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <ShieldX className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="font-semibold text-red-800">Acceso Denegado</h3>
          <p className="text-red-600 text-sm mt-2">
            No tiene permisos para {accion} en {modulo}
          </p>
          <Badge className="mt-4 bg-red-100 text-red-700">{usuario.rol}</Badge>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

// ==================== HOC withPermission ====================

export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  modulo: ModuloCampana,
  accion: AccionPermiso
) {
  return function WithPermissionComponent(props: P) {
    return (
      <ProtectedRoute modulo={modulo} accion={accion}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }
}

// ==================== COMPONENTE VISUALIZADOR ROLES ====================

export function VisualizadorRoles() {
  const { usuario, setUsuario, getRolInfo } = usePermisos()
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const rolActual = getRolInfo()

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          🔒 SISTEMA RBAC - CONTROL DE ACCESO
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Usuario actual */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">👤 Usuario Actual</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{usuario?.nombre}</div>
              <div className="text-xs text-gray-500">{usuario?.email}</div>
            </div>
            <Badge className={rolActual?.color}>{rolActual?.nombre}</Badge>
          </div>
        </div>

        {/* Selector de rol (demo) */}
        <div>
          <h4 className="font-semibold text-sm mb-2">🎭 Simular Rol (Demo)</h4>
          <div className="grid grid-cols-2 gap-2">
            {ROLES_DEFINIDOS.map(rol => (
              <Button
                key={rol.id}
                variant={usuario?.rol === rol.id ? 'default' : 'outline'}
                size="sm"
                className="justify-start gap-2"
                onClick={() => setUsuario(usuario ? { ...usuario, rol: rol.id } : null)}
              >
                {rol.icono}
                <span className="text-xs">{rol.nombre}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Detalle permisos */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setMostrarDetalle(!mostrarDetalle)}
        >
          {mostrarDetalle ? '▲ Ocultar Permisos' : '▼ Ver Permisos del Rol'}
        </Button>

        {mostrarDetalle && rolActual && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Módulo</th>
                  <th className="px-2 py-1 text-center">Ver</th>
                  <th className="px-2 py-1 text-center">Crear</th>
                  <th className="px-2 py-1 text-center">Editar</th>
                  <th className="px-2 py-1 text-center">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {(['campanas', 'programacion', 'tarifas', 'facturacion', 'materiales', 'confirmaciones'] as ModuloCampana[]).map(modulo => {
                  const permiso = rolActual.permisos.find(p => p.modulo === modulo)
                  return (
                    <tr key={modulo} className="border-t">
                      <td className="px-2 py-1 font-medium capitalize">{modulo}</td>
                      {(['ver', 'crear', 'editar', 'eliminar'] as AccionPermiso[]).map(accion => (
                        <td key={accion} className="px-2 py-1 text-center">
                          {permiso?.acciones.includes(accion) ? (
                            <Unlock className="h-3 w-3 text-green-600 mx-auto" />
                          ) : (
                            <Lock className="h-3 w-3 text-red-400 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default VisualizadorRoles
