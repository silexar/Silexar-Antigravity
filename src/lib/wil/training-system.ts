/**
 * WIL TRAINING SYSTEM: Sistema de Entrenamiento y Capacitación Automática
 * 
 * @description Sistema de entrenamiento más avanzado del mundo para WIL,
 * con capacitación personalizada, evaluación continua y certificación automática
 * 
 * @version 2040.1.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - WIL Training Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { z } from 'zod'
import { logger } from '@/lib/observability';
import { EventEmitter } from 'events'

/**
 * Schemas de Validación
 */
const TrainingModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['system_basics', 'advanced_features', 'troubleshooting', 'best_practices', 'cortex_integration']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimatedDuration: z.number(), // minutos
  prerequisites: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  content: z.object({
    theory: z.array(z.object({
      type: z.enum(['text', 'video', 'interactive', 'simulation']),
      content: z.string(),
      duration: z.number()
    })),
    exercises: z.array(z.object({
      id: z.string(),
      type: z.enum(['quiz', 'practical', 'scenario', 'simulation']),
      question: z.string(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string(),
      explanation: z.string(),
      points: z.number()
    })),
    assessments: z.array(z.object({
      id: z.string(),
      type: z.enum(['final_quiz', 'practical_test', 'project', 'certification']),
      passingScore: z.number(),
      maxAttempts: z.number(),
      timeLimit: z.number().optional()
    }))
  }),
  tags: z.array(z.string()),
  version: z.string(),
  lastUpdated: z.date()
})

const UserProgressSchema = z.object({
  userId: z.string(),
  moduleId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'certified']),
  progress: z.number().min(0).max(100),
  startDate: z.date(),
  completionDate: z.date().optional(),
  currentSection: z.string().optional(),
  scores: z.array(z.object({
    exerciseId: z.string(),
    score: z.number(),
    attempts: z.number(),
    timeSpent: z.number(),
    timestamp: z.date()
  })),
  totalTimeSpent: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string())
})

const LearningPathSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  modules: z.array(z.string()),
  estimatedDuration: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  personalizedFor: z.object({
    role: z.string(),
    skillLevel: z.string(),
    goals: z.array(z.string()),
    timeAvailable: z.number() // minutos por semana
  }),
  adaptiveSettings: z.object({
    adjustDifficulty: z.boolean(),
    skipKnownContent: z.boolean(),
    focusOnWeaknesses: z.boolean(),
    provideExtraExercises: z.boolean()
  }),
  progress: z.object({
    completedModules: z.number(),
    totalModules: z.number(),
    overallScore: z.number(),
    estimatedCompletion: z.date()
  })
})

/**
 * Interfaces principales
 */
interface TrainingModule extends z.infer<typeof TrainingModuleSchema> {}
interface UserProgress extends z.infer<typeof UserProgressSchema> {}
interface LearningPath extends z.infer<typeof LearningPathSchema> {}

interface TrainingSession {
  id: string
  userId: string
  moduleId: string
  startTime: Date
  endTime?: Date
  activities: TrainingActivity[]
  performance: SessionPerformance
}

interface TrainingActivity {
  id: string
  type: 'reading' | 'exercise' | 'quiz' | 'simulation' | 'practice'
  startTime: Date
  endTime: Date
  result?: {
    score: number
    correct: boolean
    timeSpent: number
    attempts: number
  }
}

interface SessionPerformance {
  totalScore: number
  accuracy: number
  timeEfficiency: number
  engagementLevel: number
  comprehensionRate: number
}

interface CertificationResult {
  userId: string
  moduleId: string
  certificateId: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  score: number
  issueDate: Date
  expiryDate: Date
  skills: string[]
  validatedBy: string
}

/**
 * Clase Principal WIL Training System
 */
export class WILTrainingSystem extends EventEmitter {
  private static instance: WILTrainingSystem
  private modules: Map<string, TrainingModule> = new Map()
  private userProgress: Map<string, Map<string, UserProgress>> = new Map()
  private learningPaths: Map<string, LearningPath> = new Map()
  private activeSessions: Map<string, TrainingSession> = new Map()
  
