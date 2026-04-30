'use client'

/**
 * ðŸ¤– SILEXAR PULSE - AI Training Dashboard
 * Control de modelos de IA
 * 
 * @description Gestión de IA:
 * - Métricas de modelos
 * - Reentrenamiento
 * - Precisión y performance
 * - Datasets y versiones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import {
  Brain,
  Zap,
  RefreshCw,
  TrendingUp,
  Database,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Download,
  BarChart3
} from 'lucide-react'
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'

interface AIModel {
  id: string
  name: string
  version: string
  type: 'classification' | 'regression' | 'nlp' | 'recommendation'
  status: 'active' | 'training' | 'inactive' | 'deprecated'
  accuracy: number
  latency: number
  lastTrained: Date
  trainingDuration: number
  totalPredictions: number
  datasetSize: number
  features: number
}

interface TrainingJob {
  id: string
  modelId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  startTime: Date
  estimatedEnd?: Date
  metrics?: {
    accuracy: number
    loss: number
    epoch: number
  }
}

const mockModels: AIModel[] = [
  {
    id: 'mdl_001',
    name: 'Predicción de Churn',
    version: '3.2.1',
    type: 'classification',
    status: 'active',
    accuracy: 94.7,
    latency: 45,
    lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    trainingDuration: 3600,
    totalPredictions: 1250000,
    datasetSize: 50000,
    features: 45
  },
  {
    id: 'mdl_002',
    name: 'Optimización de Campañas',
    version: '2.8.0',
    type: 'recommendation',
    status: 'active',
    accuracy: 89.3,
    latency: 120,
    lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    trainingDuration: 7200,
    totalPredictions: 890000,
    datasetSize: 100000,
    features: 78
  },
  {
    id: 'mdl_003',
    name: 'Análisis de Sentimiento',
    version: '4.0.0',
    type: 'nlp',
    status: 'training',
    accuracy: 91.2,
    latency: 85,
    lastTrained: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    trainingDuration: 10800,
    totalPredictions: 2100000,
    datasetSize: 200000,
    features: 512
  },
  {
    id: 'mdl_004',
    name: 'Predicción de Revenue',
    version: '1.5.2',
    type: 'regression',
    status: 'active',
    accuracy: 87.8,
    latency: 35,
    lastTrained: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    trainingDuration: 5400,
    totalPredictions: 450000,
    datasetSize: 25000,
    features: 32
  },
  {
    id: 'mdl_005',
    name: 'Detección de Anomalías',
    version: '2.1.0',
    type: 'classification',
    status: 'active',
    accuracy: 96.5,
    latency: 15,
    lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    trainingDuration: 1800,
    totalPredictions: 5600000,
    datasetSize: 75000,
    features: 28
  }
]

const mockTrainingJobs: TrainingJob[] = [
  {
    id: 'job_001',
    modelId: 'mdl_003',
    status: 'running',
    progress: 67,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedEnd: new Date(Date.now() + 1 * 60 * 60 * 1000),
    metrics: { accuracy: 92.1, loss: 0.082, epoch: 134 }
  }
]

export function AITrainingDashboard() {
  const [models] = useState<AIModel[]>(mockModels)
  const [trainingJobs] = useState<TrainingJob[]>(mockTrainingJobs)
  const [isLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { background: `${N.accent}20`, color: N.accent }
      case 'training': return { background: `${N.accent}20`, color: N.accent }
      case 'inactive': return { background: `${N.dark}20`, color: N.textSub }
      case 'deprecated': return { background: `${N.accent}20`, color: N.accent }
      default: return { background: `${N.dark}20`, color: N.textSub }
    }
  }

  const getStatusBadge = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (status) {
      case 'active': return 'success'
      case 'training': return 'info'
      case 'inactive': return 'neutral'
      case 'deprecated': return 'danger'
      default: return 'neutral'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target style={{ width: '16px', height: '16px', color: N.accent }} />
      case 'regression': return <TrendingUp style={{ width: '16px', height: '16px', color: N.accent }} />
      case 'nlp': return <Brain style={{ width: '16px', height: '16px', color: N.dark }} />
      case 'recommendation': return <Zap style={{ width: '16px', height: '16px', color: N.accent }} />
      default: return <Brain style={{ width: '16px', height: '16px', color: N.textSub }} />
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid ${N.dark}30',
            borderTopColor: N.dark,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: N.textSub }}>Cargando AI Dashboard...</p>
        </div>
      </div>
    )
  }

  const avgAccuracy = (models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)
  const totalPredictions = models.reduce((sum, m) => sum + m.totalPredictions, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.text, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Brain style={{ width: '20px', height: '20px', color: N.dark }} />
          AI Training Dashboard
        </h3>
        <NeuButton variant="primary">
          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          Sincronizar Modelos
        </NeuButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: N.base, textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text, margin: 0 }}>{models.length}</p>
          <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Modelos</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: `${N.accent}15`, textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>
            {models.filter(m => m.status === 'active').length}
          </p>
          <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Activos</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: `${N.accent}15`, textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>
            {trainingJobs.filter(j => j.status === 'running').length}
          </p>
          <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Entrenando</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: `${N.dark}15`, textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.dark, margin: 0 }}>
            {avgAccuracy}%
          </p>
          <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Precisión Prom</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: `${N.accent}10`, textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>
            {formatNumber(totalPredictions)}
          </p>
          <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Predicciones</p>
        </NeuCard>
      </div>

      {/* Active Training Jobs */}
      {trainingJobs.filter(j => j.status === 'running').length > 0 && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '16px', background: N.base }}>
          <h4 style={{ color: N.text, fontWeight: '500', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '16px', height: '16px', color: N.accent }} />
            Entrenamiento en Progreso
          </h4>
          {trainingJobs.filter(j => j.status === 'running').map(job => {
            const model = models.find(m => m.id === job.modelId)
            return (
              <div key={job.id} style={{ padding: '16px', background: `${N.dark}20`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: N.text, fontWeight: '500' }}>{model?.name}</span>
                  <span style={{ fontSize: '0.875rem', color: N.accent }}>{job.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: `${N.dark}30`, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${N.accent}, ${N.dark})`,
                      borderRadius: '4px',
                      width: `${job.progress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                {job.metrics && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.75rem', color: N.textSub }}>
                    <span>Accuracy: <strong style={{ color: N.accent }}>{job.metrics.accuracy}%</strong></span>
                    <span>Loss: <strong style={{ color: N.accent }}>{job.metrics.loss}</strong></span>
                    <span>Epoch: <strong style={{ color: N.accent }}>{job.metrics.epoch}</strong></span>
                  </div>
                )}
              </div>
            )
          })}
        </NeuCard>
      )}

      {/* Models Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {models.map(model => (
          <NeuCard
            key={model.id}
            style={{
              boxShadow: getShadow(),
              padding: '16px',
              background: N.base,
              cursor: 'pointer',
              border: selectedModel?.id === model.id ? `1px solid ${N.dark}50` : `1px solid ${N.dark}20`,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', cursor: 'pointer' }} onClick={() => setSelectedModel(model)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getTypeIcon(model.type)}
                <div>
                  <span style={{ color: N.text, fontWeight: '500', display: 'block' }}>{model.name}</span>
                  <span style={{ fontSize: '0.75rem', color: N.textSub }}>v{model.version}</span>
                </div>
              </div>
              <StatusBadge status={getStatusBadge(model.status)} label={model.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: `${N.dark}15`, borderRadius: '6px' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>{model.accuracy}%</p>
                <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Precisión</p>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: `${N.dark}15`, borderRadius: '6px' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>{model.latency}ms</p>
                <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Latencia</p>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: `${N.dark}15`, borderRadius: '6px' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.dark, margin: 0 }}>{formatNumber(model.totalPredictions)}</p>
                <p style={{ fontSize: '0.75rem', color: N.textSub, margin: 0 }}>Predicciones</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database style={{ width: '12px', height: '12px' }} />
                {formatNumber(model.datasetSize)} samples
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px', height: '12px' }} />
                {model.lastTrained.toLocaleDateString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {model.status !== 'training' && (
                <div style={{ flex: 1 }}>
                  <NeuButton variant="secondary">
                    <RefreshCw style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                    Reentrenar
                  </NeuButton>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <NeuButton variant="secondary">
                  <BarChart3 style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                  Métricas
                </NeuButton>
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Model Details */}
      {selectedModel && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '24px', background: N.base }}>
          <h4 style={{ color: N.text, fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getTypeIcon(selectedModel.type)}
            {selectedModel.name} - Detalles
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '0.875rem' }}>
            <div>
              <p style={{ color: N.textSub, marginBottom: '4px' }}>Tipo de Modelo</p>
              <p style={{ color: N.text, textTransform: 'capitalize' }}>{selectedModel.type}</p>
            </div>
            <div>
              <p style={{ color: N.textSub, marginBottom: '4px' }}>Features</p>
              <p style={{ color: N.text }}>{selectedModel.features}</p>
            </div>
            <div>
              <p style={{ color: N.textSub, marginBottom: '4px' }}>Dataset Size</p>
              <p style={{ color: N.text }}>{formatNumber(selectedModel.datasetSize)}</p>
            </div>
            <div>
              <p style={{ color: N.textSub, marginBottom: '4px' }}>Training Time</p>
              <p style={{ color: N.text }}>{formatDuration(selectedModel.trainingDuration)}</p>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default AITrainingDashboard
