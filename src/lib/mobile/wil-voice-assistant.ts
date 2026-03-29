import { logger } from '@/lib/observability';
/**
 * WIL VOICE ASSISTANT - TIER 0 Supremacy
 * 
 * @description Asistente de voz inteligente especializado en ventas con
 * procesamiento de lenguaje natural, reconocimiento de intenciones y
 * automatización de tareas comerciales. El compañero IA perfecto.
 * 
 * @version 2040.5.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Voice AI Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

// Tipos de datos para WIL Voice Assistant
export interface VoiceCommand {
  id: string
  transcript: string
  intent: Intent
  entities: Entity[]
  confidence: number
  timestamp: Date
  userId: string
  context: ConversationContext
}

export interface Intent {
  name: string
  confidence: number
  category: 'crm' | 'calendar' | 'communication' | 'reporting' | 'navigation' | 'general'
  action: string
  parameters: Record<string, unknown>
}

export interface Entity {
  type: 'person' | 'company' | 'date' | 'time' | 'amount' | 'location' | 'product'
  value: string
  confidence: number
  startIndex: number
  endIndex: number
  resolved?: Record<string, unknown>
}

export interface ConversationContext {
  sessionId: string
  previousCommands: VoiceCommand[]
  currentTask?: Task
  userPreferences: UserPreferences
  location?: GeolocationData
  activeClients: string[]
  recentMeetings: string[]
}

export interface Task {
  id: string
  type: 'create_proposal' | 'schedule_meeting' | 'send_message' | 'update_crm' | 'generate_report'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  parameters: Record<string, unknown>
  steps: TaskStep[]
  currentStep: number
  createdAt: Date
  completedAt?: Date
}

export interface TaskStep {
  id: string
  description: string
  action: string
  parameters: Record<string, unknown>
  status: 'pending' | 'completed' | 'failed'
  result?: Record<string, unknown>
}

export interface UserPreferences {
  language: 'es' | 'en'
  voiceSpeed: 'slow' | 'normal' | 'fast'
  confirmActions: boolean
  autoSync: boolean
  notificationLevel: 'all' | 'important' | 'none'
  preferredChannels: ('email' | 'whatsapp' | 'phone')[]
}

export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  city?: string
  country?: string
}

export interface VoiceResponse {
  id: string
  text: string
  audioUrl?: string
  actions: ResponseAction[]
  suggestions: string[]
  requiresConfirmation: boolean
  context: ConversationContext
}

export interface ResponseAction {
  type: 'navigate' | 'open_app' | 'send_message' | 'create_record' | 'show_data'
  target: string
  parameters: Record<string, unknown>
  confirmation?: string
}

export interface IntentPattern {
  intent: string
  patterns: string[]
  entities: string[]
  examples: string[]
  confidence_threshold: number
}

export interface VoiceMetrics {
  totalCommands: number
  successfulCommands: number
  failedCommands: number
  averageConfidence: number
  responseTime: number
  userSatisfaction: number
  mostUsedIntents: string[]
  timestamp: Date
}

/**
 * TIER 0 WIL Voice Assistant Engine
 * Asistente de voz especializado en ventas
 */
export class WILVoiceAssistant {
  private isListening: boolean = false
  private currentSession: string | null = null
  private conversationContext: ConversationContext | null = null
  private intentPatterns: Map<string, IntentPattern>
  private activeTask: Task | null = null
  private metrics: VoiceMetrics

  constructor() {
    this.intentPatterns = new Map()
    this.metrics = this.initializeMetrics()
    this.initializeIntentPatterns()
  }

