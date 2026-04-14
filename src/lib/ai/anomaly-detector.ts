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

export { QuantumAnomalyDetector } from './quantum-anomaly-detector'
