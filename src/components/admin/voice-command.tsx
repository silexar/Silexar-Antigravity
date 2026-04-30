'use client'

/**
 * ðŸŽ™ï¸ SILEXAR PULSE - Voice Command Center
 * Control por voz del sistema
 * 
 * @description Comandos de voz:
 * - Consultas naturales
 * - Control de acciones
 * - Briefing por voz
 * - Respuestas IA
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Mic,
  MicOff,
  Brain,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react'

interface VoiceCommand {
  id: string
  transcript: string
  response: string
  timestamp: Date
  status: 'success' | 'error' | 'Procesando'
  action?: string
}

interface QuickVoiceAction {
  phrase: string
  description: string
  category: 'query' | 'action' | 'report'
}

export function VoiceCommandCenter() {
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([
    {
      id: 'vc_001',
      transcript: '¿Cómo está el revenue de hoy?',
      response: 'El revenue de hoy es $28,500, un 12.3% más que ayer. El MRR actual es $847,500.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'success'
    },
    {
      id: 'vc_002',
      transcript: 'Dame el briefing de la mañana',
      response: 'Buenos días CEO. Resumen: 3 nuevos clientes ayer, MRR+8.5%, 1 cliente en riesgo de churn (Mega Media), 2 aprobaciones pendientes.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      id: 'vc_003',
      transcript: 'Activa modo mantenimiento para RDF Media',
      response: 'Modo mantenimiento activado para RDF Media. Se ha notificado a sus usuarios.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'success',
      action: 'maintenance_mode'
    }
  ])

  const quickActions: QuickVoiceAction[] = [
    { phrase: '¿Cómo está el revenue de hoy?', description: 'Consulta revenue diario', category: 'query' },
    { phrase: 'Dame el briefing de la mañana', description: 'Resumen ejecutivo', category: 'report' },
    { phrase: '¿Cuántos usuarios activos hay?', description: 'Usuarios en tiempo real', category: 'query' },
    { phrase: '¿Hay clientes en riesgo?', description: 'Predicción de churn', category: 'query' },
    { phrase: 'Activa modo mantenimiento', description: 'Acción de sistema', category: 'action' },
    { phrase: '¿Cuál es el NPS actual?', description: 'Satisfacción de clientes', category: 'query' },
    { phrase: 'Envía reporte semanal', description: 'Genera y envía reporte', category: 'action' },
    { phrase: '¿Hay alertas de seguridad?', description: 'Estado de seguridad', category: 'query' }
  ]

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      if (currentTranscript) {
        processVoiceCommand(currentTranscript)
      }
    } else {
      setIsListening(true)
      setCurrentTranscript('')
      // Simular escucha
      setTimeout(() => {
        setCurrentTranscript('¿Cómo está el sistema ahora?')
      }, 2000)
    }
  }

  const processVoiceCommand = (transcript: string) => {
    const newCommand: VoiceCommand = {
      id: `vc_${Date.now()}`,
      transcript,
      response: 'Procesando...',
      timestamp: new Date(),
      status: 'Procesando'
    }
    setCommandHistory(prev => [newCommand, ...prev])
    setCurrentTranscript('')

    // Simular respuesta de IA
    setTimeout(() => {
      setCommandHistory(prev => prev.map(cmd =>
        cmd.id === newCommand.id
          ? {
            ...cmd,
            response: generateAIResponse(transcript),
            status: 'success'
          }
          : cmd
      ))
    }, 1500)
  }

  const generateAIResponse = (transcript: string): string => {
    const lower = transcript.toLowerCase()
    if (lower.includes('revenue') || lower.includes('ingresos')) {
      return 'El revenue de hoy es $28,500, un 12.3% más que ayer. Proyección mensual: $847,500 MRR.'
    }
    if (lower.includes('usuario') || lower.includes('activos')) {
      return 'Actualmente hay 12,456 usuarios activos. Peak de hoy: 14,230 a las 11:30 AM.'
    }
    if (lower.includes('sistema') || lower.includes('estado')) {
      return 'Todos los sistemas operativos. Uptime: 99.97%. Latencia promedio: 45ms. Sin incidentes activos.'
    }
    if (lower.includes('churn') || lower.includes('riesgo')) {
      return 'Hay 2 clientes en riesgo: Mega Media (85% probabilidad) y Digital First (62%). Recomiendo contacto directo.'
    }
    if (lower.includes('seguridad') || lower.includes('alerta')) {
      return 'Se detectó 1 incidente de seguridad hace 2 horas (intento de fuerza bruta). Ya fue mitigado. Sin amenazas activas.'
    }
    return 'Entendido. He procesado tu solicitud. ¿Necesitas algo más?'
  }

  const executeQuickAction = (phrase: string) => {
    processVoiceCommand(phrase)
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'query': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'action': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'report': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Mic className="w-5 h-5 text-[#6888ff]" />
          Voice Command Center
          <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">AI-Powered</span>
        </h3>
      </div>

      {/* Main Voice Control */}
      <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '2rem', background: N.base }}>
        <button
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${isListening
            ? 'bg-[#6888ff] animate-pulse shadow-lg shadow-red-500/50'
            : 'bg-[#6888ff] hover:bg-[#6888ff]'
            }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-[#69738c]" />
          ) : (
            <Mic className="w-10 h-10 text-[#69738c]" />
          )}
        </button>

        <p className="text-[#69738c] text-lg mb-2">
          {isListening ? 'ðŸŽ™ï¸ Escuchando...' : 'Presiona para hablar'}
        </p>

        {currentTranscript && (
          <div className="p-4 bg-[#dfeaff]/50 rounded-lg mb-4">
            <p className="text-[#9aa3b8] text-sm mb-1">Escuchando:</p>
            <p className="text-[#69738c] text-lg">&quot;{currentTranscript}&quot;</p>
          </div>
        )}

        <p className="text-sm text-[#9aa3b8]">
          Di &quot;Hey Silexar&quot; seguido de tu comando
        </p>
      </NeuCard>

      {/* Quick Voice Actions */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#6888ff]" />
          Comandos Rápidos
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
            <button
              key={action.phrase}
              onClick={() => executeQuickAction(action.phrase)}
              className="p-3 bg-[#dfeaff]/50 rounded-lg text-left hover:bg-[#dfeaff]/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${getCategoryStyle(action.category)}`}>
                  {action.category}
                </span>
              </div>
              <p className="text-[#69738c] text-sm group-hover:text-[#6888ff] transition-colors">
                &quot;{action.phrase}&quot;
              </p>
              <p className="text-xs text-[#9aa3b8]">{action.description}</p>
            </button>
          ))}
        </div>
      </NeuCard>

      {/* Command History */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6888ff]" />
          Historial de Comandos
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {commandHistory.map(cmd => (
            <div key={cmd.id} className="p-3 bg-[#dfeaff]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {cmd.status === 'success' && <CheckCircle className="w-4 h-4 text-[#6888ff]" />}
                  {cmd.status === 'error' && <AlertTriangle className="w-4 h-4 text-[#6888ff]" />}
                  {cmd.status === 'Procesando' && <Activity className="w-4 h-4 text-[#6888ff] animate-spin" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3 h-3 text-[#9aa3b8]" />
                    <span className="text-[#69738c] text-sm">&quot;{cmd.transcript}&quot;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain className="w-3 h-3 text-[#6888ff] mt-0.5" />
                    <p className="text-sm text-[#69738c]">{cmd.response}</p>
                  </div>
                  <p className="text-xs text-[#9aa3b8] mt-1">
                    {cmd.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default VoiceCommandCenter