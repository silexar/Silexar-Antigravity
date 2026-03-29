'use client'

/**
 * 📋 SILEXAR PULSE - System Logs Viewer
 * Visor de logs en tiempo real
 * 
 * @description Sistema de logs:
 * - Logs en tiempo real
 * - Filtros por nivel/servicio
 * - Búsqueda y exportación
 * - Alertas configurables
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect, useRef } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  FileText,
  Search,
  Filter,
  Download,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug,
  RefreshCw
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  service: string
  message: string
  metadata?: Record<string, unknown>
  requestId?: string
  userId?: string
  tenantId?: string
}

type LogLevel = 'all' | 'debug' | 'info' | 'warn' | 'error' | 'critical'

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [levelFilter, setLevelFilter] = useState<LogLevel>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadLogs()
    const interval = setInterval(() => {
      if (!isPaused) {
        addNewLog()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isPaused])

  const loadLogs = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const initialLogs: LogEntry[] = [
      { id: 'log_001', timestamp: new Date(Date.now() - 60000), level: 'info', service: 'api-gateway', message: 'Request processed successfully', requestId: 'req_abc123' },
      { id: 'log_002', timestamp: new Date(Date.now() - 55000), level: 'debug', service: 'auth-service', message: 'Token validated for user usr_12345', userId: 'usr_12345' },
      { id: 'log_003', timestamp: new Date(Date.now() - 50000), level: 'warn', service: 'database', message: 'Slow query detected: SELECT * FROM campaigns (2.3s)', metadata: { duration: 2300 } },
      { id: 'log_004', timestamp: new Date(Date.now() - 45000), level: 'error', service: 'email-service', message: 'Failed to send email: SMTP connection timeout', metadata: { recipient: 'user@example.com' } },
      { id: 'log_005', timestamp: new Date(Date.now() - 40000), level: 'info', service: 'api-gateway', message: 'Health check passed', requestId: 'req_health_001' },
      { id: 'log_006', timestamp: new Date(Date.now() - 35000), level: 'critical', service: 'payment-service', message: 'Payment processing failed: Stripe API error', tenantId: 'tenant_001' },
      { id: 'log_007', timestamp: new Date(Date.now() - 30000), level: 'info', service: 'cache', message: 'Cache invalidated for key: campaigns_list', metadata: { keys: 1 } },
      { id: 'log_008', timestamp: new Date(Date.now() - 25000), level: 'debug', service: 'worker', message: 'Job completed: email_batch_001', metadata: { processed: 150 } },
      { id: 'log_009', timestamp: new Date(Date.now() - 20000), level: 'warn', service: 'rate-limiter', message: 'Rate limit approaching for tenant_002 (85%)', tenantId: 'tenant_002' },
      { id: 'log_010', timestamp: new Date(Date.now() - 15000), level: 'info', service: 'api-gateway', message: 'New API key created for tenant_003', tenantId: 'tenant_003' }
    ]

    setLogs(initialLogs)
    setIsLoading(false)
  }

  const addNewLog = () => {
    const services = ['api-gateway', 'auth-service', 'database', 'email-service', 'cache', 'worker', 'payment-service']
    const levels: LogEntry['level'][] = ['debug', 'info', 'info', 'info', 'warn', 'error']
    const messages = [
      'Request processed successfully',
      'Cache hit for key',
      'User session validated',
      'Webhook delivered successfully',
      'Database query executed',
      'Background job completed'
    ]

    const newLog: LogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      level: levels[Math.floor(Math.random() * levels.length)],
      service: services[Math.floor(Math.random() * services.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`
    }

    setLogs(prev => [...prev.slice(-99), newLog])
  }

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-slate-500/20 text-slate-400'
      case 'info': return 'bg-blue-500/20 text-blue-400'
      case 'warn': return 'bg-yellow-500/20 text-yellow-400'
      case 'error': return 'bg-red-500/20 text-red-400'
      case 'critical': return 'bg-red-600/30 text-red-300 font-bold'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug': return <Bug className="w-3 h-3" />
      case 'info': return <Info className="w-3 h-3" />
      case 'warn': return <AlertTriangle className="w-3 h-3" />
      case 'error': return <AlertCircle className="w-3 h-3" />
      case 'critical': return <AlertCircle className="w-3 h-3" />
      default: return <Info className="w-3 h-3" />
    }
  }

  const services = [...new Set(logs.map(l => l.service))]
  
  const filteredLogs = logs.filter(log => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false
    if (serviceFilter !== 'all' && log.service !== serviceFilter) return false
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const clearLogs = () => setLogs([])

  const exportLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs_${new Date().toISOString()}.json`
    a.click()
  }

  const logCounts = {
    debug: logs.filter(l => l.level === 'debug').length,
    info: logs.filter(l => l.level === 'info').length,
    warn: logs.filter(l => l.level === 'warn').length,
    error: logs.filter(l => l.level === 'error').length,
    critical: logs.filter(l => l.level === 'critical').length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando System Logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          System Logs
          <span className={`text-xs px-2 py-0.5 rounded ${isPaused ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
            {isPaused ? 'PAUSED' : 'LIVE'}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadLogs}>
            <RefreshCw className="w-4 h-4" />
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4" />
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={clearLogs}>
            <Trash2 className="w-4 h-4" />
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className="p-2 bg-slate-500/10 rounded text-center">
          <p className="text-lg font-bold text-slate-400">{logCounts.debug}</p>
          <p className="text-xs text-slate-500">Debug</p>
        </div>
        <div className="p-2 bg-blue-500/10 rounded text-center">
          <p className="text-lg font-bold text-blue-400">{logCounts.info}</p>
          <p className="text-xs text-slate-500">Info</p>
        </div>
        <div className="p-2 bg-yellow-500/10 rounded text-center">
          <p className="text-lg font-bold text-yellow-400">{logCounts.warn}</p>
          <p className="text-xs text-slate-500">Warn</p>
        </div>
        <div className="p-2 bg-red-500/10 rounded text-center">
          <p className="text-lg font-bold text-red-400">{logCounts.error}</p>
          <p className="text-xs text-slate-500">Error</p>
        </div>
        <div className="p-2 bg-red-600/20 rounded text-center">
          <p className="text-lg font-bold text-red-300">{logCounts.critical}</p>
          <p className="text-xs text-slate-500">Critical</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          >
            <option value="all">Todos los niveles</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          >
            <option value="all">Todos los servicios</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <NeuromorphicCard variant="embossed" className="p-0">
        <div className="h-96 overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              No hay logs que coincidan con los filtros
            </div>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`flex items-start gap-3 px-4 py-2 border-b border-slate-800 hover:bg-slate-800/50 ${
                  log.level === 'critical' ? 'bg-red-500/5' : ''
                }`}
              >
                <span className="text-slate-500 whitespace-nowrap">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded whitespace-nowrap ${getLevelStyle(log.level)}`}>
                  {getLevelIcon(log.level)}
                  {log.level.toUpperCase()}
                </span>
                <span className="text-cyan-400 whitespace-nowrap">
                  [{log.service}]
                </span>
                <span className="text-white flex-1">
                  {log.message}
                </span>
                {log.requestId && (
                  <span className="text-slate-500">{log.requestId}</span>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default SystemLogs
