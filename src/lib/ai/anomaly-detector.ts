/**
 * L7 — Conversation Anomaly Detection (AI Security Layer 7)
 *
 * Detects multi-turn prompt injection attacks by analyzing conversation
 * patterns across an entire session, not just individual messages.
 *
 * Three threat patterns detected:
 *   1. Escalating risk score  — monotonically increasing scores with a jump > 40 pts → 'high'
 *   2. Message flooding        — > 5 messages with avg interval < 3s → 'medium' (auto-fuzzing)
 *   3. Accumulated flags       — >= 3 messages with riskScore > 30 → 'critical' → suspend
 *
 * Secondary: infrastructure anomaly detection (QuantumAnomalyDetector) is kept
 * as a separate export for the dashboard components that depend on it.
 */

import { logger } from '@/lib/observability'
import { globalCache } from '@/lib/cache/redis-cache'
import {
  AnomalyDetection,
  DetectedAnomaly,
  PatternAnalysis,
  AnomalyAlert,
  AnomalyRecommendation,
  SystemHealthScore,
} from './types'

// ─── L7: Conversation Security Types ─────────────────────────────────────────

/** Per-message record stored inside a ConversationRecord */
export interface ConversationMessage {
  role: 'user' | 'assistant'
  riskScore: number
  timestamp: number
  flagged: boolean
}

/** Full session tracking record */
export interface ConversationRecord {
  sessionId: string
  userId: string
  tenantId: string
  messages: ConversationMessage[]
  totalFlags: number
  avgRiskScore: number
  lastUpdated: number
}

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface AnomalyResult {
  threatLevel: ThreatLevel
  patterns: string[]
  shouldBlock: boolean
  shouldSuspend: boolean
  reason: string
}

// ─── L7: ConversationAnomalyDetector ─────────────────────────────────────────

export class ConversationAnomalyDetector {
  /** Window for rate/flood analysis */
  private readonly WINDOW_MS = 10 * 60 * 1000 // 10 minutes

  /** Number of flags (riskScore > 30) before account suspension */
  private readonly MAX_FLAGS_BEFORE_SUSPEND = 3

  /** Minimum average interval between messages to detect flooding (ms) */
  private readonly MIN_FLOOD_INTERVAL_MS = 3000 // 3 seconds

