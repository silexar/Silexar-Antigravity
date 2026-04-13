/**
 * SILEXAR PULSE - WIL (Wireless Intelligence Layer) Engine
 * Motor de Asistente IA para Plataforma Silexar Pulse
 *
 * Implementa:
 * - L2: Input filter (regex + heuristic scoring)
 * - L5: AI Judge (semantic security evaluator — claude-haiku)
 * - L7: Conversation anomaly detection (multi-turn attack detection)
 * - L8: Zero Trust Action Proxy (least-privilege agent actions)
 * - Procesamiento de lenguaje natural
 * - Reconocimiento de intención
 * - Generación de respuestas contextuales
 *
 * USAGE RULE (CLAUDE.md):
 *   ALWAYS use this file to interact with Wil.
 *   NEVER call AI APIs directly from components or pages.
 *   import { askWil } from '@/lib/wil/wil-engine'
 *
 * @version 3.0.0 — Security layers fully integrated
 */

import { filterInput } from '@/lib/ai/input-filter'
import { validateOutput } from '@/lib/ai/output-validator'
import { judgeInput, shouldInvokeJudge } from '@/lib/ai/judge'
import { conversationAnomalyDetector } from '@/lib/ai/anomaly-detector'
import { actionProxy, type AgentAction } from '@/lib/cortex/action-proxy'
import { logger } from '@/lib/observability'

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

export interface WILResponse {
  readonly text: string
  readonly confidence: number
  readonly intent?: string
  readonly entities?: WILEntity[]
  readonly action?: WILAction
  readonly suggestions?: string[]
  readonly audioUrl?: string
  /** Set to true when the input was blocked by security layers */
  readonly blocked?: boolean
}

export interface WILEntity {
  readonly type: string
  readonly value: string
  readonly confidence: number
  readonly start: number
  readonly end: number
}

export interface WILAction {
  readonly type: WILActionType
  readonly parameters: Record<string, unknown>
  readonly requiresConfirmation: boolean
}

export type WILActionType =
  | 'navigate'
  | 'search'
  | 'create_campaign'
  | 'view_report'
  | 'schedule_task'
  | 'send_notification'
  | 'generate_creative'
  | 'check_status'
  | 'escalate_human'
  | 'none'

export interface WILContext {
  readonly userId: string
  readonly sessionId: string
  readonly tenantId: string
  readonly userRole: string
  readonly conversationHistory: WILMessage[]
  readonly currentIntent?: string
  readonly slots: Record<string, string>
  readonly lastInteraction: number
}

export interface WILMessage {
  readonly role: 'user' | 'assistant' | 'system'
  readonly content: string
  readonly timestamp: number
  readonly intent?: string
}

export interface WILConfig {
  readonly language: 'es' | 'en' | 'pt'
  readonly voiceEnabled: boolean
  readonly maxContextMessages: number
  readonly confidenceThreshold: number
  readonly enableLearning: boolean
}

/** Security context required to enforce L7 + L8 */
export interface WILSecurityContext {
  userId: string
  sessionId: string
  tenantId: string
  userRole: string
}

// Intenciones reconocidas
const INTENT_PATTERNS: Record<string, RegExp[]> = {
  navigate: [
    /(?:ir|navegar|abrir|mostrar|ver)\s+(?:a|al|la|el)?\s*(.+)/i,
    /(?:llévame|llevame)\s+a\s+(.+)/i,
  ],
  search: [
    /(?:buscar|encontrar|busca)\s+(.+)/i,
    /(?:dónde|donde)\s+(?:está|esta)\s+(.+)/i,
  ],
  create_campaign: [
    /(?:crear|nueva)\s+campaña/i,
    /(?:iniciar|empezar)\s+campaña/i,
  ],
  view_report: [
    /(?:ver|mostrar|dame)\s+(?:el)?\s*reporte/i,
    /(?:estadísticas|estadisticas|métricas|metricas)\s+(?:de)?\s*(.+)?/i,
  ],
  schedule_task: [
    /(?:programar|agendar|crear)\s+(?:una)?\s*tarea/i,
    /(?:recordar|recordarme)\s+(.+)/i,
  ],
  check_status: [
    /(?:estado|status)\s+(?:de|del)?\s*(.+)/i,
    /(?:cómo|como)\s+(?:va|está)\s+(.+)/i,
  ],
  generate_creative: [
    /(?:generar|crear)\s+(?:un|una)?\s*(?:imagen|banner|creatividad)/i,
    /(?:diseñar|disenar)\s+(.+)/i,
  ],
  help: [
    /(?:ayuda|help|qué puedes hacer|que puedes hacer)/i,
    /(?:comandos|opciones)/i,
  ],
}

