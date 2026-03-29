'use client'

/**
 * 🔒 SILEXAR PULSE - Panel de Seguridad Avanzada
 * Control de seguridad militar con detección de anomalías
 * 
 * @description Panel de seguridad CEO con:
 * - Geobloqueo por país
 * - Device fingerprinting
 * - Detección de anomalías
 * - Control de sesiones
 * - Registro de actividad
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
  Globe,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  MapPin,
  Ban,
  Download
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login_success' | 'login_failed' | 'suspicious_activity' | 'device_new' | 'location_new' | 'session_hijack' | 'brute_force'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user?: string
  ip: string
  location: string
  device: string
  timestamp: Date
  details: string
  blocked: boolean
}

interface BlockedEntity {
  id: string
  type: 'ip' | 'country' | 'device'
  value: string
  reason: string
  blockedAt: Date
  blockedBy: string
}

interface ActiveSession {
  id: string
  userId: string
  userName: string
  ip: string
  location: string
  device: string
  browser: string
  startedAt: Date
  lastActivity: Date
  suspicious: boolean
}

interface GeoRule {
  country: string
  code: string
  status: 'allowed' | 'blocked' | 'monitoring'
  flag: string
}

export function SecurityPanel() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [blocked, setBlocked] = useState<BlockedEntity[]>([])
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [geoRules, setGeoRules] = useState<GeoRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [securityScore, setSecurityScore] = useState(0)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Security events
    setEvents([
      {
        id: 'ev_001',
        type: 'brute_force',
        severity: 'critical',
        ip: '192.168.1.100',
        location: 'Desconocido',
        device: 'Unknown',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        details: '15 intentos fallidos en 2 minutos',
        blocked: true
      },
      {
        id: 'ev_002',
        type: 'device_new',
        severity: 'medium',
        user: 'admin@rdfmedia.com',
        ip: '201.220.45.12',
        location: 'Santiago, Chile',
        device: 'iPhone 15 Pro',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        details: 'Nuevo dispositivo detectado para este usuario',
        blocked: false
      },
      {
        id: 'ev_003',
        type: 'location_new',
        severity: 'high',
        user: 'juan@grupoprisachile.com',
        ip: '85.123.45.67',
        location: 'Madrid, España',
        device: 'Windows 11',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        details: 'Login desde ubicación no habitual',
        blocked: false
      },
      {
        id: 'ev_004',
        type: 'login_success',
        severity: 'low',
        user: 'ceo@silexar.com',
        ip: '190.45.123.89',
        location: 'Santiago, Chile',
        device: 'MacBook Pro',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'Login exitoso con MFA',
        blocked: false
      }
    ])

    // Blocked entities
    setBlocked([
      {
        id: 'block_001',
        type: 'ip',
        value: '192.168.1.100',
        reason: 'Intento de fuerza bruta',
        blockedAt: new Date(Date.now() - 5 * 60 * 1000),
        blockedBy: 'Sistema Automático'
      },
      {
        id: 'block_002',
        type: 'country',
        value: 'Rusia',
        reason: 'Política de seguridad',
        blockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        blockedBy: 'CEO'
      }
    ])

    // Active sessions
    setSessions([
      {
        id: 'sess_001',
        userId: 'usr_ceo',
        userName: 'CEO Silexar',
        ip: '190.45.123.89',
        location: 'Santiago, Chile',
        device: 'MacBook Pro',
        browser: 'Chrome 120',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(),
        suspicious: false
      },
      {
        id: 'sess_002',
        userId: 'usr_002',
        userName: 'Juan Pérez',
        ip: '85.123.45.67',
        location: 'Madrid, España',
        device: 'Windows 11',
        browser: 'Firefox 119',
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 15 * 60 * 1000),
        suspicious: true
      },
      {
        id: 'sess_003',
        userId: 'usr_003',
        userName: 'María García',
        ip: '201.220.10.15',
        location: 'Concepción, Chile',
        device: 'iPhone 15',
        browser: 'Safari 17',
        startedAt: new Date(Date.now() - 45 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        suspicious: false
      }
    ])

    // Geo rules
    setGeoRules([
      { country: 'Chile', code: 'CL', status: 'allowed', flag: '🇨🇱' },
      { country: 'Argentina', code: 'AR', status: 'allowed', flag: '🇦🇷' },
      { country: 'España', code: 'ES', status: 'monitoring', flag: '🇪🇸' },
      { country: 'Estados Unidos', code: 'US', status: 'monitoring', flag: '🇺🇸' },
      { country: 'Rusia', code: 'RU', status: 'blocked', flag: '🇷🇺' },
      { country: 'China', code: 'CN', status: 'blocked', flag: '🇨🇳' },
    ])

    setSecurityScore(94)
    setIsLoading(false)
  }

  const terminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  const unblockEntity = (blockId: string) => {
    setBlocked(prev => prev.filter(b => b.id !== blockId))
  }

  const changeGeoRule = (code: string, status: GeoRule['status']) => {
    setGeoRules(prev => prev.map(r => 
      r.code === code ? { ...r, status } : r
    ))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'brute_force': return <Ban className="w-4 h-4 text-red-400" />
      case 'login_failed': return <XCircle className="w-4 h-4 text-red-400" />
      case 'login_success': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'device_new': return <Smartphone className="w-4 h-4 text-blue-400" />
      case 'location_new': return <MapPin className="w-4 h-4 text-yellow-400" />
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      default: return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Panel de Seguridad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            Seguridad Avanzada
          </h2>
          <p className="text-slate-400">Control Pentagon++ - Grado Militar</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Security Score */}
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{securityScore}</p>
              <p className="text-xs text-slate-400">Security Score</p>
            </div>
          </div>
          <NeuromorphicButton variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar Logs
          </NeuromorphicButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
              <p className="text-xs text-slate-400">Sesiones Activas</p>
            </div>
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Ban className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{blocked.length}</p>
              <p className="text-xs text-slate-400">Bloqueados</p>
            </div>
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {events.filter(e => e.severity === 'critical' || e.severity === 'high').length}
              </p>
              <p className="text-xs text-slate-400">Alertas Hoy</p>
            </div>
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {geoRules.filter(r => r.status === 'blocked').length}
              </p>
              <p className="text-xs text-slate-400">Países Bloqueados</p>
            </div>
          </div>
        </NeuromorphicCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Events */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Eventos de Seguridad
          </h3>

          <div className="space-y-2">
            {events.map(event => (
              <NeuromorphicCard key={event.id} variant="embossed" className="p-4">
                <div className="flex items-start gap-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                          {event.blocked && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                              Bloqueado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{event.details}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      {event.user && <span>👤 {event.user}</span>}
                      <span>🌐 {event.ip}</span>
                      <span>📍 {event.location}</span>
                      <span>💻 {event.device}</span>
                    </div>
                  </div>
                </div>
              </NeuromorphicCard>
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Active Sessions */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-green-400" />
              Sesiones Activas
            </h3>
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className={`p-3 rounded-lg ${
                  session.suspicious ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{session.userName}</span>
                    {session.suspicious && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>📍 {session.location}</p>
                    <p>💻 {session.device} • {session.browser}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                      Activo hace {Math.floor((Date.now() - session.lastActivity.getTime()) / 60000)}m
                    </span>
                    <button
                      onClick={() => terminateSession(session.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Terminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NeuromorphicCard>

          {/* Geo Blocking */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Geobloqueo
            </h3>
            <div className="space-y-2">
              {geoRules.map(rule => (
                <div key={rule.code} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <div className="flex items-center gap-2">
                    <span>{rule.flag}</span>
                    <span className="text-white text-sm">{rule.country}</span>
                  </div>
                  <select
                    value={rule.status}
                    onChange={(e) => changeGeoRule(rule.code, e.target.value as GeoRule['status'])}
                    className={`text-xs px-2 py-1 rounded ${
                      rule.status === 'allowed' ? 'bg-green-500/20 text-green-400' :
                      rule.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    <option value="allowed">Permitido</option>
                    <option value="monitoring">Monitoreado</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              ))}
            </div>
          </NeuromorphicCard>

          {/* Blocked List */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-400" />
              Lista Negra
            </h3>
            <div className="space-y-2">
              {blocked.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/20">
                  <div>
                    <p className="text-white text-sm">{item.value}</p>
                    <p className="text-xs text-slate-400">{item.reason}</p>
                  </div>
                  <button
                    onClick={() => unblockEntity(item.id)}
                    className="text-xs text-green-400 hover:text-green-300"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          </NeuromorphicCard>
        </div>
      </div>
    </div>
  )
}

export default SecurityPanel