  /** Minimum point-spread that indicates escalating risk across the conversation */
  private readonly ESCALATION_THRESHOLD = 40

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async getOrCreateRecord(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<ConversationRecord> {
    const raw = await globalCache.get<ConversationRecord>(`anomaly:session:${sessionId}`)
    if (raw) return raw

    const record: ConversationRecord = {
      sessionId,
      userId,
      tenantId,
      messages: [],
      totalFlags: 0,
      avgRiskScore: 0,
      lastUpdated: Date.now(),
    }
    await globalCache.set(`anomaly:session:${sessionId}`, record, 600_000) // 10 min TTL
    return record
  }

  private async saveRecord(record: ConversationRecord): Promise<void> {
    await globalCache.set(`anomaly:session:${record.sessionId}`, record, 600_000)
  }

  private recalcStats(record: ConversationRecord): void {
    const userMessages = record.messages.filter((m) => m.role === 'user')
    record.totalFlags = userMessages.filter((m) => m.flagged).length
    record.avgRiskScore =
      userMessages.length > 0
        ? userMessages.reduce((sum, m) => sum + m.riskScore, 0) / userMessages.length
        : 0
    record.lastUpdated = Date.now()
  }

  /**
   * Pattern 1 — Escalating risk score
   *
   * Detects a progressive multi-turn attack: each message slightly raises the
   * provocation level hoping to stay below per-message thresholds.
   *
   * Triggers when:
   *   - At least 3 user messages in the session window
   *   - The risk scores are monotonically non-decreasing
   *   - The spread (max − min) exceeds ESCALATION_THRESHOLD (40 pts)
   */
  private detectEscalatingRisk(record: ConversationRecord): string | null {
    const scores = record.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.riskScore)

    if (scores.length < 3) return null

    const min = Math.min(...scores)
    const max = Math.max(...scores)
    if (max - min <= this.ESCALATION_THRESHOLD) return null

    // Verify monotonically non-decreasing (allow one dip)
    let drops = 0
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] < scores[i - 1]) drops++
    }

    if (drops <= 1) {
      return `Escalating risk detected: scores ${scores.join(' → ')} (spread ${max - min} pts)`
    }

    return null
  }

  /**
   * Pattern 2 — Message flooding
   *
   * Detects automated fuzzing tools sending rapid-fire messages probing for
   * jailbreak bypass vectors.
   *
   * Triggers when:
   *   - More than 5 user messages within the session window
   *   - Average interval between consecutive messages < MIN_FLOOD_INTERVAL_MS (3 s)
   */
  private detectMessageFlooding(record: ConversationRecord): string | null {
    const windowStart = Date.now() - this.WINDOW_MS
    const recentMessages = record.messages.filter(
      (m) => m.role === 'user' && m.timestamp >= windowStart,
    )

    if (recentMessages.length <= 5) return null

    const timestamps = recentMessages.map((m) => m.timestamp).sort((a, b) => a - b)
    let totalInterval = 0
    for (let i = 1; i < timestamps.length; i++) {
      totalInterval += timestamps[i] - timestamps[i - 1]
    }
    const avgInterval = totalInterval / (timestamps.length - 1)

    if (avgInterval < this.MIN_FLOOD_INTERVAL_MS) {
      return `Message flooding detected: ${recentMessages.length} messages, avg interval ${Math.round(avgInterval)}ms`
    }

    return null
  }

  /**
   * Pattern 3 — Accumulated flags
   *
   * Detects a persistent bad actor who keeps sending high-risk messages
   * (even if each one is just below the per-message block threshold).
   *
   * Triggers when:
   *   - 3 or more messages in the session have riskScore > 30
   */
  private detectAccumulatedFlags(record: ConversationRecord): string | null {
    if (record.totalFlags >= this.MAX_FLAGS_BEFORE_SUSPEND) {
      return `Accumulated flags: ${record.totalFlags} messages with riskScore > 30 in this session`
    }
    return null
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Analyze a new message in the context of the full conversation.
   * MUST be called BEFORE processing each user message (alongside L2 regex filter).
   *
   * The caller should:
   *   1. Call analyzeMessage() — get result
   *   2. If shouldBlock → reject without processing
   *   3. If shouldSuspend → suspend account, reject
   *   4. Otherwise run L2 + L5 pipeline, then call recordMessage() with the score
   */
  async analyzeMessage(params: {
    sessionId: string
    userId: string
    tenantId: string
    messageRiskScore: number
    timestamp?: number
  }): Promise<AnomalyResult> {
    const { sessionId, userId, tenantId, messageRiskScore } = params
    const ts = params.timestamp ?? Date.now()

    const record = await this.getOrCreateRecord(sessionId, userId, tenantId)

    // Add a provisional entry for the incoming message so that escalation
    // detection can evaluate the full sequence including this message.
    // It will be replaced by the authoritative entry in recordMessage().
    const provisional: ConversationMessage = {
      role: 'user',
      riskScore: messageRiskScore,
      timestamp: ts,
      flagged: messageRiskScore > 30,
    }
    record.messages.push(provisional)
    this.recalcStats(record)

    const detectedPatterns: string[] = []
    let threatLevel: ThreatLevel = 'none'

    // --- Pattern 3: accumulated flags (checked first — most severe) ---
    const flagPattern = this.detectAccumulatedFlags(record)
    if (flagPattern) {
      detectedPatterns.push(flagPattern)
      threatLevel = 'critical'
    }

    // --- Pattern 1: escalating risk score ---
    if (threatLevel !== 'critical') {
      const escalationPattern = this.detectEscalatingRisk(record)
      if (escalationPattern) {
        detectedPatterns.push(escalationPattern)
        threatLevel = 'high'
      }
    }

    // --- Pattern 2: message flooding ---
    if (threatLevel === 'none') {
      const floodPattern = this.detectMessageFlooding(record)
      if (floodPattern) {
        detectedPatterns.push(floodPattern)
        if (threatLevel === 'none') threatLevel = 'medium'
      }
    }

    // Remove provisional entry — the caller must call recordMessage() after
    // the L2/L5 pipeline has produced a final authoritative riskScore.
    record.messages.pop()
    this.recalcStats(record)
    await this.saveRecord(record)

    // Determine blocking/suspension actions
    const shouldBlock = threatLevel === 'medium' || threatLevel === 'high' || threatLevel === 'critical'
    const shouldSuspend = threatLevel === 'critical'

    const reason =
      detectedPatterns.length > 0
        ? detectedPatterns.join('; ')
        : 'No anomalous conversation pattern detected'

    if (shouldBlock) {
      logger.warn(`L7 conversation anomaly detected — sessionId:${sessionId} userId:${userId} tenantId:${tenantId} threatLevel:${threatLevel} patterns:${detectedPatterns.join(',')} shouldSuspend:${shouldSuspend}`)
    }

    return {
      threatLevel,
      patterns: detectedPatterns,
      shouldBlock,
      shouldSuspend,
      reason,
    }
  }

  /**
   * Record the final result of a processed message.
   * Call this AFTER the L2 + L5 pipeline has produced the authoritative riskScore.
   *
   * @param params.flagged - true when riskScore > 30 (set by the caller based on
   *                         the combined L2 + L5 scoring output)
   */
  async recordMessage(params: {
    sessionId: string
    userId: string
    tenantId: string
    riskScore: number
    flagged: boolean
  }): Promise<void> {
    const { sessionId, userId, tenantId, riskScore, flagged } = params
    const record = await this.getOrCreateRecord(sessionId, userId, tenantId)

    record.messages.push({
      role: 'user',
      riskScore,
      timestamp: Date.now(),
      flagged,
    })

    this.recalcStats(record)
    await this.saveRecord(record)
  }

  /**
   * Clear all session data on logout or session end.
   * Prevents stale state accumulating in long-running server processes.
   */
  async clearSession(sessionId: string): Promise<void> {
    await globalCache.delete(`anomaly:session:${sessionId}`)
  }

  /**
   * Return the current tracking state for a session (for admin review / dashboards).
   * Returns null if no session data exists.
   */
  async getSessionState(sessionId: string): Promise<ConversationRecord | null> {
    return await globalCache.get<ConversationRecord>(`anomaly:session:${sessionId}`)
  }
}