const RESPONSES: Record<string, string[]> = {
  greeting: [
    '¡Hola! Soy WIL, tu asistente de Silexar Pulse. ¿En qué puedo ayudarte?',
    '¡Buen día! ¿Cómo puedo asistirte hoy?',
    'Hola, estoy listo para ayudarte. ¿Qué necesitas?',
  ],
  help: [
    'Puedo ayudarte con: crear campañas, ver reportes, buscar información, navegar por el sistema, generar creatividades y más. Solo dime qué necesitas.',
    'Estoy aquí para asistirte. Puedes pedirme que navegue a secciones, busque información, muestre reportes o cree elementos nuevos.',
  ],
  not_understood: [
    'No estoy seguro de entender. ¿Podrías reformular tu solicitud?',
    'Disculpa, no capté eso. ¿Puedes expresarlo de otra manera?',
    'No logro comprender. Intenta decirlo de otra forma o pide "ayuda" para ver opciones.',
  ],
  security_block: [
    'No puedo procesar esa solicitud.',
  ],
  escalate: [
    'Entiendo que necesitas ayuda adicional. Te conectaré con un agente humano.',
    'Voy a escalar esto a nuestro equipo de soporte. Un momento.',
  ],
}

// ============================================================================
// CLASE PRINCIPAL WIL ENGINE
// ============================================================================

export class WILEngineImpl {
  private config: WILConfig
  private contexts: Map<string, WILContext> = new Map()
  private learningData: WILMessage[] = []

  constructor(config: Partial<WILConfig> = {}) {
    this.config = {
      language: config.language ?? 'es',
      voiceEnabled: config.voiceEnabled ?? true,
      maxContextMessages: config.maxContextMessages ?? 10,
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      enableLearning: config.enableLearning ?? true,
    }
  }