  // Métricas del sistema
  private metrics = {
    totalUsers: 0,
    activeUsers: 0,
    completedModules: 0,
    averageScore: 0,
    averageCompletionTime: 0,
    certificationRate: 0,
    userSatisfaction: 0
  }

  private constructor() {
    super()
    this.initializeTrainingModules()
  }

  public static getInstance(): WILTrainingSystem {
    if (!WILTrainingSystem.instance) {
      WILTrainingSystem.instance = new WILTrainingSystem()
    }
    return WILTrainingSystem.instance
  }

  /**
   * Crear ruta de aprendizaje personalizada
   */
  public async createPersonalizedLearningPath(
    userId: string,
    userProfile: {
      role: string
      skillLevel: string
      goals: string[]
      timeAvailable: number
    }
  ): Promise<LearningPath> {
    try {
      // Evaluar nivel actual del usuario
      const currentLevel = await this.assessUserLevel(userId)
      
      // Seleccionar módulos apropiados
      const recommendedModules = await this.selectModulesForUser(userProfile, currentLevel)
      
      // Crear ruta personalizada
      const learningPath: LearningPath = {
        id: `path_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId,
        title: `Ruta Personalizada para ${userProfile.role}`,
        description: `Entrenamiento adaptado a tu rol y objetivos específicos`,
        modules: recommendedModules.map(m => m.id),
        estimatedDuration: recommendedModules.reduce((sum, m) => sum + m.estimatedDuration, 0),
        difficulty: this.calculatePathDifficulty(recommendedModules),
        personalizedFor: userProfile,
        adaptiveSettings: {
          adjustDifficulty: true,
          skipKnownContent: true,
          focusOnWeaknesses: true,
          provideExtraExercises: userProfile.skillLevel === 'beginner'
        },
        progress: {
          completedModules: 0,
          totalModules: recommendedModules.length,
          overallScore: 0,
          estimatedCompletion: this.calculateEstimatedCompletion(recommendedModules, userProfile.timeAvailable)
        }
      }

      this.learningPaths.set(learningPath.id, learningPath)
      this.emit('learningPathCreated', { userId, pathId: learningPath.id })

      return learningPath
      
    } catch (error) {
      logger.error('Error creando ruta de aprendizaje:', error instanceof Error ? error : undefined)
      throw new Error('Fallo en creación de ruta personalizada')
    }
  }

  /**
   * Iniciar sesión de entrenamiento
   */
  public async startTrainingSession(userId: string, moduleId: string): Promise<TrainingSession> {
    try {
      const module = this.modules.get(moduleId)
      if (!module) {
        throw new Error(`Módulo ${moduleId} no encontrado`)
      }

      // Verificar prerrequisitos
      const hasPrerequisites = await this.checkPrerequisites(userId, module.prerequisites)
      if (!hasPrerequisites) {
        throw new Error('Prerrequisitos no cumplidos')
      }

      // Crear sesión de entrenamiento
      const session: TrainingSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId,
        moduleId,
        startTime: new Date(),
        activities: [],
        performance: {
          totalScore: 0,
          accuracy: 0,
          timeEfficiency: 0,
          engagementLevel: 0,
          comprehensionRate: 0
        }
      }

      this.activeSessions.set(session.id, session)
      
      // Actualizar progreso del usuario
      await this.updateUserProgress(userId, moduleId, 'in_progress', 0)
      
      this.emit('sessionStarted', { userId, moduleId, sessionId: session.id })
      
      return session
      
    } catch (error) {
      logger.error('Error iniciando sesión de entrenamiento:', error instanceof Error ? error : undefined)
      throw new Error('Fallo al iniciar sesión de entrenamiento')
    }
  }

  /**
   * Procesar actividad de entrenamiento
   */
  public async processTrainingActivity(
    sessionId: string,
    activityType: string,
    activityData: Record<string, unknown>
  ): Promise<{
    correct: boolean
    score: number
    feedback: string
    nextRecommendation: string
  }> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Sesión no encontrada')
      }

      const module = this.modules.get(session.moduleId)
      if (!module) {
        throw new Error('Módulo no encontrado')
      }

      // Procesar según tipo de actividad
      let result: { score: number; correct: boolean; timeSpent?: number; attempts?: number }

      switch (activityType) {
        case 'quiz':
          result = await this.processQuizActivity(activityData, module)
          break
        case 'practical':
          result = await this.processPracticalActivity(activityData, module)
          break
        case 'simulation':
          result = await this.processSimulationActivity(activityData, module)
          break
        default:
          throw new Error(`Tipo de actividad no soportado: ${activityType}`)
      }

      // Registrar actividad
      const activity: TrainingActivity = {
        id: `activity_${Date.now()}`,
        type: activityType as TrainingActivity['type'],
        startTime: new Date(Date.now() - (result.timeSpent || 0)),
        endTime: new Date(),
        result: {
          score: result.score,
          correct: result.correct,
          timeSpent: result.timeSpent || 0,
          attempts: result.attempts || 1
        }
      }

      session.activities.push(activity)
      
      // Actualizar performance de la sesión
      await this.updateSessionPerformance(session)
      
      // Generar feedback personalizado
      const feedback = await this.generatePersonalizedFeedback(session.userId, result, module)
      
      // Recomendar siguiente acción
      const nextRecommendation = await this.getNextRecommendation(session.userId, session.moduleId, result)
      
      this.emit('activityCompleted', { 
        sessionId, 
        userId: session.userId, 
        activityType, 
        result 
      })

      return {
        correct: result.correct,
        score: result.score,
        feedback,
        nextRecommendation
      }
      
    } catch (error) {
      logger.error('Error procesando actividad:', error instanceof Error ? error : undefined)
      throw new Error('Fallo en procesamiento de actividad')
    }
  }

  /**
   * Completar módulo de entrenamiento
   */
  public async completeTrainingModule(sessionId: string): Promise<{
    completed: boolean
    finalScore: number
    certificateEarned: boolean
    certificate?: CertificationResult
    recommendations: string[]
  }> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Sesión no encontrada')
      }

      session.endTime = new Date()
      
      // Calcular score final
      const finalScore = this.calculateFinalScore(session)
      
      // Determinar si se completa el módulo
      const passingScore = 70 // Configurable por módulo
      const completed = finalScore >= passingScore
      
      // Actualizar progreso del usuario
      await this.updateUserProgress(
        session.userId, 
        session.moduleId, 
        completed ? 'completed' : 'in_progress', 
        completed ? 100 : Math.min(95, finalScore)
      )

      // Verificar si merece certificación
      let certificate: CertificationResult | undefined
      let certificateEarned = false
      
      if (completed && finalScore >= 85) {
        certificate = await this.issueCertificate(session.userId, session.moduleId, finalScore)
        certificateEarned = true
      }

      // Generar recomendaciones
      const recommendations = await this.generateCompletionRecommendations(session.userId, session.moduleId, finalScore)
      
      // Limpiar sesión activa
      this.activeSessions.delete(sessionId)
      
      // Actualizar métricas
      this.updateSystemMetrics(completed, finalScore)
      
      this.emit('moduleCompleted', {
        userId: session.userId,
        moduleId: session.moduleId,
        completed,
        finalScore,
        certificateEarned
      })

      return {
        completed,
        finalScore,
        certificateEarned,
        certificate,
        recommendations
      }
      
    } catch (error) {
      logger.error('Error completando módulo:', error instanceof Error ? error : undefined)
      throw new Error('Fallo en completación de módulo')
    }
  }

  /**
   * Obtener progreso del usuario
   */
  public getUserProgress(userId: string): {
    overallProgress: number
    completedModules: number
    totalModules: number
    certificates: number
    averageScore: number
    timeSpent: number
    currentPath?: LearningPath
    recommendations: string[]
  } {
    try {
      const userProgressMap = this.userProgress.get(userId) || new Map()
      const progressArray = Array.from(userProgressMap.values())
      
      const completedModules = progressArray.filter(p => p.status === 'completed').length
      const totalModules = this.modules.size
      const certificates = progressArray.filter(p => p.status === 'certified').length
      
      const averageScore = progressArray.length > 0 
        ? progressArray.reduce((sum, p) => sum + p.progress, 0) / progressArray.length
        : 0
        
      const timeSpent = progressArray.reduce((sum, p) => sum + p.totalTimeSpent, 0)
      
      // Buscar ruta de aprendizaje actual
      const currentPath = Array.from(this.learningPaths.values())
        .find(path => path.userId === userId)
      
      // Generar recomendaciones
      const recommendations = this.generateUserRecommendations(userId, progressArray)

      return {
        overallProgress: (completedModules / totalModules) * 100,
        completedModules,
        totalModules,
        certificates,
        averageScore,
        timeSpent,
        currentPath,
        recommendations
      }
      
    } catch (error) {
      logger.error('Error obteniendo progreso:', error instanceof Error ? error : undefined)
      return {
        overallProgress: 0,
        completedModules: 0,
        totalModules: 0,
        certificates: 0,
        averageScore: 0,
        timeSpent: 0,
        recommendations: []
      }
    }
  }

  /**
   * Obtener métricas del sistema
   */
  public getSystemMetrics(): typeof this.metrics {
    return { ...this.metrics }
  }

  /**
   * Métodos privados
   */
  private initializeTrainingModules(): void {
    // Módulos de entrenamiento predefinidos
    const modules: TrainingModule[] = [
      {
        id: 'wil_basics',
        title: 'Fundamentos de WIL',
        description: 'Introducción al asistente WIL y sus capacidades básicas',
        category: 'system_basics',
        difficulty: 'beginner',
        estimatedDuration: 30,
        prerequisites: [],
        learningObjectives: [
          'Entender qué es WIL y sus capacidades',
          'Aprender a interactuar efectivamente con WIL',
          'Conocer los comandos básicos y funciones principales'
        ],
        content: {
          theory: [
            {
              type: 'text',
              content: 'WIL es el asistente de IA más avanzado para entornos empresariales...',
              duration: 10
            }
          ],
          exercises: [
            {
              id: 'ex_001',
              type: 'quiz',
              question: '¿Qué significa WIL?',
              options: ['Work Intelligence Layer', 'Workforce Intelligence Layer', 'Web Intelligence Layer'],
              correctAnswer: 'Workforce Intelligence Layer',
              explanation: 'WIL significa Workforce Intelligence Layer, diseñado para asistir a la fuerza laboral.',
              points: 10
            }
          ],
          assessments: [
            {
              id: 'assess_001',
              type: 'final_quiz',
              passingScore: 70,
              maxAttempts: 3,
              timeLimit: 15
            }
          ]
        },
        tags: ['basics', 'introduction', 'fundamentals'],
        version: '1.0',
        lastUpdated: new Date()
      },
      {
        id: 'cortex_integration',
        title: 'Integración con Motores Cortex',
        description: 'Aprende a usar WIL con todos los motores Cortex del sistema',
        category: 'cortex_integration',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        prerequisites: ['wil_basics'],
        learningObjectives: [
          'Entender la integración WIL-Cortex',
          'Usar WIL para acceder a funciones Cortex',
          'Optimizar workflows con IA integrada'
        ],
        content: {
          theory: [
            {
              type: 'interactive',
              content: 'Los motores Cortex proporcionan capacidades especializadas...',
              duration: 20
            }
          ],
          exercises: [
            {
              id: 'ex_002',
              type: 'practical',
              question: 'Usa WIL para obtener un análisis de riesgo usando Cortex-Risk',
              correctAnswer: 'Comando ejecutado correctamente',
              explanation: 'WIL puede acceder a Cortex-Risk para análisis automático.',
              points: 15
            }
          ],
          assessments: [
            {
              id: 'assess_002',
              type: 'practical_test',
              passingScore: 75,
              maxAttempts: 2,
              timeLimit: 30
            }
          ]
        },
        tags: ['cortex', 'integration', 'advanced'],
        version: '1.0',
        lastUpdated: new Date()
      }
    ]

    modules.forEach(module => {
      this.modules.set(module.id, module)
    })
  }

  private async assessUserLevel(userId: string): Promise<string> {
    // Evaluar nivel actual basado en progreso previo
    const userProgressMap = this.userProgress.get(userId)
    if (!userProgressMap || userProgressMap.size === 0) {
      return 'beginner'
    }

    const progressArray = Array.from(userProgressMap.values())
    const averageScore = progressArray.reduce((sum, p) => sum + p.progress, 0) / progressArray.length
    
    if (averageScore >= 90) return 'expert'
    if (averageScore >= 75) return 'advanced'
    if (averageScore >= 60) return 'intermediate'
    return 'beginner'
  }

  private async selectModulesForUser(userProfile: { role: string; skillLevel: string; goals: string[]; timeAvailable: number }, currentLevel: string): Promise<TrainingModule[]> {
    const allModules = Array.from(this.modules.values())
    
    // Filtrar por nivel y rol
    return allModules.filter(module => {
      const levelMatch = this.isLevelAppropriate(module.difficulty, currentLevel)
      const roleMatch = this.isModuleRelevantForRole(module, userProfile.role)
      return levelMatch && roleMatch
    })
  }

  private isLevelAppropriate(moduleDifficulty: string, userLevel: string): boolean {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert']
    const moduleIndex = levels.indexOf(moduleDifficulty)
    const userIndex = levels.indexOf(userLevel)
    
    // Permitir módulos del mismo nivel o hasta 1 nivel superior
    return moduleIndex <= userIndex + 1
  }

  private isModuleRelevantForRole(module: TrainingModule, role: string): boolean {
    // Lógica para determinar relevancia por rol
    const roleModuleMap: Record<string, string[]> = {
      'admin': ['system_basics', 'advanced_features', 'troubleshooting'],
      'user': ['system_basics', 'best_practices'],
      'manager': ['system_basics', 'advanced_features', 'best_practices'],
      'developer': ['system_basics', 'advanced_features', 'cortex_integration', 'troubleshooting']
    }
    
    const relevantCategories = roleModuleMap[role] || ['system_basics']
    return relevantCategories.includes(module.category)
  }

  private calculatePathDifficulty(modules: TrainingModule[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const difficulties = modules.map(m => m.difficulty)
    const levels = ['beginner', 'intermediate', 'advanced', 'expert']
    
    const averageLevel = difficulties.reduce((sum, diff) => sum + levels.indexOf(diff), 0) / difficulties.length
    return levels[Math.round(averageLevel)] as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }

  private calculateEstimatedCompletion(modules: TrainingModule[], timeAvailable: number): Date {
    const totalDuration = modules.reduce((sum, m) => sum + m.estimatedDuration, 0)
    const weeksNeeded = Math.ceil(totalDuration / timeAvailable)
    
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + (weeksNeeded * 7))
    
    return completionDate
  }

  private async checkPrerequisites(userId: string, prerequisites: string[]): Promise<boolean> {
    if (prerequisites.length === 0) return true
    
    const userProgressMap = this.userProgress.get(userId)
    if (!userProgressMap) return false
    
    return prerequisites.every(prereq => {
      const progress = userProgressMap.get(prereq)
      return progress && progress.status === 'completed'
    })
  }

  private async updateUserProgress(userId: string, moduleId: string, status: string, progress: number): Promise<void> {
    let userProgressMap = this.userProgress.get(userId)
    if (!userProgressMap) {
      userProgressMap = new Map()
      this.userProgress.set(userId, userProgressMap)
    }

    let moduleProgress = userProgressMap.get(moduleId)
    if (!moduleProgress) {
      moduleProgress = {
        userId,
        moduleId,
        status: 'not_started' as UserProgress['status'],
        progress: 0,
        startDate: new Date(),
        scores: [],
        totalTimeSpent: 0,
        strengths: [],
        weaknesses: [],
        recommendations: []
      }
    }

    moduleProgress.status = status as UserProgress['status']
    moduleProgress.progress = progress
    
    if (status === 'completed') {
      moduleProgress.completionDate = new Date()
    }

    userProgressMap.set(moduleId, moduleProgress)
  }

  private async processQuizActivity(activityData: Record<string, unknown>, module: TrainingModule): Promise<{ correct: boolean; score: number; timeSpent: number; attempts: number; explanation: string }> {
    // Procesar actividad de quiz
    const exercise = module.content.exercises.find(ex => ex.id === activityData.exerciseId)
    if (!exercise) {
      throw new Error('Ejercicio no encontrado')
    }

    const correct = activityData.answer === exercise.correctAnswer
    const score = correct ? exercise.points : 0

    return {
      correct,
      score,
      timeSpent: typeof activityData.timeSpent === 'number' ? activityData.timeSpent : 0,
      attempts: typeof activityData.attempts === 'number' ? activityData.attempts : 1,
      explanation: exercise.explanation
    }
  }

  private async processPracticalActivity(activityData: Record<string, unknown>, module: TrainingModule): Promise<{ correct: boolean; score: number; timeSpent: number; attempts: number; feedback: string }> {
    // Procesar actividad práctica (simulada)
    const success = Math.random() > 0.3 // 70% de éxito simulado
    
    return {
      correct: success,
      score: success ? 20 : 5,
      timeSpent: typeof activityData.timeSpent === 'number' ? activityData.timeSpent : 0,
      attempts: typeof activityData.attempts === 'number' ? activityData.attempts : 1,
      feedback: success ? 'Excelente trabajo!' : 'Inténtalo de nuevo'
    }
  }

  private async processSimulationActivity(activityData: Record<string, unknown>, module: TrainingModule): Promise<{ correct: boolean; score: number; timeSpent: number; attempts: number; performance: number }> {
    // Procesar simulación (simulada)
    const performance = Math.random() * 100
    
    return {
      correct: performance > 60,
      score: Math.round(performance / 5), // 0-20 puntos
      timeSpent: typeof activityData.timeSpent === 'number' ? activityData.timeSpent : 0,
      attempts: 1,
      performance
    }
  }

  private async updateSessionPerformance(session: TrainingSession): Promise<void> {
    const activities = session.activities
    if (activities.length === 0) return

    const totalScore = activities.reduce((sum, act) => sum + (act.result?.score || 0), 0)
    const correctAnswers = activities.filter(act => act.result?.correct).length
    const totalTime = activities.reduce((sum, act) => sum + (act.result?.timeSpent || 0), 0)

    session.performance = {
      totalScore,
      accuracy: (correctAnswers / activities.length) * 100,
      timeEfficiency: this.calculateTimeEfficiency(activities),
      engagementLevel: this.calculateEngagementLevel(activities),
      comprehensionRate: (correctAnswers / activities.length) * 100
    }
  }

  private calculateTimeEfficiency(activities: TrainingActivity[]): number {
    // Calcular eficiencia de tiempo basada en tiempo esperado vs real
    return Math.max(0, 100 - (activities.length * 10)) // Simulado
  }

  private calculateEngagementLevel(activities: TrainingActivity[]): number {
    // Calcular nivel de engagement basado en patrones de actividad
    return Math.min(100, activities.length * 15) // Simulado
  }

  private async generatePersonalizedFeedback(userId: string, result: { score: number; correct: boolean }, module: TrainingModule): Promise<string> {
    const feedbacks = [
      '¡Excelente trabajo! Continúa así.',
      'Buen progreso. Considera revisar los conceptos clave.',
      'Necesitas más práctica en esta área. Te recomiendo ejercicios adicionales.',
      'Perfecto dominio del tema. Estás listo para el siguiente nivel.'
    ]
    
    const index = Math.min(feedbacks.length - 1, Math.floor(result.score / 25))
    return feedbacks[index]
  }

  private async getNextRecommendation(userId: string, moduleId: string, result: { correct: boolean; score: number }): Promise<string> {
    if (result.correct && result.score > 15) {
      return 'Continúa con el siguiente ejercicio'
    } else if (result.score > 10) {
      return 'Revisa el material teórico antes de continuar'
    } else {
      return 'Te recomiendo repetir este ejercicio'
    }
  }

  private calculateFinalScore(session: TrainingSession): number {
    const activities = session.activities
    if (activities.length === 0) return 0

    const totalPossibleScore = activities.length * 20 // Asumiendo 20 puntos máximo por actividad
    const actualScore = activities.reduce((sum, act) => sum + (act.result?.score || 0), 0)
    
    return Math.round((actualScore / totalPossibleScore) * 100)
  }

  private async issueCertificate(userId: string, moduleId: string, score: number): Promise<CertificationResult> {
    const module = this.modules.get(moduleId)
    if (!module) {
      throw new Error('Módulo no encontrado')
    }

    const certificate: CertificationResult = {
      userId,
      moduleId,
      certificateId: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      level: score >= 95 ? 'expert' : score >= 85 ? 'advanced' : 'intermediate',
      score,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
      skills: module.learningObjectives,
      validatedBy: 'WIL Training System'
    }

    // Actualizar progreso a certificado
    await this.updateUserProgress(userId, moduleId, 'certified', 100)

    return certificate
  }

  private async generateCompletionRecommendations(userId: string, moduleId: string, score: number): Promise<string[]> {
    const recommendations = []

    if (score >= 90) {
      recommendations.push('¡Excelente! Considera tomar módulos más avanzados')
      recommendations.push('Podrías ayudar a otros usuarios como mentor')
    } else if (score >= 75) {
      recommendations.push('Buen trabajo. Practica más para dominar completamente el tema')
      recommendations.push('Revisa las áreas donde tuviste más dificultades')
    } else {
      recommendations.push('Considera repetir algunas secciones para mejorar tu comprensión')
      recommendations.push('Solicita ayuda adicional si es necesario')
    }

    return recommendations
  }

  private generateUserRecommendations(userId: string, progressArray: UserProgress[]): string[] {
    const recommendations = []

    if (progressArray.length === 0) {
      recommendations.push('Comienza con el módulo de fundamentos de WIL')
    } else {
      const averageScore = progressArray.reduce((sum, p) => sum + p.progress, 0) / progressArray.length
      
      if (averageScore < 70) {
        recommendations.push('Enfócate en mejorar tu comprensión de los conceptos básicos')
      } else if (averageScore > 85) {
        recommendations.push('Estás listo para módulos más avanzados')
      }
    }

    return recommendations
  }

  private updateSystemMetrics(completed: boolean, score: number): void {
    if (completed) {
      this.metrics.completedModules++
    }
    
    // Actualizar promedio de score
    this.metrics.averageScore = (this.metrics.averageScore + score) / 2
    
    // Actualizar tasa de certificación
    if (score >= 85) {
      this.metrics.certificationRate = (this.metrics.certificationRate + 1) / 2
    }
  }
}

/**
 * Instancia singleton para uso global
 */
export const wilTrainingSystem = WILTrainingSystem.getInstance()

/**
 * Funciones de utilidad
 */
export const WILTrainingUtils = {
  /**
   * Formatear duración de entrenamiento
   */
  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  },

  /**
   * Obtener color por score
   */
  getScoreColor: (score: number): string => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  },

  /**
   * Formatear progreso
   */
  formatProgress: (progress: number): string => {
    if (progress >= 95) return `${progress}% 🏆`
    if (progress >= 80) return `${progress}% ⭐`
    if (progress >= 60) return `${progress}% 📈`
    return `${progress}% 📚`
  },

  /**
   * Obtener icono por dificultad
   */
  getDifficultyIcon: (difficulty: string): string => {
    const icons = {
      'beginner': '🌱',
      'intermediate': '🌿',
      'advanced': '🌳',
      'expert': '🏔️'
    }
    return icons[difficulty as keyof typeof icons] || '📚'
  },

  /**
   * Calcular tiempo estimado de finalización
   */
  calculateEstimatedCompletion: (modules: number, timePerWeek: number): string => {
    const totalTime = modules * 30 // 30 min promedio por módulo
    const weeks = Math.ceil(totalTime / timePerWeek)
    
    if (weeks === 1) return '1 semana'
    if (weeks < 4) return `${weeks} semanas`
    if (weeks < 52) return `${Math.ceil(weeks / 4)} meses`
    return `${Math.ceil(weeks / 52)} años`
  }
}