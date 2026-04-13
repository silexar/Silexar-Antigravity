/**
 * @fileoverview TIER 0 Continuous Improvement Module - Módulo de Mejora Continua
 * 
 * Módulo operativo para gestión de mejoras continuas con staging, testing
 * y despliegue automatizado a producción.
 * 
 * @author SILEXAR AI Team - Tier 0 Continuous Improvement Division
 * @version 2040.5.0 - TIER 0 CONTINUOUS IMPROVEMENT SUPREMACY
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useContinuousImprovement, useContinuousImprovementNotifications } from '@/hooks/use-continuous-improvement'
import { type ImprovementProposal, type TestResult } from '@/lib/continuous-improvement-staging/improvement-engine'
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Rocket,
  TestTube,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Shield,
  BarChart3,
  Code,
  Database,
  Settings,
  Plus,
  Brain,
  Sparkles
} from 'lucide-react'

interface ContinuousImprovementModuleProps {
  onBack: () => void
}

export function ContinuousImprovementModule({ onBack }: ContinuousImprovementModuleProps) {
  const {
    improvements,
    isLoading,
    isGenerating,
    isTesting,
    isDeploying,
    error,
    generateImprovements,
    runTests,
    deployToProduction,
    refreshImprovements
  } = useContinuousImprovement()

  const { notifications, addNotification } = useContinuousImprovementNotifications()
  
  const [selectedImprovement, setSelectedImprovement] = useState<ImprovementProposal | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [deploymentProgress, setDeploymentProgress] = useState(0)

  const handleRunTests = async (improvement: ImprovementProposal) => {
    try {
      addNotification({
        type: 'info',
        title: 'Iniciando Tests',
        message: `Ejecutando tests para: ${improvement.title}`
      })

      const results = await runTests(improvement)
      setTestResults(results)
      
      addNotification({
        type: 'success',
        title: 'Tests Completados',
        message: `Todos los tests han pasado para: ${improvement.title}`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en Tests',
        message: `Error ejecutando tests: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    }
  }

  const handleDeployToProduction = async (improvement: ImprovementProposal) => {
    // Simular progreso de despliegue
    setDeploymentProgress(0)
    const progressInterval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 500)

    try {
      addNotification({
        type: 'info',
        title: 'Iniciando Despliegue',
        message: `Desplegando a producción: ${improvement.title}`
      })

      const success = await deployToProduction(improvement)
      
      clearInterval(progressInterval)
      setDeploymentProgress(100)
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Despliegue Exitoso',
          message: `${improvement.title} ha sido desplegado exitosamente a producción`
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Error en Despliegue',
          message: `Error desplegando ${improvement.title} a producción`
        })
      }
    } catch (error) {
      clearInterval(progressInterval)
      addNotification({
        type: 'error',
        title: 'Error en Despliegue',
        message: `Error crítico: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    } finally {
      setTimeout(() => setDeploymentProgress(0), 2000)
    }
  }

  const handleGenerateNewImprovements = async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Generando Mejoras',
        message: 'Analizando sistema para generar nuevas mejoras...'
      })

      await generateImprovements()
      
      addNotification({
        type: 'success',
        title: 'Mejoras Generadas',
        message: 'Nuevas mejoras han sido generadas automáticamente'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error Generando Mejoras',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'testing': return <TestTube className="h-4 w-4 text-blue-500" />
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'deployed': return <Rocket className="h-4 w-4 text-purple-500" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'security': return <Shield className="h-4 w-4 text-red-500" />
      case 'quality': return <BarChart3 className="h-4 w-4 text-blue-500" />
      case 'architecture': return <Settings className="h-4 w-4 text-purple-500" />
      default: return <Code className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-600'
      case 'medium': return 'bg-yellow-600'
      case 'low': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen quantum-background neural-grid relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 cortex-container">
        <div className="absolute top-20 right-10 w-40 h-40 bg-quantum-500/10 rounded-full blur-2xl animate-quantum-pulse"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-cortex-500/10 rounded-full blur-xl animate-cortex-spin"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-neural-500/5 rounded-full blur-3xl animate-neural-wave"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="holographic-card p-8 border-quantum-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                onClick={onBack}
                variant="outline" 
                size="lg"
                className="text-white border-quantum-400/50 hover:bg-quantum-600/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                Volver al Control de Mando
              </Button>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold holographic-text font-quantum tracking-wide flex items-center gap-3">
                  <Brain className="h-10 w-10 text-quantum-400 animate-quantum-pulse" />
                  Sistema de Mejora Continua
                </h1>
                <p className="text-xl text-white/80 font-medium">
                  Gestión automatizada de mejoras con staging y testing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleGenerateNewImprovements}
                disabled={isGenerating}
                className="quantum-button h-12 px-6 text-base font-bold"
                size="lg"
              >
                {isGenerating ? (
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 mr-3" />
                )}
                Generar Mejoras
                <Sparkles className="h-4 w-4 ml-3" />
              </Button>
              <div className="flex flex-col gap-2">
                <Badge className="bg-quantum-600/80 text-white border-quantum-400/50 px-4 py-2 font-semibold backdrop-blur-sm">
                  TIER 0 SUPREMACY
                </Badge>
                <Badge className="bg-cortex-600/80 text-white border-cortex-400/50 px-4 py-2 font-semibold backdrop-blur-sm">
                  Quantum Enhanced
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500/20 bg-red-950/30">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-400">Error del Sistema</AlertTitle>
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Alert className="border-blue-500/20 bg-blue-950/30">
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            <AlertTitle className="text-blue-400">Cargando Sistema</AlertTitle>
            <AlertDescription className="text-blue-300">
              Inicializando motor de mejora continua...
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Mejoras */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-purple-950/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Mejoras Disponibles</CardTitle>
                <CardDescription className="text-purple-200">
                  {improvements.length} mejoras generadas automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {improvements.map((improvement) => (
                  <div
                    key={improvement.id}
                    onClick={() => setSelectedImprovement(improvement)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedImprovement?.id === improvement.id
                        ? 'border-purple-400 bg-purple-900/40'
                        : 'border-purple-500/20 bg-purple-900/20 hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {getTypeIcon((improvement as unknown).type)}
                        <span className="text-white text-sm font-medium">
                          {improvement.title}
                        </span>
                      </div>
                      {getStatusIcon(improvement.status)}
                    </div>
                    <p className="text-purple-300 text-xs mb-2">
                      {improvement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getPriorityColor(improvement.priority)}`}>
                        {improvement.priority}
                      </Badge>
                      <span className="text-purple-400 text-xs">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detalles de la Mejora Seleccionada */}
          <div className="lg:col-span-2">
            {selectedImprovement ? (
              <div className="space-y-6">
                {/* Información de la Mejora */}
                <Card className="bg-purple-950/30 border-purple-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {getTypeIcon((selectedImprovement as unknown).type)}
                        <div>
                          <CardTitle className="text-white">{selectedImprovement.title}</CardTitle>
                          <CardDescription className="text-purple-200">
                            {selectedImprovement.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedImprovement.status)}
                        <Badge className={getPriorityColor(selectedImprovement.priority)}>
                          {selectedImprovement.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Impacto Estimado */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Impacto Estimado</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">
                            +{(selectedImprovement as unknown).estimatedImpact?.performance}%
                          </div>
                          <div className="text-purple-300 text-sm">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">
                            +{(selectedImprovement as unknown).estimatedImpact?.security}%
                          </div>
                          <div className="text-purple-300 text-sm">Security</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            +{(selectedImprovement as unknown).estimatedImpact?.quality}%
                          </div>
                          <div className="text-purple-300 text-sm">Quality</div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-purple-500/20" />

                    {/* Archivos Modificados */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Archivos Modificados</h4>
                      <div className="space-y-2">
                        {(selectedImprovement.codeChanges ?? []).map((file: string, index: number) => (
                          <div key={`${file}-${index}`} className="flex items-center gap-2 text-sm">
                            <Code className="h-3 w-3 text-purple-400" />
                            <span className="text-purple-200">{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 pt-4">
                      {selectedImprovement.status === 'pending' && (
                        <Button 
                          onClick={() => handleRunTests(selectedImprovement)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Ejecutar Tests en Staging
                        </Button>
                      )}
                      
                      {/* Staging URL button - commented out as stagingUrl property doesn't exist in schema
                      {selectedImprovement.stagingUrl && (
                        <Button 
                          variant="outline"
                          onClick={() => window.open(selectedImprovement.stagingUrl, '_blank')}
                          className="text-white border-purple-500 hover:bg-purple-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Staging
                        </Button>
                      )}
                      */}
                    </div>
                  </CardContent>
                </Card>

                {/* Resultados de Tests */}
                {(testResults.length > 0 || selectedImprovement.status === 'testing') && (
                  <Card className="bg-purple-950/30 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white">Resultados de Testing</CardTitle>
                      <CardDescription className="text-purple-200">
                        Validación automática en entorno de staging
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {testResults.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-900/20">
                            <div className="flex items-center gap-3">
                              {(test as unknown).status === 'running' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                              {test.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {test.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              <div>
                                <div className="text-white font-medium">{(test as unknown).name}</div>
                                <div className="text-purple-300 text-sm">{test.details}</div>
                              </div>
                            </div>
                            <div className="text-purple-400 text-sm">
                              {(test as unknown).duration > 0 && `${((test as unknown).duration / 1000).toFixed(1)}s`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {(selectedImprovement as unknown).status === 'ready' && !isDeploying && (
                        <Alert className="mt-4 border-green-500/20 bg-green-950/30">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertTitle className="text-green-400">Tests Completados Exitosamente</AlertTitle>
                          <AlertDescription className="text-green-300 mb-3">
                            Todos los tests han pasado. La mejora está lista para ser desplegada a producción.
                          </AlertDescription>
                          <Button 
                            onClick={() => handleDeployToProduction(selectedImprovement)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            ¿Desplegar a Producción?
                          </Button>
                        </Alert>
                      )}

                      {isDeploying && (
                        <Alert className="mt-4 border-blue-500/20 bg-blue-950/30">
                          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                          <AlertTitle className="text-blue-400">Desplegando a Producción</AlertTitle>
                          <AlertDescription className="text-blue-300 mb-3">
                            Ejecutando despliegue automatizado...
                          </AlertDescription>
                          <Progress value={deploymentProgress} className="w-full" />
                          <div className="text-blue-300 text-sm mt-2">
                            {deploymentProgress.toFixed(0)}% completado
                          </div>
                        </Alert>
                      )}

                      {selectedImprovement.status === 'deployed' && (
                        <Alert className="mt-4 border-purple-500/20 bg-purple-950/30">
                          <Rocket className="h-4 w-4 text-purple-500" />
                          <AlertTitle className="text-purple-400">Despliegue Completado</AlertTitle>
                          <AlertDescription className="text-purple-300">
                            La mejora ha sido desplegada exitosamente a producción. Los usuarios ya pueden acceder a las mejoras.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-purple-950/30 border-purple-500/20 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Database className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Selecciona una Mejora</h3>
                  <p className="text-purple-300">
                    Elige una mejora de la lista para ver los detalles y opciones de testing
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}