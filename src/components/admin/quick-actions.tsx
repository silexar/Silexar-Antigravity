'use client'

/**
 * š¡ SILEXAR PULSE - Quick Actions Panel
 * Acciones rápidas para CEO
 * @design NEUMORPHISM_TIER_0 €” Single Accent #6888ff
 */

import { useState, useEffect, useCallback } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow, NeuCard, NeuCardSmall } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Zap, Search, Command, Power, Users, RefreshCw, Download,
  Shield, Bell, Database, HardDrive, Brain, Wrench, X,
  ChevronRight, Star, History
} from 'lucide-react'

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  shortcut?: string
  category: 'system' | 'users' | 'data' | 'security' | 'ai'
  action: () => void
}

interface RecentAction {
  id: string
  name: string
  executedAt: Date
}

export function QuickActionsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [recentActions, setRecentActions] = useState<RecentAction[]>([])
  const [favorites, setFavorites] = useState<string[]>(['qa_backup', 'qa_cache', 'qa_sessions'])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const executeAction = useCallback((action: QuickAction) => {
    action.action()
    setRecentActions(prev => {
      const updated = [
        { id: action.id, name: action.name, executedAt: new Date() },
        ...prev.filter(a => a.id !== action.id)
      ].slice(0, 5)
      return updated
    })
    setIsOpen(false)
    setSearchTerm('')
  }, [])

  const actions: QuickAction[] = [
    {
      id: 'qa_backup', name: 'Ejecutar Backup Full',
      description: 'Inicia un backup completo del sistema',
      icon: <HardDrive className="w-5 h-5" />, shortcut: 'Ctrl+B',
      category: 'data',
      action: () => alert('ðŸ”„ Backup Full iniciado en segundo plano')
    },
    {
      id: 'qa_cache', name: 'Limpiar Cache',
      description: 'Limpia toda la caché del sistema',
      icon: <RefreshCw className="w-5 h-5" />, shortcut: 'Ctrl+Shift+C',
      category: 'system',
      action: () => alert('œ… Cache del sistema limpiada')
    },
    {
      id: 'qa_sessions', name: 'Cerrar Sesiones Inactivas',
      description: 'Termina todas las sesiones sin actividad',
      icon: <Users className="w-5 h-5" />, shortcut: 'Ctrl+Shift+S',
      category: 'users',
      action: () => alert('œ… 5 sesiones inactivas cerradas')
    },
    {
      id: 'qa_maintenance', name: 'Modo Mantenimiento',
      description: 'Activa/desactiva modo mantenimiento',
      icon: <Wrench className="w-5 h-5" />,
      category: 'system',
      action: () => {
        if (confirm('¿Activar modo mantenimiento?')) alert('ðŸ”§ Modo mantenimiento ACTIVADO')
      }
    },
    {
      id: 'qa_ai_toggle', name: 'Toggle IA Global',
      description: 'Activa/desactiva IA en todo el sistema',
      icon: <Brain className="w-5 h-5" />,
      category: 'ai',
      action: () => alert('ðŸ¤– Estado de IA cambiado')
    },
    {
      id: 'qa_security_scan', name: 'Escaneo de Seguridad',
      description: 'Ejecuta escaneo de vulnerabilidades',
      icon: <Shield className="w-5 h-5" />,
      category: 'security',
      action: () => alert('ðŸ” Escaneo de seguridad iniciado')
    },
    {
      id: 'qa_broadcast', name: 'Broadcast Rápido',
      description: 'Envía mensaje a todos los usuarios',
      icon: <Bell className="w-5 h-5" />,
      category: 'users',
      action: () => {
        const msg = prompt('Mensaje para broadcast:')
        if (msg) alert('ðŸ“¢ Mensaje enviado a todos los usuarios')
      }
    },
    {
      id: 'qa_export_logs', name: 'Exportar Logs',
      description: 'Descarga logs del sistema',
      icon: <Download className="w-5 h-5" />,
      category: 'data',
      action: () => alert('ðŸ“¥ Logs exportados')
    },
    {
      id: 'qa_restart_services', name: 'Reiniciar Servicios',
      description: 'Reinicia todos los servicios del sistema',
      icon: <Power className="w-5 h-5" />,
      category: 'system',
      action: () => {
        if (confirm('š ï¸ ¿Reiniciar todos los servicios?')) alert('ðŸ”„ Servicios reiniciados')
      }
    },
    {
      id: 'qa_db_optimize', name: 'Optimizar Base de Datos',
      description: 'Ejecuta VACUUM y optimización',
      icon: <Database className="w-5 h-5" />,
      category: 'data',
      action: () => alert('š¡ Base de datos optimizada')
    }
  ]

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFavorite = (actionId: string) => {
    setFavorites(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    )
  }

  const favoriteActions = actions.filter(a => favorites.includes(a.id))

  if (!isOpen) {
    return (
      <div className="space-y-4">
        {/* Quick Access Bar */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: N.text }}>
            <Zap className="w-5 h-5" style={{ color: N.accent }} />
            Quick Actions
          </h3>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all"
            style={{
              background: N.base,
              color: N.textSub,
              boxShadow: getSmallShadow()
            }}
          >
            <Search className="w-4 h-4" />
            <span>Buscar acción...</span>
            <kbd className="px-1.5 py-0.5 text-xs rounded" style={{ background: `${N.dark}40`, color: N.textSub }}>Ctrl+K</kbd>
          </button>
        </div>

        {/* Favorite Actions Grid €” NEUMORPHIC CARDS */}
        <div className="grid grid-cols-5 gap-3">
          {favoriteActions.map(action => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              className="p-4 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: N.base,
                boxShadow: getSmallShadow(),
              }}
            >
              <div className="mx-auto mb-2 flex justify-center" style={{ color: N.accent }}>
                <div className="p-2 rounded-xl" style={{ background: `${N.accent}10`, boxShadow: getSmallShadow(true) }}>
                  {action.icon}
                </div>
              </div>
              <span className="text-xs font-medium" style={{ color: N.text }}>
                {action.name}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm mb-2 flex items-center gap-1" style={{ color: N.textSub }}>
              <History className="w-4 h-4" />
              Acciones Recientes
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {recentActions.map(recent => (
                <button
                  key={recent.id}
                  onClick={() => {
                    const action = actions.find(a => a.id === recent.id)
                    if (action) executeAction(action)
                  }}
                  className="px-3 py-1 text-xs rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: N.base,
                    color: N.text,
                    boxShadow: getSmallShadow()
                  }}
                >
                  {recent.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full Command Palette €” NEUMORPHIC OVERLAY
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" style={{ background: `${N.base}80` }}>
      <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base, width: '100%', maxWidth: 640 }}>
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: `${N.dark}40` }}>
          <Search className="w-5 h-5" style={{ color: N.textSub }} />
          <input
            type="text"
            placeholder="Buscar acción... (ESC para cerrar)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: N.text }}
            autoFocus
          />
          <button onClick={() => setIsOpen(false)} style={{ color: N.textSub }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredActions.map(action => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              className="w-full flex items-center gap-4 p-4 text-left transition-all rounded-xl hover:scale-[1.01]"
              style={{ color: N.text }}
            >
              <div style={{ color: N.accent }}>{action.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm" style={{ color: N.text }}>{action.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(action.id) }}
                    style={{ color: favorites.includes(action.id) ? N.accent : N.textSub }}
                  >
                    <Star className="w-3 h-3" fill={favorites.includes(action.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-xs" style={{ color: N.textSub }}>{action.description}</p>
              </div>
              {action.shortcut && (
                <kbd className="px-2 py-1 text-xs rounded" style={{ background: `${N.dark}30`, color: N.textSub }}>
                  {action.shortcut}
                </kbd>
              )}
              <ChevronRight className="w-4 h-4" style={{ color: N.textSub }} />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 text-xs" style={{ color: N.textSub, background: `${N.dark}15` }}>
          <div className="flex items-center gap-4">
            <span>†‘†“ Navegar</span>
            <span>Enter Ejecutar</span>
            <span>ESC Cerrar</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Ctrl+K para abrir</span>
          </div>
        </div>
      </NeuCard>
    </div>
  )
}

export default QuickActionsPanel
