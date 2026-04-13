'use client'

/**
 * 🎙️ SILEXAR PULSE - Voice Command Center
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
import { 
  NeuromorphicCard
} from '@/components/ui/neuromorphic'
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
  status: 'success' | 'error' | 'processing'
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
      status: 'processing'
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
      case 'query': return 'bg-blue-500/20 text-blue-400'
      case 'action': return 'bg-orange-500/20 text-orange-400'
      case 'report': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-400" />
          Voice Command Center
          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">AI-Powered</span>
        </h3>
      </div>

      {/* Main Voice Control */}
      <NeuromorphicCard variant="glow" className="p-8 text-center">
        <button
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
            isListening 
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        <p className="text-white text-lg mb-2">
          {isListening ? '🎙️ Escuchando...' : 'Presiona para hablar'}
        </p>

        {currentTranscript && (
          <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
            <p className="text-slate-400 text-sm mb-1">Escuchando:</p>
            <p className="text-white text-lg">&quot;{currentTranscript}&quot;</p>
          </div>
        )}

        <p className="text-sm text-slate-400">
          Di &quot;Hey Silexar&quot; seguido de tu comando
        </p>
      </NeuromorphicCard>

      {/* Quick Voice Actions */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Comandos Rápidos
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
            <button
              key={action.phrase}
              onClick={() => executeQuickAction(action.phrase)}
              className="p-3 bg-slate-800/50 rounded-lg text-left hover:bg-slate-700/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${getCategoryStyle(action.category)}`}>
                  {action.category}
                </span>
              </div>
              <p className="text-white text-sm group-hover:text-purple-400 transition-colors">
                &quot;{action.phrase}&quot;
              </p>
              <p className="text-xs text-slate-500">{action.description}</p>
            </button>
          ))}
        </div>
      </NeuromorphicCard>

      {/* Command History */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Historial de Comandos
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {commandHistory.map(cmd => (
            <div key={cmd.id} className="p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {cmd.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {cmd.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {cmd.status === 'processing' && <Activity className="w-4 h-4 text-blue-400 animate-spin" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    <span className="text-white text-sm">&quot;{cmd.transcript}&quot;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain className="w-3 h-3 text-purple-400 mt-0.5" />
                    <p className="text-sm text-slate-300">{cmd.response}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {cmd.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default VoiceCommandCenter
