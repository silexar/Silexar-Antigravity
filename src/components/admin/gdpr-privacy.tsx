'use client'

/**
 * ðŸ“œ SILEXAR PULSE - GDPR Privacy Center
 * Centro de privacidad y cumplimiento
 * 
 * @description Privacy Management:
 * - Data requests
 * - User deletions
 * - Data exports
 * - Consent tracking
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Eye
} from 'lucide-react'

interface DataRequest {
  id: string
  type: 'access' | 'deletion' | 'portability' | 'rectification'
  userId: string
  userEmail: string
  status: 'Pendiente' | 'Procesando' | 'completed' | 'rejected'
  createdAt: Date
  dueDate: Date
  completedAt?: Date
  notes?: string
}

export function GDPRPrivacy() {
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Pendiente' | 'completed'>('all')

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setRequests([
      {
        id: 'req_001',
        type: 'access',
        userId: 'usr_12345',
        userEmail: 'maria@example.com',
        status: 'Pendiente',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'req_002',
        type: 'deletion',
        userId: 'usr_67890',
        userEmail: 'carlos@example.com',
        status: 'Procesando',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: 'Eliminando datos de campañas asociadas'
      },
      {
        id: 'req_003',
        type: 'portability',
        userId: 'usr_11111',
        userEmail: 'ana@company.com',
        status: 'completed',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'req_004',
        type: 'access',
        userId: 'usr_22222',
        userEmail: 'pedro@org.com',
        status: 'completed',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ])

    setIsLoading(false)
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'access': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'deletion': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'portability': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'rectification': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'Procesando': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'completed': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'rejected': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const getDaysRemaining = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    return days
  }

  const processRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Procesando' } : r))
  }

  const completeRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed', completedAt: new Date() } : r))
  }

  const filteredRequests = requests.filter(r => {
    switch (filter) {
      case 'Pendiente': return r.status === 'Pendiente' || r.status === 'Procesando'
      case 'completed': return r.status === 'completed'
      default: return true
    }
  })

  const pendingCount = requests.filter(r => r.status === 'Pendiente' || r.status === 'Procesando').length
  const urgentCount = requests.filter(r => getDaysRemaining(r.dueDate) <= 7 && r.status !== 'completed').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando GDPR Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6888ff]" />
          GDPR / Privacy Center
        </h3>
        <div className="flex items-center gap-2">
          {(['all', 'Pendiente', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded ${filter === f ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'
                }`}
            >
              {f === 'all' ? 'Todas' : f === 'Pendiente' ? 'Pendientes' : 'Completadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{requests.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total Requests</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{pendingCount}</p>
          <p className="text-xs text-[#9aa3b8]">Pendientes</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{urgentCount}</p>
          <p className="text-xs text-[#9aa3b8]">Urgentes ({'<'}7 días)</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {requests.filter(r => r.status === 'completed').length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Completadas</p>
        </div>
      </div>

      {/* Urgent Warning */}
      {urgentCount > 0 && (
        <div className="p-4 bg-[#6888ff]/10 border border-[#6888ff]/30 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#6888ff]" />
          <div>
            <span className="text-[#6888ff] font-medium">{urgentCount} solicitudes vencen en menos de 7 días</span>
            <p className="text-sm text-[#9aa3b8]">GDPR requiere responder en 30 días máximo</p>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.map(request => (
          <NeuCard key={request.id} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded uppercase ${getTypeStyle(request.type)}`}>
                    {request.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
              <div className={`text-sm ${getDaysRemaining(request.dueDate) <= 7 && request.status !== 'completed'
                ? 'text-[#6888ff]' : 'text-[#9aa3b8]'
                }`}>
                <Clock className="w-3 h-3 inline mr-1" />
                {request.status === 'completed'
                  ? `Completado ${request.completedAt?.toLocaleDateString()}`
                  : `${getDaysRemaining(request.dueDate)} días restantes`
                }
              </div>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#9aa3b8]" />
                <span className="text-[#69738c]">{request.userEmail}</span>
              </div>
              <span className="text-xs text-[#9aa3b8]">ID: {request.userId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3b8]">
                Solicitado: {request.createdAt.toLocaleDateString()}
              </span>

              {request.status === 'Pendiente' && (
                <div className="flex items-center gap-2">
                  <NeuButton variant="primary" onClick={() => processRequest(request.id)}>
                    <Eye className="w-3 h-3 mr-1" />
                    Procesar
                  </NeuButton>
                </div>
              )}

              {request.status === 'Procesando' && (
                <div className="flex items-center gap-2">
                  <NeuButton variant="primary" onClick={() => completeRequest(request.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Marcar Completado
                  </NeuButton>
                </div>
              )}
            </div>

            {request.notes && (
              <p className="mt-2 text-sm text-[#9aa3b8] italic">{request.notes}</p>
            )}
          </NeuCard>
        ))}
      </div>
    </div>
  )
}

export default GDPRPrivacy