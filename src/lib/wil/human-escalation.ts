import { logger } from '@/lib/observability';
/**
 * SILEXAR PULSE - Human Escalation System
 * Sistema de Escalamiento a Agentes Humanos
 * 
 * Maneja la transición de conversaciones desde WIL a agentes humanos
 * cuando el asistente no puede resolver la consulta.
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

// ============================================================================
// TIPOS
// ============================================================================

export type EscalationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EscalationStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_USER'
  | 'RESOLVED'
  | 'CLOSED';

export type EscalationReason = 
  | 'user_request'
  | 'low_confidence'
  | 'complex_query'
  | 'negative_sentiment'
  | 'repeated_failure'
  | 'urgent_matter'
  | 'billing_issue'
  | 'technical_error'
  | 'complaint';

export interface EscalationTicket {
  readonly id: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly reason: EscalationReason;
  readonly reasonDescription: string;
  readonly priority: EscalationPriority;
  readonly status: EscalationStatus;
  readonly conversationHistory: ConversationMessage[];
  readonly metadata: EscalationMetadata;
  readonly assignedAgentId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly resolvedAt?: Date;
}

export interface ConversationMessage {
  readonly role: 'user' | 'assistant' | 'agent';
  readonly content: string;
  readonly timestamp: Date;
}

export interface EscalationMetadata {
  readonly userContext: Record<string, unknown>;
  readonly wilConfidence: number;
  readonly attemptedIntents: string[];
  readonly userSentiment?: 'positive' | 'neutral' | 'negative';
  readonly deviceInfo?: string;
  readonly currentPage?: string;
}

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly status: 'available' | 'busy' | 'offline';
  readonly skills: string[];
  readonly activeTickets: number;
  readonly maxTickets: number;
}

export interface EscalationConfig {
  readonly autoAssign: boolean;
  readonly maxWaitTimeMinutes: number;
  readonly notifyEmail: boolean;
  readonly notifySlack: boolean;
  readonly slackWebhook?: string;
}

// ============================================================================
// PRIORIDAD BASADA EN RAZÓN
// ============================================================================

const PRIORITY_BY_REASON: Record<EscalationReason, EscalationPriority> = {
  'user_request': 'MEDIUM',
  'low_confidence': 'LOW',
  'complex_query': 'MEDIUM',
  'negative_sentiment': 'HIGH',
  'repeated_failure': 'MEDIUM',
  'urgent_matter': 'HIGH',
  'billing_issue': 'HIGH',
  'technical_error': 'HIGH',
  'complaint': 'CRITICAL',
};

// ============================================================================
// CLASE PRINCIPAL
// ============================================================================

export class HumanEscalationService {
  private tickets: Map<string, EscalationTicket> = new Map();
  private agents: Map<string, Agent> = new Map();
  private config: EscalationConfig;
  private listeners: Map<string, ((ticket: EscalationTicket) => void)[]> = new Map();

  constructor(config: Partial<EscalationConfig> = {}) {
    this.config = {
      autoAssign: config.autoAssign ?? true,
      maxWaitTimeMinutes: config.maxWaitTimeMinutes ?? 15,
      notifyEmail: config.notifyEmail ?? true,
      notifySlack: config.notifySlack ?? false,
      slackWebhook: config.slackWebhook,
    };

    // Registrar agentes de ejemplo (en producción vendrían de BD)
    this.registerAgent({
      id: 'agent_001',
      name: 'Soporte Nivel 1',
      email: 'soporte1@silexar.com',
      status: 'available',
      skills: ['general', 'billing', 'technical'],
      activeTickets: 0,
      maxTickets: 5,
    });
  }

  /**
   * Escala a un agente humano
   */
  async escalateToHuman(
    reason: EscalationReason | string,
    options: {
      userId?: string;
      sessionId?: string;
      conversationHistory?: ConversationMessage[];
      metadata?: Partial<EscalationMetadata>;
      customPriority?: EscalationPriority;
    } = {}
  ): Promise<EscalationTicket> {
    const normalizedReason = this.normalizeReason(reason);
    const priority = options.customPriority || PRIORITY_BY_REASON[normalizedReason] || 'MEDIUM';

    const ticket: EscalationTicket = {
      id: `esc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: options.userId || 'anonymous',
      sessionId: options.sessionId || `session_${Date.now()}`,
      reason: normalizedReason,
      reasonDescription: typeof reason === 'string' ? reason : normalizedReason,
      priority,
      status: 'PENDING',
      conversationHistory: options.conversationHistory || [],
      metadata: {
        userContext: options.metadata?.userContext || {},
        wilConfidence: options.metadata?.wilConfidence || 0,
        attemptedIntents: options.metadata?.attemptedIntents || [],
        userSentiment: options.metadata?.userSentiment,
        deviceInfo: options.metadata?.deviceInfo,
        currentPage: options.metadata?.currentPage,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(ticket.id, ticket);

    // Auto-asignar si está configurado
    if (this.config.autoAssign) {
      await this.autoAssignTicket(ticket.id);
    }

    // Notificar
    await this.notifyNewTicket(ticket);

    // Emitir evento
    this.emit('ticket_created', ticket);

    logger.info(`[Escalation] Created ticket ${ticket.id} with priority ${priority}`);

    return ticket;
  }

  /**
   * Normaliza la razón al enum
   */
  private normalizeReason(reason: string): EscalationReason {
    const validReasons: EscalationReason[] = [
      'user_request', 'low_confidence', 'complex_query', 'negative_sentiment',
      'repeated_failure', 'urgent_matter', 'billing_issue', 'technical_error', 'complaint'
    ];
    
    if (validReasons.includes(reason as EscalationReason)) {
      return reason as EscalationReason;
    }
    
    return 'user_request';
  }

  /**
   * Auto-asigna un ticket al agente disponible
   */
  private async autoAssignTicket(ticketId: string): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    // Encontrar agente disponible
    const availableAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'available' && a.activeTickets < a.maxTickets)
      .sort((a, b) => a.activeTickets - b.activeTickets);

    if (availableAgents.length === 0) {
      logger.info(`[Escalation] No available agents for ticket ${ticketId}`);
      return false;
    }

    const selectedAgent = availableAgents[0];
    
    return this.assignTicket(ticketId, selectedAgent.id);
  }

  /**
   * Asigna un ticket a un agente específico
   */
  async assignTicket(ticketId: string, agentId: string): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    const agent = this.agents.get(agentId);
    
    if (!ticket || !agent) return false;

    const updatedTicket: EscalationTicket = {
      ...ticket,
      status: 'ASSIGNED',
      assignedAgentId: agentId,
      updatedAt: new Date(),
    };

    this.tickets.set(ticketId, updatedTicket);

    // Actualizar contador del agente
    this.agents.set(agentId, {
      ...agent,
      activeTickets: agent.activeTickets + 1,
    });

    this.emit('ticket_assigned', updatedTicket);

    logger.info(`[Escalation] Ticket ${ticketId} assigned to ${agent.name}`);

    return true;
  }

  /**
   * Actualiza el estado de un ticket
   */
  async updateStatus(ticketId: string, status: EscalationStatus, note?: string): Promise<EscalationTicket | null> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    const updatedTicket: EscalationTicket = {
      ...ticket,
      status,
      updatedAt: new Date(),
      resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined,
      conversationHistory: note 
        ? [...ticket.conversationHistory, { role: 'agent', content: note, timestamp: new Date() }]
        : ticket.conversationHistory,
    };

    this.tickets.set(ticketId, updatedTicket);

    // Si se resolvió, liberar agente
    if ((status === 'RESOLVED' || status === 'CLOSED') && ticket.assignedAgentId) {
      const agent = this.agents.get(ticket.assignedAgentId);
      if (agent) {
        this.agents.set(ticket.assignedAgentId, {
          ...agent,
          activeTickets: Math.max(0, agent.activeTickets - 1),
        });
      }
    }

    this.emit('ticket_updated', updatedTicket);

    return updatedTicket;
  }

  /**
   * Agrega mensaje a un ticket
   */
  async addMessage(
    ticketId: string, 
    role: 'user' | 'agent', 
    content: string
  ): Promise<EscalationTicket | null> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    const updatedTicket: EscalationTicket = {
      ...ticket,
      status: role === 'agent' ? 'IN_PROGRESS' : 'WAITING_USER',
      updatedAt: new Date(),
      conversationHistory: [
        ...ticket.conversationHistory,
        { role, content, timestamp: new Date() },
      ],
    };

    this.tickets.set(ticketId, updatedTicket);

    return updatedTicket;
  }

  /**
   * Notifica sobre nuevo ticket
   */
  private async notifyNewTicket(ticket: EscalationTicket): Promise<void> {
    if (this.config.notifyEmail) {
      // TODO: Enviar email a equipo de soporte
      logger.info(`[Escalation] Would send email notification for ticket ${ticket.id}`);
    }

    if (this.config.notifySlack && this.config.slackWebhook) {
      // TODO: Enviar notificación a Slack
      logger.info(`[Escalation] Would send Slack notification for ticket ${ticket.id}`);
    }
  }

  /**
   * Registra un agente
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Actualiza estado de agente
   */
  updateAgentStatus(agentId: string, status: Agent['status']): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    this.agents.set(agentId, { ...agent, status });
    return true;
  }

  /**
   * Obtiene un ticket por ID
   */
  getTicket(ticketId: string): EscalationTicket | null {
    return this.tickets.get(ticketId) || null;
  }

  /**
   * Lista tickets con filtros
   */
  listTickets(filters?: {
    status?: EscalationStatus;
    priority?: EscalationPriority;
    agentId?: string;
    userId?: string;
  }): EscalationTicket[] {
    let result = Array.from(this.tickets.values());

    if (filters?.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters?.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }
    if (filters?.agentId) {
      result = result.filter(t => t.assignedAgentId === filters.agentId);
    }
    if (filters?.userId) {
      result = result.filter(t => t.userId === filters.userId);
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Obtiene estadísticas
   */
  getStats(): {
    totalTickets: number;
    pendingTickets: number;
    resolvedToday: number;
    avgResolutionTimeMinutes: number;
    availableAgents: number;
  } {
    const allTickets = Array.from(this.tickets.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resolvedToday = allTickets.filter(
      t => t.resolvedAt && t.resolvedAt >= today
    );

    const avgTime = resolvedToday.length > 0
      ? resolvedToday.reduce((sum, t) => {
          const duration = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / 60000;
          return sum + duration;
        }, 0) / resolvedToday.length
      : 0;

    return {
      totalTickets: allTickets.length,
      pendingTickets: allTickets.filter(t => t.status === 'PENDING').length,
      resolvedToday: resolvedToday.length,
      avgResolutionTimeMinutes: Math.round(avgTime),
      availableAgents: Array.from(this.agents.values()).filter(a => a.status === 'available').length,
    };
  }

  /**
   * Registra listener para eventos
   */
  on(event: string, callback: (ticket: EscalationTicket) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emite evento
   */
  private emit(event: string, ticket: EscalationTicket): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(ticket));
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

let escalationServiceInstance: HumanEscalationService | null = null;

export function getEscalationService(config?: Partial<EscalationConfig>): HumanEscalationService {
  if (!escalationServiceInstance) {
    escalationServiceInstance = new HumanEscalationService(config);
  }
  return escalationServiceInstance;
}

// Exportación compatible con código existente
export const escalateToHuman = async (reason: string): Promise<EscalationTicket> => {
  return getEscalationService().escalateToHuman(reason);
};

export default { escalateToHuman, getEscalationService };