'use client'

/**
 * 📜 SILEXAR PULSE - GDPR Privacy Center
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
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
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
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  createdAt: Date
  dueDate: Date
  completedAt?: Date
  notes?: string
}

export function GDPRPrivacy() {
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

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
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'req_002',
        type: 'deletion',
        userId: 'usr_67890',
        userEmail: 'carlos@example.com',
        status: 'processing',
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
      case 'access': return 'bg-blue-500/20 text-blue-400'
      case 'deletion': return 'bg-red-500/20 text-red-400'
      case 'portability': return 'bg-purple-500/20 text-purple-400'
      case 'rectification': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'processing': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getDaysRemaining = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    return days
  }

  const processRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'processing' } : r))
  }

  const completeRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed', completedAt: new Date() } : r))
  }

  const filteredRequests = requests.filter(r => {
    switch (filter) {
      case 'pending': return r.status === 'pending' || r.status === 'processing'
      case 'completed': return r.status === 'completed'
      default: return true
    }
  })

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'processing').length
  const urgentCount = requests.filter(r => getDaysRemaining(r.dueDate) <= 7 && r.status !== 'completed').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando GDPR Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          GDPR / Privacy Center
        </h3>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{requests.length}</p>
          <p className="text-xs text-slate-400">Total Requests</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{urgentCount}</p>
          <p className="text-xs text-slate-400">Urgentes ({'<'}7 días)</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {requests.filter(r => r.status === 'completed').length}
          </p>
          <p className="text-xs text-slate-400">Completadas</p>
        </div>
      </div>

      {/* Urgent Warning */}
      {urgentCount > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <div>
            <span className="text-red-400 font-medium">{urgentCount} solicitudes vencen en menos de 7 días</span>
            <p className="text-sm text-slate-400">GDPR requiere responder en 30 días máximo</p>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.map(request => (
          <NeuromorphicCard key={request.id} variant="embossed" className="p-4">
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
              <div className={`text-sm ${
                getDaysRemaining(request.dueDate) <= 7 && request.status !== 'completed'
                  ? 'text-red-400' : 'text-slate-400'
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
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-white">{request.userEmail}</span>
              </div>
              <span className="text-xs text-slate-500">ID: {request.userId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Solicitado: {request.createdAt.toLocaleDateString()}
              </span>

              {request.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <NeuromorphicButton variant="primary" size="sm" onClick={() => processRequest(request.id)}>
                    <Eye className="w-3 h-3 mr-1" />
                    Procesar
                  </NeuromorphicButton>
                </div>
              )}

              {request.status === 'processing' && (
                <div className="flex items-center gap-2">
                  <NeuromorphicButton variant="primary" size="sm" onClick={() => completeRequest(request.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Marcar Completado
                  </NeuromorphicButton>
                </div>
              )}
            </div>

            {request.notes && (
              <p className="mt-2 text-sm text-slate-400 italic">{request.notes}</p>
            )}
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default GDPRPrivacy