  /**
   * Main entry point — process user input through the full security pipeline.
   *
   * Security pipeline (in order):
   *   L7 → Analyze conversation anomalies (before L2/L5 so flooding is caught early)
   *   L2 → Regex + heuristic filter
   *   L5 → AI Judge (only when L2 riskScore is in 30-59 range)
   *   L7 → Record final message result
   *   Process intent + generate response
   *
   * @param input  — raw user text
   * @param secCtx — authenticated security context from JWT (NEVER from client input)
   */
  async process(input: string, secCtx: WILSecurityContext): Promise<WILResponse> {
    const { userId, sessionId, tenantId, userRole } = secCtx
    const context = this.getOrCreateContext(userId, sessionId, tenantId, userRole)
    const BLOCK_RESPONSE: WILResponse = {
      text: RESPONSES.security_block[0],
      confidence: 1,
      intent: 'security_block',
      blocked: true,
    }

    // ── L7: pre-check conversation anomaly ──────────────────────────────────
    // Use a provisional risk score of 50 to evaluate whether the session itself
    // is suspicious before we even run the per-message filters.
    const anomalyPreCheck = await conversationAnomalyDetector.analyzeMessage({
      sessionId,
      userId,
      tenantId,
      messageRiskScore: 50, // provisional — will be overwritten after L2/L5
    })

    if (anomalyPreCheck.shouldSuspend) {
      logger.warn(`WIL: session suspended by L7 anomaly detector (pre-check) — sessionId:${sessionId} userId:${userId} tenantId:${tenantId} threatLevel:${anomalyPreCheck.threatLevel} reason:${anomalyPreCheck.reason}`)
      return BLOCK_RESPONSE
    }

    if (anomalyPreCheck.shouldBlock) {
      logger.warn(`WIL: request blocked by L7 anomaly detector (pre-check) — sessionId:${sessionId} userId:${userId} tenantId:${tenantId} threatLevel:${anomalyPreCheck.threatLevel} reason:${anomalyPreCheck.reason}`)
      return BLOCK_RESPONSE
    }

    // ── L2: Regex + heuristic input filter ───────────────────────────────────
    const l2Result = filterInput(input)

    if (l2Result.isBlocked) {
      logger.warn(`WIL: input blocked by L2 filter — sessionId:${sessionId} userId:${userId} tenantId:${tenantId} riskScore:${l2Result.riskScore} reason:${l2Result.reason}`)
      // Record the high-risk message for L7 tracking
      await conversationAnomalyDetector.recordMessage({
        sessionId, userId, tenantId,
        riskScore: l2Result.riskScore,
        flagged: true,
      })
      return BLOCK_RESPONSE
    }

    // ── L5: AI Judge (semantic evaluation for medium-risk inputs) ────────────
    let finalRiskScore = l2Result.riskScore

    if (shouldInvokeJudge(l2Result.riskScore)) {
      const contextSummary = context.conversationHistory
        .slice(-3)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n')

      const verdict = await judgeInput(input, contextSummary || undefined)

      if (verdict.decision === 'block') {
        logger.warn(`WIL: input blocked by L5 AI Judge — sessionId:${sessionId} userId:${userId} tenantId:${tenantId} riskScore:${verdict.riskScore} detectedIntent:${verdict.detectedIntent} reasoning:${verdict.reasoning}`)
        await conversationAnomalyDetector.recordMessage({
          sessionId, userId, tenantId,
          riskScore: verdict.riskScore,
          flagged: true,
        })
        return BLOCK_RESPONSE
      }

      // Use the higher of L2 and L5 scores for L7 tracking
      finalRiskScore = Math.max(l2Result.riskScore, verdict.riskScore)
    }

    // ── L7: Record final authoritative risk score ────────────────────────────
    await conversationAnomalyDetector.recordMessage({
      sessionId, userId, tenantId,
      riskScore: finalRiskScore,
      flagged: finalRiskScore > 30,
    })

    // ── Intent detection + response generation ───────────────────────────────
    this.addToHistory(context, 'user', input)

    const { intent, entities, confidence } = this.detectIntent(input)
    let responseText = this.generateResponse(intent, entities, context)

    // ── L6: Output validation + DLP ─────────────────────────────────────────
    const validationResult = validateOutput(responseText)
    if (validationResult.isBlocked) {
      logger.warn('AI output blocked by L6 validator', { reason: validationResult.violationType })
      await conversationAnomalyDetector.recordMessage({
        sessionId, userId, tenantId,
        riskScore: 100,
        flagged: true,
      })
      return BLOCK_RESPONSE
    }
    if (validationResult.redactionsApplied > 0) {
      logger.warn(`L6 output redactions applied: ${validationResult.redactionsApplied} redactions`, { violationType: validationResult.violationType })
      responseText = validationResult.output
    }

    this.addToHistory(context, 'assistant', responseText, intent)

    if (this.config.enableLearning) {
      this.learningData.push({ role: 'user', content: input, timestamp: Date.now(), intent })
    }

    // ── L8: Route data-access actions through Zero Trust proxy ───────────────
    const action = this.buildAction(intent, entities, context)
    let proxyData: unknown = undefined

    if (action && this.isProxiedAction(intent)) {
      const agentAction = this.intentToAgentAction(intent, tenantId, entities)
      if (agentAction) {
        const result = await actionProxy.execute({
          userId,
          tenantId,
          userRole,
          action: agentAction,
        })
        proxyData = result.success ? result.data : undefined
        if (!result.success) {
          logger.warn(`WIL: L8 action proxy denied agent action — sessionId:${sessionId} userId:${userId} tenantId:${tenantId} actionType:${agentAction.type} auditId:${result.auditId}`)
        }
      }
    }

    return {
      text: responseText,
      confidence,
      intent,
      entities,
      action: action ?? undefined,
      suggestions: this.generateSuggestions(intent, context),
      ...(proxyData !== undefined ? { data: proxyData } : {}),
    } as WILResponse
  }

