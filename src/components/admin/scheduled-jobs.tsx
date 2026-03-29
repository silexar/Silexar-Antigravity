'use client'

/**
 * ⏰ SILEXAR PULSE - Scheduled Jobs Monitor
 * Monitor de tareas programadas
 * 
 * @description Scheduled Jobs:
 * - Cron jobs activos
 * - Historial de ejecuciones
 * - Ejecutar manualmente
 * - Pausar/activar jobs
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
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  History
} from 'lucide-react'

interface ScheduledJob {
  id: string
  name: string
  description: string
  schedule: string
  status: 'active' | 'paused' | 'running'
  lastRun?: Date
  lastStatus?: 'success' | 'failed' | 'skipped'
  lastDuration?: number
  nextRun?: Date
  successRate: number
  totalRuns: number
}

interface JobExecution {
  id: string
  jobId: string
  startedAt: Date
  finishedAt?: Date
  status: 'running' | 'success' | 'failed'
  duration?: number
  output?: string
  error?: string
}

export function ScheduledJobs() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [executions, setExecutions] = useState<JobExecution[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadJobs()
    const interval = setInterval(loadJobs, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadJobs = async () => {
    if (jobs.length === 0) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setJobs([
      { id: 'job_001', name: 'daily-backup', description: 'Backup diario de base de datos', schedule: '0 2 * * *', status: 'active', lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), lastStatus: 'success', lastDuration: 45000, nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000), successRate: 99.5, totalRuns: 365 },
      { id: 'job_002', name: 'email-digest', description: 'Envío de resumen diario', schedule: '0 8 * * *', status: 'active', lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), lastStatus: 'success', lastDuration: 120000, nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000), successRate: 98.2, totalRuns: 730 },
      { id: 'job_003', name: 'analytics-aggregate', description: 'Agregación de analytics', schedule: '*/15 * * * *', status: 'running', lastRun: new Date(Date.now() - 5 * 60 * 1000), lastDuration: 8000, successRate: 99.9, totalRuns: 5840 },
      { id: 'job_004', name: 'cleanup-temp', description: 'Limpieza de archivos temporales', schedule: '0 3 * * 0', status: 'active', lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), lastStatus: 'success', lastDuration: 30000, nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), successRate: 100, totalRuns: 52 },
      { id: 'job_005', name: 'report-generator', description: 'Generación de reportes mensuales', schedule: '0 6 1 * *', status: 'active', lastRun: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), lastStatus: 'success', lastDuration: 300000, nextRun: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), successRate: 95, totalRuns: 24 },
      { id: 'job_006', name: 'cache-warmup', description: 'Precalentamiento de caché', schedule: '0 */6 * * *', status: 'paused', lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), lastStatus: 'failed', lastDuration: 15000, successRate: 85, totalRuns: 120 },
      { id: 'job_007', name: 'ssl-check', description: 'Verificación de certificados SSL', schedule: '0 0 * * *', status: 'active', lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000), lastStatus: 'success', lastDuration: 5000, nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000), successRate: 100, totalRuns: 365 }
    ])

    setIsLoading(false)
  }

  const loadExecutions = (jobId: string) => {
    setSelectedJob(jobId)
    setExecutions([
      { id: 'exec_001', jobId, startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), finishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000), status: 'success', duration: 45000, output: 'Backup completed successfully. 2.3GB transferred.' },
      { id: 'exec_002', jobId, startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), finishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000 + 43000), status: 'success', duration: 43000 },
      { id: 'exec_003', jobId, startedAt: new Date(Date.now() - 50 * 60 * 60 * 1000), finishedAt: new Date(Date.now() - 50 * 60 * 60 * 1000 + 60000), status: 'failed', duration: 60000, error: 'Connection timeout to backup server' },
      { id: 'exec_004', jobId, startedAt: new Date(Date.now() - 74 * 60 * 60 * 1000), finishedAt: new Date(Date.now() - 74 * 60 * 60 * 1000 + 42000), status: 'success', duration: 42000 }
    ])
  }

  const toggleJob = (jobId: string) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, status: j.status === 'active' ? 'paused' : 'active' }
        : j
    ))
  }

  const runNow = (jobId: string) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: 'running' } : j
    ))
    setTimeout(() => {
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'active', lastRun: new Date(), lastStatus: 'success' } : j
      ))
    }, 3000)
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const activeJobs = jobs.filter(j => j.status === 'active').length
  const runningJobs = jobs.filter(j => j.status === 'running').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Scheduled Jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          Scheduled Jobs
        </h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadJobs}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{jobs.length}</p>
          <p className="text-xs text-slate-400">Total Jobs</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{activeJobs}</p>
          <p className="text-xs text-slate-400">Activos</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{runningJobs}</p>
          <p className="text-xs text-slate-400">Ejecutando</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{jobs.filter(j => j.status === 'paused').length}</p>
          <p className="text-xs text-slate-400">Pausados</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map(job => (
          <NeuromorphicCard 
            key={job.id}
            variant="embossed" 
            className={`p-4 ${selectedJob === job.id ? 'ring-1 ring-orange-500/50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  job.status === 'running' ? 'bg-blue-400 animate-pulse' :
                  job.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <div>
                  <span className="text-white font-medium">{job.name}</span>
                  <p className="text-xs text-slate-500">{job.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded font-mono">
                  {job.schedule}
                </span>
                <button onClick={() => toggleJob(job.id)} className="p-1 hover:bg-slate-700 rounded">
                  {job.status === 'paused' ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
                </button>
                <NeuromorphicButton variant="secondary" size="sm" onClick={() => runNow(job.id)} disabled={job.status === 'running'}>
                  <Play className="w-3 h-3 mr-1" />
                  Run Now
                </NeuromorphicButton>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                {job.lastStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {job.lastStatus === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                {job.lastStatus === 'skipped' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                <span className="text-slate-400">
                  Última: {job.lastRun?.toLocaleString() || 'Nunca'}
                </span>
              </div>
              {job.lastDuration && (
                <span className="text-slate-500">Duración: {formatDuration(job.lastDuration)}</span>
              )}
              <span className={`${job.successRate >= 95 ? 'text-green-400' : job.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                Éxito: {job.successRate}%
              </span>
              {job.nextRun && (
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Próxima: {job.nextRun.toLocaleString()}
                </span>
              )}
              <button onClick={() => loadExecutions(job.id)} className="text-cyan-400 flex items-center gap-1 hover:underline">
                <History className="w-3 h-3" />
                Historial
              </button>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Execution History */}
      {selectedJob && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Historial de Ejecuciones
          </h4>
          <div className="space-y-2">
            {executions.map(exec => (
              <div key={exec.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {exec.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {exec.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                  {exec.status === 'running' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                  <span className="text-white text-sm">{exec.startedAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  {exec.duration && <span className="text-slate-400 text-sm">{formatDuration(exec.duration)}</span>}
                  {exec.error && <span className="text-red-400 text-xs">{exec.error}</span>}
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default ScheduledJobs
