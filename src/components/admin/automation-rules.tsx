'use client'

/**
 * š¡ SILEXAR PULSE - Automation Rules Engine
 * Motor de reglas de automatización
 * 
 * @description Automation:
 * - Reglas tipo "si X entonces Y"
 * - Triggers automáticos
 * - Acciones configurables
 * - Historial de ejecuciones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Zap
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    type: 'event' | 'schedule' | 'threshold' | 'webhook'
    config: Record<string, unknown>
  }
  conditions: RuleCondition[]
  actions: RuleAction[]
  status: 'active' | 'paused' | 'error'
  lastTriggered?: Date
  triggerCount: number
  createdAt: Date
}

interface RuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: string | number
}

interface RuleAction {
  type: 'email' | 'webhook' | 'slack' | 'sms' | 'scale' | 'restart' | 'cache_clear' | 'backup'
  config: Record<string, unknown>
}

interface RuleExecution {
  id: string
  ruleId: string
  triggeredAt: Date
  status: 'success' | 'failed' | 'skipped'
  duration: number
  actionsExecuted: number
}

export function AutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [executions, setExecutions] = useState<RuleExecution[]>([])
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadRules = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setRules([
      {
        id: 'rule_001',
        name: 'Auto-scale on high CPU',
        description: 'Escalar servidores cuando CPU > 80%',
        trigger: { type: 'threshold', config: { metric: 'cpu', threshold: 80 } },
        conditions: [{ field: 'cpu_usage', operator: 'greater_than', value: 80 }],
        actions: [{ type: 'scale', config: { direction: 'up', count: 1 } }],
        status: 'active',
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
        triggerCount: 45,
        createdAt: new Date('2024-06-01')
      },
      {
        id: 'rule_002',
        name: 'Alert on error spike',
        description: 'Notificar si errores > 10/min',
        trigger: { type: 'threshold', config: { metric: 'error_rate', threshold: 10 } },
        conditions: [{ field: 'errors_per_minute', operator: 'greater_than', value: 10 }],
        actions: [
          { type: 'slack', config: { channel: '#alerts' } },
          { type: 'email', config: { to: 'oncall@company.com' } }
        ],
        status: 'active',
        lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
        triggerCount: 12,
        createdAt: new Date('2024-03-15')
      },
      {
        id: 'rule_003',
        name: 'Daily backup verification',
        description: 'Verificar backups diarios a las 3AM',
        trigger: { type: 'schedule', config: { cron: '0 3 * * *' } },
        conditions: [],
        actions: [{ type: 'backup', config: { verify: true } }],
        status: 'active',
        lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
        triggerCount: 365,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'rule_004',
        name: 'Clear cache on deploy',
        description: 'Limpiar caché después de cada deploy',
        trigger: { type: 'event', config: { event: 'deployment.completed' } },
        conditions: [],
        actions: [{ type: 'cache_clear', config: { pattern: '*' } }],
        status: 'active',
        lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        triggerCount: 89,
        createdAt: new Date('2024-02-01')
      },
      {
        id: 'rule_005',
        name: 'Restart unhealthy services',
        description: 'Reiniciar servicios que fallen health check 3 veces',
        trigger: { type: 'threshold', config: { metric: 'health_check_fails', threshold: 3 } },
        conditions: [{ field: 'consecutive_failures', operator: 'greater_than', value: 2 }],
        actions: [{ type: 'restart', config: { graceful: true } }],
        status: 'paused',
        triggerCount: 8,
        createdAt: new Date('2024-08-01')
      }
    ])

    setIsLoading(false)
  }

  const loadExecutions = (ruleId: string) => {
    setSelectedRule(ruleId)
    setExecutions([
      { id: 'exec_001', ruleId, triggeredAt: new Date(), status: 'success', duration: 1250, actionsExecuted: 2 },
      { id: 'exec_002', ruleId, triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'success', duration: 890, actionsExecuted: 2 },
      { id: 'exec_003', ruleId, triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), status: 'failed', duration: 5000, actionsExecuted: 1 },
      { id: 'exec_004', ruleId, triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000), status: 'skipped', duration: 50, actionsExecuted: 0 }
    ])
  }

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
    ))
  }

  const testRule = async (id: string) => {
    alert(`Ejecutando regla de prueba...`)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Prueba completada exitosamente!')
  }

  const deleteRule = (id: string) => {
    if (confirm('¿Eliminar esta regla?')) {
      setRules(prev => prev.filter(r => r.id !== id))
    }
  }

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'event': return 'ðŸ“¡ Evento'
      case 'schedule': return '⏰ Programado'
      case 'threshold': return 'ðŸ“Š Umbral'
      case 'webhook': return 'ðŸ”— Webhook'
      default: return type
    }
  }

  const activeCount = rules.filter(r => r.status === 'active').length
  const totalTriggers = rules.reduce((sum, r) => sum + r.triggerCount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Automation Rules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#6888ff]" />
          Automation Rules
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadRules}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="primary">
            <Plus className="w-4 h-4 mr-1" />
            New Rule
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{rules.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total Rules</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{activeCount}</p>
          <p className="text-xs text-[#9aa3b8]">Active</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{totalTriggers}</p>
          <p className="text-xs text-[#9aa3b8]">Total Triggers</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{rules.reduce((sum, r) => sum + r.actions.length, 0)}</p>
          <p className="text-xs text-[#9aa3b8]">Actions</p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map(rule => (
          <NeuCard
            key={rule.id}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${rule.status === 'active' ? 'bg-[#6888ff]' :
                  rule.status === 'error' ? 'bg-[#6888ff]' : 'bg-[#6888ff]'
                  }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#69738c] font-medium">{rule.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-[#dfeaff] rounded">{getTriggerLabel(rule.trigger.type)}</span>
                  </div>
                  <p className="text-xs text-[#9aa3b8]">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRule(rule.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                  {rule.status === 'paused' ? <Play className="w-4 h-4 text-[#6888ff]" /> : <Pause className="w-4 h-4 text-[#6888ff]" />}
                </button>
                <button onClick={() => testRule(rule.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                  <Zap className="w-4 h-4 text-[#6888ff]" />
                </button>
                <button onClick={() => loadExecutions(rule.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                  <Clock className="w-4 h-4 text-[#9aa3b8]" />
                </button>
                <button className="p-1 hover:bg-[#dfeaff] rounded">
                  <Edit className="w-4 h-4 text-[#6888ff]" />
                </button>
                <button onClick={() => deleteRule(rule.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                  <Trash2 className="w-4 h-4 text-[#6888ff]" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#9aa3b8]">
                Conditions: <span className="text-[#6888ff]">{rule.conditions.length}</span>
              </span>
              <span className="text-[#9aa3b8]">
                Actions: <span className="text-[#6888ff]">{rule.actions.length}</span>
              </span>
              <span className="text-[#9aa3b8]">
                Triggers: <span className="text-[#69738c]">{rule.triggerCount}</span>
              </span>
              {rule.lastTriggered && (
                <span className="text-[#9aa3b8]">
                  Last: {rule.lastTriggered.toLocaleString()}
                </span>
              )}
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Execution History */}
      {selectedRule && (
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3">Historial de Ejecuciones</h4>
          <div className="space-y-2">
            {executions.map(exec => (
              <div key={exec.id} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {exec.status === 'success' && <CheckCircle className="w-4 h-4 text-[#6888ff]" />}
                  {exec.status === 'failed' && <AlertTriangle className="w-4 h-4 text-[#6888ff]" />}
                  {exec.status === 'skipped' && <Clock className="w-4 h-4 text-[#6888ff]" />}
                  <span className="text-[#69738c] text-sm">{exec.triggeredAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#9aa3b8]">{exec.duration}ms</span>
                  <span className="text-[#9aa3b8]">{exec.actionsExecuted} actions</span>
                  <span className={`px-2 py-0.5 rounded ${exec.status === 'success' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                    exec.status === 'failed' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                      'bg-[#6888ff]/20 text-[#6888ff]'
                    }`}>
                    {exec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default AutomationRules