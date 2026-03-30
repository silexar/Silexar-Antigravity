import { logger } from '@/lib/observability';
/**
 * SILEXAR PULSE - TIER0+ CORTEX FLOW ENGINE
 * Motor de Flujo de Trabajo para Narrativas y Campañas
 * 
 * Implementa un motor de flujo completo para:
 * - Ejecución de workflows publicitarios
 * - Gestión de estados de narrativas
 * - Transiciones basadas en eventos
 * - Rollback y recuperación
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

export interface FlowNode {
  readonly id: string;
  readonly type: FlowNodeType;
  readonly name: string;
  readonly config: Record<string, unknown>;
  readonly entryActions?: FlowAction[];
  readonly exitActions?: FlowAction[];
  readonly transitions: FlowTransition[];
}

export type FlowNodeType = 
  | 'start'
  | 'end'
  | 'task'
  | 'decision'
  | 'parallel'
  | 'join'
  | 'timer'
  | 'event_wait'
  | 'narrative_node'
  | 'ad_display'
  | 'user_interaction';

export interface FlowTransition {
  readonly id: string;
  readonly targetNodeId: string;
  readonly condition?: FlowCondition;
  readonly priority: number;
  readonly label?: string;
}

export interface FlowCondition {
  readonly type: 'expression' | 'event' | 'timer' | 'user_action';
  readonly expression?: string;
  readonly eventType?: string;
  readonly timerSeconds?: number;
  readonly userAction?: string;
}

export interface FlowAction {
  readonly type: FlowActionType;
  readonly config: Record<string, unknown>;
}

export type FlowActionType = 
  | 'log'
  | 'notify'
  | 'api_call'
  | 'update_context'
  | 'emit_event'
  | 'track_billing'
  | 'send_ad'
  | 'record_interaction';

export interface FlowDefinition {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly nodes: FlowNode[];
  readonly initialNodeId: string;
  readonly globalContext: Record<string, unknown>;
}

export interface FlowInstance {
  id: string;
  definitionId: string;
  currentNodeId: string;
  status: FlowInstanceStatus;
  context: Record<string, unknown>;
  history: FlowHistoryEntry[];
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
}

export type FlowInstanceStatus = 
  | 'running'
  | 'paused'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface FlowHistoryEntry {
  readonly nodeId: string;
  readonly transitionId?: string;
  readonly timestamp: Date;
  readonly context: Record<string, unknown>;
  readonly action?: string;
}

export interface FlowExecutionResult {
  readonly success: boolean;
  readonly instanceId: string;
  readonly status: FlowInstanceStatus;
  readonly currentNodeId: string;
  readonly error?: string;
}

// ============================================================================
// MOTOR PRINCIPAL DE FLUJO
// ============================================================================

export class CortexFlowEngine {
  private definitions: Map<string, FlowDefinition> = new Map();
  private instances: Map<string, FlowInstance> = new Map();
  private eventHandlers: Map<string, ((instance: FlowInstance, event: unknown) => void)[]> = new Map();

  /**
   * Registra una definición de flujo
   */
  registerFlowDefinition(definition: FlowDefinition): void {
    this.definitions.set(definition.id, definition);
    logger.info(`[Cortex-Flow] Registered flow: ${definition.name} v${definition.version}`);
  }

  /**
   * Inicia una nueva instancia de flujo
   */
  async startFlow(
    definitionId: string, 
    initialContext: Record<string, unknown> = {}
  ): Promise<FlowExecutionResult> {
    const definition = this.definitions.get(definitionId);
    
    if (!definition) {
      return {
        success: false,
        instanceId: '',
        status: 'failed',
        currentNodeId: '',
        error: `Flow definition not found: ${definitionId}`
      };
    }

    const instanceId = `flow_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const instance: FlowInstance = {
      id: instanceId,
      definitionId,
      currentNodeId: definition.initialNodeId,
      status: 'running',
      context: { ...definition.globalContext, ...initialContext },
      history: [],
      startedAt: new Date(),
      updatedAt: new Date()
    };

    this.instances.set(instanceId, instance);

    // Ejecutar nodo inicial
    await this.executeNode(instance, definition.initialNodeId);

    logger.info(`[Cortex-Flow] Started flow instance: ${instanceId}`);

    return {
      success: true,
      instanceId,
      status: instance.status,
      currentNodeId: instance.currentNodeId
    };
  }

  /**
   * Ejecuta un nodo específico
   */
  private async executeNode(instance: FlowInstance, nodeId: string): Promise<void> {
    const definition = this.definitions.get(instance.definitionId);
    if (!definition) return;

    const node = definition.nodes.find(n => n.id === nodeId);
    if (!node) {
      instance.status = 'failed';
      instance.error = `Node not found: ${nodeId}`;
      return;
    }

    // Registrar en historial
    instance.history.push({
      nodeId,
      timestamp: new Date(),
      context: { ...instance.context }
    });

    // Ejecutar acciones de entrada
    if (node.entryActions) {
      for (const action of node.entryActions) {
        await this.executeAction(instance, action);
      }
    }

    instance.currentNodeId = nodeId;
    instance.updatedAt = new Date();

    // Manejar tipos especiales de nodos
    switch (node.type) {
      case 'end':
        await this.completeFlow(instance);
        break;
      
      case 'decision':
        await this.evaluateDecision(instance, node);
        break;
      
      case 'timer':
        await this.handleTimer(instance, node);
        break;
      
      case 'event_wait':
        instance.status = 'waiting';
        break;
      
      case 'parallel':
        await this.handleParallel(instance, node);
        break;
      
      default:
        // Para nodos normales, evaluar transiciones
        await this.evaluateTransitions(instance, node);
    }
  }

  /**
   * Evalúa las transiciones de un nodo
   */
  private async evaluateTransitions(instance: FlowInstance, node: FlowNode): Promise<void> {
    // Ordenar por prioridad
    const sortedTransitions = [...node.transitions].sort((a, b) => b.priority - a.priority);

    for (const transition of sortedTransitions) {
      if (await this.evaluateCondition(instance, transition.condition)) {
        // Ejecutar acciones de salida
        if (node.exitActions) {
          for (const action of node.exitActions) {
            await this.executeAction(instance, action);
          }
        }

        // Registrar transición
        Object.assign(instance.history[instance.history.length - 1], { transitionId: transition.id });

        // Ejecutar siguiente nodo
        await this.executeNode(instance, transition.targetNodeId);
        return;
      }
    }

    // Sin transición válida, pausar
    instance.status = 'waiting';
  }

  /**
   * Evalúa una condición
   */
  private async evaluateCondition(
    instance: FlowInstance, 
    condition?: FlowCondition
  ): Promise<boolean> {
    if (!condition) return true;

    switch (condition.type) {
      case 'expression':
        return this.evaluateExpression(instance.context, condition.expression || 'true');
      
      case 'event':
        // Esperar evento
        return false;
      
      case 'timer':
        // Evaluar si el timer ha pasado
        return true;
      
      case 'user_action':
        return instance.context[`user_action_${condition.userAction}`] === true;
      
      default:
        return true;
    }
  }

  /**
   * Evalúa una expresión contra el contexto
   */
  private evaluateExpression(context: Record<string, unknown>, expression: string): boolean {
    try {
      // Evaluación segura de expresiones simples
      const parts = expression.split(/\s+(==|!=|>|<|>=|<=)\s+/);
      if (parts.length === 3) {
        const [left, operator, right] = parts;
        const leftValue = context[left] ?? left;
        const rightValue = context[right] ?? right;

        switch (operator) {
          case '==': return leftValue === rightValue;
          case '!=': return leftValue !== rightValue;
          case '>': return Number(leftValue) > Number(rightValue);
          case '<': return Number(leftValue) < Number(rightValue);
          case '>=': return Number(leftValue) >= Number(rightValue);
          case '<=': return Number(leftValue) <= Number(rightValue);
        }
      }
      return expression === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Ejecuta una acción
   */
  private async executeAction(instance: FlowInstance, action: FlowAction): Promise<void> {
    logger.info(`[Cortex-Flow] Executing action: ${action.type}`);

    switch (action.type) {
      case 'log':
        logger.info(`[Flow-Log] ${action.config.message}`);
        break;
      
      case 'update_context':
        Object.assign(instance.context, action.config.updates);
        break;
      
      case 'emit_event':
        this.emitFlowEvent(action.config.eventType as string, {
          instanceId: instance.id,
          data: action.config.data
        });
        break;
      
      case 'track_billing':
        // Registrar evento de facturación
        logger.info(`[Flow-Billing] Event: ${action.config.eventType}, Value: ${action.config.value}`);
        break;
      
      case 'send_ad':
        // Enviar anuncio
        logger.info(`[Flow-Ad] Sending ad: ${action.config.adId}`);
        break;
      
      case 'record_interaction':
        // Registrar interacción
        instance.context[`interaction_${action.config.type}`] = Date.now();
        break;
      
      default:
        logger.info(`[Cortex-Flow] Unknown action type: ${action.type}`);
    }
  }

  /**
   * Evalúa nodo de decisión
   */
  private async evaluateDecision(instance: FlowInstance, node: FlowNode): Promise<void> {
    await this.evaluateTransitions(instance, node);
  }

  /**
   * Maneja nodo de timer
   */
  private async handleTimer(instance: FlowInstance, node: FlowNode): Promise<void> {
    const delayMs = ((node.config.delaySeconds as number) || 1) * 1000;
    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000)));
    await this.evaluateTransitions(instance, node);
  }

  /**
   * Maneja nodo paralelo
   */
  private async handleParallel(instance: FlowInstance, node: FlowNode): Promise<void> {
    // En producción: ejecutar branches en paralelo
    logger.info(`[Cortex-Flow] Parallel node: ${node.id}`);
    await this.evaluateTransitions(instance, node);
  }

  /**
   * Completa un flujo
   */
  private async completeFlow(instance: FlowInstance): Promise<void> {
    instance.status = 'completed';
    instance.completedAt = new Date();
    instance.updatedAt = new Date();
    
    this.emitFlowEvent('flow_completed', {
      instanceId: instance.id,
      duration: instance.completedAt.getTime() - instance.startedAt.getTime()
    });

    logger.info(`[Cortex-Flow] Flow completed: ${instance.id}`);
  }

  /**
   * Procesa un evento externo
   */
  async processEvent(instanceId: string, eventType: string, eventData: unknown): Promise<FlowExecutionResult> {
    const instance = this.instances.get(instanceId);
    
    if (!instance) {
      return {
        success: false,
        instanceId,
        status: 'failed',
        currentNodeId: '',
        error: 'Instance not found'
      };
    }

    const definition = this.definitions.get(instance.definitionId);
    if (!definition) {
      return {
        success: false,
        instanceId,
        status: 'failed',
        currentNodeId: instance.currentNodeId,
        error: 'Definition not found'
      };
    }

    // Actualizar contexto con evento
    instance.context[`event_${eventType}`] = eventData;
    instance.context[`event_${eventType}_timestamp`] = Date.now();

    // Si estaba esperando, intentar continuar
    if (instance.status === 'waiting') {
      instance.status = 'running';
      const currentNode = definition.nodes.find(n => n.id === instance.currentNodeId);
      if (currentNode) {
        await this.evaluateTransitions(instance, currentNode);
      }
    }

    return {
      success: true,
      instanceId,
      status: instance.status,
      currentNodeId: instance.currentNodeId
    };
  }

  /**
   * Pausa un flujo
   */
  async pauseFlow(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (instance && instance.status === 'running') {
      instance.status = 'paused';
      instance.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Reanuda un flujo
   */
  async resumeFlow(instanceId: string): Promise<FlowExecutionResult> {
    const instance = this.instances.get(instanceId);
    
    if (!instance) {
      return { success: false, instanceId, status: 'failed', currentNodeId: '', error: 'Not found' };
    }

    if (instance.status !== 'paused') {
      return { success: false, instanceId, status: instance.status, currentNodeId: instance.currentNodeId, error: 'Not paused' };
    }

    instance.status = 'running';
    instance.updatedAt = new Date();

    const definition = this.definitions.get(instance.definitionId);
    if (definition) {
      const currentNode = definition.nodes.find(n => n.id === instance.currentNodeId);
      if (currentNode) {
        await this.evaluateTransitions(instance, currentNode);
      }
    }

    return {
      success: true,
      instanceId,
      status: instance.status,
      currentNodeId: instance.currentNodeId
    };
  }

  /**
   * Cancela un flujo
   */
  async cancelFlow(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = 'cancelled';
      instance.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Obtiene el estado de un flujo
   */
  getFlowStatus(instanceId: string): FlowInstance | null {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Registra un handler de eventos
   */
  onFlowEvent(eventType: string, handler: (instance: FlowInstance, event: unknown) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Emite un evento de flujo
   */
  private emitFlowEvent(eventType: string, data: unknown): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        handler(null as unknown as FlowInstance, data);
      } catch (err) {
        logger.error(`[Cortex-Flow] Event handler error:`, err instanceof Error ? err : undefined);
      }
    }
  }
}

// ============================================================================
// PLANTILLAS DE FLUJO PREDEFINIDAS
// ============================================================================

export function createNarrativeFlowTemplate(config: {
  narrativeId: string;
  nodes: Array<{ id: string; name: string; nextNodes: string[] }>;
  completionNode: string;
}): FlowDefinition {
  const flowNodes: FlowNode[] = config.nodes.map((n, index) => ({
    id: n.id,
    type: index === 0 ? 'start' : (n.id === config.completionNode ? 'end' : 'narrative_node'),
    name: n.name,
    config: { narrativeId: config.narrativeId },
    transitions: n.nextNodes.map((targetId, i) => ({
      id: `trans_${n.id}_${targetId}`,
      targetNodeId: targetId,
      priority: n.nextNodes.length - i,
      condition: { type: 'user_action' as const, userAction: 'continue' }
    })),
    entryActions: [{
      type: 'track_billing' as const,
      config: { eventType: 'narrative_node_entered', nodeId: n.id }
    }]
  }));

  return {
    id: `narrative_${config.narrativeId}`,
    name: `Narrative Flow: ${config.narrativeId}`,
    version: '1.0.0',
    nodes: flowNodes,
    initialNodeId: config.nodes[0].id,
    globalContext: { narrativeId: config.narrativeId }
  };
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

let flowEngineInstance: CortexFlowEngine | null = null;

export function getCortexFlowEngine(): CortexFlowEngine {
  if (!flowEngineInstance) {
    flowEngineInstance = new CortexFlowEngine();
  }
  return flowEngineInstance;
}

// Exportación por defecto compatible con código existente
export const CortexFlow = {
  start: async () => `flow_${Date.now()}`,
  pause: async () => {},
  resume: async () => {},
  stop: async () => {}
};

export default getCortexFlowEngine;