'use client'

/**
 * 📢 SILEXAR PULSE - Sistema de Anuncios
 * Broadcast de mensajes a usuarios y tenants
 * 
 * @description Sistema de anuncios con:
 * - Broadcast global o por tenant
 * - Tipos: info, warning, maintenance, celebration
 * - Programación de anuncios
 * - Tracking de visualizaciones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Megaphone,
  Send,
  Globe,
  Building2,
  Clock,
  Eye,
  Trash2,
  Plus,
  AlertTriangle,
  Info,
  Wrench,
  PartyPopper,
  X,
  CheckCircle
} from 'lucide-react'

interface Announcement {
  id: string
  type: 'info' | 'warning' | 'maintenance' | 'celebration'
  target: 'global' | 'tenants'
  targetIds?: string[]
  title: string
  message: string
  createdAt: Date
  expiresAt?: Date
  dismissible: boolean
  priority: 'low' | 'medium' | 'high'
  views: number
  dismissed: number
  createdBy: string
  active: boolean
}

export function AnnouncementSystem() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState<{
    type: 'info' | 'warning' | 'maintenance' | 'celebration'
    target: 'global' | 'tenants'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    dismissible: boolean
    expiresIn: string
  }>({
    type: 'info',
    target: 'global',
    title: '',
    message: '',
    priority: 'medium',
    dismissible: true,
    expiresIn: '24'
  })

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setAnnouncements([
      {
        id: 'ann_001',
        type: 'info',
        target: 'global',
        title: 'Nueva versión disponible',
        message: 'Hemos lanzado la versión 3.2 con mejoras de rendimiento y nuevas características.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        dismissible: true,
        priority: 'medium',
        views: 156,
        dismissed: 45,
        createdBy: 'CEO',
        active: true
      },
      {
        id: 'ann_002',
        type: 'maintenance',
        target: 'global',
        title: 'Mantenimiento programado',
        message: 'El sistema estará en mantenimiento mañana de 02:00 a 04:00 AM.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        dismissible: false,
        priority: 'high',
        views: 230,
        dismissed: 0,
        createdBy: 'CEO',
        active: true
      },
      {
        id: 'ann_003',
        type: 'celebration',
        target: 'tenants',
        targetIds: ['tnt_rdf'],
        title: '¡Felicitaciones RDF Media!',
        message: 'Han alcanzado 1 millón de campañas procesadas. ¡Gran logro!',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dismissible: true,
        priority: 'low',
        views: 45,
        dismissed: 12,
        createdBy: 'CEO',
        active: true
      }
    ])

    setIsLoading(false)
  }

  const createAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Por favor completa título y mensaje')
      return
    }

    const announcement: Announcement = {
      id: `ann_${Date.now()}`,
      type: newAnnouncement.type,
      target: newAnnouncement.target,
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + parseInt(newAnnouncement.expiresIn) * 60 * 60 * 1000),
      dismissible: newAnnouncement.dismissible,
      priority: newAnnouncement.priority,
      views: 0,
      dismissed: 0,
      createdBy: 'CEO',
      active: true
    }

    setAnnouncements(prev => [announcement, ...prev])
    setShowCreateModal(false)
    setNewAnnouncement({
      type: 'info',
      target: 'global',
      title: '',
      message: '',
      priority: 'medium',
      dismissible: true,
      expiresIn: '24'
    })

  }

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const toggleActive = (id: string) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'maintenance': return <Wrench className="w-5 h-5 text-orange-400" />
      case 'celebration': return <PartyPopper className="w-5 h-5 text-pink-400" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500/10 border-blue-500/30'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'maintenance': return 'bg-orange-500/10 border-orange-500/30'
      case 'celebration': return 'bg-pink-500/10 border-pink-500/30'
      default: return 'bg-slate-500/10 border-slate-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Anuncios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-pink-400" />
          Sistema de Anuncios
        </h3>
        <NeuromorphicButton variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nuevo Anuncio
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{announcements.filter(a => a.active).length}</p>
          <p className="text-xs text-slate-400">Activos</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">
            {announcements.reduce((sum, a) => sum + a.views, 0)}
          </p>
          <p className="text-xs text-slate-400">Vistas Totales</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {announcements.filter(a => a.type === 'celebration').length}
          </p>
          <p className="text-xs text-slate-400">Celebraciones</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {announcements.filter(a => a.priority === 'high').length}
          </p>
          <p className="text-xs text-slate-400">Alta Prioridad</p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <NeuromorphicCard variant="glow" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">Crear Anuncio</h4>
            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tipo</label>
              <select
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, type: e.target.value as Announcement['type'] }))}
                className="w-full bg-slate-800 text-white text-sm rounded px-3 py-2"
              >
                <option value="info">ℹ️ Información</option>
                <option value="warning">⚠️ Advertencia</option>
                <option value="maintenance">🔧 Mantenimiento</option>
                <option value="celebration">🎉 Celebración</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Destino</label>
              <select
                value={newAnnouncement.target}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, target: e.target.value as 'global' | 'tenants' }))}
                className="w-full bg-slate-800 text-white text-sm rounded px-3 py-2"
              >
                <option value="global">🌍 Global (todos)</option>
                <option value="tenants">🏢 Tenants específicos</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 block mb-1">Título</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, title: e.target.value }))}
                className="w-full bg-slate-800 text-white text-sm rounded px-3 py-2"
                placeholder="Título del anuncio"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 block mb-1">Mensaje</label>
              <textarea
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, message: e.target.value }))}
                className="w-full bg-slate-800 text-white text-sm rounded px-3 py-2"
                rows={3}
                placeholder="Contenido del anuncio..."
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Prioridad</label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, priority: e.target.value as Announcement['priority'] }))}
                className="w-full bg-slate-800 text-white text-sm rounded px-3 py-2"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Expira en</label>
              <select
                value={newAnnouncement.expiresIn}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, expiresIn: e.target.value }))}
                className="w-full bg-slate-800 text-white text-sm rounded px-3 py-2"
              >
                <option value="1">1 hora</option>
                <option value="6">6 horas</option>
                <option value="24">24 horas</option>
                <option value="72">3 días</option>
                <option value="168">1 semana</option>
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={newAnnouncement.dismissible}
                  onChange={(e) => setNewAnnouncement(na => ({ ...na, dismissible: e.target.checked }))}
                  className="rounded"
                />
                Permitir cerrar
              </label>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <NeuromorphicButton variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </NeuromorphicButton>
              <NeuromorphicButton variant="primary" size="sm" onClick={createAnnouncement}>
                <Send className="w-4 h-4 mr-1" />
                Enviar
              </NeuromorphicButton>
            </div>
          </div>
        </NeuromorphicCard>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map(announcement => (
          <div 
            key={announcement.id}
            className={`p-4 rounded-lg border ${getTypeStyle(announcement.type)} ${
              !announcement.active ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getTypeIcon(announcement.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{announcement.title}</span>
                    {announcement.priority === 'high' && (
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                        Alta prioridad
                      </span>
                    )}
                    {announcement.target === 'global' ? (
                      <Globe className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Building2 className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{announcement.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {announcement.views} vistas
                    </span>
                    {announcement.dismissible && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {announcement.dismissed} cerrados
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {announcement.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(announcement.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    announcement.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {announcement.active ? 'Activo' : 'Pausado'}
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnnouncementSystem
