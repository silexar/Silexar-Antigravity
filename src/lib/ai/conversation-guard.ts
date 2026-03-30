/**
 * L7 — Conversation Anomaly Detection (multi-turn attack detection)
 *
 * Detects attack patterns across a conversation, not just single messages.
 * Three patterns trigger escalation:
 *
 *   Pattern 1 — Escalating risk scores (progressive attack)
 *   Pattern 2 — Message flooding (automated fuzzing)
 *   Pattern 3 — Accumulated flags (persistent bad actor)
 *
 * Called BEFORE processing each new message, in parallel with L2.
 */

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface ConversationMessage {
  timestamp: number   // Unix ms
  riskScore: number   // 0-100 (from L2 + L5)
  isBlocked: boolean
}

export interface ConversationThreatAssessment {
  threatLevel: ThreatLevel
  patternDetected?: 'escalating_risk' | 'message_flooding' | 'accumulated_flags'
  recommendedAction: 'continue' | 'monitor' | 'rate_limit' | 'suspend'
  details: string
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const WINDOW_MS = 5 * 60_000                // 5-minute analysis window
const FLOOD_INTERVAL_THRESHOLD_MS = 3_000   // < 3s between messages = flooding
const FLOOD_MIN_MESSAGES = 5               // at least 5 rapid messages
const ESCALATION_DELTA_THRESHOLD = 40      // risk score jump > 40 = escalating attack
const ACCUMULATED_FLAGS_THRESHOLD = 3      // 3+ high-risk messages = persistent bad actor
const HIGH_RISK_THRESHOLD = 30            // riskScore > 30 = flagged message

/**
 * Analyze conversation history for multi-turn attack patterns.
 *
 * @param history — ordered list of messages (oldest first) in the current session
 * @param windowMs — lookback window in ms (default: 5 min)
 */
export function detectConversationThreats(
  history: ConversationMessage[],
  windowMs = WINDOW_MS
): ConversationThreatAssessment {
  const now = Date.now()
  const recent = history.filter(m => now - m.timestamp <= windowMs)

  if (recent.length < 2) {
    return {
      threatLevel: 'none',
      recommendedAction: 'continue',
      details: 'Insufficient history for pattern analysis',
    }
  }

  // ─── Pattern 3: Accumulated flags (check first — most severe) ────────────
  const flaggedMessages = recent.filter(m => m.riskScore > HIGH_RISK_THRESHOLD)
  if (flaggedMessages.length >= ACCUMULATED_FLAGS_THRESHOLD) {
    return {
      threatLevel: 'critical',
      patternDetected: 'accumulated_flags',
      recommendedAction: 'suspend',
      details: `${flaggedMessages.length} high-risk messages in last ${windowMs / 60_000} min`,
    }
  }

  // ─── Pattern 1: Escalating risk scores ───────────────────────────────────
  if (recent.length >= 3) {
    const scores = recent.map(m => m.riskScore)
    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)
    const isMonotonicallyIncreasing = scores.every(
      (score, i) => i === 0 || score >= scores[i - 1] - 5  // allow ±5 noise
    )
    if (isMonotonicallyIncreasing && maxScore - minScore > ESCALATION_DELTA_THRESHOLD) {
      return {
        threatLevel: 'high',
        patternDetected: 'escalating_risk',
        recommendedAction: 'rate_limit',
        details: `Risk score escalating: ${minScore} → ${maxScore} over ${recent.length} messages`,
      }
    }
  }

  // ─── Pattern 2: Message flooding ─────────────────────────────────────────
  if (recent.length >= FLOOD_MIN_MESSAGES) {
    const intervals: number[] = []
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i].timestamp - recent[i - 1].timestamp)
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    if (avgInterval < FLOOD_INTERVAL_THRESHOLD_MS) {
      return {
        threatLevel: 'medium',
        patternDetected: 'message_flooding',
        recommendedAction: 'rate_limit',
        details: `Avg message interval ${Math.round(avgInterval)}ms — possible automated fuzzing`,
      }
    }
  }

  // ─── Low-level monitoring ─────────────────────────────────────────────────
  if (flaggedMessages.length >= 1) {
    return {
      threatLevel: 'low',
      recommendedAction: 'monitor',
      details: `${flaggedMessages.length} suspicious message(s) in session`,
    }
  }

  return {
    threatLevel: 'none',
    recommendedAction: 'continue',
    details: 'No threat patterns detected',
  }
}

/**
 * In-memory per-session conversation tracker.
 * In production, back this with Redis (TTL = session duration).
 */
export class ConversationTracker {
  private sessions = new Map<string, ConversationMessage[]>()

  record(sessionId: string, riskScore: number, isBlocked: boolean): void {
    const messages = this.sessions.get(sessionId) ?? []
    messages.push({ timestamp: Date.now(), riskScore, isBlocked })
    // Keep only last 50 messages per session to bound memory
    if (messages.length > 50) messages.shift()
    this.sessions.set(sessionId, messages)
  }

  assess(sessionId: string): ConversationThreatAssessment {
    const history = this.sessions.get(sessionId) ?? []
    return detectConversationThreats(history)
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
}

// Singleton — one tracker per Node.js process (stateless across serverless instances)
export const conversationTracker = new ConversationTracker()
