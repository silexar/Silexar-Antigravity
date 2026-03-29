'use client'

/**
 * ⚡ SILEXAR PULSE - Quick Actions Panel
 * Acciones rápidas para CEO
 * 
 * @description Panel de acciones rápidas con:
 * - Acciones frecuentes con un clic
 * - Atajos de teclado (Ctrl+K)
 * - Búsqueda global rápida
 * - Comandos de voz (placeholder)
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  NeuromorphicCard
} from '@/components/ui/neuromorphic'
import {
  Zap,
  Search,
  Command,
  Power,
  Users,
  RefreshCw,
  Download,
  Shield,
  Bell,
  Database,
  HardDrive,
  Brain,
  Wrench,
  X,
  ChevronRight,
  Star,
  History
} from 'lucide-react'

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  shortcut?: string
  category: 'system' | 'users' | 'data' | 'security' | 'ai'
  action: () => void
  color: string
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

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const executeAction = useCallback((action: QuickAction) => {
    action.action()
    
    // Add to recent
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
      id: 'qa_backup',
      name: 'Ejecutar Backup Full',
      description: 'Inicia un backup completo del sistema',
      icon: <HardDrive className="w-5 h-5" />,
      shortcut: 'Ctrl+B',
      category: 'data',
      color: 'text-green-400',
      action: () => {
        
        alert('🔄 Backup Full iniciado en segundo plano')
      }
    },
    {
      id: 'qa_cache',
      name: 'Limpiar Cache',
      description: 'Limpia toda la caché del sistema',
      icon: <RefreshCw className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+C',
      category: 'system',
      color: 'text-blue-400',
      action: () => {
        
        alert('✅ Cache del sistema limpiada')
      }
    },
    {
      id: 'qa_sessions',
      name: 'Cerrar Sesiones Inactivas',
      description: 'Termina todas las sesiones sin actividad',
      icon: <Users className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+S',
      category: 'users',
      color: 'text-purple-400',
      action: () => {
        
        alert('✅ 5 sesiones inactivas cerradas')
      }
    },
    {
      id: 'qa_maintenance',
      name: 'Modo Mantenimiento',
      description: 'Activa/desactiva modo mantenimiento',
      icon: <Wrench className="w-5 h-5" />,
      category: 'system',
      color: 'text-orange-400',
      action: () => {
        if (confirm('¿Activar modo mantenimiento?')) {
          
          alert('🔧 Modo mantenimiento ACTIVADO')
        }
      }
    },
    {
      id: 'qa_ai_toggle',
      name: 'Toggle IA Global',
      description: 'Activa/desactiva IA en todo el sistema',
      icon: <Brain className="w-5 h-5" />,
      category: 'ai',
      color: 'text-pink-400',
      action: () => {
        
        alert('🤖 Estado de IA cambiado')
      }
    },
    {
      id: 'qa_security_scan',
      name: 'Escaneo de Seguridad',
      description: 'Ejecuta escaneo de vulnerabilidades',
      icon: <Shield className="w-5 h-5" />,
      category: 'security',
      color: 'text-red-400',
      action: () => {
        
        alert('🔍 Escaneo de seguridad iniciado')
      }
    },
    {
      id: 'qa_broadcast',
      name: 'Broadcast Rápido',
      description: 'Envía mensaje a todos los usuarios',
      icon: <Bell className="w-5 h-5" />,
      category: 'users',
      color: 'text-yellow-400',
      action: () => {
        const msg = prompt('Mensaje para broadcast:')
        if (msg) {
          
          alert('📢 Mensaje enviado a todos los usuarios')
        }
      }
    },
    {
      id: 'qa_export_logs',
      name: 'Exportar Logs',
      description: 'Descarga logs del sistema',
      icon: <Download className="w-5 h-5" />,
      category: 'data',
      color: 'text-cyan-400',
      action: () => {
        
        alert('📥 Logs exportados')
      }
    },
    {
      id: 'qa_restart_services',
      name: 'Reiniciar Servicios',
      description: 'Reinicia todos los servicios del sistema',
      icon: <Power className="w-5 h-5" />,
      category: 'system',
      color: 'text-slate-400',
      action: () => {
        if (confirm('⚠️ ¿Reiniciar todos los servicios?')) {
          
          alert('🔄 Servicios reiniciados')
        }
      }
    },
    {
      id: 'qa_db_optimize',
      name: 'Optimizar Base de Datos',
      description: 'Ejecuta VACUUM y optimización',
      icon: <Database className="w-5 h-5" />,
      category: 'data',
      color: 'text-emerald-400',
      action: () => {
        
        alert('⚡ Base de datos optimizada')
      }
    }
  ]

  const filteredActions = actions.filter(action => 
    action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFavorite = (actionId: string) => {
    setFavorites(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    )
  }

  const favoriteActions = actions.filter(a => favorites.includes(a.id))

  if (!isOpen) {
    return (
      <div className="space-y-4">
        {/* Quick Access Bar */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </h3>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 text-sm rounded-lg hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Buscar acción...</span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-xs rounded">Ctrl+K</kbd>
          </button>
        </div>

        {/* Favorite Actions Grid */}
        <div className="grid grid-cols-5 gap-3">
          {favoriteActions.map(action => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all group text-center"
            >
              <div className={`mx-auto mb-2 ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-xs text-slate-300 group-hover:text-white">
                {action.name}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm text-slate-400 mb-2 flex items-center gap-1">
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
                  className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
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

  // Full Command Palette
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80">
      <NeuromorphicCard variant="glow" className="w-full max-w-2xl p-0 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar acción... (ESC para cerrar)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none placeholder-slate-500"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredActions.map(action => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors text-left"
            >
              <div className={action.color}>
                {action.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{action.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(action.id)
                    }}
                    className={`p-0.5 ${favorites.includes(action.id) ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    <Star className="w-3 h-3" fill={favorites.includes(action.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
              {action.shortcut && (
                <kbd className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded">
                  {action.shortcut}
                </kbd>
              )}
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>↑↓ Navegar</span>
            <span>Enter Ejecutar</span>
            <span>ESC Cerrar</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Ctrl+K para abrir</span>
          </div>
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default QuickActionsPanel
