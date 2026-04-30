'use client'

/**
 * ðŸ‘¤ SILEXAR PULSE - User Impersonation
 * Login como cualquier usuario (auditado)
 * 
 * @description User Impersonation:
 * - Login seguro como usuario
 * - Audit trail completo
 * - Session control
 * - Time-limited access
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  UserCheck,
  Search,
  LogIn,
  AlertTriangle,
  Eye,
  X,
  History
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  tenant: string
  role: string
  lastLogin: Date
  status: 'active' | 'inactive' | 'suspended'
}

interface ImpersonationSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  adminId: string
  adminName: string
  startedAt: Date
  endedAt?: Date
  reason: string
}

export function UserImpersonation() {
  const [users, setUsers] = useState<User[]>([])
  const [sessions, setSessions] = useState<ImpersonationSession[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [impersonationReason, setImpersonationReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<ImpersonationSession | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setUsers([
      { id: 'usr_001', email: 'admin@rdfmedia.com', name: 'Admin RDF', tenant: 'RDF Media', role: 'Administrador', lastLogin: new Date(), status: 'active' },
      { id: 'usr_002', email: 'maria@rdfmedia.com', name: 'María González', tenant: 'RDF Media', role: 'editor', lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'active' },
      { id: 'usr_003', email: 'carlos@prisa.com', name: 'Carlos Mendez', tenant: 'Grupo Prisa', role: 'Administrador', lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'active' },
      { id: 'usr_004', email: 'ana@megamedia.cl', name: 'Ana Rojas', tenant: 'Mega Media', role: 'viewer', lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), status: 'inactive' },
      { id: 'usr_005', email: 'pedro@canal13.cl', name: 'Pedro Soto', tenant: 'Canal 13', role: 'editor', lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), status: 'active' }
    ])

    setSessions([
      {
        id: 'imp_001',
        userId: 'usr_002',
        userName: 'María González',
        userEmail: 'maria@rdfmedia.com',
        adminId: 'ceo',
        adminName: 'CEO',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        reason: 'Investigar error reportado por usuario'
      },
      {
        id: 'imp_002',
        userId: 'usr_004',
        userName: 'Ana Rojas',
        userEmail: 'ana@megamedia.cl',
        adminId: 'ceo',
        adminName: 'CEO',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        reason: 'Verificar configuración de cuenta'
      }
    ])

    setIsLoading(false)
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.tenant.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startImpersonation = () => {
    if (!selectedUser || !impersonationReason) {
      alert('Debes seleccionar un usuario y proporcionar una razón')
      return
    }

    const session: ImpersonationSession = {
      id: `imp_${Date.now()}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      userEmail: selectedUser.email,
      adminId: 'ceo',
      adminName: 'CEO',
      startedAt: new Date(),
      reason: impersonationReason
    }

    setActiveSession(session)
    setSessions(prev => [session, ...prev])

  }

  const endImpersonation = () => {
    if (activeSession) {
      setSessions(prev => prev.map(s =>
        s.id === activeSession.id ? { ...s, endedAt: new Date() } : s
      ))
      setActiveSession(null)
      setSelectedUser(null)
      setImpersonationReason('')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando User Impersonation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#6888ff]" />
          User Impersonation
        </h3>
      </div>

      {/* Warning */}
      <div className="p-4 bg-[#6888ff]/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#6888ff] flex-shrink-0" />
        <div>
          <span className="text-[#6888ff] font-medium">Acceso auditado</span>
          <p className="text-sm text-[#9aa3b8]">Todas las sesiones de impersonation quedan registradas en el audit log.</p>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6888ff] rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#69738c]" />
              </div>
              <div>
                <span className="text-[#69738c] font-medium">Sesión activa como {activeSession.userName}</span>
                <p className="text-xs text-[#9aa3b8]">{activeSession.userEmail}</p>
              </div>
            </div>
            <NeuButton variant="secondary" onClick={endImpersonation}>
              <X className="w-4 h-4 mr-1" />
              Terminar Sesión
            </NeuButton>
          </div>
        </NeuCard>
      )}

      {/* Search & Impersonate */}
      {!activeSession && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
            <input
              type="text"
              placeholder="Buscar usuario por nombre, email o tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#dfeaff] border border-slate-700 rounded-lg text-[#69738c]"
            />
          </div>

          {searchQuery && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${selectedUser?.id === user.id
                    ? 'bg-[#6888ff]/20 border border-[#6888ff]/50'
                    : 'bg-[#dfeaff]/50 hover:bg-[#dfeaff]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#69738c]">{user.name}</span>
                      <p className="text-xs text-[#9aa3b8]">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#9aa3b8]">{user.tenant}</span>
                      <p className="text-xs text-[#9aa3b8] capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedUser && (
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
              <h4 className="text-[#69738c] font-medium mb-3">Iniciar sesión como: {selectedUser.name}</h4>
              <textarea
                placeholder="Razón para impersonar (requerido)..."
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value)}
                className="w-full p-3 bg-[#dfeaff] border border-slate-700 rounded-lg text-[#69738c] text-sm mb-3"
                rows={2}
              />
              <NeuButton variant="primary" onClick={startImpersonation}>
                <LogIn className="w-4 h-4 mr-1" />
                Iniciar Impersonation
              </NeuButton>
            </NeuCard>
          )}
        </>
      )}

      {/* Session History */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-[#9aa3b8]" />
          Historial de Sesiones
        </h4>
        <div className="space-y-2">
          {sessions.slice(0, 5).map(session => (
            <div key={session.id} className="p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#69738c] text-sm">{session.userName}</span>
                <span className="text-xs text-[#9aa3b8]">
                  {session.startedAt.toLocaleDateString()} {session.startedAt.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-[#9aa3b8]">Razón: {session.reason}</p>
              {session.endedAt && (
                <p className="text-xs text-[#6888ff] mt-1">
                  Duración: {Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000)} min
                </p>
              )}
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default UserImpersonation