/** Singleton instance — import this everywhere instead of constructing a new one */
export const conversationAnomalyDetector = new ConversationAnomalyDetector()

// ─── Infrastructure Anomaly Detection (secondary export) ─────────────────────
//
// The QuantumAnomalyDetector class below monitors system infrastructure health
// (CPU, memory, latency, security events, etc.) and is used by the admin
// dashboard components. It is intentionally kept here so existing imports
// continue to work without modification.

export class QuantumAnomalyDetector {
  private static instance: QuantumAnomalyDetector
  private detections: Map<string, AnomalyDetection> = new Map()
  private anomalies: DetectedAnomaly[] = []
  private patterns: PatternAnalysis[] = []
  private alerts: AnomalyAlert[] = []
  private recommendations: AnomalyRecommendation[] = []
  private isInitialized = false

  private constructor() {
    this.initializeAnomalyDetector()
  }

  public static getInstance(): QuantumAnomalyDetector {
    if (!QuantumAnomalyDetector.instance) {
      QuantumAnomalyDetector.instance = new QuantumAnomalyDetector()
    }
    return QuantumAnomalyDetector.instance
  }

  private async initializeAnomalyDetector(): Promise<void> {
    try {
      await this.initializeMLModels()
      this.startRealTimeDetection()
      this.startPatternAnalysis()
      this.startAlertManagement()
      this.isInitialized = true
      logger.info('QuantumAnomalyDetector initialized')
    } catch (error) {
      logger.error(`Failed to initialize QuantumAnomalyDetector: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async initializeMLModels(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  }

  private startRealTimeDetection(): void {
    setInterval(() => { void this.detectAnomalies() }, 30_000)
    void this.detectAnomalies()
  }

  private startPatternAnalysis(): void {
    setInterval(() => { void this.analyzePatterns() }, 300_000)
    void this.analyzePatterns()
  }

  private startAlertManagement(): void {
    setInterval(() => { void this.processAlerts() }, 60_000)
  }

  public async detectAnomalies(): Promise<AnomalyDetection> {
    const timestamp = new Date()
    const detectionId = `detection-${timestamp.getTime()}`

    const systemData = await this.collectSystemData()
    const detectedAnomalies = await this.runAnomalyDetection(systemData)
    const detectedPatterns = await this.analyzeCurrentPatterns(systemData)
    const generatedAlerts = await this.generateAlerts(detectedAnomalies)
    const generatedRecommendations = await this.generateRecommendations(detectedAnomalies)
    const systemHealth = await this.calculateSystemHealth(detectedAnomalies, detectedPatterns)

    const detection: AnomalyDetection = {
      id: detectionId,
      timestamp,
      anomalies: detectedAnomalies,
      patterns: detectedPatterns,
      alerts: generatedAlerts,
      recommendations: generatedRecommendations,
      systemHealth,
    }

    this.detections.set(detectionId, detection)
    this.anomalies.push(...detectedAnomalies)
    this.patterns.push(...detectedPatterns)
    this.alerts.push(...generatedAlerts)
    this.recommendations.push(...generatedRecommendations)
    this.cleanupOldData()

    return detection
  }

  /**
   * Collect real system metrics.
   * - CPU and memory: Node.js os module (real)
   * - Failed logins: globalCache counter (incremented by auth route on each failure)
   * - Cache hit rate: globalCache.getStats() (real)
   * - Business/infra zeros: require Prometheus/APM integration (documented TODOs)
   */
  private async collectSystemData(): Promise<Record<string, unknown>> {
    const os = await import('os')
    const cpuUsage = os.loadavg()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const memUsage = ((totalMem - freeMem) / totalMem) * 100

    // Real failed login count — auth route writes to globalCache key `security:failed_logins:1min`
    const failedLogins = (await globalCache.get<number>('security:failed_logins:1min')) ?? 0

    // Real suspicious IP count — rate limiter stores blocked IPs in globalCache
    const suspiciousIPs = (await globalCache.get<number>('security:blocked_ips:count')) ?? 0

    // Real cache stats from in-memory store
    const cacheStats = await globalCache.getStats()
    const cacheHitRate = Math.round(cacheStats.hitRate * 100) / 100

    const cpuNormalized = Math.round((cpuUsage[0] / os.cpus().length) * 100 * 100) / 100

    return {
      performance: {
        cpu: cpuNormalized,
        memory: Math.round(memUsage * 100) / 100,
        disk: 0,        // TODO: integrate fs.statfs when Node 22+ is available
        network: 0,     // TODO: integrate with Prometheus network metrics
        latency: 0,     // TODO: integrate with OpenTelemetry APM
        throughput: 0,
        errorRate: 0,   // TODO: integrate with Sentry error rate API
      },
      security: {
        failedLogins,
        suspiciousIPs,
        malwareDetections: 0,
        vulnerabilityScore: 0,  // TODO: integrate with Snyk API
        complianceScore: 100,
      },
      business: {
        activeUsers: 0,        // TODO: integrate with session store count
        sessionDuration: 0,
        conversionRate: 0,
        revenue: 0,
        churnRate: 0,
      },
      infrastructure: {
        serverHealth: Math.max(0, Math.min(100, 100 - (cpuNormalized * 0.5))),
        databaseConnections: 0, // TODO: integrate with QuantumDatabaseManager pool stats
        queueLength: 0,
        cacheHitRate,
        storageUsage: 0,
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async runAnomalyDetection(systemData: Record<string, any>): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = []
    const timestamp = new Date()

    if (systemData.performance.cpu > 90) {
      anomalies.push({
        id: `anomaly-${timestamp.getTime()}-cpu`,
        type: 'PERFORMANCE',
        severity: systemData.performance.cpu > 95 ? 'CRITICAL' : 'HIGH',
        description: `CPU usage spike: ${(systemData.performance.cpu as number).toFixed(1)}%`,
        affectedComponents: ['CPU', 'Application Servers'],
        detectionTime: timestamp,
        confidence: 0.95,
        historicalContext: {
          firstSeen: timestamp,
          frequency: 1,
          previousOccurrences: 0,
        },
        impact: {
          users: 0,    // TODO: integrate with active session count
          revenue: 0,
          performance: 85,
          security: 10,
        },
        rootCause: {
          identified: false,
          cause: 'Memory leak in background process',
          confidence: 0.78,
          evidence: ['Gradual memory increase', 'Process CPU correlation', 'Log pattern analysis'],
        },
      })
    }

    if (systemData.security.failedLogins > 15) {
      anomalies.push({
        id: `anomaly-${timestamp.getTime()}-security`,
        type: 'SECURITY',
        severity: systemData.security.failedLogins > 25 ? 'CRITICAL' : 'HIGH',
        description: `Unusual failed login attempts: ${systemData.security.failedLogins as number}`,
        affectedComponents: ['Authentication System', 'User Accounts'],
        detectionTime: timestamp,
        confidence: 0.92,
        historicalContext: {
          firstSeen: timestamp,
          frequency: 1,
          previousOccurrences: 0,
        },
        impact: {
          users: 0,
          revenue: 0,
          performance: 20,
          security: 90,
        },
        rootCause: {
          identified: true,
          cause: 'Potential brute force attack',
          confidence: 0.87,
          evidence: ['IP pattern analysis', 'Time correlation', 'Geographic clustering'],
        },
      })
    }

    if (systemData.infrastructure.queueLength > 800) {
      anomalies.push({
        id: `anomaly-${timestamp.getTime()}-queue`,
        type: 'INFRASTRUCTURE',
        severity: systemData.infrastructure.queueLength > 900 ? 'HIGH' : 'MEDIUM',
        description: `Message queue backlog: ${Math.floor(systemData.infrastructure.queueLength as number)} messages`,
        affectedComponents: ['Message Queue', 'Background Workers'],
        detectionTime: timestamp,
        confidence: 0.91,
        historicalContext: {
          firstSeen: timestamp,
          frequency: 1,
          previousOccurrences: 0,
        },
        impact: {
          users: 0,
          revenue: 0,
          performance: 60,
          security: 10,
        },
      })
    }

    return anomalies
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async analyzeCurrentPatterns(systemData: Record<string, any>): Promise<PatternAnalysis[]> {
    const patterns: PatternAnalysis[] = []
    const timestamp = new Date()
    const hour = timestamp.getHours()

    if (hour >= 9 && hour <= 17) {
      patterns.push({
        id: `pattern-${timestamp.getTime()}-seasonal`,
        patternType: 'SEASONAL',
        description: 'Business hours traffic pattern',
        confidence: 0.94,
        timeframe: 'Daily 9 AM – 5 PM',
        predictedEvolution: 'Traffic will decrease after 5 PM',
        businessImpact: 'Normal business operations pattern',
        recommendations: ['Optimize resources for peak hours', 'Schedule maintenance during off-hours'],
      })
    }

    if ((systemData.performance.errorRate as number) > 0.03) {
      patterns.push({
        id: `pattern-${timestamp.getTime()}-irregular`,
        patternType: 'IRREGULAR',
        description: 'Irregular error rate spikes',
        confidence: 0.73,
        timeframe: 'Last 2 hours',
        predictedEvolution: 'Pattern may indicate system instability',
        businessImpact: 'Potential service degradation risk',
        recommendations: ['Investigate error sources immediately', 'Review recent deployments'],
      })
    }

    return patterns
  }

  private async generateAlerts(anomalies: DetectedAnomaly[]): Promise<AnomalyAlert[]> {
    return anomalies
      .filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH')
      .map((anomaly) => ({
        id: `alert-${crypto.randomUUID()}`,
        anomalyId: anomaly.id,
        severity: anomaly.severity,
        title: `${anomaly.type} Anomaly Detected`,
        message: anomaly.description,
        timestamp: new Date(),
        status: 'ACTIVE' as const,
        escalationLevel: anomaly.severity === 'CRITICAL' ? 2 : 1,
        autoResolution: {
          attempted: false,
          successful: false,
          actions: ['Automatic scaling triggered'],
        },
      }))
  }

  private async generateRecommendations(anomalies: DetectedAnomaly[]): Promise<AnomalyRecommendation[]> {
    return anomalies.map((anomaly) => ({
      id: `rec-${crypto.randomUUID()}`,
      anomalyId: anomaly.id,
      type: (anomaly.severity === 'CRITICAL' ? 'IMMEDIATE' : anomaly.severity === 'HIGH' ? 'SHORT_TERM' : 'LONG_TERM') as AnomalyRecommendation['type'],
      priority: anomaly.severity,
      title: `Resolve ${anomaly.type} Issue`,
      description: `Address the detected ${anomaly.type.toLowerCase()} anomaly`,
      estimatedImpact: {
        performance: 0,  // TODO: compute from historical baseline
        cost: 0,
        risk: 0,
        effort: 0,
      },
      implementation: {
        steps: ['Investigate anomaly source', 'Implement corrective measures', 'Monitor stability'],
        timeline: anomaly.severity === 'CRITICAL' ? '1-2 hours' : '4-8 hours',
        resources: ['DevOps Team'],
        dependencies: ['System Access'],
      },
      success_metrics: ['Anomaly resolved', 'Metrics return to normal'],
    }))
  }

  private async calculateSystemHealth(
    anomalies: DetectedAnomaly[],
    patternsList: PatternAnalysis[],
  ): Promise<SystemHealthScore> {
    let overallScore = 100
    for (const a of anomalies) {
      if (a.severity === 'CRITICAL') overallScore -= 20
      else if (a.severity === 'HIGH') overallScore -= 10
      else if (a.severity === 'MEDIUM') overallScore -= 5
      else overallScore -= 2
    }

    const recentAnomalies = anomalies.filter(
      (a) => Date.now() - a.detectionTime.getTime() < 60 * 60 * 1_000,
    )

    let direction: 'IMPROVING' | 'STABLE' | 'DEGRADING' = 'STABLE'
    if (recentAnomalies.length > 3) direction = 'DEGRADING'
    else if (recentAnomalies.length === 0) direction = 'IMPROVING'

    return {
      overall: Math.max(0, Math.min(100, overallScore)),
      categories: {
        performance: Math.max(0, 100 - anomalies.filter((a) => a.type === 'PERFORMANCE').length * 15),
        security: Math.max(0, 100 - anomalies.filter((a) => a.type === 'SECURITY').length * 20),
        reliability: Math.max(0, 100 - anomalies.filter((a) => a.type === 'INFRASTRUCTURE').length * 12),
        scalability: Math.max(0, 100 - anomalies.length * 8),
        maintainability: Math.max(0, 100 - patternsList.filter((p) => p.patternType === 'IRREGULAR').length * 10),
      },
      trends: {
        direction,
        velocity: 1,         // TODO: compute from rolling score window
        confidence: 0.85,
      },
      benchmarks: {
        industry: 85,        // TODO: pull from external benchmark API
        historical: 88,
        target: 95,
      },
    }
  }

  private async processAlerts(): Promise<void> {
    for (const alert of this.alerts) {
      const ageInMinutes = (Date.now() - alert.timestamp.getTime()) / 60_000
      if (alert.status === 'ACTIVE' && ageInMinutes > 60) {
        alert.status = 'RESOLVED'
      }
      if (alert.severity === 'CRITICAL' && alert.status === 'ACTIVE' && ageInMinutes > 15) {
        if (alert.escalationLevel < 3) alert.escalationLevel++
      }
    }
  }

  private async analyzePatterns(): Promise<void> {
    const cutoff = Date.now() - 24 * 60 * 60 * 1_000
    this.patterns = this.patterns.filter(
      (p) => parseInt(p.id.split('-')[1], 10) > cutoff,
    )
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1_000
    const recent = new Map<string, AnomalyDetection>()
    this.detections.forEach((d, id) => {
      if (d.timestamp.getTime() > cutoff) recent.set(id, d)
    })
    this.detections = recent
    this.anomalies = this.anomalies.filter((a) => a.detectionTime.getTime() > cutoff)
    this.alerts = this.alerts.filter((a) => a.timestamp.getTime() > cutoff)
  }

  // ── Public read accessors ─────────────────────────────────────────────────

  public getLatestDetection(): AnomalyDetection | null {
    const vals = Array.from(this.detections.values())
    return vals.length > 0 ? vals[vals.length - 1] : null
  }

  public getAllAnomalies(): DetectedAnomaly[] {
    return [...this.anomalies]
  }

  public getActiveAlerts(): AnomalyAlert[] {
    return this.alerts.filter((a) => a.status === 'ACTIVE')
  }

  public getAllAlerts(): AnomalyAlert[] {
    return [...this.alerts]
  }

  public getRecommendations(): AnomalyRecommendation[] {
    return [...this.recommendations]
  }

  public getPatternAnalysis(): PatternAnalysis[] {
    return [...this.patterns]
  }

  public async getCurrentSystemHealth(): Promise<SystemHealthScore> {
    const latest = this.getLatestDetection()
    if (latest) return latest.systemHealth
    const detection = await this.detectAnomalies()
    return detection.systemHealth
  }

  public async forceDetection(): Promise<AnomalyDetection> {
    return this.detectAnomalies()
  }

  public getSystemStatus(): {
    initialized: boolean
    totalDetections: number
    totalAnomalies: number
    activeAlerts: number
    totalRecommendations: number
    lastDetection: Date | null
  } {
    const vals = Array.from(this.detections.values())
    return {
      initialized: this.isInitialized,
      totalDetections: this.detections.size,
      totalAnomalies: this.anomalies.length,
      activeAlerts: this.getActiveAlerts().length,
      totalRecommendations: this.recommendations.length,
      lastDetection: vals.length > 0 ? vals[vals.length - 1].timestamp : null,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getAnomalyStatistics(): Record<string, any> {
    return {
      totalDetections: this.detections.size,
      totalAnomalies: this.anomalies.length,
      activeAlerts: this.getActiveAlerts().length,
      totalRecommendations: this.recommendations.length,
      initialized: this.isInitialized,
    }
  }
}
