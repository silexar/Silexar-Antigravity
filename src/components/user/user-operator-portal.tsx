'use client'

/**
 * 🧑‍💼 SILEXAR PULSE - User Operator Portal
 * Portal para usuarios finales que operan el sistema
 * 
 * @description Portal Features:
 * - Dashboard personalizado por rol/permisos
 * - Módulos dinámicos según permisos
 * - Crear tickets de errores
 * - Tareas manuales y checklists
 * - Quick actions por categoría
 * - Conexión con admin para soporte
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  LayoutDashboard, Users, ShoppingCart, Megaphone, BarChart3,
  Settings, Database, FileText, Zap, HelpCircle, Bell, Clock,
  CheckSquare, Square, Play, Pause, AlertTriangle, MessageSquare,
  Target, TrendingUp, Calendar, Plus, Search, Filter, X,
  CheckCircle, XCircle, Loader, ChevronRight, Send, Paperclip,
  Camera, User, LogOut, Home
} from 'lucide-react'

// Permission-based modules
const ALL_MODULES = {
  crm: { id: 'crm', name: 'CRM & Ventas', icon: <ShoppingCart className="w-5 h-5" />, color: 'green', requiredPermission: 'crm_view' },
  campaigns: { id: 'campaigns', name: 'Campañas', icon: <Megaphone className="w-5 h-5" />, color: 'purple', requiredPermission: 'camp_view' },
  reports: { id: 'reports', name: 'Reportes', icon: <BarChart3 className="w-5 h-5" />, color: 'blue', requiredPermission: 'rep_view' },
  data: { id: 'data', name: 'Datos', icon: <Database className="w-5 h-5" />, color: 'cyan', requiredPermission: 'data_view' },
  billing: { id: 'billing', name: 'Facturación', icon: <FileText className="w-5 h-5" />, color: 'yellow', requiredPermission: 'bill_view' },
  integrations: { id: 'integrations', name: 'Integraciones', icon: <Zap className="w-5 h-5" />, color: 'orange', requiredPermission: 'int_view' },
  settings: { id: 'settings', name: 'Configuración', icon: <Settings className="w-5 h-5" />, color: 'gray', requiredPermission: 'set_view' }
}

// Quick Actions by category
const QUICK_ACTIONS = {
  vendedor: [
    { id: 'new_client', name: 'Nuevo Cliente', icon: <Plus className="w-4 h-4" />, color: 'green' },
    { id: 'new_sale', name: 'Registrar Venta', icon: <ShoppingCart className="w-4 h-4" />, color: 'blue' },
    { id: 'view_pipeline', name: 'Ver Pipeline', icon: <TrendingUp className="w-4 h-4" />, color: 'purple' },
    { id: 'schedule_call', name: 'Agendar Llamada', icon: <Calendar className="w-4 h-4" />, color: 'orange' }
  ],
  trafico: [
    { id: 'new_campaign', name: 'Nueva Campaña', icon: <Plus className="w-4 h-4" />, color: 'purple' },
    { id: 'quick_ad', name: 'Crear Anuncio', icon: <Megaphone className="w-4 h-4" />, color: 'blue' },
    { id: 'view_metrics', name: 'Ver Métricas', icon: <BarChart3 className="w-4 h-4" />, color: 'green' },
    { id: 'pause_campaign', name: 'Pausar Campaña', icon: <Pause className="w-4 h-4" />, color: 'orange' }
  ],
  analista: [
    { id: 'new_report', name: 'Nuevo Reporte', icon: <Plus className="w-4 h-4" />, color: 'blue' },
    { id: 'export_data', name: 'Exportar Datos', icon: <Database className="w-4 h-4" />, color: 'cyan' },
    { id: 'schedule_report', name: 'Programar Reporte', icon: <Calendar className="w-4 h-4" />, color: 'purple' },
    { id: 'view_dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, color: 'green' }
  ],
  ejecutivo: [
    { id: 'view_overview', name: 'Vista General', icon: <LayoutDashboard className="w-4 h-4" />, color: 'blue' },
    { id: 'team_performance', name: 'Rendimiento Equipo', icon: <Users className="w-4 h-4" />, color: 'green' },
    { id: 'financial_report', name: 'Reporte Financiero', icon: <FileText className="w-4 h-4" />, color: 'yellow' },
    { id: 'strategic_goals', name: 'Objetivos', icon: <Target className="w-4 h-4" />, color: 'purple' }
  ],
  operacional: [
    { id: 'daily_tasks', name: 'Tareas del Día', icon: <CheckSquare className="w-4 h-4" />, color: 'green' },
    { id: 'process_orders', name: 'Procesar Pedidos', icon: <ShoppingCart className="w-4 h-4" />, color: 'blue' },
    { id: 'inventory', name: 'Inventario', icon: <Database className="w-4 h-4" />, color: 'orange' },
    { id: 'logistics', name: 'Logística', icon: <TrendingUp className="w-4 h-4" />, color: 'purple' }
  ],
  soporte: [
    { id: 'open_tickets', name: 'Tickets Abiertos', icon: <MessageSquare className="w-4 h-4" />, color: 'blue' },
    { id: 'respond_ticket', name: 'Responder Ticket', icon: <Send className="w-4 h-4" />, color: 'green' },
    { id: 'escalate', name: 'Escalar', icon: <AlertTriangle className="w-4 h-4" />, color: 'red' },
    { id: 'knowledge_base', name: 'Base Conocimiento', icon: <FileText className="w-4 h-4" />, color: 'purple' }
  ]
}

interface ManualTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: Date
  assignedBy: string
  checklist: { id: string; text: string; done: boolean }[]
  notes?: string
}

interface UserTicket {
  id: string
  ticketNumber: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  lastUpdate: Date
}

interface CurrentUser {
  id: string
  name: string
  email: string
  category: string
  permissions: string[]
  avatar?: string
}

interface UserOperatorPortalProps {
  user?: CurrentUser
}

export function UserOperatorPortal({ user: propUser }: UserOperatorPortalProps) {
  // Mock current user (would come from auth)
  const [currentUser] = useState<CurrentUser>(propUser || {
    id: 'user_003',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    category: 'vendedor',
    permissions: ['crm_view', 'crm_create', 'crm_edit', 'rep_view'],
    avatar: undefined
  })

  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [tasks, setTasks] = useState<ManualTask[]>([])
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [notifications, setNotifications] = useState<number>(3)
  const [isLoading, setIsLoading] = useState(true)

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'general'
  })

  useEffect(() => { loadUserData() }, [])

  const loadUserData = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const now = new Date()

    // Load user's tasks
    setTasks([
      {
        id: 'task_001',
        title: 'Llamar a prospectos del día',
        description: 'Contactar a los 5 prospectos nuevos asignados hoy',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        assignedBy: 'Carlos Rodríguez',
        checklist: [
          { id: 'c1', text: 'Prospect A - Tech Solutions', done: true },
          { id: 'c2', text: 'Prospect B - Media Corp', done: true },
          { id: 'c3', text: 'Prospect C - Retail Plus', done: false },
          { id: 'c4', text: 'Prospect D - Finance Pro', done: false },
          { id: 'c5', text: 'Prospect E - Health Systems', done: false }
        ]
      },
      {
        id: 'task_002',
        title: 'Actualizar CRM con notas de reuniones',
        description: 'Registrar las notas de las reuniones de ayer',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        assignedBy: 'Sistema Automático',
        checklist: [
          { id: 'c1', text: 'Reunión con Cliente Alpha', done: false },
          { id: 'c2', text: 'Demo con Prospecto Beta', done: false }
        ]
      }
    ])

    // Load user's tickets
    setTickets([
      {
        id: 'ticket_001',
        ticketNumber: 'TKT-2025-005432',
        subject: 'Error al exportar lista de clientes',
        status: 'in_progress',
        priority: 'medium',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(now.getTime() - 4 * 60 * 60 * 1000)
      }
    ])

    setIsLoading(false)
  }

  // Get available modules based on permissions
  const availableModules = Object.values(ALL_MODULES).filter(m =>
    currentUser.permissions.includes(m.requiredPermission)
  )

  // Get quick actions for user category
  const quickActions = QUICK_ACTIONS[currentUser.category as keyof typeof QUICK_ACTIONS] || QUICK_ACTIONS.operacional

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? {
        ...t,
        checklist: t.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c)
      } : t
    ))
  }

  const updateTaskStatus = (taskId: string, status: ManualTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const createTicket = () => {
    if (!newTicket.subject.trim()) {
      alert('El asunto es requerido')
      return
    }

    const ticket: UserTicket = {
      id: `ticket_${Date.now()}`,
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`,
      subject: newTicket.subject,
      status: 'open',
      priority: newTicket.priority,
      createdAt: new Date(),
      lastUpdate: new Date()
    }

    setTickets(prev => [ticket, ...prev])
    setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' })
    setShowNewTicket(false)
    alert(`✅ Ticket ${ticket.ticketNumber} creado. El equipo de soporte lo revisará pronto.`)
  }

  const getTaskProgress = (task: ManualTask) => {
    const done = task.checklist.filter(c => c.done).length
    return Math.round((done / task.checklist.length) * 100)
  }

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { name: string; icon: string; color: string }> = {
      vendedor: { name: 'Vendedor', icon: '💰', color: 'green' },
      ejecutivo: { name: 'Ejecutivo', icon: '👔', color: 'blue' },
      trafico: { name: 'Tráfico Digital', icon: '📊', color: 'purple' },
      operacional: { name: 'Operacional', icon: '⚙️', color: 'orange' },
      marketing: { name: 'Marketing', icon: '📣', color: 'pink' },
      soporte: { name: 'Soporte', icon: '🎧', color: 'cyan' },
      analista: { name: 'Analista', icon: '📈', color: 'yellow' }
    }
    return categories[category] || { name: category, icon: '👤', color: 'gray' }
  }

  const catInfo = getCategoryInfo(currentUser.category)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F0EDE8]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando tu portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-800/80 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">Silexar Pulse</span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{catInfo.icon} {catInfo.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-700 rounded-lg">
              <Bell className="w-5 h-5 text-slate-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Help/Support */}
            <button onClick={() => setShowNewTicket(true)} className="p-2 hover:bg-slate-700 rounded-lg" title="Soporte">
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{currentUser.name}</p>
                <p className="text-slate-500 text-xs">{currentUser.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Welcome & Stats */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            ¡Hola, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400">
            Tienes {tasks.filter(t => t.status !== 'completed').length} tareas pendientes y {tickets.filter(t => t.status === 'open').length} tickets abiertos
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Quick Actions & Modules */}
          <div className="col-span-3 space-y-4">
            {/* Quick Actions */}
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-${action.color}-500/20`}>
                      {action.icon}
                    </div>
                    <span className="text-white text-sm">{action.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                  </button>
                ))}
              </div>
            </NeuCard>

            {/* Available Modules */}
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                Mis Módulos
              </h3>
              <div className="space-y-2">
                {availableModules.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${activeModule === mod.id
                      ? 'bg-orange-500/20 border border-orange-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                      }`}
                  >
                    <div className={`text-${mod.color}-400`}>{mod.icon}</div>
                    <span className="text-white text-sm">{mod.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                {availableModules.length} de {Object.keys(ALL_MODULES).length} módulos disponibles
              </p>
            </NeuCard>

            {/* Support Button */}
            <button
              onClick={() => setShowNewTicket(true)}
              className="w-full p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-orange-400" />
                <div className="text-left">
                  <p className="text-white font-medium">¿Necesitas ayuda?</p>
                  <p className="text-xs text-slate-400">Crea un ticket de soporte</p>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Tasks */}
          <div className="col-span-6 space-y-4">
            {/* Manual Tasks */}
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-400" />
                  Mis Tareas del Día
                </h3>
                <span className="text-xs text-slate-400">
                  {tasks.filter(t => t.status === 'completed').length}/{tasks.length} completadas
                </span>
              </div>

              <div className="space-y-4">
                {tasks.map(task => {
                  const progress = getTaskProgress(task)
                  return (
                    <div key={task.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded ${task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                              }`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                task.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                                  'bg-slate-500/20 text-slate-400'
                              }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{task.description}</p>
                        </div>
                        {task.status !== 'completed' && (
                          <div className="flex gap-1">
                            {task.status === 'pending' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                                title="Iniciar"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {task.status === 'in_progress' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                title="Completar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Progreso</span>
                          <span className="text-white">{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="space-y-2">
                        {task.checklist.map(item => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-700/50 rounded"
                          >
                            <button onClick={() => toggleChecklistItem(task.id, item.id)}>
                              {item.done ? (
                                <CheckSquare className="w-4 h-4 text-green-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                            <span className={`text-sm ${item.done ? 'text-slate-500 line-through' : 'text-white'}`}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700 text-xs">
                        <span className="text-slate-500">Asignado por: {task.assignedBy}</span>
                        {task.dueDate && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Vence: {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </NeuCard>
          </div>

          {/* Right: My Tickets & Info */}
          <div className="col-span-3 space-y-4">
            {/* My Tickets */}
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  Mis Tickets
                </h3>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="p-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {tickets.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  No tienes tickets abiertos
                </p>
              ) : (
                <div className="space-y-2">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-orange-400 font-mono">{ticket.ticketNumber}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-white text-sm mb-2">{ticket.subject}</p>
                      <p className="text-xs text-slate-500">
                        Actualizado: {ticket.lastUpdate.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </NeuCard>

            {/* Permissions Summary */}
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Mi Perfil
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rol</span>
                  <span className="text-white">{catInfo.icon} {catInfo.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Permisos</span>
                  <span className="text-white">{currentUser.permissions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Módulos</span>
                  <span className="text-white">{availableModules.length}</span>
                </div>
              </div>
            </NeuCard>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }} className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-400" />
                Nuevo Ticket de Soporte
              </h4>
              <button onClick={() => setShowNewTicket(false)} className="p-1 hover:bg-slate-700 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Asunto *</label>
                <input
                  type="text"
                  placeholder="Describe brevemente el problema"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1">Descripción</label>
                <textarea
                  placeholder="Detalla el problema o error que estás experimentando..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Categoría</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="general">General</option>
                    <option value="error">Error del Sistema</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Solicitud</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Prioridad</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <NeuButton variant="secondary" onClick={() => setShowNewTicket(false)}>
                  Cancelar
                </NeuButton>
                <NeuButton variant="primary" onClick={createTicket}>
                  <Send className="w-4 h-4 mr-1" />
                  Enviar Ticket
                </NeuButton>
              </div>
            </div>
          </NeuCard>
        </div>
      )}
    </div>
  )
}

export default UserOperatorPortal
