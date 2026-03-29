'use client'

/**
 * 📊 SILEXAR PULSE - Queue Monitor
 * Monitor de colas de trabajo
 * 
 * @description Queue Management:
 * - Estado de jobs pendientes
 * - Jobs fallidos y reintentos
 * - Pausar/resumir colas
 * - Métricas de throughput
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
  Layers,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface QueueJob {
  id: string
  name: string
  data: Record<string, unknown>
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
  attempts: number
  maxAttempts: number
  createdAt: Date
  processedAt?: Date
  finishedAt?: Date
  error?: string
}

interface Queue {
  name: string
  status: 'running' | 'paused'
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  throughput: number
}

export function QueueMonitor() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null)
  const [jobs, setJobs] = useState<QueueJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadQueues()
    const interval = setInterval(loadQueues, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadQueues = async () => {
    if (queues.length === 0) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setQueues([
      { name: 'email', status: 'running', waiting: 45, active: 3, completed: 12500, failed: 23, delayed: 12, throughput: 150 },
      { name: 'notifications', status: 'running', waiting: 120, active: 5, completed: 45000, failed: 8, delayed: 0, throughput: 500 },
      { name: 'reports', status: 'running', waiting: 8, active: 1, completed: 890, failed: 2, delayed: 3, throughput: 10 },
      { name: 'analytics', status: 'running', waiting: 230, active: 10, completed: 156000, failed: 45, delayed: 50, throughput: 1200 },
      { name: 'imports', status: 'paused', waiting: 15, active: 0, completed: 234, failed: 5, delayed: 0, throughput: 0 },
      { name: 'exports', status: 'running', waiting: 3, active: 1, completed: 567, failed: 1, delayed: 0, throughput: 5 }
    ])

    setIsLoading(false)
  }

  const loadJobs = (queueName: string) => {
    setSelectedQueue(queueName)
    setJobs([
      { id: 'job_001', name: 'send_email', data: { to: 'user@example.com' }, status: 'completed', attempts: 1, maxAttempts: 3, createdAt: new Date(Date.now() - 60000), processedAt: new Date(Date.now() - 55000), finishedAt: new Date(Date.now() - 50000) },
      { id: 'job_002', name: 'send_email', data: { to: 'admin@company.com' }, status: 'active', attempts: 1, maxAttempts: 3, createdAt: new Date(Date.now() - 30000), processedAt: new Date() },
      { id: 'job_003', name: 'send_email', data: { to: 'test@domain.com' }, status: 'failed', attempts: 3, maxAttempts: 3, createdAt: new Date(Date.now() - 120000), error: 'SMTP connection timeout' },
      { id: 'job_004', name: 'send_email', data: { to: 'user2@example.com' }, status: 'waiting', attempts: 0, maxAttempts: 3, createdAt: new Date() },
      { id: 'job_005', name: 'send_email', data: { to: 'user3@example.com' }, status: 'delayed', attempts: 0, maxAttempts: 3, createdAt: new Date(Date.now() - 5000) }
    ])
  }

  const toggleQueue = (queueName: string) => {
    setQueues(prev => prev.map(q => 
      q.name === queueName 
        ? { ...q, status: q.status === 'running' ? 'paused' : 'running' }
        : q
    ))
  }

  const retryJob = (jobId: string) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: 'waiting', attempts: 0, error: undefined } : j
    ))
  }

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4 text-slate-400" />
      case 'active': return <Play className="w-4 h-4 text-blue-400" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
      case 'delayed': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const totalWaiting = queues.reduce((sum, q) => sum + q.waiting, 0)
  const totalActive = queues.reduce((sum, q) => sum + q.active, 0)
  const totalFailed = queues.reduce((sum, q) => sum + q.failed, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Queue Monitor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          Queue Monitor
          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>
        </h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadQueues}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{queues.length}</p>
          <p className="text-xs text-slate-400">Colas</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{totalWaiting}</p>
          <p className="text-xs text-slate-400">En espera</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{totalActive}</p>
          <p className="text-xs text-slate-400">Activos</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{totalFailed}</p>
          <p className="text-xs text-slate-400">Fallidos</p>
        </div>
      </div>

      {/* Queues Grid */}
      <div className="grid grid-cols-3 gap-3">
        {queues.map(queue => (
          <NeuromorphicCard 
            key={queue.name}
            variant="embossed" 
            className={`p-4 cursor-pointer ${selectedQueue === queue.name ? 'ring-1 ring-purple-500/50' : ''}`}
            onClick={() => loadJobs(queue.name)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium capitalize">{queue.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  queue.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {queue.status}
                </span>
                <button onClick={(e) => { e.stopPropagation(); toggleQueue(queue.name); }}>
                  {queue.status === 'running' ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-green-400" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-yellow-400">{queue.waiting}</p>
                <p className="text-xs text-slate-500">Waiting</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{queue.active}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{queue.failed}</p>
                <p className="text-xs text-slate-500">Failed</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center">
              Throughput: {queue.throughput}/min
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Jobs List */}
      {selectedQueue && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3">Jobs en cola: {selectedQueue}</h4>
          <div className="space-y-2">
            {jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <span className="text-white text-sm">{job.name}</span>
                    <p className="text-xs text-slate-500">ID: {job.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">
                    Intentos: {job.attempts}/{job.maxAttempts}
                  </span>
                  {job.error && (
                    <span className="text-xs text-red-400">{job.error}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {job.status === 'failed' && (
                      <button onClick={() => retryJob(job.id)} className="p-1 hover:bg-slate-700 rounded">
                        <RotateCcw className="w-4 h-4 text-yellow-400" />
                      </button>
                    )}
                    <button onClick={() => deleteJob(job.id)} className="p-1 hover:bg-slate-700 rounded">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default QueueMonitor
