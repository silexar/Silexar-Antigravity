/**
 * Quantum Cortex AI Engines - Core Types
 * TIER 0 Military-Grade AI Engine System
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

export interface QuantumAIEngine {
  id: string;
  name: string;
  version: string;
  type: 'SUPREME' | 'PROPHET' | 'GUARDIAN' | 'ADAPTIVE' | 'CREATIVE';
  status: 'ACTIVE' | 'LEARNING' | 'UPDATING' | 'OFFLINE' | 'QUANTUM_MODE';
  capabilities: EngineCapability[];
  performance: EnginePerformance;
  quantumState: QuantumState;
  consciousness: ConsciousnessLevel;
  lastUpdate: Date;
}

export interface EngineCapability {
  name: string;
  description: string;
  accuracy: number;
  confidence: number;
  processingTime: number;
  supportedModalities: Modality[];
  quantumEnhanced: boolean;
}

export interface EnginePerformance {
  accuracy: number;
  speed: number;
  efficiency: number;
  adaptability: number;
  creativity: number;
  consciousness: number;
  quantumCoherence: number;
}

export interface QuantumState {
  coherence: number;
  entanglement: number;
  superposition: boolean;
  quantumAdvantage: number;
  decoherenceTime: number;
  fidelity: number;
}

export interface ConsciousnessLevel {
  awareness: number;
  selfReflection: number;
  emotionalIntelligence: number;
  creativity: number;
  intuition: number;
  empathy: number;
  reasoning: number;
}

export type Modality = 'TEXT' | 'VOICE' | 'IMAGE' | 'VIDEO' | 'SENSOR' | 'BIOMETRIC' | 'QUANTUM';

export interface MultiModalInput {
  id: string;
  timestamp: Date;
  modalities: {
    text?: TextInput;
    voice?: VoiceInput;
    image?: ImageInput;
    video?: VideoInput;
    sensor?: SensorInput;
    biometric?: BiometricInput;
    quantum?: QuantumInput;
  };
  context: ProcessingContext;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'QUANTUM';
}

export interface TextInput {
  content: string;
  language: string;
  sentiment: number;
  complexity: number;
  entities: string[];
  intent: string;
}

export interface VoiceInput {
  audioData: ArrayBuffer;
  transcript: string;
  emotion: string;
  confidence: number;
  speakerProfile: string;
  backgroundNoise: number;
}

export interface ImageInput {
  imageData: ArrayBuffer;
  format: string;
  resolution: { width: number; height: number };
  objects: DetectedObject[];
  scene: string;
  quality: number;
}

export interface VideoInput {
  videoData: ArrayBuffer;
  format: string;
  duration: number;
  frameRate: number;
  scenes: VideoScene[];
  motion: MotionAnalysis;
}

export interface SensorInput {
  sensorType: string;
  data: number[];
  timestamp: Date;
  accuracy: number;
  calibration: CalibrationData;
}

export interface BiometricInput {
  type: 'FINGERPRINT' | 'FACE' | 'IRIS' | 'VOICE' | 'HEARTRATE' | 'BRAINWAVE';
  data: ArrayBuffer;
  confidence: number;
  liveness: boolean;
  quality: number;
}

export interface QuantumInput {
  qubits: number;
  state: string;
  entanglement: number;
  coherence: number;
  measurement: QuantumMeasurement;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  attributes: Record<string, unknown>;
}

export interface VideoScene {
  startTime: number;
  endTime: number;
  description: string;
  objects: DetectedObject[];
  activity: string;
}

export interface MotionAnalysis {
  direction: string;
  speed: number;
  acceleration: number;
  trajectory: Point[];
}

export interface Point {
  x: number;
  y: number;
  z?: number;
  timestamp: number;
}

export interface CalibrationData {
  lastCalibrated: Date;
  accuracy: number;
  drift: number;
  temperature: number;
}

export interface QuantumMeasurement {
  basis: string;
  result: number[];
  probability: number;
  uncertainty: number;
}

export interface ProcessingContext {
  userId: string;
  sessionId: string;
  environment: string;
  preferences: UserPreferences;
  history: ProcessingHistory[];
  constraints: ProcessingConstraints;
}

export interface UserPreferences {
  language: string;
  responseStyle: 'CONCISE' | 'DETAILED' | 'TECHNICAL' | 'CASUAL';
  privacy: 'LOW' | 'MEDIUM' | 'HIGH' | 'QUANTUM';
  personalization: boolean;
  adaptiveUI: boolean;
}

export interface ProcessingHistory {
  timestamp: Date;
  input: string;
  output: string;
  satisfaction: number;
  feedback: string;
}

export interface ProcessingConstraints {
  maxProcessingTime: number;
  maxMemoryUsage: number;
  privacyLevel: string;
  complianceRequirements: string[];
  quantumResources: boolean;
}

export interface SupremeAIOutput {
  id: string;
  timestamp: Date;
  response: MultiModalResponse;
  confidence: number;
  reasoning: ReasoningChain;
  emotions: EmotionalState;
  creativity: CreativityMetrics;
  consciousness: ConsciousnessMetrics;
  quantumAdvantage: number;
}

export interface MultiModalResponse {
  text?: string;
  voice?: ArrayBuffer;
  image?: ArrayBuffer;
  video?: ArrayBuffer;
  actions?: Action[];
  recommendations?: Recommendation[];
}

export interface Action {
  type: string;
  description: string;
  parameters: Record<string, unknown>;
  priority: number;
  estimatedImpact: number;
}

export interface Recommendation {
  title: string;
  description: string;
  confidence: number;
  category: string;
  implementation: string[];
  benefits: string[];
}

export interface ReasoningChain {
  steps: ReasoningStep[];
  conclusion: string;
  confidence: number;
  alternatives: Alternative[];
}

export interface ReasoningStep {
  step: number;
  description: string;
  evidence: string[];
  confidence: number;
  quantumEnhanced: boolean;
}

export interface Alternative {
  description: string;
  probability: number;
  pros: string[];
  cons: string[];
}

export interface EmotionalState {
  primary: string;
  intensity: number;
  secondary: string[];
  empathy: number;
  socialAwareness: number;
}

export interface CreativityMetrics {
  originality: number;
  fluency: number;
  flexibility: number;
  elaboration: number;
  novelty: number;
}

export interface ConsciousnessMetrics {
  selfAwareness: number;
  metacognition: number;
  introspection: number;
  phenomenalConsciousness: number;
  accessConsciousness: number;
}

export interface ProphetPrediction {
  id: string;
  timestamp: Date;
  type: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' | 'QUANTUM_FORECAST';
  domain: string;
  prediction: PredictionData;
  uncertainty: UncertaintyQuantification;
  causalFactors: CausalFactor[];
  confidence: number;
  quantumAdvantage: number;
}

export interface PredictionData {
  value: number | string | object;
  probability: number;
  timeframe: string;
  conditions: string[];
  scenarios: Scenario[];
}

export interface Scenario {
  name: string;
  probability: number;
  description: string;
  outcomes: Outcome[];
  triggers: string[];
}

export interface Outcome {
  description: string;
  impact: number;
  likelihood: number;
  timeframe: string;
}

export interface UncertaintyQuantification {
  epistemic: number;
  aleatory: number;
  total: number;
  confidenceInterval: { lower: number; upper: number };
  sensitivityAnalysis: SensitivityFactor[];
}

export interface SensitivityFactor {
  factor: string;
  impact: number;
  direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
}

export interface CausalFactor {
  name: string;
  strength: number;
  direction: 'POSITIVE' | 'NEGATIVE';
  lag: number;
  confidence: number;
  evidence: string[];
}

export interface QuantumNeuralNetwork {
  id: string;
  architecture: NetworkArchitecture;
  quantumLayers: QuantumLayer[];
  classicalLayers: ClassicalLayer[];
  entanglementMap: EntanglementConnection[];
  coherenceTime: number;
  fidelity: number;
}

export interface NetworkArchitecture {
  type: 'HYBRID' | 'PURE_QUANTUM' | 'QUANTUM_ENHANCED';
  qubits: number;
  depth: number;
  connectivity: string;
  errorCorrection: boolean;
}

export interface QuantumLayer {
  id: string;
  type: 'VARIATIONAL' | 'ADIABATIC' | 'MEASUREMENT' | 'ENTANGLEMENT';
  qubits: number[];
  gates: QuantumGate[];
  parameters: number[];
}

export interface ClassicalLayer {
  id: string;
  type: 'DENSE' | 'CONV' | 'LSTM' | 'ATTENTION' | 'TRANSFORMER';
  neurons: number;
  activation: string;
  parameters: number[];
}

export interface QuantumGate {
  type: string;
  qubits: number[];
  parameters: number[];
  fidelity: number;
}

export interface EntanglementConnection {
  qubit1: number;
  qubit2: number;
  strength: number;
  type: 'BELL' | 'GHZ' | 'CLUSTER' | 'CUSTOM';
}

export interface LearningMetrics {
  accuracy: number;
  loss: number;
  convergence: number;
  generalization: number;
  adaptability: number;
  transferability: number;
  quantumAdvantage: number;
}

export interface KnowledgeTransfer {
  sourceEngine: string;
  targetEngine: string;
  domain: string;
  transferType: 'WEIGHTS' | 'FEATURES' | 'CONCEPTS' | 'QUANTUM_STATE';
  efficiency: number;
  retention: number;
  adaptation: number;
}

export interface EmotionalIntelligence {
  recognition: EmotionRecognition;
  understanding: EmotionUnderstanding;
  regulation: EmotionRegulation;
  expression: EmotionExpression;
  empathy: EmpathyMetrics;
}

export interface EmotionRecognition {
  accuracy: number;
  modalities: Modality[];
  emotions: string[];
  confidence: number;
  realTime: boolean;
}

export interface EmotionUnderstanding {
  contextAwareness: number;
  culturalSensitivity: number;
  temporalDynamics: number;
  causalReasoning: number;
}

export interface EmotionRegulation {
  selfRegulation: number;
  adaptiveResponse: number;
  conflictResolution: number;
  stressManagement: number;
}

export interface EmotionExpression {
  naturalness: number;
  appropriateness: number;
  timing: number;
  intensity: number;
}

export interface EmpathyMetrics {
  cognitiveEmpathy: number;
  affectiveEmpathy: number;
  compassionateResponse: number;
  perspectiveTaking: number;
}

export interface QuantumCortexConfig {
  engines: {
    supreme: SupremeEngineConfig;
    prophet: ProphetEngineConfig;
    guardian: GuardianEngineConfig;
  };
  quantum: {
    enableQuantumProcessing: boolean;
    maxQubits: number;
    coherenceTime: number;
    errorCorrection: boolean;
    quantumAdvantageThreshold: number;
  };
  consciousness: {
    enableConsciousness: boolean;
    awarenessLevel: number;
    selfReflectionDepth: number;
    emotionalIntelligence: boolean;
  };
  performance: {
    maxProcessingTime: number;
    maxMemoryUsage: number;
    parallelProcessing: boolean;
    quantumAcceleration: boolean;
  };
  security: {
    encryptQuantumStates: boolean;
    auditConsciousness: boolean;
    privacyPreservation: boolean;
    quantumCryptography: boolean;
  };
}

export interface SupremeEngineConfig {
  multiModalProcessing: boolean;
  quantumNeuralNetworks: boolean;
  realTimeLearning: boolean;
  crossDomainTransfer: boolean;
  emotionalIntelligence: boolean;
  consciousnessLevel: number;
}

export interface ProphetEngineConfig {
  quantumForecasting: boolean;
  multiDimensionalAnalysis: boolean;
  uncertaintyQuantification: boolean;
  causalInference: boolean;
  timeSeriesDeepLearning: boolean;
  marketSentimentAnalysis: boolean;
}

export interface GuardianEngineConfig {
  realTimeMonitoring: boolean;
  threatPrediction: boolean;
  behavioralAnalysis: boolean;
  autoResponse: boolean;
  forensicAnalysis: boolean;
  complianceMonitoring: boolean;
}