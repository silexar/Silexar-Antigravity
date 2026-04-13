'use client'

/**
 * 📜 SILEXAR PULSE - Audit Log Viewer
 * Visor de logs de auditoría enterprise
 * 
 * @description Audit Viewer Features:
 * - Filtros avanzados por usuario, acción, fecha
 * - Export de logs
 * - Búsqueda en tiempo real
 * - Timeline visual
 * - Detalles expandibles
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Activity, Search, Filter, Download, RefreshCw, Calendar,
  User, Shield, CheckCircle, AlertTriangle, XCircle, Clock,
  ChevronDown, ChevronUp, Eye, Globe, Monitor, Key
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  result: 'success' | 'warning' | 'error'
  ipAddress: string
  userAgent: string
  location?: string
  details?: Record<string, unknown>
  timestamp: Date
}

interface AuditLogFilters {
  search: string
  userId: string
  action: string
  result: string
  startDate: string
  endDate: string
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [filters, setFilters] = useState<AuditLogFilters>({
    search: '',
    userId: '',
    action: '',
    result: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const now = new Date()
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'log_001', userId: 'user_001', userName: 'María González', userEmail: 'maria@empresa.com',
        action: 'LOGIN', resource: 'auth', result: 'success',
        ipAddress: '192.168.1.100', userAgent: 'Chrome/120 Windows',
        location: 'Santiago, Chile', timestamp: new Date(now.getTime() - 5 * 60 * 1000)
      },
      {
        id: 'log_002', userId: 'user_001', userName: 'María González', userEmail: 'maria@empresa.com',
        action: 'CREATE_USER', resource: 'users', resourceId: 'user_005', result: 'success',
        ipAddress: '192.168.1.100', userAgent: 'Chrome/120 Windows',
        details: { newUserEmail: 'nuevo@empresa.com', category: 'vendedor' },
        timestamp: new Date(now.getTime() - 15 * 60 * 1000)
      },
      {
        id: 'log_003', userId: 'user_002', userName: 'Carlos Rodríguez', userEmail: 'carlos@empresa.com',
        action: 'UPDATE_PERMISSIONS', resource: 'users', resourceId: 'user_003', result: 'success',
        ipAddress: '192.168.1.105', userAgent: 'Firefox/121 MacOS',
        details: { addedPermissions: ['crm_export'], removedPermissions: [] },
        timestamp: new Date(now.getTime() - 30 * 60 * 1000)
      },
      {
        id: 'log_004', userId: 'user_003', userName: 'Ana Silva', userEmail: 'ana@empresa.com',
        action: 'LOGIN_FAILED', resource: 'auth', result: 'error',
        ipAddress: '10.0.0.50', userAgent: 'Safari/17 iOS',
        details: { reason: 'invalid_password', attempts: 3 },
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'log_005', userId: 'user_001', userName: 'María González', userEmail: 'maria@empresa.com',
        action: 'EXPORT_DATA', resource: 'reports', result: 'success',
        ipAddress: '192.168.1.100', userAgent: 'Chrome/120 Windows',
        details: { format: 'csv', rows: 1500 },
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'log_006', userId: 'user_002', userName: 'Carlos Rodríguez', userEmail: 'carlos@empresa.com',
        action: 'IMPERSONATION_START', resource: 'security', resourceId: 'user_003', result: 'warning',
        ipAddress: '192.168.1.105', userAgent: 'Firefox/121 MacOS',
        details: { reason: 'Verificar reporte de bug', targetUser: 'ana@empresa.com' },
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000)
      },
      {
        id: 'log_007', userId: 'user_001', userName: 'María González', userEmail: 'maria@empresa.com',
        action: 'CHANGE_PASSWORD', resource: 'security', result: 'success',
        ipAddress: '192.168.1.100', userAgent: 'Chrome/120 Windows',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'log_008', userId: 'unknown', userName: 'Desconocido', userEmail: 'attacker@hacker.com',
        action: 'LOGIN_BLOCKED', resource: 'security', result: 'error',
        ipAddress: '203.0.113.50', userAgent: 'curl/7.68.0',
        details: { reason: 'ip_blocked', attempts: 10 },
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ]

    setLogs(mockLogs)
    setIsLoading(false)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <Key className="w-4 h-4" />
    if (action.includes('USER')) return <User className="w-4 h-4" />
    if (action.includes('PERMISSION')) return <Shield className="w-4 h-4" />
    if (action.includes('EXPORT')) return <Download className="w-4 h-4" />
    if (action.includes('IMPERSONATION')) return <Eye className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getResultBadge = (result: AuditLogEntry['result']) => {
    switch (result) {
      case 'success':
        return <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded"><CheckCircle className="w-3 h-3" />Éxito</span>
      case 'warning':
        return <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded"><AlertTriangle className="w-3 h-3" />Aviso</span>
      case 'error':
        return <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded"><XCircle className="w-3 h-3" />Error</span>
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filters.search && !JSON.stringify(log).toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.userId && log.userId !== filters.userId) return false
    if (filters.action && !log.action.includes(filters.action)) return false
    if (filters.result && log.result !== filters.result) return false
    return true
  })

  const uniqueActions = [...new Set(logs.map(l => l.action))]
  const uniqueUsers = [...new Map(logs.map(l => [l.userId, { id: l.userId, name: l.userName }])).values()]

  const exportLogs = () => {
    const csv = [
      ['ID', 'Usuario', 'Email', 'Acción', 'Recurso', 'Resultado', 'IP', 'Fecha'].join(','),
      ...filteredLogs.map(l => [
        l.id, l.userName, l.userEmail, l.action, l.resource, l.result, l.ipAddress, l.timestamp.toISOString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Logs de Auditoría
          </h2>
          <p className="text-slate-400 text-sm">{filteredLogs.length} registros encontrados</p>
        </div>
        <div className="flex gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-1" />
            Filtros
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadLogs} aria-label="Actualizar">
            <RefreshCw className="w-4 h-4" />
          </NeuromorphicButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar en logs..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-purple-500/50 focus:outline-none"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-slate-400 text-xs block mb-1">Usuario</label>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0EDE8] border border-slate-700 rounded-lg text-white"
              >
                <option value="">Todos</option>
                {uniqueUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0EDE8] border border-slate-700 rounded-lg text-white"
              >
                <option value="">Todas</option>
                {uniqueActions.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Resultado</label>
              <select
                value={filters.result}
                onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                className="w-full px-3 py-2 bg-[#F0EDE8] border border-slate-700 rounded-lg text-white"
              >
                <option value="">Todos</option>
                <option value="success">Éxito</option>
                <option value="warning">Aviso</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ search: '', userId: '', action: '', result: '', startDate: '', endDate: '' })}
                className="text-slate-400 hover:text-white text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </NeuromorphicCard>
      )}

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.map(log => (
          <NeuromorphicCard 
            key={log.id} 
            variant="embossed" 
            className={`p-4 cursor-pointer transition-all ${expandedLog === log.id ? 'ring-1 ring-purple-500/50' : ''}`}
            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  log.result === 'success' ? 'bg-green-500/20 text-green-400' :
                  log.result === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {getActionIcon(log.action)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{log.action.replace(/_/g, ' ')}</span>
                    {getResultBadge(log.result)}
                  </div>
                  <p className="text-slate-500 text-sm">
                    {log.userName} ({log.userEmail}) • {log.resource}
                    {log.resourceId && ` → ${log.resourceId}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-slate-400">{log.timestamp.toLocaleTimeString()}</p>
                  <p className="text-slate-600 text-xs">{log.timestamp.toLocaleDateString()}</p>
                </div>
                {expandedLog === log.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedLog === log.id && (
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">IP Address</p>
                  <p className="text-white flex items-center gap-1"><Globe className="w-3 h-3" />{log.ipAddress}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">User Agent</p>
                  <p className="text-white flex items-center gap-1"><Monitor className="w-3 h-3" />{log.userAgent}</p>
                </div>
                {log.location && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Ubicación</p>
                    <p className="text-white">{log.location}</p>
                  </div>
                )}
                {log.details && (
                  <div className="col-span-3">
                    <p className="text-slate-500 text-xs mb-1">Detalles</p>
                    <pre className="text-xs bg-[#F0EDE8] p-2 rounded overflow-x-auto text-slate-300">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default AuditLogViewer
