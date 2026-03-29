'use client'

/**
 * 🧠 SILEXAR PULSE - CEO AI Copilot
 * Asistente IA personal del CEO
 * 
 * @description Copiloto IA:
 * - Resúmenes ejecutivos diarios
 * - Recomendaciones estratégicas
 * - Análisis predictivo
 * - Alertas inteligentes
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Target,
  Lightbulb,
  Calendar,
  Send,
  CheckCircle,
  Zap
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'risk'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: string
  impact?: string
  timestamp: Date
}

interface DailyBriefing {
  date: Date
  highlights: string[]
  metrics: { label: string; value: string; trend: string }[]
  priorities: string[]
  risks: string[]
}

export function CEOAICopilot() {
  const [insights] = useState<AIInsight[]>([
    {
      id: 'ins_001',
      type: 'opportunity',
      priority: 'high',
      title: 'Oportunidad de Upsell Detectada',
      description: 'RDF Media ha aumentado su uso un 45% este mes. Basado en su patrón de uso, están listos para Enterprise Plus.',
      action: 'Programar llamada con Account Manager',
      impact: '+$15,000 MRR potencial',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'ins_002',
      type: 'risk',
      priority: 'high',
      title: 'Riesgo de Churn: Mega Media',
      description: 'Detecté que Mega Media no ha usado la plataforma en 14 días. Su NPS bajó de 8 a 5.',
      action: 'Contacto ejecutivo urgente',
      impact: '-$8,500 MRR en riesgo',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'ins_003',
      type: 'recommendation',
      priority: 'medium',
      title: 'Optimización de Infraestructura',
      description: 'Analizando patrones de uso, podrías reducir costos AWS un 23% moviendo workloads a instancias spot en horarios valle.',
      action: 'Revisar propuesta técnica',
      impact: '-$4,200/mes en costos',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'ins_004',
      type: 'alert',
      priority: 'medium',
      title: 'Competidor Lanzó Nueva Feature',
      description: 'AdTech Pro acaba de lanzar integración con TikTok Ads. Recomiendo acelerar nuestro roadmap de TikTok.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ])

  const [briefing] = useState<DailyBriefing>({
    date: new Date(),
    highlights: [
      '3 nuevos clientes Enterprise firmados ayer',
      'MRR creció 2.1% esta semana ($17,500)',
      'NPS mejoró 3 puntos (72 → 75)',
      'Tiempo de respuesta de soporte mejoró 15%'
    ],
    metrics: [
      { label: 'MRR', value: '$847K', trend: '+8.5%' },
      { label: 'Usuarios', value: '12,456', trend: '+5.2%' },
      { label: 'Uptime', value: '99.97%', trend: 'stable' },
      { label: 'NPS', value: '75', trend: '+3pts' }
    ],
    priorities: [
      'Cerrar negociación con Google Cloud Partnership',
      'Resolver situación de Mega Media (riesgo de churn)',
      'Preparar board deck para reunión del viernes'
    ],
    risks: [
      'Factura vencida de Digital First (15 días)',
      'Competidor ganando presencia en mercado chileno'
    ]
  })

  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; message: string }[]>([
    { role: 'ai', message: 'Buenos días CEO. ¿En qué puedo ayudarte hoy? Puedo analizar datos, generar reportes, o darte recomendaciones estratégicas.' }
  ])

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'risk': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'recommendation': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'alert': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4" />
      case 'risk': return <AlertTriangle className="w-4 h-4" />
      case 'recommendation': return <Lightbulb className="w-4 h-4" />
      case 'alert': return <Zap className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const sendMessage = () => {
    if (!chatInput.trim()) return
    
    setChatHistory(prev => [...prev, { role: 'user', message: chatInput }])
    const userMessage = chatInput
    setChatInput('')

    // Simular respuesta IA
    setTimeout(() => {
      let response = ''
      const lower = userMessage.toLowerCase()
      
      if (lower.includes('revenue') || lower.includes('mrr')) {
        response = 'El MRR actual es $847,500, con un crecimiento del 8.5% MoM. El revenue proyectado para este trimestre es $2.6M, superando la meta del 3%.'
      } else if (lower.includes('churn') || lower.includes('riesgo')) {
        response = 'Hay 2 clientes en riesgo: Mega Media (85% prob churn, $8.5K MRR) y Digital First (62% prob, $3.2K MRR). Recomiendo contacto ejecutivo inmediato.'
      } else if (lower.includes('prioridad') || lower.includes('hacer')) {
        response = 'Tus 3 prioridades hoy: 1) Llamada con Google Cloud (11:00), 2) Resolver situación Mega Media, 3) Revisar propuesta de infraestructura.'
      } else {
        response = 'Entendido. Basándome en los datos actuales, mi análisis indica que deberías enfocarte en retención de clientes y el partnership con Google Cloud. ¿Necesitas más detalles?'
      }
      
      setChatHistory(prev => [...prev, { role: 'ai', message: response }])
    }, 1000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          CEO AI Copilot
          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            GPT-4 Powered
          </span>
        </h3>
      </div>

      {/* Daily Briefing */}
      <NeuromorphicCard variant="glow" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          📋 Briefing del Día - {briefing.date.toLocaleDateString()}
        </h4>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {briefing.metrics.map((m, i) => (
            <div key={i} className="p-3 bg-slate-800/50 rounded text-center">
              <p className="text-lg font-bold text-white">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className={`text-xs ${m.trend.includes('+') ? 'text-green-400' : m.trend.includes('-') ? 'text-red-400' : 'text-slate-400'}`}>
                {m.trend}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-green-400 mb-2">✨ Highlights</p>
            <ul className="space-y-1">
              {briefing.highlights.map((h, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-yellow-400 mb-2">🎯 Prioridades Hoy</p>
            <ul className="space-y-1">
              {briefing.priorities.map((p, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-yellow-400">{i + 1}.</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </NeuromorphicCard>

      {/* AI Insights */}
      <div className="space-y-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Insights IA ({insights.length})
        </h4>
        {insights.map(insight => (
          <NeuromorphicCard 
            key={insight.id} 
            variant="embossed" 
            className={`p-4 border ${getTypeStyle(insight.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(insight.type)}
                <span className="text-white font-medium">{insight.title}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                insight.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {insight.priority}
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-2">{insight.description}</p>
            {(insight.action || insight.impact) && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
                {insight.action && (
                  <span className="text-xs text-blue-400">💡 {insight.action}</span>
                )}
                {insight.impact && (
                  <span className={`text-xs ${insight.impact.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {insight.impact}
                  </span>
                )}
              </div>
            )}
          </NeuromorphicCard>
        ))}
      </div>

      {/* AI Chat */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          Pregúntame lo que sea
        </h4>
        
        <div className="h-48 overflow-y-auto mb-3 space-y-3">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {msg.role === 'ai' && <Brain className="w-4 h-4 text-purple-400 inline mr-2" />}
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Pregunta sobre revenue, clientes, estrategia..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
          />
          <NeuromorphicButton variant="primary" size="sm" onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </NeuromorphicButton>
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default CEOAICopilot
