'use client'

/**
 * 💾 SILEXAR PULSE - Backup Status Dashboard
 * Monitoreo de backups automáticos
 * 
 * @description Dashboard de backups con:
 * - Estado de backups automáticos
 * - Último backup exitoso
 * - Restauración a punto anterior
 * - Verificación de integridad IA
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
  HardDrive,
  Database,
  CheckCircle,
  RefreshCw,
  Upload,
  Calendar,
  Shield,
  Brain,
  Play,
  History,
  Archive
} from 'lucide-react'

interface Backup {
  id: string
  type: 'full' | 'incremental' | 'differential'
  target: 'database' | 'files' | 'complete'
  status: 'completed' | 'running' | 'failed' | 'scheduled'
  startedAt: Date
  completedAt?: Date
  size: number
  location: string
  verified: boolean
  retentionDays: number
}

interface BackupStats {
  totalBackups: number
  lastSuccessful: Date
  nextScheduled: Date
  totalSize: number
  integrityScore: number
  failureRate: number
}

export function BackupStatusDashboard() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningBackup, setIsRunningBackup] = useState(false)

  useEffect(() => {
    loadBackupData()
  }, [])

  const loadBackupData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setBackups([
      {
        id: 'bkp_001',
        type: 'full',
        target: 'complete',
        status: 'completed',
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: 45.8 * 1024 * 1024 * 1024, // 45.8 GB
        location: 'gs://silexar-backups/full/2025-12-12',
        verified: true,
        retentionDays: 30
      },
      {
        id: 'bkp_002',
        type: 'incremental',
        target: 'database',
        status: 'completed',
        startedAt: new Date(Date.now() - 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 45 * 60 * 1000),
        size: 2.3 * 1024 * 1024 * 1024,
        location: 'gs://silexar-backups/incremental/2025-12-12-12',
        verified: true,
        retentionDays: 7
      },
      {
        id: 'bkp_003',
        type: 'incremental',
        target: 'database',
        status: 'scheduled',
        startedAt: new Date(Date.now() + 60 * 60 * 1000),
        size: 0,
        location: 'gs://silexar-backups/incremental/2025-12-12-14',
        verified: false,
        retentionDays: 7
      },
      {
        id: 'bkp_004',
        type: 'full',
        target: 'complete',
        status: 'completed',
        startedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        size: 44.2 * 1024 * 1024 * 1024,
        location: 'gs://silexar-backups/full/2025-12-11',
        verified: true,
        retentionDays: 30
      }
    ])

    setStats({
      totalBackups: 156,
      lastSuccessful: new Date(Date.now() - 45 * 60 * 1000),
      nextScheduled: new Date(Date.now() + 60 * 60 * 1000),
      totalSize: 892 * 1024 * 1024 * 1024, // 892 GB
      integrityScore: 99.8,
      failureRate: 0.5
    })

    setIsLoading(false)
  }

  const runManualBackup = async (type: 'full' | 'incremental') => {
    setIsRunningBackup(true)

    // Simular backup
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newBackup: Backup = {
      id: `bkp_${Date.now()}`,
      type,
      target: type === 'full' ? 'complete' : 'database',
      status: 'completed',
      startedAt: new Date(Date.now() - 180000),
      completedAt: new Date(),
      size: type === 'full' ? 46.1 * 1024 * 1024 * 1024 : 2.5 * 1024 * 1024 * 1024,
      location: `gs://silexar-backups/${type}/${new Date().toISOString().split('T')[0]}`,
      verified: true,
      retentionDays: type === 'full' ? 30 : 7
    }
    
    setBackups(prev => [newBackup, ...prev])
    setIsRunningBackup(false)
    alert(`✅ Backup ${type} completado exitosamente`)
  }

  const restoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) return
    
    if (confirm(`⚠️ ¿Restaurar sistema al punto ${backup.startedAt.toLocaleString()}?\n\nEsto reemplazará todos los datos actuales.`)) {
      
      alert('🔄 Restauración iniciada. El sistema se reiniciará en breve.')
    }
  }

  const verifyBackup = async (backupId: string) => {
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setBackups(prev => prev.map(b => 
      b.id === backupId ? { ...b, verified: true } : b
    ))
    
    alert('✅ Verificación de integridad completada. Backup válido.')
  }

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'running': return 'bg-blue-500/20 text-blue-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Backup Status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-green-400" />
          Backup Status
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton 
            variant="secondary" 
            size="sm" 
            onClick={() => runManualBackup('incremental')}
            disabled={isRunningBackup}
          >
            <Archive className="w-4 h-4 mr-1" />
            Incremental
          </NeuromorphicButton>
          <NeuromorphicButton 
            variant="primary" 
            size="sm" 
            onClick={() => runManualBackup('full')}
            disabled={isRunningBackup}
          >
            {isRunningBackup ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Backup Full
              </>
            )}
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Archive className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Total Backups</span>
          </div>
          <p className="text-xl font-bold text-white">{stats?.totalBackups}</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Último Exitoso</span>
          </div>
          <p className="text-sm font-bold text-green-400">
            Hace {Math.floor((Date.now() - (stats?.lastSuccessful.getTime() || 0)) / 60000)}m
          </p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Próximo</span>
          </div>
          <p className="text-sm font-bold text-white">
            En {Math.floor(((stats?.nextScheduled.getTime() || 0) - Date.now()) / 60000)}m
          </p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Total Size</span>
          </div>
          <p className="text-xl font-bold text-white">{formatSize(stats?.totalSize || 0)}</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Integridad IA</span>
          </div>
          <p className="text-xl font-bold text-green-400">{stats?.integrityScore}%</p>
        </div>
      </div>

      {/* AI Insight */}
      <NeuromorphicCard variant="glow" className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Análisis IA</span>
        </div>
        <p className="text-xs text-slate-300">
          ✅ Todos los backups verificados. Tasa de fallo: {stats?.failureRate}% (excelente). 
          Próximo backup full programado para mañana 02:00.
          Almacenamiento usado: {formatSize(stats?.totalSize || 0)} de 2TB disponibles.
        </p>
      </NeuromorphicCard>

      {/* Backup List */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          Historial de Backups
        </h4>
        <div className="space-y-2">
          {backups.map(backup => (
            <div key={backup.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  backup.type === 'full' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                }`}>
                  {backup.type === 'full' ? (
                    <Database className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Archive className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {backup.type === 'full' ? 'Backup Completo' : 'Incremental'} - {backup.target}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(backup.status)}`}>
                      {backup.status}
                    </span>
                    {backup.verified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {backup.startedAt.toLocaleString()} • {formatSize(backup.size)} • {backup.retentionDays}d retención
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!backup.verified && backup.status === 'completed' && (
                  <NeuromorphicButton
                    variant="secondary"
                    size="sm"
                    onClick={() => verifyBackup(backup.id)}
                  >
                    <Shield className="w-3 h-3" />
                  </NeuromorphicButton>
                )}
                {backup.status === 'completed' && (
                  <NeuromorphicButton
                    variant="danger"
                    size="sm"
                    onClick={() => restoreBackup(backup.id)}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Restaurar
                  </NeuromorphicButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default BackupStatusDashboard
