'use client'

/**
 * 📱 SILEXAR PULSE - Mobile Bottom Navigation
 * Navegación inferior para dispositivos móviles
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import {
  Home, Users, MessageSquare, BarChart3,
  Bell, User, Menu, Search, Plus
} from 'lucide-react'

interface MobileNavProps {
  activeTab: string
  userRole: 'super_admin' | 'admin_cliente' | 'usuario'
  onTabChange: (tab: string) => void
  onMenuOpen: () => void
  unreadNotifications?: number
}

export function MobileBottomNav({ 
  activeTab, 
  userRole, 
  onTabChange, 
  onMenuOpen,
  unreadNotifications = 0 
}: MobileNavProps) {
  const getNavItems = () => {
    switch (userRole) {
      case 'super_admin':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'tenants', icon: Users, label: 'Tenants' },
          { id: 'tickets', icon: MessageSquare, label: 'Tickets' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'more', icon: Menu, label: 'Más' }
        ]
      case 'admin_cliente':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'users', icon: Users, label: 'Usuarios' },
          { id: 'support', icon: MessageSquare, label: 'Soporte' },
          { id: 'reports', icon: BarChart3, label: 'Reportes' },
          { id: 'more', icon: Menu, label: 'Más' }
        ]
      default:
        return [
          { id: 'dashboard', icon: Home, label: 'Inicio' },
          { id: 'tasks', icon: Plus, label: 'Tareas' },
          { id: 'support', icon: MessageSquare, label: 'Soporte' },
          { id: 'profile', icon: User, label: 'Perfil' },
          { id: 'more', icon: Menu, label: 'Más' }
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-50 flex items-center justify-around px-2 md:hidden">
      {navItems.map(item => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        
        return (
          <button
            key={item.id}
            onClick={() => item.id === 'more' ? onMenuOpen() : onTabChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-colors ${
              isActive ? 'text-orange-400' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {item.id === 'tickets' && unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>
            <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-400 rounded-b-full" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// MOBILE HEADER
// ═══════════════════════════════════════════════════════════════

interface MobileHeaderProps {
  title: string
  userName: string
  userAvatar?: string
  onMenuOpen: () => void
  onSearchOpen?: () => void
  onNotificationsOpen?: () => void
  unreadNotifications?: number
}

export function MobileHeader({
  title,
  userName,
  userAvatar,
  onMenuOpen,
  onSearchOpen,
  onNotificationsOpen,
  unreadNotifications = 0
}: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 z-40 flex items-center justify-between px-4 md:hidden">
      <button 
        onClick={onMenuOpen}
        className="p-2 -ml-2 text-slate-400 hover:text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="text-white font-semibold text-lg absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {onSearchOpen && (
          <button 
            onClick={onSearchOpen}
            className="p-2 text-slate-400 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        
        {onNotificationsOpen && (
          <button 
            onClick={onNotificationsOpen}
            className="p-2 text-slate-400 hover:text-white relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        )}

        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{userName.charAt(0)}</span>
          )}
        </button>
      </div>
    </header>
  )
}

// ═══════════════════════════════════════════════════════════════
// MOBILE SLIDE MENU
// ═══════════════════════════════════════════════════════════════

interface MobileSlideMenuProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  userEmail: string
  userRole: string
  menuItems: { id: string; label: string; icon: React.ReactNode; onClick: () => void }[]
}

export function MobileSlideMenu({
  isOpen,
  onClose,
  userName,
  userEmail,
  userRole,
  menuItems
}: MobileSlideMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 md:hidden">
        {/* User Info */}
        <div className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">{userName.charAt(0)}</span>
          </div>
          <h3 className="text-white font-semibold text-lg">{userName}</h3>
          <p className="text-slate-400 text-sm">{userEmail}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
            {userRole}
          </span>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { item.onClick(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
        >
          ✕
        </button>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// MOBILE FAB (FLOATING ACTION BUTTON)
// ═══════════════════════════════════════════════════════════════

interface MobileFABProps {
  icon: React.ReactNode
  onClick: () => void
  label?: string
  variant?: 'primary' | 'secondary'
}

export function MobileFAB({ icon, onClick, label, variant = 'primary' }: MobileFABProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 md:hidden ${
        variant === 'primary' 
          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
          : 'bg-slate-800 text-slate-300 border border-slate-700'
      }`}
      aria-label={label}
    >
      {icon}
    </button>
  )
}

export default {
  MobileBottomNav,
  MobileHeader,
  MobileSlideMenu,
  MobileFAB
}
