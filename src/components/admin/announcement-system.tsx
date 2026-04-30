'use client'

/**
 * ðŸ“¢ SILEXAR PULSE - Sistema de Anuncios
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
 * @last_modified 2025-04-28 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
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
      case 'info': return <Info style={{ width: 20, height: 20, color: N.accent }} />
      case 'warning': return <AlertTriangle style={{ width: 20, height: 20, color: N.accent }} />
      case 'maintenance': return <Wrench style={{ width: 20, height: 20, color: '#6888ff' }} />
      case 'celebration': return <PartyPopper style={{ width: 20, height: 20, color: '#6888ff' }} />
      default: return <Info style={{ width: 20, height: 20, color: N.textSub }} />
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'info': return { background: `${N.accent}15`, border: `1px solid ${N.accent}30` }
      case 'warning': return { background: `${N.accent}15`, border: `1px solid ${N.accent}30` }
      case 'maintenance': return { background: '#6888ff15', border: '1px solid #6888ff30' }
      case 'celebration': return { background: '#6888ff15', border: '1px solid #6888ff30' }
      default: return { background: `${N.dark}15`, border: `1px solid ${N.dark}30` }
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid ${N.dark}30',
            borderTopColor: N.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: N.textSub }}>Cargando Anuncios...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Megaphone style={{ width: 20, height: 20, color: '#6888ff' }} />
          Sistema de Anuncios
        </h3>
        <NeuButton variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus style={{ width: 16, height: 16, marginRight: 4 }} />
          Nuevo Anuncio
        </NeuButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <div style={{ padding: '12px', background: `${N.dark}50`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{announcements.filter(a => a.active).length}</p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Activos</p>
        </div>
        <div style={{ padding: '12px', background: `${N.dark}50`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.accent, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            {announcements.reduce((sum, a) => sum + a.views, 0)}
          </p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Vistas Totales</p>
        </div>
        <div style={{ padding: '12px', background: `${N.dark}50`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.accent, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            {announcements.filter(a => a.type === 'celebration').length}
          </p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Celebraciones</p>
        </div>
        <div style={{ padding: '12px', background: `${N.dark}50`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.accent, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            {announcements.filter(a => a.priority === 'high').length}
          </p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Alta Prioridad</p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ color: N.text, fontWeight: 700 }}>Crear Anuncio</h4>
            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: N.textSub, cursor: 'pointer' }} aria-label="Cerrar">
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ color: N.textSub, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Tipo</label>
              <select
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, type: e.target.value as Announcement['type'] }))}
                style={{ width: '100%', background: N.dark, color: N.text, fontSize: '0.875rem', borderRadius: '6px', padding: '8px 12px', border: `1px solid ${N.dark}50` }}
              >
                <option value="info">„¹ï¸ Información</option>
                <option value="warning">š ï¸ Advertencia</option>
                <option value="maintenance">ðŸ”§ Mantenimiento</option>
                <option value="celebration">ðŸŽ‰ Celebración</option>
              </select>
            </div>
            <div>
              <label style={{ color: N.textSub, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Destino</label>
              <select
                value={newAnnouncement.target}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, target: e.target.value as 'global' | 'tenants' }))}
                style={{ width: '100%', background: N.dark, color: N.text, fontSize: '0.875rem', borderRadius: '6px', padding: '8px 12px', border: `1px solid ${N.dark}50` }}
              >
                <option value="global">ðŸŒ Global (todos)</option>
                <option value="tenants">ðŸ¢ Tenants específicos</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ color: N.textSub, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Título</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, title: e.target.value }))}
                style={{ width: '100%', background: N.dark, color: N.text, fontSize: '0.875rem', borderRadius: '6px', padding: '8px 12px', border: `1px solid ${N.dark}50` }}
                placeholder="Título del anuncio"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ color: N.textSub, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Mensaje</label>
              <textarea
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, message: e.target.value }))}
                style={{ width: '100%', background: N.dark, color: N.text, fontSize: '0.875rem', borderRadius: '6px', padding: '8px 12px', border: `1px solid ${N.dark}50`, resize: 'vertical' }}
                rows={3}
                placeholder="Contenido del anuncio..."
              />
            </div>
            <div>
              <label style={{ color: N.textSub, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Prioridad</label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, priority: e.target.value as Announcement['priority'] }))}
                style={{ width: '100%', background: N.dark, color: N.text, fontSize: '0.875rem', borderRadius: '6px', padding: '8px 12px', border: `1px solid ${N.dark}50` }}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label style={{ color: N.textSub, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Expira en</label>
              <select
                value={newAnnouncement.expiresIn}
                onChange={(e) => setNewAnnouncement(na => ({ ...na, expiresIn: e.target.value }))}
                style={{ width: '100%', background: N.dark, color: N.text, fontSize: '0.875rem', borderRadius: '6px', padding: '8px 12px', border: `1px solid ${N.dark}50` }}
              >
                <option value="1">1 hora</option>
                <option value="6">6 horas</option>
                <option value="24">24 horas</option>
                <option value="72">3 días</option>
                <option value="168">1 semana</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: N.text, fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={newAnnouncement.dismissible}
                  onChange={(e) => setNewAnnouncement(na => ({ ...na, dismissible: e.target.checked }))}
                  style={{ borderRadius: '4px' }}
                />
                Permitir cerrar
              </label>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <NeuButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </NeuButton>
              <NeuButton variant="primary" onClick={createAnnouncement}>
                <Send style={{ width: 16, height: 16, marginRight: 4 }} />
                Enviar
              </NeuButton>
            </div>
          </div>
        </NeuCard>
      )}

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {announcements.map(announcement => (
          <div
            key={announcement.id}
            style={{
              ...getTypeStyle(announcement.type),
              padding: '1rem',
              borderRadius: '8px',
              opacity: !announcement.active ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {getTypeIcon(announcement.type)}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: N.text, fontWeight: 500 }}>{announcement.title}</span>
                    {announcement.priority === 'high' && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: `${N.accent}20`, color: N.accent, borderRadius: '4px' }}>
                        Alta prioridad
                      </span>
                    )}
                    {announcement.target === 'global' ? (
                      <Globe style={{ width: 16, height: 16, color: N.textSub }} />
                    ) : (
                      <Building2 style={{ width: 16, height: 16, color: N.textSub }} />
                    )}
                  </div>
                  <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '4px' }}>{announcement.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '8px', fontSize: '0.75rem', color: N.textSub }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye style={{ width: 12, height: 12 }} />
                      {announcement.views} vistas
                    </span>
                    {announcement.dismissible && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle style={{ width: 12, height: 12 }} />
                        {announcement.dismissed} cerrados
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: 12, height: 12 }} />
                      {announcement.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => toggleActive(announcement.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: announcement.active ? `${N.accent}20` : `${N.dark}50`,
                    color: announcement.active ? N.accent : N.textSub
                  }}
                >
                  {announcement.active ? 'Activo' : 'Pausado'}
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  style={{ padding: '4px', color: N.accent, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                  aria-label="Eliminar"
                >
                  <Trash2 style={{ width: 16, height: 16 }} />
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