  /**
   * Convenience wrapper — maps action intent to AgentAction for the L8 proxy.
   * Returns null if the intent does not require a proxied data access.
   */
  private intentToAgentAction(
    intent: string,
    tenantId: string,
    entities: WILEntity[],
  ): AgentAction | null {
    const filter = entities.find((e) => e.type === 'query')?.value

    switch (intent) {
      case 'view_report':
        return { type: 'read_reports', tenantId, filter }
      case 'check_status':
        return { type: 'read_campaigns', tenantId, filter }
      case 'search':
        return { type: 'search_knowledge_base', tenantId, query: filter }
      default:
        return null
    }
  }

  /** True for intents that require reading data through the L8 proxy */
  private isProxiedAction(intent: string): boolean {
    return ['view_report', 'check_status', 'search'].includes(intent)
  }

  // ─── Intent detection ──────────────────────────────────────────────────────

  private detectIntent(
    input: string,
  ): { intent: string; entities: WILEntity[]; confidence: number } {
    const normalized = input.toLowerCase().trim()
    const entities: WILEntity[] = []

    if (/^(hola|hey|buenos días|buenas tardes|buenas noches|hi|hello)/i.test(normalized)) {
      return { intent: 'greeting', entities, confidence: 0.95 }
    }

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        const match = normalized.match(pattern)
        if (match) {
          if (match[1]) {
            entities.push({
              type: 'query',
              value: match[1].trim(),
              confidence: 0.9,
              start: match.index ?? 0,
              end: (match.index ?? 0) + match[0].length,
            })
          }
          return { intent, entities, confidence: 0.85 }
        }
      }
    }

    return { intent: 'unknown', entities, confidence: 0.3 }
  }

  // ─── Action builder ────────────────────────────────────────────────────────

  private buildAction(
    intent: string,
    entities: WILEntity[],
    _context: WILContext,
  ): WILAction | null {
    const query = entities.find((e) => e.type === 'query')?.value ?? ''

    switch (intent) {
      case 'navigate':
        return { type: 'navigate', parameters: { destination: this.mapDestination(query) }, requiresConfirmation: false }
      case 'search':
        return { type: 'search', parameters: { query }, requiresConfirmation: false }
      case 'create_campaign':
        return { type: 'create_campaign', parameters: {}, requiresConfirmation: true }
      case 'view_report':
        return { type: 'view_report', parameters: { reportType: query || 'general' }, requiresConfirmation: false }
      case 'schedule_task':
        return { type: 'schedule_task', parameters: { description: query }, requiresConfirmation: true }
      case 'check_status':
        return { type: 'check_status', parameters: { target: query }, requiresConfirmation: false }
      case 'generate_creative':
        return { type: 'generate_creative', parameters: { type: query || 'banner' }, requiresConfirmation: true }
      default:
        return null
    }
  }

  private mapDestination(query: string): string {
    const destinations: Record<string, string> = {
      'campañas': '/campanas',
      'campaña': '/campanas',
      dashboard: '/dashboard',
      inicio: '/',
      reportes: '/inteligencia-negocios',
      creatividades: '/creatividades',
      'facturación': '/facturacion',
      contratos: '/contratos',
      clientes: '/crm',
      inventario: '/inventario',
      'configuración': '/admin',
    }
    return destinations[query.toLowerCase()] ?? `/search?q=${encodeURIComponent(query)}`
  }

  // ─── Response generator ────────────────────────────────────────────────────

  private generateResponse(
    intent: string,
    entities: WILEntity[],
    _context: WILContext,
  ): string {
    const query = entities.find((e) => e.type === 'query')?.value ?? ''

    switch (intent) {
      case 'greeting': return this.pickRandom(RESPONSES.greeting)
      case 'help':     return this.pickRandom(RESPONSES.help)
      case 'navigate': return `Navegando a ${query}...`
      case 'search':   return `Buscando "${query}"...`
      case 'create_campaign': return 'Abriendo el asistente para crear nueva campaña. ¿Confirmas?'
      case 'view_report':     return `Generando reporte${query ? ` de ${query}` : ''}...`
      case 'schedule_task':   return `Voy a crear una tarea: "${query}". ¿Deseas confirmar?`
      case 'check_status':    return `Verificando estado de ${query || 'sistema'}...`
      case 'generate_creative': return `Iniciando generación de ${query || 'creatividad'}. ¿Confirmas?`
      case 'unknown':
      default: return this.pickRandom(RESPONSES.not_understood)
    }
  }

  private generateSuggestions(intent: string, _context: WILContext): string[] {
    switch (intent) {
      case 'greeting':        return ['Ver campañas activas', 'Mostrar reportes', 'Ayuda']
      case 'create_campaign': return ['Confirmar', 'Cancelar', 'Ver plantillas']
      case 'view_report':     return ['Exportar', 'Comparar períodos', 'Programar envío']
      case 'unknown':         return ['Ayuda', 'Ver campañas', 'Crear campaña', 'Ver reportes']
      default:                return []
    }
  }

  // ─── Context management ────────────────────────────────────────────────────

  private getOrCreateContext(
    userId: string,
    sessionId: string,
    tenantId: string,
    userRole: string,
  ): WILContext {
    const existing = this.contexts.get(userId)
    if (existing) return existing

    const ctx: WILContext = {
      userId,
      sessionId,
      tenantId,
      userRole,
      conversationHistory: [],
      slots: {},
      lastInteraction: Date.now(),
    }
    this.contexts.set(userId, ctx)
    return ctx
  }

  private addToHistory(
    context: WILContext,
    role: 'user' | 'assistant' | 'system',
    content: string,
    intent?: string,
  ): void {
    const updated: WILContext = {
      ...context,
      conversationHistory: [
        ...context.conversationHistory.slice(-(this.config.maxContextMessages - 1)),
        { role, content, timestamp: Date.now(), intent },
      ],
      currentIntent: intent ?? context.currentIntent,
      lastInteraction: Date.now(),
    }
    this.contexts.set(context.userId, updated)
  }

  private pickRandom(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)]
  }

  // ─── Session management ────────────────────────────────────────────────────

  async clearSession(userId: string): Promise<boolean> {
    const ctx = this.contexts.get(userId)
    if (ctx?.sessionId) {
      await conversationAnomalyDetector.clearSession(ctx.sessionId)
    }
    return this.contexts.delete(userId)
  }

  async train(): Promise<{ success: boolean; samplesProcessed: number }> {
    const samplesProcessed = this.learningData.length
    this.learningData = []
    return { success: true, samplesProcessed }
  }

  getMetrics(): { totalSessions: number; learningDataSize: number; supportedIntents: string[] } {
    return {
      totalSessions: this.contexts.size,
      learningDataSize: this.learningData.length,
      supportedIntents: Object.keys(INTENT_PATTERNS),
    }
  }
}

// ============================================================================
// SINGLETON + PUBLIC API
// ============================================================================

let wilEngineInstance: WILEngineImpl | null = null

export function getWILEngine(config?: Partial<WILConfig>): WILEngineImpl {
  if (!wilEngineInstance) {
    wilEngineInstance = new WILEngineImpl(config)
  }
  return wilEngineInstance
}

/**
 * Public function for all callers per CLAUDE.md rule:
 *   "ALWAYS use askWil — NEVER call AI APIs directly from components"
 *
 * @param input  — raw user message
 * @param secCtx — security context from JWT (userId, sessionId, tenantId, userRole)
 */
export async function askWil(
  input: string,
  secCtx: WILSecurityContext,
): Promise<WILResponse> {
  return getWILEngine().process(input, secCtx)
}

/** Singleton for direct use — prefer askWil() for new code */
export const WILEngine = new WILEngineImpl()
export default WILEngine