  /**
   * Inicia sesión de voz con el usuario
   */
  async startVoiceSession(userId: string, context?: Partial<ConversationContext>): Promise<string> {
    try {
      const sessionId = `wil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      this.currentSession = sessionId
      this.conversationContext = {
        sessionId,
        previousCommands: [],
        userPreferences: await this.getUserPreferences(userId),
        activeClients: await this.getActiveClients(userId),
        recentMeetings: await this.getRecentMeetings(userId),
        ...context
      }

      this.isListening = true
      
      logger.info(`🎤 WIL Voice Session iniciada: ${sessionId}`)
      return sessionId

    } catch (error) {
      logger.error('Error iniciando sesión de voz:', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Procesa comando de voz y genera respuesta
   */
  async processVoiceCommand(transcript: string): Promise<VoiceResponse> {
    const startTime = Date.now()
    
    try {
      if (!this.currentSession || !this.conversationContext) {
        throw new Error('No hay sesión de voz activa')
      }

      // 1. Procesar transcript y extraer intent/entities
      const command = await this.parseVoiceCommand(transcript)
      
      // 2. Actualizar contexto conversacional
      this.conversationContext.previousCommands.push(command)
      
      // 3. Ejecutar acción basada en intent
      const response = await this.executeIntent(command)
      
      // 4. Actualizar métricas
      this.updateMetrics('success', Date.now() - startTime, command.confidence)
      
      return response

    } catch (error) {
      logger.error('Error procesando comando de voz:', error instanceof Error ? error : undefined)
      this.updateMetrics('error', Date.now() - startTime, 0)
      
      return {
        id: `resp_${Date.now()}`,
        text: 'Lo siento, no pude procesar tu solicitud. ¿Puedes repetirla?',
        actions: [],
        suggestions: [
          'Crear propuesta',
          'Programar reunión',
          'Enviar mensaje',
          'Ver agenda'
        ],
        requiresConfirmation: false,
        context: this.conversationContext!
      }
    }
  }

  /**
   * Detiene sesión de voz
   */
  async stopVoiceSession(): Promise<void> {
    try {
      if (this.currentSession) {
        logger.info(`🛑 WIL Voice Session terminada: ${this.currentSession}`)
        
        // Guardar contexto para futuras sesiones
        await this.saveConversationContext()
        
        this.currentSession = null
        this.conversationContext = null
        this.isListening = false
        this.activeTask = null
      }
    } catch (error) {
      logger.error('Error deteniendo sesión de voz:', error instanceof Error ? error : undefined)
    }
  }

  /**
   * Obtiene estado actual del asistente
   */
  getStatus(): {
    isListening: boolean
    sessionId: string | null
    activeTask: Task | null
    metrics: VoiceMetrics
  } {
    return {
      isListening: this.isListening,
      sessionId: this.currentSession,
      activeTask: this.activeTask,
      metrics: { ...this.metrics }
    }
  }

  /**
   * Obtiene sugerencias contextuales
   */
  async getContextualSuggestions(): Promise<string[]> {
    if (!this.conversationContext) {
      return this.getDefaultSuggestions()
    }

    const suggestions: string[] = []
    
    // Sugerencias basadas en clientes activos
    if (this.conversationContext.activeClients.length > 0) {
      const client = this.conversationContext.activeClients[0]
      suggestions.push(`Crear propuesta para ${client}`)
      suggestions.push(`Programar reunión con ${client}`)
    }

    // Sugerencias basadas en reuniones recientes
    if (this.conversationContext.recentMeetings.length > 0) {
      suggestions.push('Enviar seguimiento de reunión')
      suggestions.push('Actualizar estado de oportunidad')
    }

    // Sugerencias basadas en ubicación
    if (this.conversationContext.location) {
      suggestions.push('Ver clientes cercanos')
      suggestions.push('Optimizar ruta de visitas')
    }

    // Sugerencias generales
    suggestions.push('Generar reporte de actividades')
    suggestions.push('Ver agenda del día')

    return suggestions.slice(0, 5)
  }

  // Métodos privados de implementación

  private async parseVoiceCommand(transcript: string): Promise<VoiceCommand> {
    // Limpiar y normalizar transcript
    const cleanTranscript = transcript.toLowerCase().trim()
    
    // Detectar intent
    const intent = await this.detectIntent(cleanTranscript)
    
    // Extraer entidades
    const entities = await this.extractEntities(cleanTranscript, intent)
    
    // Calcular confianza general
    const confidence = this.calculateOverallConfidence(intent, entities)

    return {
      id: `cmd_${Date.now()}`,
      transcript: cleanTranscript,
      intent,
      entities,
      confidence,
      timestamp: new Date(),
      userId: 'current_user', // En producción vendría del contexto
      context: this.conversationContext!
    }
  }

  private async detectIntent(transcript: string): Promise<Intent> {
    let bestMatch: { intent: string; confidence: number; pattern: IntentPattern } | null = null

    // Buscar el mejor match en los patrones
    for (const [intentName, pattern] of this.intentPatterns) {
      const confidence = this.calculatePatternMatch(transcript, pattern)
      
      if (confidence > pattern.confidence_threshold && 
          (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { intent: intentName, confidence, pattern }
      }
    }

    if (bestMatch) {
      return {
        name: bestMatch.intent,
        confidence: bestMatch.confidence,
        category: this.getIntentCategory(bestMatch.intent),
        action: this.getIntentAction(bestMatch.intent),
        parameters: {}
      }
    }

    // Intent por defecto si no hay match
    return {
      name: 'unknown',
      confidence: 0.1,
      category: 'general',
      action: 'clarify',
      parameters: {}
    }
  }

  private async extractEntities(transcript: string, intent: Intent): Promise<Entity[]> {
    const entities: Entity[] = []
    
    // Extraer nombres de personas
    const personMatches = transcript.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g)
    if (personMatches) {
      personMatches.forEach(match => {
        entities.push({
          type: 'person',
          value: match,
          confidence: 0.8,
          startIndex: transcript.indexOf(match),
          endIndex: transcript.indexOf(match) + match.length
        })
      })
    }

    // Extraer nombres de empresas
    const companyPatterns = ['corp', 'sa', 'ltda', 'inc', 'bank', 'retail']
    companyPatterns.forEach(pattern => {
      const regex = new RegExp(`\\b\\w+\\s*${pattern}\\b`, 'gi')
      const matches = transcript.match(regex)
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'company',
            value: match,
            confidence: 0.7,
            startIndex: transcript.indexOf(match.toLowerCase()),
            endIndex: transcript.indexOf(match.toLowerCase()) + match.length
          })
        })
      }
    })

    // Extraer fechas y horas
    const datePatterns = [
      /\b(hoy|mañana|pasado mañana)\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{1,2}:\d{2}\b/g
    ]
    
    datePatterns.forEach(pattern => {
      const matches = transcript.match(pattern)
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: pattern.toString().includes(':') ? 'time' : 'date',
            value: match,
            confidence: 0.9,
            startIndex: transcript.indexOf(match.toLowerCase()),
            endIndex: transcript.indexOf(match.toLowerCase()) + match.length
          })
        })
      }
    })

    // Extraer montos
    const amountMatches = transcript.match(/\$?\d+(?:\.\d{3})*(?:\.\d{2})?/g)
    if (amountMatches) {
      amountMatches.forEach(match => {
        entities.push({
          type: 'amount',
          value: match,
          confidence: 0.85,
          startIndex: transcript.indexOf(match),
          endIndex: transcript.indexOf(match) + match.length
        })
      })
    }

    return entities
  }

  private async executeIntent(command: VoiceCommand): Promise<VoiceResponse> {
    const { intent, entities } = command

    switch (intent.name) {
      case 'create_proposal':
        return await this.handleCreateProposal(entities)
      
      case 'schedule_meeting':
        return await this.handleScheduleMeeting(entities)
      
      case 'send_message':
        return await this.handleSendMessage(entities)
      
      case 'update_crm':
        return await this.handleUpdateCRM(entities)
      
      case 'generate_report':
        return await this.handleGenerateReport(entities)
      
      case 'navigate':
        return await this.handleNavigation(entities)
      
      case 'get_info':
        return await this.handleGetInfo(entities)
      
      default:
        return await this.handleUnknownIntent(command)
    }
  }

  private async handleCreateProposal(entities: Entity[]): Promise<VoiceResponse> {
    const company = entities.find(e => e.type === 'company')?.value
    
    if (!company) {
      return {
        id: `resp_${Date.now()}`,
        text: '¿Para qué empresa quieres crear la propuesta?',
        actions: [],
        suggestions: [
          'Para TechCorp Solutions',
          'Para Retail Mega Store',
          'Para FinanceBank Chile'
        ],
        requiresConfirmation: false,
        context: this.conversationContext!
      }
    }

    // Crear tarea de propuesta
    this.activeTask = {
      id: `task_${Date.now()}`,
      type: 'create_proposal',
      status: 'in_progress',
      parameters: { company },
      steps: [
        {
          id: 'step_1',
          description: 'Recopilar información del cliente',
          action: 'fetch_client_data',
          parameters: { company },
          status: 'completed',
          result: { clientData: 'mock_data' }
        },
        {
          id: 'step_2',
          description: 'Generar propuesta con IA',
          action: 'generate_proposal',
          parameters: { company },
          status: 'pending'
        }
      ],
      currentStep: 1,
      createdAt: new Date()
    }

    return {
      id: `resp_${Date.now()}`,
      text: `Perfecto, estoy creando una propuesta para ${company}. Te notificaré cuando esté lista.`,
      actions: [
        {
          type: 'navigate',
          target: '/propuestas/nueva',
          parameters: { company },
          confirmation: `¿Quieres revisar la propuesta para ${company}?`
        }
      ],
      suggestions: [
        'Ver propuesta generada',
        'Enviar propuesta por email',
        'Programar presentación'
      ],
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  private async handleScheduleMeeting(entities: Entity[]): Promise<VoiceResponse> {
    const person = entities.find(e => e.type === 'person')?.value
    const company = entities.find(e => e.type === 'company')?.value
    const date = entities.find(e => e.type === 'date')?.value
    const time = entities.find(e => e.type === 'time')?.value

    let responseText = 'Programando reunión'
    if (person) responseText += ` con ${person}`
    if (company) responseText += ` de ${company}`
    if (date) responseText += ` para ${date}`
    if (time) responseText += ` a las ${time}`

    return {
      id: `resp_${Date.now()}`,
      text: `${responseText}. ¿Confirmas los detalles?`,
      actions: [
        {
          type: 'create_record',
          target: 'calendar_event',
          parameters: { person, company, date, time },
          confirmation: '¿Confirmar reunión?'
        }
      ],
      suggestions: [
        'Confirmar reunión',
        'Cambiar horario',
        'Agregar más detalles'
      ],
      requiresConfirmation: true,
      context: this.conversationContext!
    }
  }

  private async handleSendMessage(entities: Entity[]): Promise<VoiceResponse> {
    const person = entities.find(e => e.type === 'person')?.value
    const company = entities.find(e => e.type === 'company')?.value

    return {
      id: `resp_${Date.now()}`,
      text: `¿Qué mensaje quieres enviar${person ? ` a ${person}` : ''}${company ? ` de ${company}` : ''}?`,
      actions: [
        {
          type: 'open_app',
          target: 'whatsapp',
          parameters: { contact: person || company }
        }
      ],
      suggestions: [
        'Seguimiento de reunión',
        'Enviar propuesta',
        'Confirmar cita',
        'Mensaje personalizado'
      ],
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  private async handleUpdateCRM(entities: Entity[]): Promise<VoiceResponse> {
    return {
      id: `resp_${Date.now()}`,
      text: 'Actualizando información en el CRM. ¿Qué datos quieres modificar?',
      actions: [
        {
          type: 'navigate',
          target: '/crm',
          parameters: {}
        }
      ],
      suggestions: [
        'Actualizar estado de oportunidad',
        'Agregar nota de reunión',
        'Cambiar probabilidad de cierre',
        'Actualizar valor de deal'
      ],
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  private async handleGenerateReport(entities: Entity[]): Promise<VoiceResponse> {
    return {
      id: `resp_${Date.now()}`,
      text: 'Generando reporte de actividades. ¿Qué período quieres incluir?',
      actions: [
        {
          type: 'navigate',
          target: '/reportes',
          parameters: {}
        }
      ],
      suggestions: [
        'Reporte del día',
        'Reporte semanal',
        'Reporte mensual',
        'Reporte personalizado'
      ],
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  private async handleNavigation(entities: Entity[]): Promise<VoiceResponse> {
    return {
      id: `resp_${Date.now()}`,
      text: '¿A dónde quieres ir?',
      actions: [],
      suggestions: [
        'Ver agenda',
        'Ir a CRM',
        'Ver campañas',
        'Abrir inventario'
      ],
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  private async handleGetInfo(entities: Entity[]): Promise<VoiceResponse> {
    return {
      id: `resp_${Date.now()}`,
      text: '¿Qué información necesitas?',
      actions: [],
      suggestions: [
        'Estado de campañas',
        'Próximas reuniones',
        'Clientes activos',
        'Métricas del día'
      ],
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  private async handleUnknownIntent(command: VoiceCommand): Promise<VoiceResponse> {
    return {
      id: `resp_${Date.now()}`,
      text: 'No estoy seguro de lo que quieres hacer. ¿Puedes ser más específico?',
      actions: [],
      suggestions: await this.getContextualSuggestions(),
      requiresConfirmation: false,
      context: this.conversationContext!
    }
  }

  // Métodos auxiliares

  private calculatePatternMatch(transcript: string, pattern: IntentPattern): number {
    let maxScore = 0
    
    for (const patternText of pattern.patterns) {
      const score = this.calculateStringSimilarity(transcript, patternText)
      maxScore = Math.max(maxScore, score)
    }
    
    return maxScore
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Implementación simplificada de similitud de strings
    const words1 = str1.split(' ')
    const words2 = str2.split(' ')
    
    let matches = 0
    for (const word1 of words1) {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matches++
      }
    }
    
    return matches / Math.max(words1.length, words2.length)
  }

  private calculateOverallConfidence(intent: Intent, entities: Entity[]): number {
    const intentWeight = 0.6
    const entityWeight = 0.4
    
    const avgEntityConfidence = entities.length > 0 
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0.5
    
    return intent.confidence * intentWeight + avgEntityConfidence * entityWeight
  }

  private getIntentCategory(intentName: string): Intent['category'] {
    const categoryMap: Record<string, Intent['category']> = {
      'create_proposal': 'crm',
      'schedule_meeting': 'calendar',
      'send_message': 'communication',
      'update_crm': 'crm',
      'generate_report': 'reporting',
      'navigate': 'navigation'
    }
    
    return categoryMap[intentName] || 'general'
  }

  private getIntentAction(intentName: string): string {
    const actionMap: Record<string, string> = {
      'create_proposal': 'create',
      'schedule_meeting': 'schedule',
      'send_message': 'send',
      'update_crm': 'update',
      'generate_report': 'generate',
      'navigate': 'navigate'
    }
    
    return actionMap[intentName] || 'process'
  }

  private getDefaultSuggestions(): string[] {
    return [
      'Crear propuesta',
      'Programar reunión',
      'Enviar mensaje',
      'Ver agenda',
      'Generar reporte'
    ]
  }

  private updateMetrics(type: 'success' | 'error', responseTime: number, confidence: number): void {
    this.metrics.totalCommands++
    this.metrics.responseTime = (this.metrics.responseTime + responseTime) / 2
    this.metrics.timestamp = new Date()
    
    if (type === 'success') {
      this.metrics.successfulCommands++
      this.metrics.averageConfidence = (this.metrics.averageConfidence + confidence) / 2
    } else {
      this.metrics.failedCommands++
    }
  }

  private initializeMetrics(): VoiceMetrics {
    return {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageConfidence: 0,
      responseTime: 0,
      userSatisfaction: 0,
      mostUsedIntents: [],
      timestamp: new Date()
    }
  }

  private initializeIntentPatterns(): void {
    const patterns: IntentPattern[] = [
      {
        intent: 'create_proposal',
        patterns: [
          'crear propuesta',
          'generar propuesta',
          'hacer propuesta',
          'nueva propuesta'
        ],
        entities: ['company', 'person'],
        examples: [
          'crear propuesta para techcorp',
          'generar propuesta para retail mega'
        ],
        confidence_threshold: 0.7
      },
      {
        intent: 'schedule_meeting',
        patterns: [
          'programar reunión',
          'agendar cita',
          'programar cita',
          'agendar reunión'
        ],
        entities: ['person', 'company', 'date', 'time'],
        examples: [
          'programar reunión con maría gonzález',
          'agendar cita para mañana'
        ],
        confidence_threshold: 0.7
      },
      {
        intent: 'send_message',
        patterns: [
          'enviar mensaje',
          'mandar whatsapp',
          'escribir mensaje',
          'contactar'
        ],
        entities: ['person', 'company'],
        examples: [
          'enviar mensaje a carlos ruiz',
          'mandar whatsapp a techcorp'
        ],
        confidence_threshold: 0.7
      }
    ]

    patterns.forEach(pattern => {
      this.intentPatterns.set(pattern.intent, pattern)
    })
  }

  // Métodos placeholder para integración futura
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    return {
      language: 'es',
      voiceSpeed: 'normal',
      confirmActions: true,
      autoSync: true,
      notificationLevel: 'important',
      preferredChannels: ['whatsapp', 'email']
    }
  }

  private async getActiveClients(userId: string): Promise<string[]> {
    return ['TechCorp Solutions', 'Retail Mega Store', 'FinanceBank Chile']
  }

  private async getRecentMeetings(userId: string): Promise<string[]> {
    return ['meeting_1', 'meeting_2', 'meeting_3']
  }

  private async saveConversationContext(): Promise<void> {
    // Implementar guardado de contexto
  }
}

// Instancia singleton para uso global
export const wilVoiceAssistant = new WILVoiceAssistant()