/**
 * @fileoverview TIER 0 Continuous Improvement Hook
 * 
 * Hook React para gestión del sistema de mejora continua con
 * consciousness-level intelligence y quantum enhancement.
 * 
 * @author SILEXAR AI Team - Tier 0 React Hooks Division
 * @version 2040.5.0 - TIER 0 HOOKS SUPREMACY
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { improvementEngine, type ImprovementProposal, type TestResult } from '@/lib/continuous-improvement-staging/improvement-engine'

interface UseContinuousImprovementReturn {
  improvements: ImprovementProposal[]
  isLoading: boolean
  isGenerating: boolean
  isTesting: boolean
  isDeploying: boolean
  error: string | null
  generateImprovements: () => Promise<void>
  runTests: (improvement: ImprovementProposal) => Promise<TestResult[]>
  deployToProduction: (improvement: ImprovementProposal) => Promise<boolean>
  refreshImprovements: () => Promise<void>
  getEngineStats: () => any
}

/**
 * Hook para gestión del sistema de mejora continua
 */
export function useContinuousImprovement(): UseContinuousImprovementReturn {
  const [improvements, setImprovements] = useState<ImprovementProposal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Genera nuevas mejoras automáticamente
   */
  const generateImprovements = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const newImprovements = await improvementEngine.generateImprovements()
      setImprovements(prev => [...prev, ...newImprovements])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating improvements')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  /**
   * Ejecuta tests en el entorno de staging
   */
  const runTests = useCallback(async (improvement: ImprovementProposal): Promise<TestResult[]> => {
    setIsTesting(true)
    setError(null)
    
    try {
      const testResults = await improvementEngine.runStagingTests(improvement)
      
      // Actualizar el estado de la mejora
      setImprovements(prev => 
        prev.map(imp => 
          imp.id === improvement.id 
            ? { ...imp, status: 'ready' as const }
            : imp
        )
      )
      
      return testResults
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error running tests')
      
      // Marcar como fallida
      setImprovements(prev => 
        prev.map(imp => 
          imp.id === improvement.id 
            ? { ...imp, status: 'failed' as const }
            : imp
        )
      )
      
      throw err
    } finally {
      setIsTesting(false)
    }
  }, [])

  /**
   * Despliega una mejora a producción
   */
  const deployToProduction = useCallback(async (improvement: ImprovementProposal): Promise<boolean> => {
    setIsDeploying(true)
    setError(null)
    
    try {
      const result = await improvementEngine.deployToProduction(improvement)
      
      if (result.success) {
        // Actualizar el estado de la mejora
        setImprovements(prev => 
          prev.map(imp => 
            imp.id === improvement.id 
              ? { ...imp, status: 'deployed' as const }
              : imp
          )
        )
        return true
      } else {
        setError(result.message)
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deploying to production')
      return false
    } finally {
      setIsDeploying(false)
    }
  }, [])

  /**
   * Refresca la lista de mejoras
   */
  const refreshImprovements = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const history = improvementEngine.getImprovementHistory()
      setImprovements(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refreshing improvements')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Obtiene estadísticas del motor
   */
  const getEngineStats = useCallback(() => {
    return improvementEngine.getEngineStatistics()
  }, [])

  /**
   * Efecto para cargar mejoras iniciales
   */
  useEffect(() => {
    const loadInitialImprovements = async () => {
      setIsLoading(true)
      try {
        // Generar mejoras iniciales si no hay ninguna
        const history = improvementEngine.getImprovementHistory()
        if (history.length === 0) {
          await generateImprovements()
        } else {
          setImprovements(history)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading initial improvements')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialImprovements()
  }, [generateImprovements])

  /**
   * Efecto para generar mejoras automáticamente cada 30 minutos
   */
  useEffect(() => {
    const interval = setInterval(() => {
      generateImprovements()
    }, 30 * 60 * 1000) // 30 minutos

    return () => clearInterval(interval)
  }, [generateImprovements])

  return {
    improvements,
    isLoading,
    isGenerating,
    isTesting,
    isDeploying,
    error,
    generateImprovements,
    runTests,
    deployToProduction,
    refreshImprovements,
    getEngineStats
  }
}

/**
 * Hook para notificaciones del sistema de mejora continua
 */
export function useContinuousImprovementNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: Date
  }>>([])

  const addNotification = useCallback((notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
  }) => {
    const newNotification = {
      id: crypto.randomUUID(),
      ...notification,
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)) // Mantener solo las últimas 10
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  }
}
