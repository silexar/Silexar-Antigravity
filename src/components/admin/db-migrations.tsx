'use client'

/**
 * 🗃️ SILEXAR PULSE - Database Migrations Manager
 * Gestión de migraciones de base de datos
 * 
 * @description DB Migrations:
 * - Estado de migraciones
 * - Ejecutar/revertir
 * - Historial completo
 * - Rollback seguro
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
  Database,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  RefreshCw
} from 'lucide-react'

interface Migration {
  id: string
  name: string
  version: string
  description: string
  status: 'pending' | 'applied' | 'failed'
  appliedAt?: Date
  executionTime?: number
  batch: number
}

export function DbMigrations() {
  const [migrations, setMigrations] = useState<Migration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    loadMigrations()
  }, [])

  const loadMigrations = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setMigrations([
      { id: 'mig_001', name: '2024_01_01_create_users_table', version: '1.0.0', description: 'Crear tabla de usuarios', status: 'applied', appliedAt: new Date('2024-01-01'), executionTime: 120, batch: 1 },
      { id: 'mig_002', name: '2024_01_02_create_campaigns_table', version: '1.0.1', description: 'Crear tabla de campañas', status: 'applied', appliedAt: new Date('2024-01-02'), executionTime: 85, batch: 1 },
      { id: 'mig_003', name: '2024_02_15_add_tenant_id_to_users', version: '1.1.0', description: 'Agregar tenant_id a usuarios', status: 'applied', appliedAt: new Date('2024-02-15'), executionTime: 340, batch: 2 },
      { id: 'mig_004', name: '2024_03_01_create_analytics_table', version: '1.2.0', description: 'Crear tabla de analytics', status: 'applied', appliedAt: new Date('2024-03-01'), executionTime: 150, batch: 3 },
      { id: 'mig_005', name: '2024_06_10_add_indexes_campaigns', version: '1.3.0', description: 'Agregar índices a campañas', status: 'applied', appliedAt: new Date('2024-06-10'), executionTime: 890, batch: 4 },
      { id: 'mig_006', name: '2024_12_01_create_audit_log', version: '2.0.0', description: 'Crear tabla de audit log', status: 'applied', appliedAt: new Date('2024-12-01'), executionTime: 200, batch: 5 },
      { id: 'mig_007', name: '2024_12_15_add_2fa_columns', version: '2.1.0', description: 'Agregar columnas para 2FA', status: 'pending', batch: 6 },
      { id: 'mig_008', name: '2024_12_16_create_webhooks_table', version: '2.1.1', description: 'Crear tabla de webhooks', status: 'pending', batch: 6 }
    ])

    setIsLoading(false)
  }

  const runMigration = async (id: string) => {
    setIsRunning(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setMigrations(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'applied', appliedAt: new Date(), executionTime: Math.floor(Math.random() * 500) + 100 } : m
    ))
    setIsRunning(false)
  }

  const rollback = async (batch: number) => {
    if (!confirm(`¿Revertir batch ${batch}? Esto revertirá todas las migraciones de ese batch.`)) return
    
    setIsRunning(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setMigrations(prev => prev.map(m => 
      m.batch === batch && m.status === 'applied' ? { ...m, status: 'pending', appliedAt: undefined, executionTime: undefined } : m
    ))
    setIsRunning(false)
  }

  const runAllPending = async () => {
    setIsRunning(true)
    const pending = migrations.filter(m => m.status === 'pending')
    
    for (const mig of pending) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMigrations(prev => prev.map(m => 
        m.id === mig.id ? { ...m, status: 'applied', appliedAt: new Date(), executionTime: Math.floor(Math.random() * 500) + 100 } : m
      ))
    }
    
    setIsRunning(false)
  }

  const appliedCount = migrations.filter(m => m.status === 'applied').length
  const pendingCount = migrations.filter(m => m.status === 'pending').length
  const latestBatch = Math.max(...migrations.filter(m => m.status === 'applied').map(m => m.batch), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Migrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Database Migrations
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadMigrations}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          {pendingCount > 0 && (
            <NeuromorphicButton variant="primary" size="sm" onClick={runAllPending} disabled={isRunning}>
              <Play className="w-4 h-4 mr-1" />
              {isRunning ? 'Ejecutando...' : `Run ${pendingCount} Pending`}
            </NeuromorphicButton>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{migrations.length}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{appliedCount}</p>
          <p className="text-xs text-slate-400">Aplicadas</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">{latestBatch}</p>
          <p className="text-xs text-slate-400">Último Batch</p>
        </div>
      </div>

      {/* Warning if pending */}
      {pendingCount > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <div>
            <span className="text-yellow-400 font-medium">Hay {pendingCount} migraciones pendientes</span>
            <p className="text-sm text-slate-400">Ejecuta las migraciones para mantener la base de datos actualizada</p>
          </div>
        </div>
      )}

      {/* Migrations List */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <div className="space-y-2">
          {migrations.map(migration => (
            <div 
              key={migration.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                migration.status === 'applied' ? 'bg-green-500/5 border border-green-500/20' :
                migration.status === 'pending' ? 'bg-yellow-500/5 border border-yellow-500/20' :
                'bg-red-500/5 border border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {migration.status === 'applied' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {migration.status === 'pending' && <Clock className="w-5 h-5 text-yellow-400" />}
                {migration.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-white text-sm font-mono">{migration.name}</code>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">v{migration.version}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">Batch {migration.batch}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{migration.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {migration.appliedAt && (
                  <span className="text-xs text-slate-400">
                    {migration.appliedAt.toLocaleDateString()} • {migration.executionTime}ms
                  </span>
                )}
                
                {migration.status === 'pending' && (
                  <NeuromorphicButton variant="secondary" size="sm" onClick={() => runMigration(migration.id)} disabled={isRunning}>
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Migrate
                  </NeuromorphicButton>
                )}
                
                {migration.status === 'applied' && migration.batch === latestBatch && (
                  <button 
                    onClick={() => rollback(migration.batch)}
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                    disabled={isRunning}
                  >
                    <ArrowDown className="w-3 h-3" />
                    Rollback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default DbMigrations
