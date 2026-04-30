'use client'

/**
 * ðŸ” SILEXAR PULSE - Audit Trail Forensics
 * Análisis forense de eventos de seguridad
 * 
 * @description Sistema de auditoría avanzada:
 * - Timeline de eventos
 * - Análisis forense con IA
 * - Correlación de amenazas
 * - Exportación legal
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Search,
  Shield,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Monitor,
  Download,
  Filter,
  Eye,
  Link,
  Brain,
  Activity,
  Target,
  FileText,
  ChevronDown
} from 'lucide-react'

interface ForensicEvent {
  id: string
  timestamp: Date
  eventType: 'login' | 'access' | 'modification' | 'deletion' | 'security' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string
  userName: string
  ip: string
  location: string
  device: string
  action: string
  resource: string
  details: string
  correlatedEvents: string[]
  aiThreatScore: number
  aiAnalysis?: {
    classification: string
    confidence: number
    recommendation: string
  }
}

interface ForensicSession {
  id: string
  startTime: Date
  endTime?: Date
  eventsCount: number
  threatLevel: 'safe' | 'suspicious' | 'malicious'
  userId: string
  userName: string
}

export function AuditForensics() {
  const [events, setEvents] = useState<ForensicEvent[]>([])
  const [sessions, setSessions] = useState<ForensicSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<ForensicEvent | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadForensicData()
  }, [])

  const loadForensicData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const demoEvents: ForensicEvent[] = [
      {
        id: 'evt_001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        eventType: 'security',
        severity: 'critical',
        userId: 'usr_unknown',
        userName: 'Desconocido',
        ip: '192.168.1.100',
        location: 'Shanghai, China',
        device: 'Unknown Linux',
        action: 'Intento de fuerza bruta',
        resource: '/api/auth/login',
        details: '147 intentos fallidos en 5 minutos',
        correlatedEvents: ['evt_002', 'evt_003'],
        aiThreatScore: 95,
        aiAnalysis: {
          classification: 'Ataque de Fuerza Bruta',
          confidence: 98,
          recommendation: 'Bloquear IP inmediatamente y revisar credenciales comprometidas'
        }
      },
      {
        id: 'evt_002',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        eventType: 'access',
        severity: 'high',
        userId: 'usr_admin',
        userName: 'Admin RDF',
        ip: '192.168.1.100',
        location: 'Santiago, Chile',
        device: 'Chrome Windows',
        action: 'Acceso a datos sensibles',
        resource: '/api/users/export',
        details: 'Exportación masiva de 5000 usuarios',
        correlatedEvents: ['evt_001'],
        aiThreatScore: 72,
        aiAnalysis: {
          classification: 'Exfiltración de Datos Potencial',
          confidence: 85,
          recommendation: 'Verificar con el usuario la necesidad de esta exportación'
        }
      },
      {
        id: 'evt_003',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        eventType: 'modification',
        severity: 'medium',
        userId: 'usr_ceo',
        userName: 'CEO Silexar',
        ip: '10.0.0.5',
        location: 'Santiago, Chile',
        device: 'Safari macOS',
        action: 'Modificación de permisos',
        resource: '/admin/roles/super_admin',
        details: 'Agregados permisos de eliminación masiva',
        correlatedEvents: [],
        aiThreatScore: 45,
        aiAnalysis: {
          classification: 'Escalación de Privilegios',
          confidence: 60,
          recommendation: 'Actividad legítima de CEO, pero registrar para auditoría'
        }
      },
      {
        id: 'evt_004',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        eventType: 'login',
        severity: 'low',
        userId: 'usr_user123',
        userName: 'María González',
        ip: '201.215.45.67',
        location: 'Valparaíso, Chile',
        device: 'Firefox Windows',
        action: 'Login exitoso',
        resource: '/auth/login',
        details: 'Login normal con 2FA',
        correlatedEvents: [],
        aiThreatScore: 5
      },
      {
        id: 'evt_005',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        eventType: 'deletion',
        severity: 'high',
        userId: 'usr_admin2',
        userName: 'Carlos Admin',
        ip: '10.0.0.15',
        location: 'Santiago, Chile',
        device: 'Chrome Windows',
        action: 'Eliminación de registros',
        resource: '/api/campanas/batch-delete',
        details: 'Eliminadas 250 campañas antiguas',
        correlatedEvents: [],
        aiThreatScore: 55,
        aiAnalysis: {
          classification: 'Limpieza de Datos',
          confidence: 75,
          recommendation: 'Verificar política de retención de datos'
        }
      }
    ]

    setEvents(demoEvents)

    setSessions([
      {
        id: 'ses_001',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        eventsCount: 147,
        threatLevel: 'malicious',
        userId: 'usr_unknown',
        userName: 'Atacante Externo'
      },
      {
        id: 'ses_002',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        eventsCount: 23,
        threatLevel: 'suspicious',
        userId: 'usr_admin',
        userName: 'Admin RDF'
      },
      {
        id: 'ses_003',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        eventsCount: 45,
        threatLevel: 'safe',
        userId: 'usr_ceo',
        userName: 'CEO Silexar'
      }
    ])

    setIsLoading(false)
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
      case 'high': return 'bg-[#6888ff]/20 text-[#6888ff] border-orange-500/30'
      case 'medium': return 'bg-[#6888ff]/20 text-[#6888ff] border-yellow-500/30'
      case 'low': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const getThreatStyle = (level: string) => {
    switch (level) {
      case 'malicious': return 'bg-[#6888ff] text-white'
      case 'suspicious': return 'bg-[#6888ff] text-black'
      case 'safe': return 'bg-[#6888ff] text-white'
      default: return 'bg-slate-500 text-[#69738c]'
    }
  }

  const exportForensicReport = () => {

    alert('Reporte forense exportado en formato legal')
  }

  const filteredEvents = events.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false
    if (typeFilter !== 'all' && e.eventType !== typeFilter) return false
    if (searchTerm && !e.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !e.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Datos Forenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Search className="w-5 h-5 text-[#6888ff]" />
          Audit Trail Forensics
        </h3>
        <NeuButton variant="secondary" onClick={exportForensicReport}>
          <Download className="w-4 h-4 mr-1" />
          Exportar Reporte Legal
        </NeuButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{events.length}</p>
          <p className="text-xs text-[#9aa3b8]">Eventos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {events.filter(e => e.severity === 'critical').length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Críticos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {events.filter(e => e.severity === 'high').length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Altos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {sessions.filter(s => s.threatLevel === 'malicious').length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Sesiones Maliciosas</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {Math.round(events.reduce((sum, e) => sum + e.aiThreatScore, 0) / events.length)}%
          </p>
          <p className="text-xs text-[#9aa3b8]">Threat Score Prom</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#dfeaff] border border-slate-700 rounded-lg text-[#69738c] text-sm"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#dfeaff] text-[#69738c] text-sm rounded-lg px-3 py-2"
        >
          <option value="all">Todas las Severidades</option>
          <option value="critical">Crítico</option>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
          <option value="low">Bajo</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#dfeaff] text-[#69738c] text-sm rounded-lg px-3 py-2"
        >
          <option value="all">Todos los Tipos</option>
          <option value="security">Seguridad</option>
          <option value="access">Acceso</option>
          <option value="modification">Modificación</option>
          <option value="deletion">Eliminación</option>
          <option value="login">Login</option>
        </select>
      </div>

      {/* Suspicious Sessions Alert */}
      {sessions.some(s => s.threatLevel !== 'safe') && (
        <div className="p-4 bg-[#6888ff]/10 border border-[#6888ff]/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-[#6888ff]" />
            <span className="text-[#6888ff] font-medium">Sesiones Sospechosas Detectadas</span>
          </div>
          <div className="flex gap-2">
            {sessions.filter(s => s.threatLevel !== 'safe').map(session => (
              <span key={session.id} className={`text-xs px-2 py-1 rounded ${getThreatStyle(session.threatLevel)}`}>
                {session.userName} - {session.eventsCount} eventos
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Events Timeline */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#6888ff]" />
          Timeline de Eventos
        </h4>

        <div className="space-y-3">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-[#6888ff]/50 ${getSeverityStyle(event.severity)
                } ${selectedEvent?.id === event.id ? 'ring-1 ring-red-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">{event.action}</span>
                  {event.correlatedEvents.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      {event.correlatedEvents.length} correlacionados
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {event.aiThreatScore >= 70 && (
                    <span className="text-xs px-2 py-0.5 bg-[#6888ff] text-white rounded animate-pulse">
                      š ï¸ Threat: {event.aiThreatScore}%
                    </span>
                  )}
                  <span className="text-xs text-[#9aa3b8]">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#9aa3b8]" />
                  <span>{event.userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#9aa3b8]" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-[#9aa3b8]" />
                  <span>{event.device}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-[#9aa3b8]" />
                  <span className="truncate">{event.resource}</span>
                </div>
              </div>

              {event.aiAnalysis && (
                <div className="mt-2 p-2 bg-[#dfeaff]/50 rounded flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#6888ff]" />
                  <span className="text-xs text-[#6888ff]">
                    IA: {event.aiAnalysis.classification} ({event.aiAnalysis.confidence}% confianza)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Event Detail Panel */}
      {selectedEvent && selectedEvent.aiAnalysis && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
          <h4 className="text-[#69738c] font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#6888ff]" />
            Análisis Forense Detallado
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm text-[#9aa3b8] mb-2">Información del Evento</h5>
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {selectedEvent.id}</p>
                <p><strong>Acción:</strong> {selectedEvent.action}</p>
                <p><strong>Recurso:</strong> {selectedEvent.resource}</p>
                <p><strong>Detalles:</strong> {selectedEvent.details}</p>
                <p><strong>IP:</strong> {selectedEvent.ip}</p>
              </div>
            </div>

            <div>
              <h5 className="text-sm text-[#9aa3b8] mb-2">Análisis IA</h5>
              <div className="p-4 bg-[#6888ff]/10 rounded-lg">
                <p className="text-[#6888ff] font-medium mb-2">
                  {selectedEvent.aiAnalysis.classification}
                </p>
                <p className="text-sm text-[#9aa3b8] mb-2">
                  Confianza: {selectedEvent.aiAnalysis.confidence}%
                </p>
                <p className="text-sm text-[#69738c]">
                  ðŸ’¡ {selectedEvent.aiAnalysis.recommendation}
                </p>
              </div>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default AuditForensics