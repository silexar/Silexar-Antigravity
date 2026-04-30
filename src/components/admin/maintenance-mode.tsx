'use client'

/**
 * ðŸ”§ SILEXAR PULSE - Modo Mantenimiento
 * Control de mantenimiento global y por tenant
 * 
 * @description Sistema de mantenimiento con:
 * - Activación global/por tenant
 * - Mensajes personalizables
 * - Programación de mantenimientos futuros
 * - Historial de mantenimientos
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Wrench,
  Power,
  Clock,
  Calendar,
  Globe,
  Building2,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Play
} from 'lucide-react'

interface MaintenanceWindow {
  id: string
  type: 'global' | 'tenant'
  tenantId?: string
  tenantName?: string
  title: string
  message: string
  startTime: Date
  endTime: Date
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notifyUsers: boolean
  allowAdminAccess: boolean
  createdBy: string
}

interface MaintenanceStats {
  activeMaintenances: number
  scheduledMaintenances: number
  completedThisMonth: number
  totalDowntimeHours: number
}

export function MaintenanceMode() {
  const [globalMaintenance, setGlobalMaintenance] = useState(false)
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([])
  const [stats, setStats] = useState<MaintenanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [globalMessage, setGlobalMessage] = useState('El sistema está en mantenimiento. Por favor, intente más tarde.')
  const [newMaintenance, setNewMaintenance] = useState<{
    type: 'global' | 'tenant'
    title: string
    message: string
    startTime: string
    endTime: string
    notifyUsers: boolean
    allowAdminAccess: boolean
  }>({
    type: 'global',
    title: '',
    message: 'El sistema estará en mantenimiento programado. Disculpe las molestias.',
    startTime: '',
    endTime: '',
    notifyUsers: true,
    allowAdminAccess: true
  })

  useEffect(() => {
    loadMaintenanceData()
  }, [])

  const loadMaintenanceData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Demo windows
    setMaintenanceWindows([
      {
        id: 'mnt_001',
        type: 'global',
        title: 'Actualización de Base de Datos',
        message: 'Actualización programada del sistema de base de datos.',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        status: 'scheduled',
        notifyUsers: true,
        allowAdminAccess: true,
        createdBy: 'CEO'
      },
      {
        id: 'mnt_002',
        type: 'tenant',
        tenantId: 'tnt_001',
        tenantName: 'Mega Media',
        title: 'Migración de datos',
        message: 'Migración de datos a nuevo servidor.',
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 50 * 60 * 60 * 1000),
        status: 'scheduled',
        notifyUsers: true,
        allowAdminAccess: true,
        createdBy: 'CEO'
      }
    ])

    setStats({
      activeMaintenances: 0,
      scheduledMaintenances: 2,
      completedThisMonth: 5,
      totalDowntimeHours: 8.5
    })

    setIsLoading(false)
  }

  const toggleGlobalMaintenance = () => {
    if (!globalMaintenance) {
      if (confirm('¿Activar modo mantenimiento GLOBAL? Todos los usuarios serán desconectados.')) {
        setGlobalMaintenance(true)
      }
    } else {
      setGlobalMaintenance(false)
    }
  }

  const scheduleMaintenance = () => {
    if (!newMaintenance.title || !newMaintenance.startTime || !newMaintenance.endTime) {
      alert('Por favor completa todos los campos')
      return
    }

    const window: MaintenanceWindow = {
      id: `mnt_${Date.now()}`,
      type: newMaintenance.type,
      title: newMaintenance.title,
      message: newMaintenance.message,
      startTime: new Date(newMaintenance.startTime),
      endTime: new Date(newMaintenance.endTime),
      status: 'scheduled',
      notifyUsers: newMaintenance.notifyUsers,
      allowAdminAccess: newMaintenance.allowAdminAccess,
      createdBy: 'CEO'
    }

    setMaintenanceWindows(prev => [...prev, window])
    setShowScheduleModal(false)
    setNewMaintenance({
      type: 'global',
      title: '',
      message: 'El sistema estará en mantenimiento programado. Disculpe las molestias.',
      startTime: '',
      endTime: '',
      notifyUsers: true,
      allowAdminAccess: true
    })

    if (newMaintenance.notifyUsers) {

    }
  }

  const cancelMaintenance = (id: string) => {
    setMaintenanceWindows(prev => prev.map(w =>
      w.id === id ? { ...w, status: 'cancelled' as const } : w
    ))
  }

  const startMaintenanceNow = (id: string) => {
    setMaintenanceWindows(prev => prev.map(w =>
      w.id === id ? { ...w, status: 'active' as const, startTime: new Date() } : w
    ))
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Modo Mantenimiento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Global Maintenance Toggle */}
      <NeuCard
        style={{ boxShadow: globalMaintenance ? getFloatingShadow() : getSmallShadow(), padding: '1.5rem', background: N.base }}
        className={`p-6 ${globalMaintenance ? 'border-[#6888ff]/50' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${globalMaintenance ? 'bg-[#6888ff] animate-pulse' : 'bg-[#dfeaff]'
              }`}>
              <Wrench className="w-7 h-7 text-[#69738c]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#69738c]">Modo Mantenimiento Global</h3>
              <p className="text-sm text-[#9aa3b8]">
                {globalMaintenance
                  ? 'š ï¸ ACTIVO - Usuarios bloqueados'
                  : 'Sistema operativo normalmente'
                }
              </p>
            </div>
          </div>
          <NeuButton
            variant={globalMaintenance ? 'primary' : 'secondary'}
            onClick={toggleGlobalMaintenance}
          >
            <Power className="w-4 h-4 mr-2" />
            {globalMaintenance ? 'Desactivar' : 'Activar'}
          </NeuButton>
        </div>

        {globalMaintenance && (
          <div className="mt-4 p-4 bg-[#6888ff]/10 rounded-lg">
            <label className="text-xs text-[#9aa3b8] block mb-2">Mensaje para usuarios:</label>
            <textarea
              value={globalMessage}
              onChange={(e) => setGlobalMessage(e.target.value)}
              className="w-full bg-[#dfeaff] text-[#69738c] text-sm rounded-lg p-3 border border-[#6888ff]/30"
              rows={2}
            />
          </div>
        )}
      </NeuCard>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-[#6888ff]" />
            <span className="text-xs text-[#9aa3b8]">Activos</span>
          </div>
          <p className="text-xl font-bold text-[#69738c]">{stats?.activeMaintenances}</p>
        </div>
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-[#6888ff]" />
            <span className="text-xs text-[#9aa3b8]">Programados</span>
          </div>
          <p className="text-xl font-bold text-[#69738c]">{stats?.scheduledMaintenances}</p>
        </div>
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-[#6888ff]" />
            <span className="text-xs text-[#9aa3b8]">Este Mes</span>
          </div>
          <p className="text-xl font-bold text-[#69738c]">{stats?.completedThisMonth}</p>
        </div>
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#6888ff]" />
            <span className="text-xs text-[#9aa3b8]">Downtime Total</span>
          </div>
          <p className="text-xl font-bold text-[#69738c]">{stats?.totalDowntimeHours}h</p>
        </div>
      </div>

      {/* Schedule New */}
      <div className="flex items-center justify-between">
        <h4 className="text-[#69738c] font-medium">Mantenimientos Programados</h4>
        <NeuButton
          variant="primary"

          onClick={() => setShowScheduleModal(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Programar
        </NeuButton>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
          <h4 className="text-[#69738c] font-bold mb-4">Programar Mantenimiento</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9aa3b8] block mb-1">Tipo</label>
              <select
                value={newMaintenance.type}
                onChange={(e) => setNewMaintenance(nm => ({ ...nm, type: e.target.value as 'global' | 'tenant' }))}
                className="w-full bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2"
              >
                <option value="global">Global (Todo el sistema)</option>
                <option value="tenant">Por Tenant</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9aa3b8] block mb-1">Título</label>
              <input
                type="text"
                value={newMaintenance.title}
                onChange={(e) => setNewMaintenance(nm => ({ ...nm, title: e.target.value }))}
                className="w-full bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2"
                placeholder="Ej: Actualización de seguridad"
              />
            </div>
            <div>
              <label className="text-xs text-[#9aa3b8] block mb-1">Inicio</label>
              <input
                type="datetime-local"
                value={newMaintenance.startTime}
                onChange={(e) => setNewMaintenance(nm => ({ ...nm, startTime: e.target.value }))}
                className="w-full bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-[#9aa3b8] block mb-1">Fin</label>
              <input
                type="datetime-local"
                value={newMaintenance.endTime}
                onChange={(e) => setNewMaintenance(nm => ({ ...nm, endTime: e.target.value }))}
                className="w-full bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#9aa3b8] block mb-1">Mensaje</label>
              <textarea
                value={newMaintenance.message}
                onChange={(e) => setNewMaintenance(nm => ({ ...nm, message: e.target.value }))}
                className="w-full bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#69738c]">
                <input
                  type="checkbox"
                  checked={newMaintenance.notifyUsers}
                  onChange={(e) => setNewMaintenance(nm => ({ ...nm, notifyUsers: e.target.checked }))}
                  className="rounded"
                />
                Notificar usuarios
              </label>
              <label className="flex items-center gap-2 text-sm text-[#69738c]">
                <input
                  type="checkbox"
                  checked={newMaintenance.allowAdminAccess}
                  onChange={(e) => setNewMaintenance(nm => ({ ...nm, allowAdminAccess: e.target.checked }))}
                  className="rounded"
                />
                Permitir acceso admin
              </label>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <NeuButton variant="secondary" onClick={() => setShowScheduleModal(false)}>
                Cancelar
              </NeuButton>
              <NeuButton variant="primary" onClick={scheduleMaintenance}>
                Programar
              </NeuButton>
            </div>
          </div>
        </NeuCard>
      )}

      {/* Scheduled Windows */}
      <div className="space-y-2">
        {maintenanceWindows.filter(w => w.status !== 'cancelled').map(window => (
          <div
            key={window.id}
            className={`p-4 rounded-lg border ${window.status === 'active'
              ? 'bg-[#6888ff]/10 border-[#6888ff]/30'
              : 'bg-[#dfeaff]/30 border-slate-700/50'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {window.type === 'global' ? (
                  <Globe className="w-5 h-5 text-[#6888ff]" />
                ) : (
                  <Building2 className="w-5 h-5 text-[#6888ff]" />
                )}
                <div>
                  <p className="text-[#69738c] font-medium">{window.title}</p>
                  <p className="text-xs text-[#9aa3b8]">
                    {window.type === 'global' ? 'Global' : window.tenantName} •
                    {formatDateTime(window.startTime)} - {formatDateTime(window.endTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${window.status === 'active' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                  window.status === 'scheduled' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                    'bg-[#6888ff]/20 text-[#6888ff]'
                  }`}>
                  {window.status === 'active' ? 'En Curso' :
                    window.status === 'scheduled' ? 'Programado' : 'completed'}
                </span>
                {window.status === 'scheduled' && (
                  <>
                    <NeuButton
                      variant="primary"

                      onClick={() => startMaintenanceNow(window.id)}
                    >
                      <Play className="w-3 h-3" />
                    </NeuButton>
                    <NeuButton
                      variant="secondary"

                      onClick={() => cancelMaintenance(window.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </NeuButton>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MaintenanceMode