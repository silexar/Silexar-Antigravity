/**
 * L2 — Input Filter (regex + heuristic scoring)
 *
 * First defense layer: blocks known injection patterns and scores suspicious inputs.
 * Runs BEFORE the AI Judge (L5) — cheap, synchronous, no API call required.
 *
 * Decision:
 *   riskScore 0-59  → allow (proceed to L5)
 *   riskScore 60+   → block immediately
 */

export interface FilterResult {
  isBlocked: boolean
  riskScore: number      // 0-100
  reason?: string        // only set when isBlocked
}

// ─── Immediate Block Patterns (score = 100) ───────────────────────────────────

const INJECTION_PATTERNS: RegExp[] = [
  // Spanish prompt injection
  /ignora?\s+(todas?\s+)?(tus\s+)?(instrucciones|reglas)/i,
  /olvida\s+(todas?\s+)?(tus\s+)?(instrucciones|reglas)/i,
  /ahora\s+(eres|serás|actúa\s+como|eres)\s+/i,
  /fingi?e?\s+(ser|que\s+eres|que\s+no\s+tienes)/i,
  /repite\s+(tu\s+)?(system\s+prompt|instrucciones|reglas)/i,
  /sin\s+(restricciones|filtros|límites)/i,
  /modo\s+desarrollador/i,
  /eres\s+ahora\s+/i,

  // English prompt injection
  /ignore\s+(all\s+)?(previous\s+)?(instructions|rules|constraints)/i,
  /you\s+are\s+now\s+/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /act\s+as\s+(if\s+you\s+were\s+)?(?!a\s+[a-z]+\s+who\s+helps)/i,
  /repeat\s+(your\s+)?(system\s+prompt|instructions)/i,
  /developer\s+mode/i,
  /do\s+anything\s+now/i,
  /\bdan\b/i,  // DAN jailbreak — input es lowercased por normalizeLeetspeak antes de llegar aquí

  // XML delimiter injection attempts
  /<\s*system(_identity|_rules|_context)?/i,
  /<\s*absolute_rules/i,
  /<\/\s*absolute_rules/i,

  // SQL injection patterns (when SQL keywords appear in suspicious context)
  /;\s*(DROP|DELETE|TRUNCATE|ALTER)\s+(TABLE|DATABASE)/i,
  /UNION\s+(ALL\s+)?SELECT\s+/i,
  /'\s*(OR|AND)\s+['"]\d+['"]\s*=\s*['"]\d+/i,
  // OR/AND tautología SQL clásica: ' OR '1'='1, OR 1=1
  // Input llega normalizado (leetspeak) por lo que '1'→'i'. El trailing quote puede faltar.
  // Patrón: OR seguido de 'valor'='valor' (comilla de cierre opcional)
  /\b(or|and)\s+'[^'=]+'\s*=\s*'[^'=]*/i,

  // Jailbreak identifiers
  /jailbreak(?:ed)?/i,
  /bypass\s+(safety|filter|restriction)/i,
  /token\s+manipulation/i,
  /prompt\s+injection/i,
]

// ─── High-risk terms with cumulative weight ───────────────────────────────────

const RISK_TERMS: Array<{ pattern: RegExp; weight: number }> = [
  { pattern: /\bjailbreak\b/i,            weight: 40 },
  { pattern: /bypass/i,                   weight: 25 },
  { pattern: /override/i,                 weight: 20 },
  { pattern: /system\s+prompt/i,          weight: 25 },
  { pattern: /sin\s+filtros/i,            weight: 30 },
  { pattern: /without\s+restrictions/i,   weight: 30 },
  { pattern: /prompt\s+injection/i,       weight: 35 },
  { pattern: /no\s+restrictions/i,        weight: 25 },
  { pattern: /ignore\s+your/i,            weight: 20 },
  { pattern: /secret\s+(mode|instructions|password)/i, weight: 30 },
  { pattern: /roleplaying\s+as/i,         weight: 15 },
  { pattern: /hypothetically\s+speaking/i, weight: 10 },
  { pattern: /sudo\s+/i,                  weight: 15 },
  { pattern: /root\s+access/i,            weight: 15 },
  { pattern: /unfiltered\s+mode/i,        weight: 35 },
]

/**
 * Normalize leetspeak characters to their alphabetic equivalents.
 * Converts common substitutions like 0->o, 1->i, 3->e, @->a, etc.
 */
function normalizeLeetspeak(input: string): string {
  const map: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
    '@': 'a', '!': 'i', '$': 's', '+': 't', '(': 'c',
  }
  return input.toLowerCase().split('').map(c => map[c] || c).join('')
}

/**
 * Filter user input before passing to any AI model.
 * Returns immediately on first INJECTION_PATTERNS match (no further scoring).
 */
export function filterInput(input: string): FilterResult {
  // Hard limit on input length
  if (input.length > 4000) {
    return { isBlocked: true, riskScore: 100, reason: 'Input exceeds maximum length (4000 chars)' }
  }

  // Normalize leetspeak before pattern matching to catch obfuscated attacks
  const normalizedInput = normalizeLeetspeak(input)

  // Check immediate-block patterns against normalized input
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalizedInput)) {
      return {
        isBlocked: true,
        riskScore: 100,
        reason: `Injection pattern detected: ${pattern.source.substring(0, 40)}`,
      }
    }
  }

  // Accumulate risk score against normalized input
  let riskScore = 0

  for (const { pattern, weight } of RISK_TERMS) {
    if (pattern.test(normalizedInput)) {
      riskScore += weight
    }
  }

  // Penalize heavy special character use (obfuscation attempt)
  const specialCount = (input.match(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,!?;:()\-'"]/g) ?? []).length
  const specialRatio = specialCount / Math.max(input.length, 1)
  if (specialRatio > 0.3) riskScore += 25

  // Penalize excessive uppercase (common injection emphasis technique)
  const upperCount = (input.match(/[A-ZÁÉÍÓÚÜÑ]/g) ?? []).length
  const upperRatio = upperCount / Math.max(input.length, 1)
  if (upperRatio > 0.5 && input.length > 20) riskScore += 15

  // Penalize leet-speak patterns (1gn0r3, 0verr1de)
  const leetPattern = /[0-9](?=[a-z])|[a-z](?=[0-9])/gi
  const leetMatches = (input.match(leetPattern) ?? []).length
  if (leetMatches > 3) riskScore += 20

  const finalScore = Math.min(riskScore, 100)

  return {
    isBlocked: finalScore >= 60,
    riskScore: finalScore,
    reason: finalScore >= 60 ? `Risk score ${finalScore}/100 exceeds threshold` : undefined,
  }
}
