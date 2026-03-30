'use client'

/**
 * 📧 SILEXAR PULSE - Invitation System (Client)
 * Sistema de invitaciones para clientes
 * 
 * @description Invitations:
 * - Invitar usuarios por email
 * - Roles predefinidos
 * - Links de invitación
 * - Historial de invitaciones
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
  UserPlus
} from 'lucide-react'

interface Invitation {
  id: string
  email: string
  role: string
  team?: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  acceptedAt?: Date
  inviteLink: string
}

export function InvitationSystem() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('user')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setInvitations([
      {
        id: 'inv_001',
        email: 'nuevo.usuario@empresa.com',
        role: 'Usuario',
        team: 'Marketing Digital',
        status: 'pending',
        invitedBy: 'María González',
        invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        inviteLink: 'https://silexar.com/invite/abc123'
      },
      {
        id: 'inv_002',
        email: 'ana.martinez@empresa.com',
        role: 'Gerente',
        status: 'accepted',
        invitedBy: 'María González',
        invitedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        inviteLink: 'https://silexar.com/invite/def456'
      },
      {
        id: 'inv_003',
        email: 'pedro.ex@empresa.com',
        role: 'Usuario',
        status: 'expired',
        invitedBy: 'Carlos López',
        invitedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        inviteLink: 'https://silexar.com/invite/ghi789'
      }
    ])

    setIsLoading(false)
  }

  const sendInvitation = async () => {
    if (!newEmail.trim()) return
    
    const newInvite: Invitation = {
      id: `inv_${Date.now()}`,
      email: newEmail,
      role: newRole,
      status: 'pending',
      invitedBy: 'Admin',
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      inviteLink: `https://silexar.com/invite/${Math.random().toString(36).substr(2, 9)}`
    }
    
    setInvitations(prev => [newInvite, ...prev])
    setNewEmail('')
    setShowForm(false)
    alert(`Invitación enviada a ${newEmail}`)
  }

  const resendInvitation = (_id: string) => {
    alert('Invitación reenviada!')
  }

  const revokeInvitation = (id: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'revoked' as const } : inv
    ))
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    alert('Link copiado al portapapeles')
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'accepted': return 'bg-green-500/20 text-green-400'
      case 'expired': return 'bg-red-500/20 text-red-400'
      case 'revoked': return 'bg-slate-500/20 text-slate-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      case 'revoked': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const pendingCount = invitations.filter(i => i.status === 'pending').length
  const acceptedCount = invitations.filter(i => i.status === 'accepted').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Invitation System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          Invitation System
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadInvitations}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          <NeuromorphicButton variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Invitar Usuario
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{invitations.length}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{acceptedCount}</p>
          <p className="text-xs text-slate-400">Aceptadas</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{invitations.filter(i => i.status === 'expired').length}</p>
          <p className="text-xs text-slate-400">Expiradas</p>
        </div>
      </div>

      {/* Invitation Form */}
      {showForm && (
        <NeuromorphicCard variant="glow" className="p-4">
          <h4 className="text-white font-medium mb-3">Nueva Invitación</h4>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="email@empresa.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
            >
              <option value="user">Usuario</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end mt-3">
            <NeuromorphicButton variant="primary" size="sm" onClick={sendInvitation}>
              <Send className="w-4 h-4 mr-1" />
              Enviar Invitación
            </NeuromorphicButton>
          </div>
        </NeuromorphicCard>
      )}

      {/* Invitations List */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">Historial de Invitaciones</h4>
        <div className="space-y-2">
          {invitations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${getStatusStyle(inv.status)}`}>
                  {getStatusIcon(inv.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{inv.email}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded">{inv.role}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Invitado por {inv.invitedBy} • {inv.invitedAt.toLocaleDateString()}
                    {inv.team && ` • Equipo: ${inv.team}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusStyle(inv.status)}`}>
                  {inv.status}
                </span>
                {inv.status === 'pending' && (
                  <>
                    <button onClick={() => copyLink(inv.inviteLink)} className="p-1 hover:bg-slate-700 rounded">
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => resendInvitation(inv.id)} className="p-1 hover:bg-slate-700 rounded">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                    </button>
                    <button onClick={() => revokeInvitation(inv.id)} className="p-1 hover:bg-slate-700 rounded">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default InvitationSystem
