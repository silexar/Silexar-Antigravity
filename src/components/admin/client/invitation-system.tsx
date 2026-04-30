'use client'

/**
 * ðŸ“§ SILEXAR PULSE - Invitation System (Client)
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
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
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
  status: 'Pendiente' | 'accepted' | 'expired' | 'revoked'
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
  const [newRole, setNewRole] = useState('Usuario')
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
        status: 'Pendiente',
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
      status: 'Pendiente',
      invitedBy: 'Administrador',
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
      case 'Pendiente': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'accepted': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'expired': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'revoked': return 'bg-slate-500/20 text-[#9aa3b8]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendiente': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      case 'revoked': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const pendingCount = invitations.filter(i => i.status === 'Pendiente').length
  const acceptedCount = invitations.filter(i => i.status === 'accepted').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Invitation System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#6888ff]" />
          Invitation System
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadInvitations}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="primary" onClick={() => setShowForm(!showForm)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Invitar Usuario
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{invitations.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{pendingCount}</p>
          <p className="text-xs text-[#9aa3b8]">Pendientes</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{acceptedCount}</p>
          <p className="text-xs text-[#9aa3b8]">Aceptadas</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{invitations.filter(i => i.status === 'expired').length}</p>
          <p className="text-xs text-[#9aa3b8]">Expiradas</p>
        </div>
      </div>

      {/* Invitation Form */}
      {showForm && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3">Nueva Invitación</h4>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="email@empresa.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="col-span-2 px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]"
            >
              <option value="Usuario">Usuario</option>
              <option value="Gerente">Gerente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end mt-3">
            <NeuButton variant="primary" onClick={sendInvitation}>
              <Send className="w-4 h-4 mr-1" />
              Enviar Invitación
            </NeuButton>
          </div>
        </NeuCard>
      )}

      {/* Invitations List */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3">Historial de Invitaciones</h4>
        <div className="space-y-2">
          {invitations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${getStatusStyle(inv.status)}`}>
                  {getStatusIcon(inv.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#69738c]">{inv.email}</span>
                    <span className="text-xs px-2 py-0.5 bg-[#dfeaff] rounded">{inv.role}</span>
                  </div>
                  <p className="text-xs text-[#9aa3b8]">
                    Invitado por {inv.invitedBy} • {inv.invitedAt.toLocaleDateString()}
                    {inv.team && ` • Equipo: ${inv.team}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusStyle(inv.status)}`}>
                  {inv.status}
                </span>
                {inv.status === 'Pendiente' && (
                  <>
                    <button onClick={() => copyLink(inv.inviteLink)} className="p-1 hover:bg-[#dfeaff] rounded">
                      <Copy className="w-4 h-4 text-[#9aa3b8]" />
                    </button>
                    <button onClick={() => resendInvitation(inv.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                      <RefreshCw className="w-4 h-4 text-[#6888ff]" />
                    </button>
                    <button onClick={() => revokeInvitation(inv.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                      <XCircle className="w-4 h-4 text-[#6888ff]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default InvitationSystem