'use client'

/**
 * 🤖 SILEXAR PULSE - AI Training Dashboard
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

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
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

export function AITrainingDashboard() {
  const [models, setModels] = useState<AIModel[]>([])
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)

  useEffect(() => {
    loadAIData()
  }, [])

  const loadAIData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setModels([
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
    ])

    setTrainingJobs([
      {
        id: 'job_001',
        modelId: 'mdl_003',
        status: 'running',
        progress: 67,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        estimatedEnd: new Date(Date.now() + 1 * 60 * 60 * 1000),
        metrics: { accuracy: 92.1, loss: 0.082, epoch: 134 }
      }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'training': return 'bg-blue-500/20 text-blue-400'
      case 'inactive': return 'bg-slate-500/20 text-slate-400'
      case 'deprecated': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="w-4 h-4 text-blue-400" />
      case 'regression': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'nlp': return <Brain className="w-4 h-4 text-purple-400" />
      case 'recommendation': return <Zap className="w-4 h-4 text-yellow-400" />
      default: return <Brain className="w-4 h-4 text-slate-400" />
    }
  }

  const startTraining = (modelId: string) => {
    
    const newJob: TrainingJob = {
      id: `job_${Date.now()}`,
      modelId,
      status: 'queued',
      progress: 0,
      startTime: new Date()
    }
    setTrainingJobs(prev => [...prev, newJob])
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'training' } : m))
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando AI Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Training Dashboard
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" />
          Sincronizar Modelos
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{models.length}</p>
          <p className="text-xs text-slate-400">Modelos</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {models.filter(m => m.status === 'active').length}
          </p>
          <p className="text-xs text-slate-400">Activos</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">
            {trainingJobs.filter(j => j.status === 'running').length}
          </p>
          <p className="text-xs text-slate-400">Entrenando</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">
            {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400">Precisión Prom</p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">
            {formatNumber(models.reduce((sum, m) => sum + m.totalPredictions, 0))}
          </p>
          <p className="text-xs text-slate-400">Predicciones</p>
        </div>
      </div>

      {/* Active Training Jobs */}
      {trainingJobs.filter(j => j.status === 'running').length > 0 && (
        <NeuromorphicCard variant="glow" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
            Entrenamiento en Progreso
          </h4>
          {trainingJobs.filter(j => j.status === 'running').map(job => {
            const model = models.find(m => m.id === job.modelId)
            return (
              <div key={job.id} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{model?.name}</span>
                  <span className="text-sm text-blue-400">{job.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                {job.metrics && (
                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                    <span>Accuracy: <strong className="text-green-400">{job.metrics.accuracy}%</strong></span>
                    <span>Loss: <strong className="text-yellow-400">{job.metrics.loss}</strong></span>
                    <span>Epoch: <strong className="text-blue-400">{job.metrics.epoch}</strong></span>
                  </div>
                )}
              </div>
            )
          })}
        </NeuromorphicCard>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-2 gap-4">
        {models.map(model => (
          <NeuromorphicCard 
            key={model.id}
            variant="embossed" 
            className={`p-4 cursor-pointer hover:border-purple-500/30 transition-all ${
              selectedModel?.id === model.id ? 'ring-1 ring-purple-500/50' : ''
            }`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(model.type)}
                <div>
                  <span className="text-white font-medium block">{model.name}</span>
                  <span className="text-xs text-slate-500">v{model.version}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(model.status)}`}>
                {model.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-slate-800/30 rounded">
                <p className="text-lg font-bold text-green-400">{model.accuracy}%</p>
                <p className="text-xs text-slate-500">Precisión</p>
              </div>
              <div className="text-center p-2 bg-slate-800/30 rounded">
                <p className="text-lg font-bold text-blue-400">{model.latency}ms</p>
                <p className="text-xs text-slate-500">Latencia</p>
              </div>
              <div className="text-center p-2 bg-slate-800/30 rounded">
                <p className="text-lg font-bold text-purple-400">{formatNumber(model.totalPredictions)}</p>
                <p className="text-xs text-slate-500">Predicciones</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {formatNumber(model.datasetSize)} samples
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Entrenado {model.lastTrained.toLocaleDateString()}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {model.status !== 'training' && (
                <NeuromorphicButton 
                  variant="secondary" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); startTraining(model.id); }}
                  className="flex-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reentrenar
                </NeuromorphicButton>
              )}
              <NeuromorphicButton variant="secondary" size="sm" className="flex-1">
                <BarChart3 className="w-3 h-3 mr-1" />
                Métricas
              </NeuromorphicButton>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Model Details */}
      {selectedModel && (
        <NeuromorphicCard variant="glow" className="p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            {getTypeIcon(selectedModel.type)}
            {selectedModel.name} - Detalles
          </h4>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1">Tipo de Modelo</p>
              <p className="text-white capitalize">{selectedModel.type}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Features</p>
              <p className="text-white">{selectedModel.features}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Dataset Size</p>
              <p className="text-white">{formatNumber(selectedModel.datasetSize)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Training Time</p>
              <p className="text-white">{formatDuration(selectedModel.trainingDuration)}</p>
            </div>
          </div>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default AITrainingDashboard
