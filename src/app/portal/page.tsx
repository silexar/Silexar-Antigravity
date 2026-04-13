'use client'

/**
 * 👤 SILEXAR PULSE - User Portal Page
 * Portal principal para Usuarios Finales (Operadores)
 * 
 * @route /portal
 * @access Authenticated Users
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import { UserOperatorPortal } from '@/components/user/user-operator-portal'
import { UserProfile } from '@/components/user/user-profile'
import { useAuth } from '@/components/security-initializer'
import {
  LayoutDashboard, User, Settings, HelpCircle, LogOut,
  Bell, Search, Menu, ChevronDown
} from 'lucide-react'

type PortalView = 'dashboard' | 'profile' | 'help'

interface AuthenticatedUser {
  id: string
  name: string
  email: string
  category: string
  permissions: string[]
  tenantName: string
}

export default function PortalPage() {
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [currentView, setCurrentView] = useState<PortalView>('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Use authenticated user from real auth context
  const user = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    category: authUser.category,
    permissions: [],
    tenantName: authUser.tenantSlug || 'Silexar'
  } : null

  const handleLogout = async () => {
    // Clear session via auth context (handled by SecurityInitializer)
    sessionStorage.removeItem('silexar_user')
    sessionStorage.removeItem('silexar_token')
    localStorage.removeItem('silexar_user')
    window.location.href = '/login'
  }

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { name: string; icon: string; color: string }> = {
      vendedor: { name: 'Vendedor', icon: '💰', color: 'green' },
      ejecutivo: { name: 'Ejecutivo', icon: '👔', color: 'blue' },
      trafico: { name: 'Tráfico Digital', icon: '📊', color: 'purple' },
      operacional: { name: 'Operacional', icon: '⚙️', color: 'orange' },
      marketing: { name: 'Marketing', icon: '📣', color: 'pink' },
      soporte: { name: 'Soporte', icon: '🎧', color: 'cyan' },
      analista: { name: 'Analista', icon: '📈', color: 'yellow' },
      developer: { name: 'Developer', icon: '💻', color: 'gray' },
      super_user: { name: 'Super Usuario', icon: '👑', color: 'red' }
    }
    return categories[category] || { name: category, icon: '👤', color: 'gray' }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login
    window.location.href = '/login'
    return null
  }

  const catInfo = getCategoryInfo(user.category)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Tabs */}
      <div className="bg-slate-800/80 border-b border-slate-700 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'profile', name: 'Mi Perfil', icon: <User className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as PortalView)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  currentView === tab.id 
                    ? 'border-green-500 text-green-400' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* User Info */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-lg"
            >
              <div className="text-right hidden md:block">
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-500">{catInfo.icon} {catInfo.name} • {user.tenantName}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{user.tenantName}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => { setCurrentView('profile'); setShowUserMenu(false) }}
                    className="w-full flex items-center gap-2 p-2 text-slate-300 hover:bg-slate-700 rounded text-sm"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 text-slate-300 hover:bg-slate-700 rounded text-sm">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 text-slate-300 hover:bg-slate-700 rounded text-sm">
                    <HelpCircle className="w-4 h-4" />
                    Ayuda
                  </button>
                </div>
                <div className="p-2 border-t border-slate-700">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentView === 'dashboard' && (
          <UserOperatorPortal 
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              category: user.category,
              permissions: user.permissions
            }}
          />
        )}

        {currentView === 'profile' && <UserProfile />}
      </div>
    </div>
  )
}
