'use client'

/**
 * 🚨 SILEXAR PULSE - Incident Manager
 * Gestión profesional de incidentes
 * 
 * @description Incidents:
 * - Timeline de eventos
 * - Postmortems
 * - Métricas de resolución
 * - Comunicación automática
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
  AlertOctagon,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Users,
  RefreshCw,
  ArrowRight
} from 'lucide-react'

interface Incident {
  id: string
  title: string
  description: string
  severity: 'sev1' | 'sev2' | 'sev3' | 'sev4'
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  startedAt: Date
  resolvedAt?: Date
  affectedServices: string[]
  commander: string
  timeline: TimelineEvent[]
  impactSummary?: string
}

interface TimelineEvent {
  id: string
  timestamp: Date
  type: 'status_change' | 'update' | 'action' | 'communication'
  author: string
  content: string
}

interface IncidentStats {
  mttr: number
  mtta: number
  totalIncidents: number
  unresolvedCount: number
}

export function IncidentManager() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [stats, setStats] = useState<IncidentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newUpdate, setNewUpdate] = useState('')

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setStats({
      mttr: 45,
      mtta: 8,
      totalIncidents: 23,
      unresolvedCount: 1
    })

    setIncidents([
      {
        id: 'inc_001',
        title: 'Meta API Degraded Performance',
        description: 'Meta Marketing API responding with increased latency',
        severity: 'sev2',
        status: 'monitoring',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        affectedServices: ['Meta Integration', 'Campaign Sync'],
        commander: 'DevOps Lead',
        timeline: [
          { id: 'tl_001', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'status_change', author: 'System', content: 'Incident created - Meta API latency > 5s' },
          { id: 'tl_002', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), type: 'update', author: 'DevOps Lead', content: 'Investigating root cause. Meta status page shows no issues.' },
          { id: 'tl_003', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), type: 'status_change', author: 'DevOps Lead', content: 'Status changed to Identified - Issue is on Meta side' },
          { id: 'tl_004', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'action', author: 'DevOps Lead', content: 'Implemented circuit breaker to reduce load' },
          { id: 'tl_005', timestamp: new Date(Date.now() - 15 * 60 * 1000), type: 'status_change', author: 'DevOps Lead', content: 'Status changed to Monitoring - Performance improving' }
        ]
      },
      {
        id: 'inc_002',
        title: 'Database Connection Pool Exhausted',
        description: 'PostgreSQL connection pool reached max capacity',
        severity: 'sev1',
        status: 'resolved',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        affectedServices: ['API Gateway', 'Campaign Service', 'Analytics'],
        commander: 'CEO',
        timeline: [
          { id: 'tl_010', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), type: 'status_change', author: 'System', content: 'SEV1 Incident created - DB connections at 100%' },
          { id: 'tl_011', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), type: 'action', author: 'CEO', content: 'Increased connection pool size from 100 to 200' },
          { id: 'tl_012', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), type: 'action', author: 'CEO', content: 'Identified slow query causing connection pile-up' },
          { id: 'tl_013', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), type: 'status_change', author: 'CEO', content: 'Incident resolved - Query optimized, connections stable' }
        ],
        impactSummary: '45 minutes downtime. 12 customer complaints received. Root cause: Unoptimized query in campaign report feature.'
      },
      {
        id: 'inc_003',
        title: 'SSL Certificate Expired',
        description: 'CDN SSL certificate expired causing 502 errors',
        severity: 'sev1',
        status: 'resolved',
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        affectedServices: ['CDN', 'Static Assets'],
        commander: 'CEO',
        timeline: [],
        impactSummary: '15 minutes downtime. Implemented automatic certificate renewal.'
      }
    ])

    setIsLoading(false)
  }

  const updateStatus = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { 
        ...inc, 
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? new Date() : inc.resolvedAt,
        timeline: [
          ...inc.timeline,
          {
            id: `tl_${Date.now()}`,
            timestamp: new Date(),
            type: 'status_change' as const,
            author: 'CEO',
            content: `Status changed to ${newStatus}`
          }
        ]
      } : inc
    ))
  }

  const addUpdate = (incidentId: string) => {
    if (!newUpdate.trim()) return
    
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? {
        ...inc,
        timeline: [
          ...inc.timeline,
          {
            id: `tl_${Date.now()}`,
            timestamp: new Date(),
            type: 'update' as const,
            author: 'CEO',
            content: newUpdate
          }
        ]
      } : inc
    ))
    setNewUpdate('')
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'sev1': return 'bg-red-600/20 text-red-300 border-red-500'
      case 'sev2': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'sev3': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'sev4': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'investigating': return 'bg-red-500/20 text-red-400'
      case 'identified': return 'bg-yellow-500/20 text-yellow-400'
      case 'monitoring': return 'bg-blue-500/20 text-blue-400'
      case 'resolved': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <ArrowRight className="w-4 h-4 text-blue-400" />
      case 'update': return <MessageSquare className="w-4 h-4 text-cyan-400" />
      case 'action': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'communication': return <Users className="w-4 h-4 text-purple-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const activeIncidents = incidents.filter(i => i.status !== 'resolved')

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Incident Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          Incident Manager
          {activeIncidents.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">
              {activeIncidents.length} Active
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          <NeuromorphicButton variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Declare Incident
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{stats.mttr}m</p>
          <p className="text-xs text-slate-400">MTTR (Mean Time to Resolve)</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">{stats.mtta}m</p>
          <p className="text-xs text-slate-400">MTTA (Mean Time to Ack)</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">{stats.totalIncidents}</p>
          <p className="text-xs text-slate-400">Total Incidents (30d)</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <AlertOctagon className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">{stats.unresolvedCount}</p>
          <p className="text-xs text-slate-400">Active Now</p>
        </NeuromorphicCard>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-2 gap-4">
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3">Incidentes</h4>
          <div className="space-y-2">
            {incidents.map(incident => (
              <div 
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  selectedIncident?.id === incident.id ? 'border-red-500/50 bg-slate-800' : 'border-transparent bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase ${getSeverityStyle(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusStyle(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {incident.startedAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white text-sm">{incident.title}</p>
                <p className="text-xs text-slate-500 mt-1">Commander: {incident.commander}</p>
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Incident Details */}
        <NeuromorphicCard variant="embossed" className="p-4">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{selectedIncident.title}</h4>
                <div className="flex gap-1">
                  {selectedIncident.status !== 'resolved' && (
                    <>
                      {selectedIncident.status === 'investigating' && (
                        <NeuromorphicButton variant="secondary" size="sm" onClick={() => updateStatus(selectedIncident.id, 'identified')}>
                          Identified
                        </NeuromorphicButton>
                      )}
                      {selectedIncident.status === 'identified' && (
                        <NeuromorphicButton variant="secondary" size="sm" onClick={() => updateStatus(selectedIncident.id, 'monitoring')}>
                          Monitoring
                        </NeuromorphicButton>
                      )}
                      <NeuromorphicButton variant="primary" size="sm" onClick={() => updateStatus(selectedIncident.id, 'resolved')}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </NeuromorphicButton>
                    </>
                  )}
                </div>
              </div>

              <p className="text-slate-400 text-sm">{selectedIncident.description}</p>

              <div className="text-xs text-slate-500">
                <span>Affected: </span>
                {selectedIncident.affectedServices.map(s => (
                  <span key={s} className="text-cyan-400 mr-2">{s}</span>
                ))}
              </div>

              {/* Timeline */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h5 className="text-sm text-slate-400">Timeline</h5>
                {selectedIncident.timeline.map(event => (
                  <div key={event.id} className="flex items-start gap-2 p-2 bg-slate-800/50 rounded">
                    {getTimelineIcon(event.type)}
                    <div className="flex-1">
                      <p className="text-white text-xs">{event.content}</p>
                      <p className="text-slate-500 text-xs">{event.author} • {event.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Update */}
              {selectedIncident.status !== 'resolved' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                  />
                  <NeuromorphicButton variant="secondary" size="sm" onClick={() => addUpdate(selectedIncident.id)}>
                    Add
                  </NeuromorphicButton>
                </div>
              )}

              {/* Postmortem */}
              {selectedIncident.impactSummary && (
                <div className="p-3 bg-slate-800/30 rounded">
                  <h5 className="text-sm text-slate-400 mb-1">Impact Summary</h5>
                  <p className="text-white text-xs">{selectedIncident.impactSummary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Select an incident to view details
            </div>
          )}
        </NeuromorphicCard>
      </div>
    </div>
  )
}

export default IncidentManager
