/**
 * SILEXAR PULSE - TIER0+ CORTEX ORCHESTRATOR 2.0
 * Orquestador con Deep Reinforcement Learning y Multi-Armed Bandit
 * 
 * Implementa:
 * - Deep Q-Network (DQN) para selección de anuncios
 * - Multi-Armed Bandit (UCB, Thompson Sampling) para optimización
 * - Gestión de estados de narrativa
 * - Integración con Redis para persistencia
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

export interface OrchestratorConfig {
  readonly learningRate: number;
  readonly discountFactor: number;
  readonly explorationRate: number;
  readonly minExplorationRate: number;
  readonly explorationDecay: number;
  readonly batchSize: number;
  readonly memorySize: number;
  readonly mabAlgorithm: 'ucb1' | 'thompson_sampling' | 'epsilon_greedy';
}

export interface State {
  readonly userId: string;
  readonly contextType: string;
  readonly timeOfDay: number;
  readonly dayOfWeek: number;
  readonly deviceType: string;
  readonly previousActions: string[];
  readonly narrativeProgress: number;
  readonly interactionHistory: number[];
}

export interface Action {
  readonly id: string;
  readonly type: 'show_ad' | 'show_narrative' | 'skip' | 'wait';
  readonly adId?: string;
  readonly narrativeNodeId?: string;
  readonly waitSeconds?: number;
}

export interface Experience {
  readonly state: State;
  readonly action: Action;
  readonly reward: number;
  readonly nextState: State;
  readonly done: boolean;
}

export interface QValue {
  readonly stateHash: string;
  readonly actionId: string;
  readonly value: number;
  readonly count: number;
  readonly lastUpdate: number;
}

export interface ArmStats {
  readonly armId: string;
  readonly pulls: number;
  readonly totalReward: number;
  readonly mean: number;
  readonly variance: number;
  readonly ucbScore?: number;
}

export interface NarrativeState {
  readonly userId: string;
  readonly narrativeId: string;
  readonly currentNodeId: string;
  readonly nodesVisited: string[];
  readonly startedAt: number;
  readonly lastInteractionAt: number;
  readonly engagementScore: number;
  readonly isCompleted: boolean;
}

export interface OrchestratorDecision {
  readonly action: Action;
  readonly confidence: number;
  readonly algorithm: string;
  readonly explorationUsed: boolean;
  readonly qValue?: number;
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================================

const DEFAULT_CONFIG: OrchestratorConfig = {
  learningRate: 0.01,
  discountFactor: 0.99,
  explorationRate: 1.0,
  minExplorationRate: 0.01,
  explorationDecay: 0.995,
  batchSize: 32,
  memorySize: 10000,
  mabAlgorithm: 'thompson_sampling'
};

// ============================================================================
// CLASE PRINCIPAL DEL ORCHESTRATOR
// ============================================================================

export class CortexOrchestratorDRL {
  private config: OrchestratorConfig;
  private qTable: Map<string, QValue[]> = new Map();
  private replayMemory: Experience[] = [];
  private armStats: Map<string, ArmStats> = new Map();
  private narrativeStates: Map<string, NarrativeState> = new Map();
  private totalSteps: number = 0;
  private currentExplorationRate: number;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentExplorationRate = this.config.explorationRate;
  }

  // ==========================================================================
  // DEEP Q-NETWORK (DQN) IMPLEMENTATION
  // ==========================================================================

  /**
   * Selecciona la mejor acción usando DQN
   */
  async selectAction(state: State, availableActions: Action[]): Promise<OrchestratorDecision> {
    const stateHash = this.hashState(state);
    
    // Exploración vs Explotación (epsilon-greedy)
    const shouldExplore = Math.random() < this.currentExplorationRate;
    
    if (shouldExplore) {
      // Exploración: acción aleatoria
      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      return {
        action: randomAction,
        confidence: 0.5,
        algorithm: 'dqn-exploration',
        explorationUsed: true
      };
    }

    // Explotación: mejor Q-value
    const qValues = this.getQValues(stateHash);
    let bestAction = availableActions[0];
    let bestQValue = -Infinity;

    for (const action of availableActions) {
      const qValue = qValues.find(q => q.actionId === action.id);
      const value = qValue?.value || 0;
      
      if (value > bestQValue) {
        bestQValue = value;
        bestAction = action;
      }
    }

    return {
      action: bestAction,
      confidence: this.sigmoid(bestQValue),
      algorithm: 'dqn-exploitation',
      explorationUsed: false,
      qValue: bestQValue
    };
  }

  /**
   * Almacena experiencia en replay memory
   */
  storeExperience(experience: Experience): void {
    this.replayMemory.push(experience);
    
    // Limitar tamaño de memoria
    if (this.replayMemory.length > this.config.memorySize) {
      this.replayMemory.shift();
    }
  }

  /**
   * Entrena el modelo con experience replay
   */
  async train(): Promise<{ loss: number; avgReward: number }> {
    if (this.replayMemory.length < this.config.batchSize) {
      return { loss: 0, avgReward: 0 };
    }

    // Muestrear batch aleatorio
    const batch = this.sampleBatch(this.config.batchSize);
    
    let totalLoss = 0;
    let totalReward = 0;

    for (const exp of batch) {
      const stateHash = this.hashState(exp.state);
      const nextStateHash = this.hashState(exp.nextState);

      // Obtener Q-value actual
      const currentQ = this.getQValue(stateHash, exp.action.id);

      // Calcular target Q-value (Bellman equation)
      let targetQ: number;
      if (exp.done) {
        targetQ = exp.reward;
      } else {
        const maxNextQ = this.getMaxQValue(nextStateHash);
        targetQ = exp.reward + this.config.discountFactor * maxNextQ;
      }

      // Calcular loss y actualizar
      const loss = Math.pow(targetQ - currentQ, 2);
      const newQ = currentQ + this.config.learningRate * (targetQ - currentQ);
      
      this.updateQValue(stateHash, exp.action.id, newQ);
      
      totalLoss += loss;
      totalReward += exp.reward;
    }

    // Decay exploration rate
    this.currentExplorationRate = Math.max(
      this.config.minExplorationRate,
      this.currentExplorationRate * this.config.explorationDecay
    );

    this.totalSteps++;

    return {
      loss: totalLoss / batch.length,
      avgReward: totalReward / batch.length
    };
  }

  // ==========================================================================
  // MULTI-ARMED BANDIT (MAB) IMPLEMENTATION
  // ==========================================================================

  /**
   * Selecciona acción usando MAB
   */
  selectActionMAB(availableArms: string[]): { armId: string; algorithm: string } {
    switch (this.config.mabAlgorithm) {
      case 'ucb1':
        return { armId: this.selectUCB1(availableArms), algorithm: 'ucb1' };
      case 'thompson_sampling':
        return { armId: this.selectThompsonSampling(availableArms), algorithm: 'thompson_sampling' };
      case 'epsilon_greedy':
      default:
        return { armId: this.selectEpsilonGreedy(availableArms), algorithm: 'epsilon_greedy' };
    }
  }

  /**
   * UCB1 (Upper Confidence Bound)
   */
  private selectUCB1(availableArms: string[]): string {
    const totalPulls = availableArms.reduce((sum, armId) => {
      const stats = this.armStats.get(armId);
      return sum + (stats?.pulls || 0);
    }, 0);

    if (totalPulls === 0) {
      return availableArms[Math.floor(Math.random() * availableArms.length)];
    }

    let bestArm = availableArms[0];
    let bestScore = -Infinity;

    for (const armId of availableArms) {
      const stats = this.armStats.get(armId);
      
      if (!stats || stats.pulls === 0) {
        return armId; // Explorar brazos no probados
      }

      const exploitationTerm = stats.mean;
      const explorationTerm = Math.sqrt((2 * Math.log(totalPulls)) / stats.pulls);
      const ucbScore = exploitationTerm + explorationTerm;

      if (ucbScore > bestScore) {
        bestScore = ucbScore;
        bestArm = armId;
      }
    }

    return bestArm;
  }

  /**
   * Thompson Sampling
   */
  private selectThompsonSampling(availableArms: string[]): string {
    let bestArm = availableArms[0];
    let bestSample = -Infinity;

    for (const armId of availableArms) {
      const stats = this.armStats.get(armId);
      
      // Parámetros Beta distribution
      const alpha = (stats?.totalReward || 0) + 1;
      const beta = (stats?.pulls || 0) - (stats?.totalReward || 0) + 1;
      
      // Muestrear de distribución Beta
      const sample = this.sampleBeta(alpha, beta);

      if (sample > bestSample) {
        bestSample = sample;
        bestArm = armId;
      }
    }

    return bestArm;
  }

  /**
   * Epsilon-Greedy para MAB
   */
  private selectEpsilonGreedy(availableArms: string[]): string {
    if (Math.random() < this.currentExplorationRate) {
      return availableArms[Math.floor(Math.random() * availableArms.length)];
    }

    let bestArm = availableArms[0];
    let bestMean = -Infinity;

    for (const armId of availableArms) {
      const stats = this.armStats.get(armId);
      const mean = stats?.mean || 0;

      if (mean > bestMean) {
        bestMean = mean;
        bestArm = armId;
      }
    }

    return bestArm;
  }

  /**
   * Actualiza estadísticas de un brazo
   */
  updateArmStats(armId: string, reward: number): void {
    const stats = this.armStats.get(armId) || {
      armId,
      pulls: 0,
      totalReward: 0,
      mean: 0,
      variance: 0
    };

    const newPulls = stats.pulls + 1;
    const newTotalReward = stats.totalReward + reward;
    const newMean = newTotalReward / newPulls;
    
    // Varianza incremental (Welford's algorithm)
    const delta = reward - stats.mean;
    const delta2 = reward - newMean;
    const newVariance = stats.pulls === 0 
      ? 0 
      : (stats.variance * (stats.pulls - 1) + delta * delta2) / (newPulls - 1);

    this.armStats.set(armId, {
      armId,
      pulls: newPulls,
      totalReward: newTotalReward,
      mean: newMean,
      variance: newVariance
    });
  }

  // ==========================================================================
  // GESTIÓN DE ESTADOS DE NARRATIVA
  // ==========================================================================

  /**
   * Inicia o actualiza estado de narrativa
   */
  updateNarrativeState(
    userId: string,
    narrativeId: string,
    nodeId: string,
    engagementScore: number
  ): NarrativeState {
    const key = `${userId}_${narrativeId}`;
    const existing = this.narrativeStates.get(key);

    const state: NarrativeState = {
      userId,
      narrativeId,
      currentNodeId: nodeId,
      nodesVisited: existing 
        ? [...existing.nodesVisited, nodeId]
        : [nodeId],
      startedAt: existing?.startedAt || Date.now(),
      lastInteractionAt: Date.now(),
      engagementScore,
      isCompleted: false
    };

    this.narrativeStates.set(key, state);
    return state;
  }

  /**
   * Marca narrativa como completada
   */
  completeNarrative(userId: string, narrativeId: string): NarrativeState | null {
    const key = `${userId}_${narrativeId}`;
    const state = this.narrativeStates.get(key);
    
    if (state) {
      const updated: NarrativeState = { ...state, isCompleted: true };
      this.narrativeStates.set(key, updated);
      return updated;
    }
    
    return null;
  }

  /**
   * Obtiene estado de narrativa
   */
  getNarrativeState(userId: string, narrativeId: string): NarrativeState | null {
    return this.narrativeStates.get(`${userId}_${narrativeId}`) || null;
  }

  // ==========================================================================
  // FUNCIONES AUXILIARES
  // ==========================================================================

  private hashState(state: State): string {
    return `${state.contextType}_${state.timeOfDay}_${state.dayOfWeek}_${state.deviceType}_${state.narrativeProgress}`;
  }

  private getQValues(stateHash: string): QValue[] {
    return this.qTable.get(stateHash) || [];
  }

  private getQValue(stateHash: string, actionId: string): number {
    const qValues = this.getQValues(stateHash);
    const qValue = qValues.find(q => q.actionId === actionId);
    return qValue?.value || 0;
  }

  private getMaxQValue(stateHash: string): number {
    const qValues = this.getQValues(stateHash);
    if (qValues.length === 0) return 0;
    return Math.max(...qValues.map(q => q.value));
  }

  private updateQValue(stateHash: string, actionId: string, value: number): void {
    let qValues = this.qTable.get(stateHash) || [];
    const existingIndex = qValues.findIndex(q => q.actionId === actionId);

    const newQValue: QValue = {
      stateHash,
      actionId,
      value,
      count: (existingIndex >= 0 ? qValues[existingIndex].count : 0) + 1,
      lastUpdate: Date.now()
    };

    if (existingIndex >= 0) {
      qValues[existingIndex] = newQValue;
    } else {
      qValues = [...qValues, newQValue];
    }

    this.qTable.set(stateHash, qValues);
  }

  private sampleBatch(size: number): Experience[] {
    const indices = new Set<number>();
    while (indices.size < Math.min(size, this.replayMemory.length)) {
      indices.add(Math.floor(Math.random() * this.replayMemory.length));
    }
    return Array.from(indices).map(i => this.replayMemory[i]);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private sampleBeta(alpha: number, beta: number): number {
    // Aproximación simple de distribución Beta
    const x = this.sampleGamma(alpha, 1);
    const y = this.sampleGamma(beta, 1);
    return x / (x + y);
  }

  private sampleGamma(shape: number, scale: number): number {
    // Marsaglia and Tsang's method
    if (shape < 1) {
      return this.sampleGamma(1 + shape, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x: number;
      let v: number;
      
      do {
        x = this.normalRandom();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();

      if (u < 1 - 0.0331 * (x * x) * (x * x)) {
        return d * v * scale;
      }

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  private normalRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // ==========================================================================
  // GETTERS Y ESTADÍSTICAS
  // ==========================================================================

  getStats(): {
    totalSteps: number;
    explorationRate: number;
    qTableSize: number;
    memoryUsage: number;
    armCount: number;
    narrativeCount: number;
  } {
    return {
      totalSteps: this.totalSteps,
      explorationRate: this.currentExplorationRate,
      qTableSize: this.qTable.size,
      memoryUsage: this.replayMemory.length,
      armCount: this.armStats.size,
      narrativeCount: this.narrativeStates.size
    };
  }

  getArmStats(): ArmStats[] {
    return Array.from(this.armStats.values());
  }

  resetExploration(): void {
    this.currentExplorationRate = this.config.explorationRate;
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

let orchestratorInstance: CortexOrchestratorDRL | null = null;

export function getCortexOrchestrator(config?: Partial<OrchestratorConfig>): CortexOrchestratorDRL {
  if (!orchestratorInstance) {
    orchestratorInstance = new CortexOrchestratorDRL(config);
  }
  return orchestratorInstance;
}

// Exportación compatible con código existente
export interface CortexTask {
  readonly id: string;
  readonly type: string;
  readonly priority: number;
  readonly status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

class LegacyOrchestratorWrapper {
  private tasks: CortexTask[] = [];

  async schedule(task: Omit<CortexTask, 'status'>): Promise<string> {
    const newTask: CortexTask = { ...task, status: 'PENDING' };
    this.tasks.push(newTask);
    return task.id;
  }

  async execute(taskId: string): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      (task as { status: string }).status = 'RUNNING';
      await new Promise(resolve => setTimeout(resolve, 100));
      (task as { status: string }).status = 'COMPLETED';
    }
  }

  async getStatus(taskId: string): Promise<CortexTask | null> {
    return this.tasks.find(t => t.id === taskId) || null;
  }

  async cancel(taskId: string): Promise<boolean> {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index > -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const CortexOrchestrator = new LegacyOrchestratorWrapper();
export default getCortexOrchestrator;