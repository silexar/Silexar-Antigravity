'use client'

/**
 * ðŸ”’ SILEXAR PULSE - Panel de Seguridad Avanzada
 * Control de seguridad militar con detección de anomalías
 * 
 * @description Panel de seguridad CEO con:
 * - Geobloqueo por país
 * - Device fingerprinting
 * - Detección de anomalías
 * - Control de sesiones
 * - Registro de actividad
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 * 
 * @last_modified 2025-04-27 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { N, NeuCard, NeuCardSmall, NeuButton, StatusBadge, NeuProgress, getShadow, getSmallShadow } from './_sdk/AdminDesignSystem'
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
      { country: 'Chile', code: 'CL', status: 'allowed', flag: 'ðŸ‡¨ðŸ‡±' },
      { country: 'Argentina', code: 'AR', status: 'allowed', flag: 'ðŸ‡¦ðŸ‡·' },
      { country: 'España', code: 'ES', status: 'monitoring', flag: 'ðŸ‡ªðŸ‡¸' },
      { country: 'Estados Unidos', code: 'US', status: 'monitoring', flag: 'ðŸ‡ºðŸ‡¸' },
      { country: 'Rusia', code: 'RU', status: 'blocked', flag: 'ðŸ‡·ðŸ‡º' },
      { country: 'China', code: 'CN', status: 'blocked', flag: 'ðŸ‡¨ðŸ‡³' },
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
      case 'critical': return '#6888ff'
      case 'high': return '#6888ff'
      case 'medium': return '#6888ff'
      case 'low': return '#6888ff'
      default: return N.textSub
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return '#6888ff20'
      case 'high': return '#6888ff20'
      case 'medium': return '#6888ff20'
      case 'low': return '#6888ff20'
      default: return `${N.dark}20`
    }
  }

  const getEventIcon = (type: SecurityEvent['type']) => {
    const color = type === 'brute_force' || type === 'login_failed' ? '#6888ff' :
      type === 'login_success' ? '#6888ff' :
        type === 'device_new' ? '#6888ff' :
          type === 'location_new' ? '#6888ff' :
            type === 'suspicious_activity' ? '#6888ff' : N.textSub
    switch (type) {
      case 'brute_force': return <Ban style={{ width: 16, height: 16, color }} />
      case 'login_failed': return <XCircle style={{ width: 16, height: 16, color }} />
      case 'login_success': return <CheckCircle style={{ width: 16, height: 16, color }} />
      case 'device_new': return <Smartphone style={{ width: 16, height: 16, color }} />
      case 'location_new': return <MapPin style={{ width: 16, height: 16, color }} />
      case 'suspicious_activity': return <AlertTriangle style={{ width: 16, height: 16, color }} />
      default: return <Activity style={{ width: 16, height: 16, color }} />
    }
  }

  const getGeoStatusBadge = (status: GeoRule['status']) => {
    switch (status) {
      case 'allowed': return <StatusBadge status="success" label="Permitido" />
      case 'blocked': return <StatusBadge status="danger" label="Bloqueado" />
      case 'monitoring': return <StatusBadge status="warning" label="Monitoreado" />
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #6888ff30',
            borderTopColor: '#6888ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: N.textSub }}>Cargando Panel de Seguridad...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield style={{ color: '#6888ff', width: 24, height: 24 }} />
            Seguridad Avanzada
          </h2>
          <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Control Pentagon++ - Grado Militar</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Security Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: '#6888ff15', borderRadius: 8, border: '1px solid #6888ff50' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>{securityScore}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Security Score</p>
            </div>
          </div>
          <NeuButton variant="secondary">
            <Download style={{ width: 16, height: 16, marginRight: 4 }} />
            Exportar Logs
          </NeuButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#6888ff20', borderRadius: 8 }}>
              <CheckCircle style={{ color: '#6888ff', width: 24, height: 24 }} />
            </div>
            <div>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{sessions.length}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Sesiones Activas</p>
            </div>
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#6888ff20', borderRadius: 8 }}>
              <Ban style={{ color: '#6888ff', width: 24, height: 24 }} />
            </div>
            <div>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{blocked.length}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Bloqueados</p>
            </div>
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#6888ff20', borderRadius: 8 }}>
              <AlertTriangle style={{ color: '#6888ff', width: 24, height: 24 }} />
            </div>
            <div>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
                {events.filter(e => e.severity === 'critical' || e.severity === 'high').length}
              </p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Alertas Hoy</p>
            </div>
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#6888ff20', borderRadius: 8 }}>
              <Globe style={{ color: '#6888ff', width: 24, height: 24 }} />
            </div>
            <div>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>
                {geoRules.filter(r => r.status === 'blocked').length}
              </p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Países Bloqueados</p>
            </div>
          </div>
        </NeuCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {/* Security Events */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity style={{ color: '#6888ff', width: 20, height: 20 }} />
            Eventos de Seguridad
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.map(event => (
              <NeuCard key={event.id} style={{ boxShadow: getShadow() }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {getEventIcon(event.type)}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: N.text, fontWeight: 500 }}>
                            {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 4,
                            color: getSeverityColor(event.severity),
                            background: getSeverityBg(event.severity)
                          }}>
                            {event.severity}
                          </span>
                          {event.blocked && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: 4,
                              background: '#6888ff20',
                              color: '#6888ff'
                            }}>
                              Bloqueado
                            </span>
                          )}
                        </div>
                        <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.25rem' }}>{event.details}</p>
                      </div>
                      <span style={{ color: N.textSub, fontSize: '0.75rem' }}>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: N.textSub }}>
                      {event.user && <span>ðŸ‘¤ {event.user}</span>}
                      <span>ðŸŒ {event.ip}</span>
                      <span>ðŸ“ {event.location}</span>
                      <span>ðŸ’» {event.device}</span>
                    </div>
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Sessions */}
          <NeuCard style={{ boxShadow: getShadow() }}>
            <h3 style={{ color: N.text, fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Monitor style={{ color: '#6888ff', width: 16, height: 16 }} />
              Sesiones Activas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessions.map(session => (
                <div key={session.id} style={{
                  padding: '0.75rem',
                  borderRadius: 8,
                  background: session.suspicious ? '#6888ff15' : `${N.dark}50`,
                  border: session.suspicious ? '1px solid #6888ff50' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: N.text, fontSize: '0.875rem', fontWeight: 500 }}>{session.userName}</span>
                    {session.suspicious && (
                      <AlertTriangle style={{ color: '#6888ff', width: 16, height: 16 }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: N.textSub, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p>ðŸ“ {session.location}</p>
                    <p>ðŸ’» {session.device} • {session.browser}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ color: N.textSub, fontSize: '0.75rem' }}>
                      Activo hace {Math.floor((Date.now() - session.lastActivity.getTime()) / 60000)}m
                    </span>
                    <button
                      onClick={() => terminateSession(session.id)}
                      style={{ color: '#6888ff', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Terminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Geo Blocking */}
          <NeuCard style={{ boxShadow: getShadow() }}>
            <h3 style={{ color: N.text, fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe style={{ color: '#6888ff', width: 16, height: 16 }} />
              Geobloqueo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {geoRules.map(rule => (
                <div key={rule.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}30`, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{rule.flag}</span>
                    <span style={{ color: N.text, fontSize: '0.875rem' }}>{rule.country}</span>
                  </div>
                  {getGeoStatusBadge(rule.status)}
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Blocked List */}
          <NeuCard style={{ boxShadow: getShadow() }}>
            <h3 style={{ color: N.text, fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ban style={{ color: '#6888ff', width: 16, height: 16 }} />
              Lista Negra
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blocked.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: '#6888ff15', borderRadius: 8, border: '1px solid #6888ff50' }}>
                  <div>
                    <p style={{ color: N.text, fontSize: '0.875rem' }}>{item.value}</p>
                    <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{item.reason}</p>
                  </div>
                  <button
                    onClick={() => unblockEntity(item.id)}
                    style={{ color: '#6888ff', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          </NeuCard>
        </div>
      </div>
    </div>
  )
}

export default SecurityPanel
